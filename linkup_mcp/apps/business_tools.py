# -*- coding: utf-8 -*-
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Tuple


def suggest_reorder(stock_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    suggestions: List[Dict[str, Any]] = []
    for item in stock_items:
        qty = float(item.get("stock", 0) or 0)
        rp = float(item.get("reorder_point", 0) or 0)
        if qty <= rp:
            target = max(rp * 1.5, rp + 1)
            order_qty = round(max(target - qty, 0), 3)
            suggestions.append({
                "sku": item.get("sku"),
                "name": item.get("name"),
                "unit": item.get("unit", ""),
                "current_stock": qty,
                "reorder_point": rp,
                "suggested_order": order_qty
            })
    return suggestions


def dedupe_leads(leads: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    seen_keys = set()
    uniques: List[Dict[str, Any]] = []
    dups: List[Dict[str, Any]] = []

    def norm(s: Any) -> str:
        if not s:
            return ""
        return str(s).strip().lower().replace(" ", "")

    for lead in leads:
        key = (norm(lead.get("email")) or norm(lead.get("company")), norm(lead.get("contact")))
        if key in seen_keys:
            dups.append(lead)
        else:
            seen_keys.add(key)
            uniques.append(lead)
    return uniques, dups


def match_payments(invoices: List[Dict[str, Any]], payments: List[Dict[str, Any]]) -> Dict[str, Any]:
    inv_map = {inv.get("invoice_no"): inv for inv in invoices}
    matches: List[Dict[str, Any]] = []
    unmatched: List[Dict[str, Any]] = []

    for pay in payments:
        ref = pay.get("reference")
        amt = float(pay.get("amount", 0) or 0)
        inv = inv_map.get(ref)
        if inv is None:
            unmatched.append({"payment": pay, "reason": "invoice_not_found"})
            continue
        inv_amt = float(inv.get("amount", 0) or 0)
        if abs(inv_amt - amt) < 1e-6:
            matches.append({"invoice": inv, "payment": pay, "status": "matched"})
        else:
            unmatched.append({"payment": pay, "reason": "amount_mismatch", "invoice_amount": inv_amt})

    return {"matches": matches, "unmatched": unmatched}


def generate_dunning(invoices: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    dunnings: List[Dict[str, Any]] = []
    for inv in invoices:
        if inv.get("open") is True:
            dunnings.append({
                "invoice_no": inv.get("invoice_no"),
                "customer": inv.get("customer"),
                "amount": inv.get("amount"),
                "level": 1,
                "action": "send_reminder"
            })
    return dunnings


# File-based wrappers

def _read_json(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, list):
            return data
        return []
    except Exception:
        return []


def reorder_from_file(path: str) -> List[Dict[str, Any]]:
    return suggest_reorder(_read_json(Path(path)))


def dedupe_from_file(path: str) -> Dict[str, Any]:
    uniques, dups = dedupe_leads(_read_json(Path(path)))
    return {"uniques": uniques, "duplicates": dups}


def match_from_files(invoices_path: str, payments_path: str) -> Dict[str, Any]:
    return match_payments(_read_json(Path(invoices_path)), _read_json(Path(payments_path)))


def dunning_from_file(invoices_path: str) -> List[Dict[str, Any]]:
    return generate_dunning(_read_json(Path(invoices_path)))
