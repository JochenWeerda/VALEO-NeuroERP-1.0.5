"""
Demo-Daten für die Produktionsprozesse
"""

# Demo-Daten für Produktionsaufträge
produktionsauftraege = [
    {
        "id": 1,
        "artikel_id": 3,
        "produktions_menge": 100.0,
        "einheit_id": 1,
        "ziel_lager_id": 1,
        "ziel_lagerort_id": 3,
        "geplanter_start": "2025-05-01T08:00:00+00:00",
        "geplantes_ende": "2025-05-01T16:00:00+00:00",
        "prioritaet": 1,
        "status": "abgeschlossen",
        "charge_id": 3,
        "bemerkungen": "Standard-Produktion",
        "erstellt_am": "2025-04-28T10:00:00+00:00",
        "erstellt_von": 1,
        "geaendert_am": "2025-05-01T16:30:00+00:00",
        "geaendert_von": 1
    },
    {
        "id": 2,
        "artikel_id": 4,
        "produktions_menge": 50.0,
        "einheit_id": 1,
        "ziel_lager_id": 1,
        "ziel_lagerort_id": 4,
        "geplanter_start": "2025-05-10T08:00:00+00:00",
        "geplantes_ende": "2025-05-10T12:00:00+00:00",
        "prioritaet": 2,
        "status": "geplant",
        "charge_id": None,
        "bemerkungen": "Eilauftrag",
        "erstellt_am": "2025-05-05T14:00:00+00:00",
        "erstellt_von": 1,
        "geaendert_am": None,
        "geaendert_von": None
    },
    {
        "id": 3,
        "artikel_id": 5,
        "produktions_menge": 200.0,
        "einheit_id": 1,
        "ziel_lager_id": 2,
        "ziel_lagerort_id": 7,
        "geplanter_start": "2025-05-15T07:00:00+00:00",
        "geplantes_ende": "2025-05-15T19:00:00+00:00",
        "prioritaet": 1,
        "status": "in_produktion",
        "charge_id": 5,
        "bemerkungen": "Großauftrag mit mehreren Materialien",
        "erstellt_am": "2025-05-10T11:30:00+00:00",
        "erstellt_von": 2,
        "geaendert_am": "2025-05-15T07:15:00+00:00",
        "geaendert_von": 2
    }
]

# Demo-Daten für Produktionsprozess-Materialien
produktionsmaterialien = [
    {
        "id": 1,
        "produktionsauftrag_id": 1,
        "artikel_id": 1,
        "charge_id": 1,
        "menge": 75.0,
        "einheit_id": 1,
    },
    {
        "id": 2,
        "produktionsauftrag_id": 1,
        "artikel_id": 2,
        "charge_id": 2,
        "menge": 25.0,
        "einheit_id": 1,
    },
    {
        "id": 3,
        "produktionsauftrag_id": 2,
        "artikel_id": 1,
        "charge_id": 1,
        "menge": 40.0,
        "einheit_id": 1,
    },
    {
        "id": 4,
        "produktionsauftrag_id": 3,
        "artikel_id": 1,
        "charge_id": 1,
        "menge": 120.0,
        "einheit_id": 1,
    },
    {
        "id": 5,
        "produktionsauftrag_id": 3,
        "artikel_id": 2,
        "charge_id": 2,
        "menge": 60.0,
        "einheit_id": 1,
    },
    {
        "id": 6,
        "produktionsauftrag_id": 3,
        "artikel_id": 3,
        "charge_id": 3,
        "menge": 20.0,
        "einheit_id": 1,
    }
]

# Demo-Daten für Produktionsschritt-Protokolle
produktionsschritte = [
    {
        "id": 1,
        "produktionsauftrag_id": 1,
        "schritt_name": "Vormischen",
        "status": "abgeschlossen",
        "beginn": "2025-05-01T08:15:00+00:00",
        "ende": "2025-05-01T09:30:00+00:00",
        "ausgeführt_von": 3,
        "bemerkungen": "Mischvorgang ohne Probleme",
        "parameter": {
            "temperatur": "22°C",
            "mischzeit": "45 Minuten",
            "drehzahl": "120 U/min"
        }
    },
    {
        "id": 2,
        "produktionsauftrag_id": 1,
        "schritt_name": "Erhitzen",
        "status": "abgeschlossen",
        "beginn": "2025-05-01T09:45:00+00:00",
        "ende": "2025-05-01T11:15:00+00:00",
        "ausgeführt_von": 3,
        "bemerkungen": "Temperaturprofil eingehalten",
        "parameter": {
            "zieltemperatur": "85°C",
            "haltedauer": "30 Minuten",
            "aufheizrate": "2°C/min"
        }
    },
    {
        "id": 3,
        "produktionsauftrag_id": 1,
        "schritt_name": "Abfüllen",
        "status": "abgeschlossen",
        "beginn": "2025-05-01T11:30:00+00:00",
        "ende": "2025-05-01T13:00:00+00:00",
        "ausgeführt_von": 4,
        "bemerkungen": "Keine Auffälligkeiten",
        "parameter": {
            "füllmenge": "500g pro Behälter",
            "behälter": "Kunststoffeimer 1kg"
        }
    },
    {
        "id": 4,
        "produktionsauftrag_id": 3,
        "schritt_name": "Vormischen",
        "status": "abgeschlossen",
        "beginn": "2025-05-15T07:30:00+00:00",
        "ende": "2025-05-15T09:00:00+00:00",
        "ausgeführt_von": 3,
        "bemerkungen": "Längere Mischzeit nötig als geplant",
        "parameter": {
            "temperatur": "20°C",
            "mischzeit": "90 Minuten",
            "drehzahl": "150 U/min"
        }
    },
    {
        "id": 5,
        "produktionsauftrag_id": 3,
        "schritt_name": "Erhitzen",
        "status": "in_bearbeitung",
        "beginn": "2025-05-15T09:15:00+00:00",
        "ende": None,
        "ausgeführt_von": 3,
        "bemerkungen": "Aufheizphase läuft planmäßig",
        "parameter": {
            "zieltemperatur": "90°C",
            "haltedauer": "45 Minuten",
            "aufheizrate": "1.5°C/min"
        }
    }
]

# Demo-Daten für Chargen-Verfolgungen in der Produktion
produktions_chargen_verfolgungen = [
    {
        "id": 1,
        "quell_charge_id": 1,
        "ziel_charge_id": 3,
        "menge": 75.0,
        "einheit_id": 1,
        "prozess_typ": "produktion",
        "prozess_id": 1,
        "erstellt_am": "2025-05-01T08:15:00+00:00",
        "erstellt_von": 3
    },
    {
        "id": 2,
        "quell_charge_id": 2,
        "ziel_charge_id": 3,
        "menge": 25.0,
        "einheit_id": 1,
        "prozess_typ": "produktion",
        "prozess_id": 1,
        "erstellt_am": "2025-05-01T08:15:00+00:00",
        "erstellt_von": 3
    },
    {
        "id": 3,
        "quell_charge_id": 1,
        "ziel_charge_id": 5,
        "menge": 120.0,
        "einheit_id": 1,
        "prozess_typ": "produktion",
        "prozess_id": 3,
        "erstellt_am": "2025-05-15T07:30:00+00:00",
        "erstellt_von": 3
    },
    {
        "id": 4,
        "quell_charge_id": 2,
        "ziel_charge_id": 5,
        "menge": 60.0,
        "einheit_id": 1,
        "prozess_typ": "produktion",
        "prozess_id": 3,
        "erstellt_am": "2025-05-15T07:30:00+00:00",
        "erstellt_von": 3
    },
    {
        "id": 5,
        "quell_charge_id": 3,
        "ziel_charge_id": 5,
        "menge": 20.0,
        "einheit_id": 1,
        "prozess_typ": "produktion",
        "prozess_id": 3,
        "erstellt_am": "2025-05-15T07:30:00+00:00",
        "erstellt_von": 3
    }
] 