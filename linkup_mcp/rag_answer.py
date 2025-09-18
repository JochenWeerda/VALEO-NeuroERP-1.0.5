# -*- coding: utf-8 -*-
from __future__ import annotations

import json
from typing import List, Dict, Any
import requests


def synthesize_local_ollama(question: str, hits: List[Dict[str, Any]], base_url: str = "http://localhost:11434", model: str = "gpt-oss-20b-small") -> str:
    context = "\n\n".join([f"[Snippet {i+1}]\n{h.get('text','')}\n" for i, h in enumerate(hits)])
    prompt = (
        "Du bist ein deutscher Assistent. Beantworte die Frage auf Basis der folgenden Code-Snippets. "
        "Wenn Informationen fehlen, sage das klar. Nutze Zitate aus den Snippets sparsam.\n\n"
        f"Frage: {question}\n\nKontext:\n{context}\n\nAntwort:"
    )
    try:
        resp = requests.post(
            f"{base_url}/api/generate",
            headers={"Content-Type": "application/json"},
            data=json.dumps({
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.2, "num_ctx": 1536, "num_predict": 512}
            }),
            timeout=120
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("response", "")
    except Exception as e:
        return f"[Synthese-Fehler] {e}"
