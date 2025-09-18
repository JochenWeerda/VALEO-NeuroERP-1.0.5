"""
Predictive Economy – heuristische Vorbestell-Empfehlungen (Lieferung vor Bestellung)
"""

from __future__ import annotations
import statistics
from typing import List, Dict, Any
from datetime import datetime, timedelta

from backend.apm_framework.llm_service import LLMService, LLMProvider


def moving_average(values: List[float], window: int = 4) -> float:
    if not values:
        return 0.0
    window = max(1, min(window, len(values)))
    return sum(values[-window:]) / window


async def forecast_preorder_suggestions(
    sku_history: List[Dict[str, Any]],
    safety_factor: float = 1.2,
    provider: str = "ollama"
) -> Dict[str, Any]:
    """
    Erzeugt einfache Vorbestell-Empfehlungen aus Vergangenheitsdaten und LLM-Validierung.
    sku_history: [{"sku": str, "date": str (ISO), "qty": float}]
    """
    # Gruppieren nach SKU
    sku_to_series: Dict[str, List[float]] = {}
    for row in sorted(sku_history, key=lambda r: r.get("date", "")):
        sku = str(row.get("sku", "")).strip()
        qty = float(row.get("qty", 0.0))
        if not sku:
            continue
        sku_to_series.setdefault(sku, []).append(qty)

    baseline: Dict[str, float] = {}
    for sku, series in sku_to_series.items():
        baseline[sku] = moving_average(series, window=4) * safety_factor

    # LLM-Validierung/Anreicherung (optional)
    llm = LLMService(LLMProvider(provider)) if provider in {p.value for p in LLMProvider} else LLMService(LLMProvider.OLLAMA)
    enriched: Dict[str, Any] = {
        "generated_at": datetime.utcnow().isoformat(),
        "suggestions": []
    }

    try:
        prompt = (
            "Analysiere folgende Nachfrage-Basiswerte je SKU und gib konsolidierte Vorbestell-Empfehlungen zurück.\n"
            "Format: Liste mit Objekten {sku, recommendedQty, rationale}.\n"
            f"Baseline: {baseline}\n"
        )
        analysis = await llm.analyze_requirement(prompt)
        # Für MVP: LLM-Text nur als Begründung anhängen, Empfehlung aus Baseline
        for sku, qty in baseline.items():
            enriched["suggestions"].append({
                "sku": sku,
                "recommendedQty": round(qty, 2),
                "rationale": analysis[:500]
            })
    except Exception:
        # Fallback: Nur Baseline
        for sku, qty in baseline.items():
            enriched["suggestions"].append({
                "sku": sku,
                "recommendedQty": round(qty, 2),
                "rationale": "Baseline moving average * safety_factor"
            })

    return enriched
