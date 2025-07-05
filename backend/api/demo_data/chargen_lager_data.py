"""
Demo-Daten für die Chargen-Lager-Integration.
"""

# Demo-Daten für die Chargen-Lager-Integration
chargen_lager_bewegungen = [
    {
        "id": 1,
        "charge_id": 1,
        "lager_id": 1,
        "lagerort_id": 1,
        "bewegungs_typ": "eingang",
        "menge": 500.0,
        "einheit_id": 1,
        "referenz_typ": "wareneingang",
        "referenz_id": 1,
        "notiz": "Initialbestand Charge 1",
        "erstellt_am": "2025-05-01T10:30:00Z",
        "erstellt_von": 1
    },
    {
        "id": 2,
        "charge_id": 2,
        "lager_id": 1,
        "lagerort_id": 2,
        "bewegungs_typ": "eingang",
        "menge": 750.0,
        "einheit_id": 1,
        "referenz_typ": "wareneingang",
        "referenz_id": 2,
        "notiz": "Initialbestand Charge 2",
        "erstellt_am": "2025-05-02T11:15:00Z",
        "erstellt_von": 1
    },
    {
        "id": 3,
        "charge_id": 1,
        "lager_id": 1,
        "lagerort_id": 1,
        "bewegungs_typ": "ausgang",
        "menge": 100.0,
        "einheit_id": 1,
        "referenz_typ": "produktion",
        "referenz_id": 1,
        "notiz": "Entnahme für Produktion",
        "erstellt_am": "2025-05-05T09:00:00Z",
        "erstellt_von": 2
    },
    {
        "id": 4,
        "charge_id": 3,
        "lager_id": 1,
        "lagerort_id": 3,
        "bewegungs_typ": "eingang",
        "menge": 200.0,
        "einheit_id": 1,
        "referenz_typ": "produktion",
        "referenz_id": 1,
        "notiz": "Produktionseingang",
        "erstellt_am": "2025-05-05T15:30:00Z",
        "erstellt_von": 2
    },
    {
        "id": 5,
        "charge_id": 3,
        "lager_id": 1,
        "lagerort_id": 3,
        "bewegungs_typ": "transfer",
        "menge": 50.0,
        "einheit_id": 1,
        "ziel_lager_id": 2,
        "ziel_lagerort_id": 5,
        "referenz_typ": "transfer",
        "referenz_id": 1,
        "notiz": "Transfer zu anderem Lager",
        "erstellt_am": "2025-05-10T13:45:00Z",
        "erstellt_von": 3
    }
]

chargen_reservierungen = [
    {
        "id": 1,
        "charge_id": 1,
        "lager_id": 1,
        "lagerort_id": 1,
        "menge": 50.0,
        "einheit_id": 1,
        "referenz_typ": "auftrag",
        "referenz_id": 101,
        "status": "aktiv",
        "gueltig_bis": "2025-06-30T23:59:59Z",
        "erstellt_am": "2025-05-05T10:00:00Z",
        "erstellt_von": 1
    },
    {
        "id": 2,
        "charge_id": 2,
        "lager_id": 1,
        "lagerort_id": 2,
        "menge": 100.0,
        "einheit_id": 1,
        "referenz_typ": "auftrag",
        "referenz_id": 102,
        "status": "aktiv",
        "gueltig_bis": "2025-06-15T23:59:59Z",
        "erstellt_am": "2025-05-06T11:30:00Z",
        "erstellt_von": 1
    },
    {
        "id": 3,
        "charge_id": 3,
        "lager_id": 1,
        "lagerort_id": 3,
        "menge": 75.0,
        "einheit_id": 1,
        "referenz_typ": "produktion",
        "referenz_id": 201,
        "status": "aktiv",
        "gueltig_bis": "2025-05-31T23:59:59Z",
        "erstellt_am": "2025-05-10T09:15:00Z",
        "erstellt_von": 2
    }
]

# Demo-Daten für Lagerorte
lagerorte = [
    {
        "id": 1,
        "lager_id": 1,
        "name": "Regal A1",
        "beschreibung": "Hauptlager Regal A1",
        "kapazitaet": 1000,
        "temperatur_min": 15,
        "temperatur_max": 25,
        "feuchte_min": 40,
        "feuchte_max": 60
    },
    {
        "id": 2,
        "lager_id": 1,
        "name": "Regal B2",
        "beschreibung": "Hauptlager Regal B2",
        "kapazitaet": 800,
        "temperatur_min": 15,
        "temperatur_max": 25,
        "feuchte_min": 40,
        "feuchte_max": 60
    },
    {
        "id": 3,
        "lager_id": 1,
        "name": "Regal C3",
        "beschreibung": "Hauptlager Regal C3",
        "kapazitaet": 1200,
        "temperatur_min": 15,
        "temperatur_max": 25,
        "feuchte_min": 40,
        "feuchte_max": 60
    },
    {
        "id": 4,
        "lager_id": 2,
        "name": "Zone A",
        "beschreibung": "Außenlager Zone A",
        "kapazitaet": 2000,
        "temperatur_min": 10,
        "temperatur_max": 30,
        "feuchte_min": 30,
        "feuchte_max": 70
    },
    {
        "id": 5,
        "lager_id": 2,
        "name": "Zone B",
        "beschreibung": "Außenlager Zone B",
        "kapazitaet": 1500,
        "temperatur_min": 10,
        "temperatur_max": 30,
        "feuchte_min": 30,
        "feuchte_max": 70
    }
] 