# -*- coding: utf-8 -*-
"""
RAG-Memory-Manager für VALEO-NeuroERP.

Funktionen:
- Scannen von Verzeichnissen nach relevanten Dateien (Code, Markdown, Texte)
- Chunking in semantische Abschnitte
- Embeddings (HuggingFace standard, optional OpenAI) – optional
- Persistenter Vectorstore (FAISS/Chroma/Qdrant, wenn verfügbar)
- Fallback: einfacher Keyword-Scorer ohne Abhängigkeiten
"""
from __future__ import annotations

import os
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
                 hf_model: str = "sentence-transformers/all-MiniLM-L6-v2",
                 vector_backend: Optional[str] = None) -> None:
        project_root = Path(__file__).parent.parent.parent
        default_db = project_root / "data" / "faiss_db"
        self.db_dir: Path = db_dir or default_db
        self.db_dir.mkdir(parents=True, exist_ok=True)

        self.embedding_backend = embedding_backend
        self.hf_model = hf_model
        # Backend-Auswahl (auto | faiss | chroma | qdrant | fallback)
        self.vector_backend = (vector_backend or os.getenv("VECTOR_BACKEND", "auto")).lower()

        # Lazy-Import von LangChain-Komponenten
        self._has_langchain = False
        self._text_splitter = None
        self._embeddings = None
        self._vectorstore = None
        self._docs_fallback: List[Dict[str, Any]] = []  # Für Fallback-Suche
        # BM25-Fallback-Index
        self._bm25_enabled: bool = os.getenv("BM25_FALLBACK", "1") == "1"
        self._bm25_inv_index: Dict[str, List[tuple]] = {}
        self._bm25_doc_len: List[int] = []
        self._bm25_avg_dl: float = 0.0
        self._bm25_df: Dict[str, int] = {}
        self._bm25_texts: List[str] = []
        self._bm25_metadatas: List[Dict[str, Any]] = []

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

            # Prüfe, ob mind. ein Vectorstore nutzbar ist
            if self._embeddings is not None:
                try:
                    from langchain_community.vectorstores import FAISS  # noqa: F401
                    self._has_langchain = True
                except Exception:
                    # evtl. Chroma/Qdrant
                    try:
                        from langchain_community.vectorstores import Chroma  # noqa: F401
                        self._has_langchain = True
                    except Exception:
                        try:
                            from langchain_community.vectorstores import Qdrant  # noqa: F401
                            self._has_langchain = True
                        except Exception:
                            self._has_langchain = False
            logger.info("RAGMemoryManager: LangChain=%s, Backend=%s", self._has_langchain, self.vector_backend)
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

    def _tokenize(self, text: str) -> List[str]:
        token = []
        out: List[str] = []
        for ch in text.lower():
            if "a" <= ch <= "z" or "0" <= ch <= "9" or ch in "äöüß":
                token.append(ch)
            else:
                if token:
                    out.append("".join(token))
                    token = []
        if token:
            out.append("".join(token))
        return out

    def _build_bm25(self, documents: List[str], metadatas: List[Dict[str, Any]]):
        if not self._bm25_enabled:
            return
        inv: Dict[str, List[tuple]] = {}
        df: Dict[str, int] = {}
        doc_len: List[int] = []
        texts: List[str] = []
        metas: List[Dict[str, Any]] = []
        for doc_id, text in enumerate(documents):
            toks = self._tokenize(text)
            texts.append(text)
            metas.append(metadatas[doc_id])
            doc_len.append(len(toks))
            # term frequencies per doc
            freqs: Dict[str, int] = {}
            for t in toks:
                freqs[t] = freqs.get(t, 0) + 1
            for t, f in freqs.items():
                inv.setdefault(t, []).append((doc_id, f))
                df[t] = df.get(t, 0) + 1
        avg_dl = (sum(doc_len) / len(doc_len)) if doc_len else 0.0
        self._bm25_inv_index = inv
        self._bm25_df = df
        self._bm25_doc_len = doc_len
        self._bm25_avg_dl = avg_dl
        self._bm25_texts = texts
        self._bm25_metadatas = metas

    def _bm25_query(self, query: str, top_k: int = 6) -> List[Dict[str, Any]]:
        # BM25 parameters
        k1 = 1.5
        b = 0.75
        N = len(self._bm25_doc_len)
        if N == 0:
            return []
        q_terms = self._tokenize(query)
        scores: Dict[int, float] = {}
        for qt in q_terms:
            df = self._bm25_df.get(qt, 0)
            if df == 0:
                continue
            # idf with +0.5 smoothing
            idf = max(0.0, ( (N - df + 0.5) / (df + 0.5) ))
            # use log
            import math
            idf = math.log(idf + 1.0)
            for doc_id, tf in self._bm25_inv_index.get(qt, []):
                dl = self._bm25_doc_len[doc_id]
                denom = tf + k1 * (1 - b + b * (dl / (self._bm25_avg_dl or 1.0)))
                score = idf * ((tf * (k1 + 1)) / (denom or 1.0))
                scores[doc_id] = scores.get(doc_id, 0.0) + score
        # top-k
        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:top_k]
        results: List[Dict[str, Any]] = []
        for doc_id, sc in ranked:
            results.append({
                "text": self._bm25_texts[doc_id],
                "metadata": self._bm25_metadatas[doc_id],
                "score": float(sc)
            })
        return results

    def _init_vectorstore(self, documents: List[str], metadatas: List[Dict[str, Any]]):
        """Initialisiert Vectorstore je nach Backend-Auswahl."""
        if not self._has_langchain or self._embeddings is None:
            return None

        # Helper: safe import
        def try_import(name: str):
            try:
                module = __import__(name, fromlist=["*"])
                return module
            except Exception:
                return None

        backend = self.vector_backend
        if backend == "auto":
            # Bevorzugung: FAISS -> Chroma -> Qdrant
            for cand in ("faiss", "chroma", "qdrant"):
                vs = self._try_build_vectorstore(cand, documents, metadatas)
                if vs is not None:
                    self.vector_backend = cand
                    return vs
            return None
        else:
            return self._try_build_vectorstore(backend, documents, metadatas)

    def _try_build_vectorstore(self, backend: str, documents: List[str], metadatas: List[Dict[str, Any]]):
        try:
            if backend == "faiss":
                from langchain_community.vectorstores import FAISS  # type: ignore
                try:
                    vs = FAISS.load_local(str(self.db_dir), self._embeddings, allow_dangerous_deserialization=True)
                    vs.add_texts(documents, metadatas=metadatas)
                except Exception:
                    vs = FAISS.from_texts(documents, self._embeddings, metadatas=metadatas)
                try:
                    vs.save_local(str(self.db_dir))
                except Exception:
                    pass
                return vs
            if backend == "chroma":
                from langchain_community.vectorstores import Chroma  # type: ignore
                persist_dir = str(self.db_dir / "chroma")
                # Erstelle/leite Collection
                try:
                    vs = Chroma(collection_name="valero_repo", embedding_function=self._embeddings, persist_directory=persist_dir)
                    # In Batches hinzufügen, um Max-Batch-Limit zu vermeiden
                    batch_size = 10000
                    for i in range(0, len(documents), batch_size):
                        j = min(i + batch_size, len(documents))
                        vs.add_texts(texts=documents[i:j], metadatas=metadatas[i:j])
                except Exception:
                    # Fallback: from_texts mit kleinerem Batch
                    batch_size = 10000
                    vs = Chroma(collection_name="valero_repo", embedding_function=self._embeddings, persist_directory=persist_dir)
                    for i in range(0, len(documents), batch_size):
                        j = min(i + batch_size, len(documents))
                        vs.add_texts(texts=documents[i:j], metadatas=metadatas[i:j])
                try:
                    vs.persist()
                except Exception:
                    pass
                return vs
            if backend == "qdrant":
                from langchain_community.vectorstores import Qdrant  # type: ignore
                from qdrant_client import QdrantClient  # type: ignore
                url = os.getenv("QDRANT_URL")
                host = os.getenv("QDRANT_HOST", "localhost")
                port = int(os.getenv("QDRANT_PORT", "6333"))
                collection = os.getenv("QDRANT_COLLECTION", "valero_repo")
                client = QdrantClient(url=url) if url else QdrantClient(host=host, port=port)
                vs = Qdrant.from_texts(
                    texts=documents,
                    embedding=self._embeddings,
                    metadatas=metadatas,
                    url=url if url else None,
                    host=None if url else host,
                    port=None if url else port,
                    collection_name=collection,
                )
                return vs
        except Exception as e:
            logger.warning("Vectorstore '%s' konnte nicht aufgebaut werden: %s", backend, str(e))
            return None

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

        # Versuche ausgewähltes Backend
        self._vectorstore = self._init_vectorstore(documents, metadatas)

        # Fallback-Index (einfach/BM25): speichere Texte + Metadaten
        if self._vectorstore is None:
            self._docs_fallback = [
                {"text": t, "metadata": m}
                for t, m in zip(documents, metadatas)
            ]
            # BM25-Index aufbauen
            self._build_bm25(documents, metadatas)
            # Persistiere als JSON für Transparenz (nur Texte/Metadaten)
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
        # Falls noch kein Vectorstore im Speicher: versuchen zu laden
        if self._vectorstore is None and self._has_langchain and self._embeddings is not None:
            try:
                if self.vector_backend == "faiss":
                    from langchain_community.vectorstores import FAISS  # type: ignore
                    self._vectorstore = FAISS.load_local(str(self.db_dir), self._embeddings, allow_dangerous_deserialization=True)
                elif self.vector_backend == "chroma":
                    from langchain_community.vectorstores import Chroma  # type: ignore
                    persist_dir = str(self.db_dir / "chroma")
                    self._vectorstore = Chroma(collection_name="valero_repo", embedding_function=self._embeddings, persist_directory=persist_dir)
                elif self.vector_backend == "qdrant":
                    from langchain_community.vectorstores import Qdrant  # type: ignore
                    from qdrant_client import QdrantClient  # type: ignore
                    url = os.getenv("QDRANT_URL")
                    host = os.getenv("QDRANT_HOST", "localhost")
                    port = int(os.getenv("QDRANT_PORT", "6333"))
                    collection = os.getenv("QDRANT_COLLECTION", "valero_repo")
                    client = QdrantClient(url=url) if url else QdrantClient(host=host, port=port)
                    # Laden per Client + Collection
                    self._vectorstore = Qdrant(
                        client=client,
                        collection_name=collection,
                        embeddings=self._embeddings,
                    )
            except Exception as e:
                logger.warning("Konnte persistente Vektordaten nicht laden: %s", str(e))
                self._vectorstore = None

        if self._vectorstore is not None:
            try:
                results = self._vectorstore.similarity_search_with_score(query_text, k=top_k)  # type: ignore
                output: List[Dict[str, Any]] = []
                for doc, score in results:
                    output.append({
                        "text": getattr(doc, "page_content", getattr(doc, "text", "")),
                        "metadata": getattr(doc, "metadata", {}) or {},
                        "score": float(score) if not isinstance(score, dict) else float(score.get("score", 0.0))
                    })
                return output
            except Exception as e:
                logger.warning("Fehler bei Vector-Query, weiche auf Fallback aus: %s", str(e))
        # BM25 bevorzugt, wenn verfügbar
        if self._bm25_enabled and self._bm25_inv_index:
            return self._bm25_query(query_text, top_k=top_k)
        # Einfacher Keyword-Fallback
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
            "vector_backend": self.vector_backend,
            "fallback_docs": len(self._docs_fallback),
        }