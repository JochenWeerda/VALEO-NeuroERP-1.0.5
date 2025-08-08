# -*- coding: utf-8 -*-
"""
RAG-Memory-Manager für VALEO-NeuroERP.

Funktionen:
- Scannen von Verzeichnissen nach relevanten Dateien (Code, Markdown, Texte)
- Chunking in semantische Abschnitte
- Embeddings (HuggingFace standard, optional OpenAI) – optional
- Persistenter Vectorstore unter data/faiss_db (wenn verfügbar)
- Fallback: einfacher Keyword-Scorer ohne Abhängigkeiten
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Iterable

logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = {
    ".py", ".md", ".txt", ".json", ".yaml", ".yml",
    ".ts", ".tsx", ".js", ".jsx", ".html", ".css"
}


class RAGMemoryManager:
    """Verwaltet den Vektorindex und die Abfragen mit optionalem Fallback."""

    def __init__(self,
                 db_dir: Optional[Path] = None,
                 embedding_backend: str = "hf",
                 hf_model: str = "sentence-transformers/all-MiniLM-L6-v2") -> None:
        project_root = Path(__file__).parent.parent.parent
        default_db = project_root / "data" / "faiss_db"
        self.db_dir: Path = db_dir or default_db
        self.db_dir.mkdir(parents=True, exist_ok=True)

        self.embedding_backend = embedding_backend
        self.hf_model = hf_model

        # Lazy-Import von LangChain-Komponenten
        self._has_langchain = False
        self._text_splitter = None
        self._embeddings = None
        self._vectorstore = None
        self._docs_fallback: List[Dict[str, Any]] = []  # Für Fallback-Suche

        try:
            from langchain.text_splitter import RecursiveCharacterTextSplitter  # type: ignore
            self._text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1200,
                chunk_overlap=160,
                separators=["\n\n", "\n", ". ", ".", " "]
            )

            # Embeddings (HF bevorzugt)
            if embedding_backend == "openai":
                try:
                    from langchain_openai import OpenAIEmbeddings  # type: ignore
                    self._embeddings = OpenAIEmbeddings()
                except Exception:
                    self._embeddings = None
            if self._embeddings is None:
                try:
                    from langchain_huggingface import HuggingFaceEmbeddings  # type: ignore
                    self._embeddings = HuggingFaceEmbeddings(model_name=hf_model)
                except Exception:
                    self._embeddings = None

            if self._embeddings is not None:
                # Vectorstore (FAISS) optional
                try:
                    from langchain_community.vectorstores import FAISS  # noqa: F401
                    self._has_langchain = True
                    logger.info("RAGMemoryManager: LangChain/FAISS verfügbar.")
                except Exception:
                    logger.warning("RAGMemoryManager: FAISS nicht verfügbar – Fallback-Suche wird genutzt.")
        except Exception:
            logger.warning("RAGMemoryManager: LangChain nicht verfügbar – Fallback-Suche wird genutzt.")

    def _iter_files(self, roots: Iterable[Path]) -> Iterable[Path]:
        for root in roots:
            if root.is_file():
                if root.suffix.lower() in SUPPORTED_EXTENSIONS:
                    yield root
                continue
            for path in root.rglob("*"):
                if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS:
                    if any(part in {"node_modules", "venv", ".git", "dist", "build"} for part in path.parts):
                        continue
                    yield path

    def _load_file(self, path: Path) -> Optional[str]:
        try:
            return path.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            logger.warning("Konnte Datei nicht lesen: %s (%s)", path, str(e))
            return None

    def _split_text(self, text: str) -> List[str]:
        if self._text_splitter is None:
            # Minimaler Splitter ohne Abhängigkeiten
            chunks: List[str] = []
            current = []
            count = 0
            for line in text.splitlines():
                current.append(line)
                count += len(line) + 1
                if count >= 1000:
                    chunks.append("\n".join(current))
                    current, count = [], 0
            if current:
                chunks.append("\n".join(current))
            return chunks
        return self._text_splitter.split_text(text)

    def build_index(self, root_paths: List[str]) -> Dict[str, Any]:
        files = list(self._iter_files(Path(p) for p in root_paths))
        logger.info("Indexiere %d Dateien...", len(files))

        documents: List[str] = []
        metadatas: List[Dict[str, Any]] = []
        for f in files:
            content = self._load_file(f)
            if not content:
                continue
            chunks = self._split_text(content)
            documents.extend(chunks)
            metadatas.extend({"source": str(f)} for _ in chunks)

        if not documents:
            raise ValueError("Keine dokumentierbaren Inhalte gefunden.")

        if self._has_langchain and self._embeddings is not None:
            # Versuche FAISS zu laden/erstellen
            try:
                from langchain_community.vectorstores import FAISS  # type: ignore
                try:
                    self._vectorstore = FAISS.load_local(str(self.db_dir), self._embeddings, allow_dangerous_deserialization=True)  # type: ignore
                    self._vectorstore.add_texts(documents, metadatas=metadatas)  # type: ignore
                    logger.info("Existierenden Vectorstore erweitert.")
                except Exception:
                    self._vectorstore = FAISS.from_texts(documents, self._embeddings, metadatas=metadatas)  # type: ignore
                    logger.info("Neuen Vectorstore erstellt.")
                # Persistieren, falls möglich
                try:
                    self._vectorstore.save_local(str(self.db_dir))  # type: ignore
                except Exception:
                    pass
            except Exception:
                logger.warning("FAISS konnte nicht genutzt werden – Fallback-Suche wird verwendet.")
                self._vectorstore = None

        # Fallback-Index (einfach): speichere Texte + Metadaten
        if self._vectorstore is None:
            self._docs_fallback = [
                {"text": t, "metadata": m}
                for t, m in zip(documents, metadatas)
            ]
            # Persistiere als JSON für Transparenz
            fallback_path = self.db_dir / "fallback_store.json"
            try:
                fallback_path.write_text(json.dumps(self._docs_fallback)[:2_000_000], encoding="utf-8")
            except Exception:
                pass

        return self.export_manifest()

    def _score_keyword(self, text: str, query: str) -> float:
        # Sehr einfache Heuristik: Häufigkeit + Länge
        q = query.strip().lower()
        if not q:
            return 0.0
        t = text.lower()
        count = t.count(q)
        if count == 0:
            return 0.0
        return min(1.0, count / max(3, len(t) / max(10, len(q))))

    def query(self, query_text: str, top_k: int = 6) -> List[Dict[str, Any]]:
        if self._vectorstore is not None:
            try:
                results = self._vectorstore.similarity_search_with_score(query_text, k=top_k)  # type: ignore
                output: List[Dict[str, Any]] = []
                for doc, score in results:
                    output.append({
                        "text": doc.page_content,
                        "metadata": doc.metadata or {},
                        "score": float(score)
                    })
                return output
            except Exception as e:
                logger.warning("Fehler bei Vector-Query, weiche auf Fallback aus: %s", str(e))

        # Fallback: einfache Keyword-Suche
        scored = [
            {
                "text": d["text"],
                "metadata": d.get("metadata", {}),
                "score": self._score_keyword(d["text"], query_text)
            }
            for d in self._docs_fallback
        ]
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    def export_manifest(self) -> Dict[str, Any]:
        return {
            "db_dir": str(self.db_dir),
            "backend": self.embedding_backend,
            "hf_model": self.hf_model,
            "vectorstore": self._vectorstore is not None,
            "fallback_docs": len(self._docs_fallback),
        }