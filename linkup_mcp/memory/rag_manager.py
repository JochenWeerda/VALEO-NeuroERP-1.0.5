# -*- coding: utf-8 -*-
from __future__ import annotations

import os, json, logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Iterable

logger = logging.getLogger(__name__)
SUPPORTED_EXTENSIONS = {".py", ".md", ".txt", ".json", ".yaml", ".yml", ".ts", ".tsx", ".js", ".jsx", ".html", ".css"}

class RAGMemoryManager:
    def __init__(self, db_dir: Optional[Path]=None, embedding_backend: str="hf", hf_model: str="sentence-transformers/all-MiniLM-L6-v2", vector_backend: Optional[str]=None) -> None:
        project_root = Path(__file__).parent.parent.parent
        default_db = project_root / "data" / "faiss_db"
        self.db_dir: Path = db_dir or default_db
        self.db_dir.mkdir(parents=True, exist_ok=True)
        self.embedding_backend = embedding_backend
        self.hf_model = hf_model
        self.vector_backend = (vector_backend or os.getenv("VECTOR_BACKEND", "fallback")).lower()
        self._vectorstore = None
        self._docs_fallback: List[Dict[str, Any]] = []
        self._bm25_enabled = True
        self._bm25_inv: Dict[str, List[tuple]] = {}
        self._bm25_df: Dict[str, int] = {}
        self._bm25_doclen: List[int] = []
        self._bm25_avgdl: float = 0.0
        self._bm25_texts: List[str] = []
        self._bm25_meta: List[Dict[str, Any]] = []
        # LangChain lazy flags
        self._has_langchain = False
        self._embeddings = None
        self._text_splitter = None
        try:
            from langchain.text_splitter import RecursiveCharacterTextSplitter  # type: ignore
            self._text_splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=160)
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
                try:
                    from langchain_community.vectorstores import FAISS  # noqa: F401
                    self._has_langchain = True
                except Exception:
                    self._has_langchain = False
        except Exception:
            pass

    def _iter_files(self, roots: Iterable[Path]) -> Iterable[Path]:
        for root in roots:
            if root.is_file():
                if root.suffix.lower() in SUPPORTED_EXTENSIONS:
                    yield root
                continue
            for p in root.rglob("*"):
                if p.is_file() and p.suffix.lower() in SUPPORTED_EXTENSIONS:
                    if any(part in {"node_modules", ".git", "venv", "build", "dist"} for part in p.parts):
                        continue
                    yield p

    def _load(self, path: Path) -> Optional[str]:
        try:
            return path.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return None

    def _split(self, text: str) -> List[str]:
        if self._text_splitter is None:
            chunks: List[str] = []; buf: List[str] = []; size=0
            for line in text.splitlines():
                buf.append(line); size+=len(line)+1
                if size>=1000: chunks.append("\n".join(buf)); buf=[]; size=0
            if buf: chunks.append("\n".join(buf))
            return chunks
        return self._text_splitter.split_text(text)

    def _tokenize(self, text: str) -> List[str]:
        out: List[str] = []; tok: List[str] = []
        for ch in text.lower():
            if "a"<=ch<="z" or "0"<=ch<="9" or ch in "äöüß": tok.append(ch)
            else:
                if tok: out.append("".join(tok)); tok=[]
        if tok: out.append("".join(tok))
        return out

    def _build_bm25(self, docs: List[str], metas: List[Dict[str, Any]]):
        inv: Dict[str,List[tuple]]={}; df: Dict[str,int]={}; dl: List[int]=[]
        for i,t in enumerate(docs):
            toks=self._tokenize(t); dl.append(len(toks)); tf: Dict[str,int]={}
            for w in toks: tf[w]=tf.get(w,0)+1
            for w,f in tf.items(): inv.setdefault(w,[]).append((i,f)); df[w]=df.get(w,0)+1
        self._bm25_inv=inv; self._bm25_df=df; self._bm25_doclen=dl; self._bm25_avgdl=(sum(dl)/len(dl)) if dl else 0.0
        self._bm25_texts=docs; self._bm25_meta=metas

    def _bm25_query(self, q: str, top_k: int) -> List[Dict[str, Any]]:
        N=len(self._bm25_doclen)
        if N==0: return []
        import math
        k1,b=1.5,0.75; scores: Dict[int,float]={}
        for qt in self._tokenize(q):
            df=self._bm25_df.get(qt,0)
            if df==0: continue
            idf=math.log(1.0+(N-df+0.5)/(df+0.5))
            for doc_id,tf in self._bm25_inv.get(qt, []):
                dl=self._bm25_doclen[doc_id] or 1
                denom=tf + k1*(1-b + b*(dl/(self._bm25_avgdl or 1.0)))
                score=idf*((tf*(k1+1))/denom)
                scores[doc_id]=scores.get(doc_id,0.0)+score
        ranked=sorted(scores.items(), key=lambda x:x[1], reverse=True)[:top_k]
        return [{"text":self._bm25_texts[i], "metadata": self._bm25_meta[i], "score": float(s)} for i,s in ranked]

    def build_index(self, root_paths: List[str]) -> Dict[str, Any]:
        files=list(self._iter_files(Path(p) for p in root_paths))
        docs: List[str]=[]; metas: List[Dict[str,Any]]=[]
        for f in files:
            t=self._load(f)
            if not t: continue
            for ch in self._split(t): docs.append(ch); metas.append({"source": str(f)})
        # Vectorstore optional (nur FAISS hier), standard Fallback
        if self._has_langchain and self._embeddings is not None and self.vector_backend=="faiss":
            try:
                from langchain_community.vectorstores import FAISS  # type: ignore
                try:
                    self._vectorstore = FAISS.load_local(str(self.db_dir), self._embeddings, allow_dangerous_deserialization=True)
                    self._vectorstore.add_texts(docs, metadatas=metas)
                except Exception:
                    self._vectorstore = FAISS.from_texts(docs, self._embeddings, metadatas=metas)
                    self._vectorstore.save_local(str(self.db_dir))
            except Exception as e:
                logger.warning("FAISS Fehler: %s", e); self._vectorstore=None
        if self._vectorstore is None:
            self._docs_fallback=[{"text":t, "metadata":m} for t,m in zip(docs, metas)]
            self._build_bm25(docs, metas)
            try: (self.db_dir/"fallback_store.json").write_text(json.dumps(self._docs_fallback)[:2_000_000], encoding="utf-8")
            except Exception: pass
        return self.export_manifest()

    def query(self, query_text: str, top_k: int = 6) -> List[Dict[str, Any]]:
        if self._vectorstore is not None:
            try:
                results=self._vectorstore.similarity_search_with_score(query_text, k=top_k)  # type: ignore
                out: List[Dict[str,Any]]=[]
                for doc,score in results:
                    out.append({"text":getattr(doc,"page_content",getattr(doc,"text","")),"metadata":getattr(doc,"metadata",{}) or {},"score": float(score) if not isinstance(score,dict) else float(score.get("score",0.0))})
                return out
            except Exception:
                pass
        if self._bm25_enabled and self._bm25_inv:
            return self._bm25_query(query_text, top_k)
        scored=[{"text":d["text"],"metadata":d.get("metadata",{}),"score": d["text"].lower().count(query_text.lower())/max(1,len(d["text"]))} for d in self._docs_fallback]
        scored.sort(key=lambda x:x["score"], reverse=True)
        return scored[:top_k]

    def export_manifest(self) -> Dict[str, Any]:
        return {"db_dir": str(self.db_dir), "backend": self.embedding_backend, "hf_model": self.hf_model, "vectorstore": self._vectorstore is not None, "vector_backend": self.vector_backend, "fallback_docs": len(self._docs_fallback)}
