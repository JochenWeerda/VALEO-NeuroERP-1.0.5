# -*- coding: utf-8 -*-
from __future__ import annotations

import os
from typing import List, Dict, Any

DEFAULT_BASE_URL = os.getenv("LLM_BASE_URL", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("LLM_MODEL", "gpt-oss-20b-small")

PROMPT_TMPL = (
    "Du bist ein präziser Assistent. Antworte auf Deutsch und nutze nur den gegebenen Kontext.\n"
    "Wenn die Antwort nicht sicher im Kontext steht, sage: 'Nicht im Kontext vorhanden.'\n\n"
    "Frage: {question}\n\n"
    "Kontext:\n{context}\n\n"
    "Antwort:"
)


def build_context(chunks: List[Dict[str, Any]], max_chars: int = 4000) -> str:
    parts: List[str] = []
    total = 0
    for c in chunks:
        t = c.get("text", "")
        if not t:
            continue
        if total + len(t) > max_chars:
            t = t[: max(0, max_chars - total)]
        parts.append(t)
        total += len(t)
        if total >= max_chars:
            break
    return "\n---\n".join(parts)


def synthesize_local_ollama(question: str, chunks: List[Dict[str, Any]], base_url: str | None = None, model: str | None = None) -> str:
    base_url = base_url or DEFAULT_BASE_URL
    model = model or DEFAULT_MODEL

    try:
        # LangChain Community Wrapper
        from langchain_community.chat_models import ChatOllama
        from langchain.schema import HumanMessage, SystemMessage

        context = build_context(chunks)
        if not context.strip():
            return "Nicht im Kontext vorhanden."

        llm = ChatOllama(base_url=base_url, model=model, temperature=0.3)
        messages = [
            SystemMessage(content="Du bist ein hilfreicher, präziser Assistent."),
            HumanMessage(content=PROMPT_TMPL.format(question=question, context=context)),
        ]
        resp = llm.invoke(messages)
        return getattr(resp, "content", str(resp))
    except Exception:
        # Fallback: Kontext zusammenfassen (sehr simpel)
        ctx = build_context(chunks, max_chars=800)
        return f"[Fallback ohne LLM]\nKontext-Auszug:\n{ctx[:600]}\n...\nAntwort (heuristisch): Nicht im Kontext vorhanden."