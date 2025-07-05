"""
Standardisierter Kontenplan für das ERP-System.
Basiert auf dem SKR03/SKR04 (Standardkontenrahmen) für deutsche Unternehmen.
"""

STANDARD_KONTENPLAN = [
    # Aktiva (Vermögen)
    {"kontonummer": "0001", "bezeichnung": "Grundstücke ohne Bauten", "typ": "Aktiv"},
    {"kontonummer": "0100", "bezeichnung": "Geschäftsbauten", "typ": "Aktiv"},
    {"kontonummer": "0400", "bezeichnung": "Technische Anlagen und Maschinen", "typ": "Aktiv"},
    {"kontonummer": "0500", "bezeichnung": "Betriebs- und Geschäftsausstattung", "typ": "Aktiv"},
    {"kontonummer": "0600", "bezeichnung": "Büroausstattung", "typ": "Aktiv"},
    {"kontonummer": "0650", "bezeichnung": "Geringwertige Wirtschaftsgüter", "typ": "Aktiv"},
    {"kontonummer": "0700", "bezeichnung": "Fuhrpark", "typ": "Aktiv"},
    {"kontonummer": "1000", "bezeichnung": "Rohstoffe und Hilfsstoffe", "typ": "Aktiv"},
    {"kontonummer": "1200", "bezeichnung": "Fertige Erzeugnisse", "typ": "Aktiv"},
    {"kontonummer": "1300", "bezeichnung": "Waren", "typ": "Aktiv"},
    {"kontonummer": "1350", "bezeichnung": "Geleistete Anzahlungen auf Vorräte", "typ": "Aktiv"},
    {"kontonummer": "1400", "bezeichnung": "Forderungen aus Lieferungen und Leistungen", "typ": "Aktiv"},
    {"kontonummer": "1600", "bezeichnung": "Sonstige Forderungen", "typ": "Aktiv"},
    {"kontonummer": "1700", "bezeichnung": "Bank", "typ": "Aktiv"},
    {"kontonummer": "1800", "bezeichnung": "Kasse", "typ": "Aktiv"},
    
    # Passiva (Kapital)
    {"kontonummer": "2000", "bezeichnung": "Eigenkapital", "typ": "Passiv"},
    {"kontonummer": "2100", "bezeichnung": "Gezeichnetes Kapital", "typ": "Passiv"},
    {"kontonummer": "2200", "bezeichnung": "Kapitalrücklage", "typ": "Passiv"},
    {"kontonummer": "2300", "bezeichnung": "Gewinnrücklage", "typ": "Passiv"},
    {"kontonummer": "2400", "bezeichnung": "Gewinnvortrag/Verlustvortrag", "typ": "Passiv"},
    {"kontonummer": "2500", "bezeichnung": "Jahresüberschuss/Jahresfehlbetrag", "typ": "Passiv"},
    {"kontonummer": "3000", "bezeichnung": "Rückstellungen", "typ": "Passiv"},
    {"kontonummer": "3200", "bezeichnung": "Verbindlichkeiten gegenüber Kreditinstituten", "typ": "Passiv"},
    {"kontonummer": "3300", "bezeichnung": "Erhaltene Anzahlungen auf Bestellungen", "typ": "Passiv"},
    {"kontonummer": "3400", "bezeichnung": "Verbindlichkeiten aus Lieferungen und Leistungen", "typ": "Passiv"},
    {"kontonummer": "3500", "bezeichnung": "Sonstige Verbindlichkeiten", "typ": "Passiv"},
    {"kontonummer": "3700", "bezeichnung": "Verbindlichkeiten gegenüber Gesellschaftern", "typ": "Passiv"},
    {"kontonummer": "3800", "bezeichnung": "Umsatzsteuer", "typ": "Passiv"},
    {"kontonummer": "3900", "bezeichnung": "Vorsteuer", "typ": "Aktiv"},
    
    # Aufwendungen (Kosten)
    {"kontonummer": "4000", "bezeichnung": "Wareneinkauf Inland 19% USt", "typ": "Aufwand"},
    {"kontonummer": "4100", "bezeichnung": "Wareneinkauf Inland 7% USt", "typ": "Aufwand"},
    {"kontonummer": "4300", "bezeichnung": "Wareneinkauf EU 19% USt", "typ": "Aufwand"},
    {"kontonummer": "4400", "bezeichnung": "Wareneinkauf EU 7% USt", "typ": "Aufwand"},
    {"kontonummer": "4500", "bezeichnung": "Wareneinkauf Import", "typ": "Aufwand"},
    {"kontonummer": "5000", "bezeichnung": "Personalkosten", "typ": "Aufwand"},
    {"kontonummer": "5100", "bezeichnung": "Gehälter", "typ": "Aufwand"},
    {"kontonummer": "5200", "bezeichnung": "Löhne", "typ": "Aufwand"},
    {"kontonummer": "5300", "bezeichnung": "Gesetzliche Sozialaufwendungen", "typ": "Aufwand"},
    {"kontonummer": "5400", "bezeichnung": "Freiwillige Sozialaufwendungen", "typ": "Aufwand"},
    {"kontonummer": "6000", "bezeichnung": "Abschreibungen", "typ": "Aufwand"},
    {"kontonummer": "6300", "bezeichnung": "Reparatur und Instandhaltung", "typ": "Aufwand"},
    {"kontonummer": "6400", "bezeichnung": "Fahrzeugkosten", "typ": "Aufwand"},
    {"kontonummer": "6500", "bezeichnung": "Werbekosten", "typ": "Aufwand"},
    {"kontonummer": "6600", "bezeichnung": "Kosten der Warenabgabe", "typ": "Aufwand"},
    {"kontonummer": "6700", "bezeichnung": "Reisekosten", "typ": "Aufwand"},
    {"kontonummer": "6800", "bezeichnung": "Kommunikationskosten", "typ": "Aufwand"},
    {"kontonummer": "6900", "bezeichnung": "Bürobedarf", "typ": "Aufwand"},
    {"kontonummer": "7000", "bezeichnung": "Versicherungen", "typ": "Aufwand"},
    {"kontonummer": "7100", "bezeichnung": "Beiträge und Gebühren", "typ": "Aufwand"},
    {"kontonummer": "7200", "bezeichnung": "Verschiedene Kosten", "typ": "Aufwand"},
    {"kontonummer": "7600", "bezeichnung": "Zinsen und ähnliche Aufwendungen", "typ": "Aufwand"},
    
    # Erträge (Umsätze)
    {"kontonummer": "8000", "bezeichnung": "Umsatzerlöse 19% USt", "typ": "Ertrag"},
    {"kontonummer": "8100", "bezeichnung": "Umsatzerlöse 7% USt", "typ": "Ertrag"},
    {"kontonummer": "8200", "bezeichnung": "Umsatzerlöse steuerfrei", "typ": "Ertrag"},
    {"kontonummer": "8300", "bezeichnung": "Umsatzerlöse EU 19% USt", "typ": "Ertrag"},
    {"kontonummer": "8400", "bezeichnung": "Umsatzerlöse EU 7% USt", "typ": "Ertrag"},
    {"kontonummer": "8500", "bezeichnung": "Umsatzerlöse Export", "typ": "Ertrag"},
    {"kontonummer": "8700", "bezeichnung": "Erträge aus Anlageverkäufen", "typ": "Ertrag"},
    {"kontonummer": "8800", "bezeichnung": "Sonstige betriebliche Erträge", "typ": "Ertrag"},
    {"kontonummer": "8900", "bezeichnung": "Erträge aus Wertpapieren", "typ": "Ertrag"},
    {"kontonummer": "9000", "bezeichnung": "Zinsen und ähnliche Erträge", "typ": "Ertrag"},
    
    # Neutrale Konten
    {"kontonummer": "9500", "bezeichnung": "Privatentnahmen", "typ": "Neutrale"},
    {"kontonummer": "9600", "bezeichnung": "Privateinlagen", "typ": "Neutrale"},
    {"kontonummer": "9700", "bezeichnung": "Privatsteuern", "typ": "Neutrale"},
    {"kontonummer": "9800", "bezeichnung": "Saldenvorträge", "typ": "Neutrale"},
    {"kontonummer": "9900", "bezeichnung": "Statistische Konten", "typ": "Neutrale"},
]

# Steuersätze
STANDARD_STEUERSAETZE = [
    {"bezeichnung": "Umsatzsteuer 19%", "prozentsatz": 19.0, "ist_aktiv": True},
    {"bezeichnung": "Umsatzsteuer 7%", "prozentsatz": 7.0, "ist_aktiv": True},
    {"bezeichnung": "Umsatzsteuer 0% (steuerfrei)", "prozentsatz": 0.0, "ist_aktiv": True},
]

# Standard-Geschäftsjahr
STANDARD_GESCHAEFTSJAHR = {
    "bezeichnung": "Geschäftsjahr 2024",
    "start_datum": "2024-01-01",
    "end_datum": "2024-12-31",
    "ist_abgeschlossen": False,
}

# Standard-Kostenstellen
STANDARD_KOSTENSTELLEN = [
    {"kostenstellen_nr": "1000", "bezeichnung": "Verwaltung", "beschreibung": "Allgemeine Verwaltungskosten", "budget": 100000.0},
    {"kostenstellen_nr": "2000", "bezeichnung": "Vertrieb", "beschreibung": "Vertrieb und Marketing", "budget": 150000.0},
    {"kostenstellen_nr": "3000", "bezeichnung": "Produktion", "beschreibung": "Produktionskosten", "budget": 300000.0},
    {"kostenstellen_nr": "4000", "bezeichnung": "Forschung & Entwicklung", "beschreibung": "F&E-Kosten", "budget": 120000.0},
    {"kostenstellen_nr": "5000", "bezeichnung": "IT", "beschreibung": "IT-Infrastruktur und Support", "budget": 80000.0},
] 