# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import math
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# ---------- Utility ----------

def load_json(path: str) -> Any:
    p = Path(path)
    return json.loads(p.read_text(encoding="utf-8"))


def save_json(path: str, data: Any) -> None:
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

# ---------- Warenwirtschaft ----------

def suggest_reorder(items: List[Dict[str, Any]], safety_days: int = 5) -> List[Dict[str, Any]]:
    """
    Erzeugt Dispo-Vorschläge basierend auf Mindestbestand, Durchschnittsbedarf und Lieferzeit.
    Erwartete Felder: sku, stock, min, max, lead_time_days, avg_daily_demand
    """
    suggestions: List[Dict[str, Any]] = []
    for it in items:
        sku = it.get("sku")
        stock = float(it.get("stock", 0))
        min_b = float(it.get("min", 0))
        max_b = float(it.get("max", 0)) or max(min_b * 2, 1)
        ltd = int(it.get("lead_time_days", 0))
        add = float(it.get("avg_daily_demand", 0))
        # Bedarf bis Wiederbeschaffung + Sicherheitspuffer
        demand_until_arrival = add * (ltd + safety_days)
        reorder_point = min_b + demand_until_arrival
        if stock < reorder_point:
            target = max_b + demand_until_arrival
            qty = max(0, math.ceil(target - stock))
            if qty > 0:
                suggestions.append({
                    "sku": sku,
                    "order_qty": qty,
                    "reason": f"Stock {stock} < reorder_point {reorder_point:.1f}",
                    "lead_time_days": ltd
                })
    # Priorisierung: niedrigster Bestand zu Bedarf zuerst
    suggestions.sort(key=lambda s: s["order_qty"], reverse=True)
    return suggestions

# ---------- CRM ----------

def dedupe_leads(leads: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Führt einfache Dublettenprüfung durch: bevorzugt Email, sonst Firmen-/Namenssimilarität."""
    seen_email: Dict[str, Dict[str, Any]] = {}
    groups: List[List[Dict[str, Any]]] = []

    def norm(s: Optional[str]) -> str:
        return (s or "").strip().lower()

    # 1) Email-basierte Cluster
    leftovers: List[Dict[str, Any]] = []
    for ld in leads:
        email = norm(ld.get("email"))
        if email:
            if email in seen_email:
                seen_email[email]["_dupes"].append(ld)
            else:
                base = dict(ld)
                base["_dupes"] = []
                seen_email[email] = base
        else:
            leftovers.append(ld)

    # 2) Namen/Firma Token-Overlap (simple)
    def tokens(x: str) -> set:
        return set(t for t in norm(x).replace("-", " ").split() if t)

    used = [False] * len(leftovers)
    for i, a in enumerate(leftovers):
        if used[i]:
            continue
        group = [a]
        ta = tokens(a.get("company", "") + " " + a.get("name", ""))
        for j in range(i + 1, len(leftovers)):
            if used[j]:
                continue
            b = leftovers[j]
            tb = tokens(b.get("company", "") + " " + b.get("name", ""))
            if ta and tb and len(ta & tb) >= max(1, min(len(ta), len(tb)) // 2):
                group.append(b)
                used[j] = True
        used[i] = True
        groups.append(group)

    # Ergebnis zusammenbauen
    clusters: List[Dict[str, Any]] = []
    for email, base in seen_email.items():
        cluster = [dict({"email": email}, **{k: v for k, v in base.items() if k != "_dupes"})]
        cluster.extend(base["_dupes"])
        clusters.append({"key": email, "items": cluster})
    for grp in groups:
        key = norm(grp[0].get("company") or grp[0].get("name") or "group")
        clusters.append({"key": key, "items": grp})
    return {"clusters": clusters}

# ---------- FiBu ----------

def match_payments(invoices: List[Dict[str, Any]], payments: List[Dict[str, Any]], date_tolerance_days: int = 10) -> Dict[str, Any]:
    """
    Matched Zahlungseingänge zu Rechnungen: Regeln: exakter Betrag, Referenz enthält Rechnungsnummer, Datumstoleranz.
    Erwartete Felder:
      - invoice: id, number, amount, due_date
      - payment: id, amount, booking_date, reference
    """
    inv_by_num = {str(inv.get("number")): inv for inv in invoices}
    unmatched_invoices = set(inv.get("id") for inv in invoices)
    unmatched_payments = set(p.get("id") for p in payments)
    matches: List[Dict[str, Any]] = []

    def parse_date(s: Optional[str]) -> Optional[datetime]:
        if not s:
            return None
        for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(s, fmt)
            except Exception:
                continue
        return None

    # 1) Referenz + Betrag
    for p in payments:
        pref = str(p.get("reference", ""))
        pamt = float(p.get("amount", 0))
        pdate = parse_date(p.get("booking_date")) or datetime.utcnow()
        candidate: Optional[Dict[str, Any]] = None
        # Suche nach Rechnungsnummer in Referenz
        for num, inv in inv_by_num.items():
            if num and num in pref and abs(float(inv.get("amount", 0)) - pamt) < 0.01:
                idate = parse_date(inv.get("due_date")) or pdate
                if abs((pdate - idate).days) <= date_tolerance_days:
                    candidate = inv
                    break
        if candidate:
            matches.append({"invoice_id": candidate.get("id"), "payment_id": p.get("id"), "amount": pamt})
            unmatched_invoices.discard(candidate.get("id"))
            unmatched_payments.discard(p.get("id"))

    # 2) Exakter Betrag ohne Referenztreffer (noch offen)
    open_invoices = [inv for inv in invoices if inv.get("id") in unmatched_invoices]
    open_payments = [p for p in payments if p.get("id") in unmatched_payments]
    for inv in open_invoices:
        for p in open_payments:
            if abs(float(inv.get("amount", 0)) - float(p.get("amount", 0))) < 0.01:
                matches.append({"invoice_id": inv.get("id"), "payment_id": p.get("id"), "amount": float(p.get("amount", 0))})
                unmatched_invoices.discard(inv.get("id"))
                unmatched_payments.discard(p.get("id"))
                break

    return {
        "matches": matches,
        "unmatched_invoices": list(unmatched_invoices),
        "unmatched_payments": list(unmatched_payments)
    }


def generate_dunning(invoices: List[Dict[str, Any]], today: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Erzeugt Mahnstufen und Textvorschläge je überfällige Rechnung.
    """
    now = datetime.strptime(today, "%Y-%m-%d") if today else datetime.utcnow()
    out: List[Dict[str, Any]] = []

    def parse_date(s: Optional[str]) -> Optional[datetime]:
        if not s:
            return None
        for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(s, fmt)
            except Exception:
                continue
        return None

    for inv in invoices:
        due = parse_date(inv.get("due_date"))
        if not due:
            continue
        days = (now - due).days
        if days <= 0:
            continue
        if days <= 14:
            level = 1
            text = f"Freundliche Zahlungserinnerung: Rechnung {inv.get('number')} über {inv.get('amount')} ist seit {days} Tagen fällig."
        elif days <= 30:
            level = 2
            text = f"1. Mahnung: Rechnung {inv.get('number')} über {inv.get('amount')} ist seit {days} Tagen überfällig. Bitte begleichen Sie den Betrag."
        else:
            level = 3
            text = f"2. Mahnung: Rechnung {inv.get('number')} über {inv.get('amount')} ist seit {days} Tagen überfällig. Wir behalten uns rechtliche Schritte vor."
        out.append({
            "invoice_id": inv.get("id"),
            "number": inv.get("number"),
            "days_overdue": days,
            "level": level,
            "text": text
        })
    out.sort(key=lambda x: (x["level"], -x["days_overdue"]))
    return out

# ---------- Dateibasierte Wrapper ----------

def suggest_reorder_from_file(stock_path: str, out_path: Optional[str] = None) -> List[Dict[str, Any]]:
    data = load_json(stock_path)
    res = suggest_reorder(data)
    if out_path:
        save_json(out_path, res)
    return res


def dedupe_leads_from_file(leads_path: str, out_path: Optional[str] = None) -> Dict[str, Any]:
    data = load_json(leads_path)
    res = dedupe_leads(data)
    if out_path:
        save_json(out_path, res)
    return res


def match_payments_from_files(invoices_path: str, payments_path: str, out_path: Optional[str] = None) -> Dict[str, Any]:
    inv = load_json(invoices_path)
    pay = load_json(payments_path)
    res = match_payments(inv, pay)
    if out_path:
        save_json(out_path, res)
    return res


def generate_dunning_from_file(invoices_path: str, out_path: Optional[str] = None, today: Optional[str] = None) -> List[Dict[str, Any]]:
    inv = load_json(invoices_path)
    res = generate_dunning(inv, today=today)
    if out_path:
        save_json(out_path, res)
    return res