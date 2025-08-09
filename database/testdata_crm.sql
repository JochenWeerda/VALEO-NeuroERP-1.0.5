-- Testdaten für CRM (Leads, einfache Kunden)
-- Annahme: Schema aus crm_schema.sql wurde bereits deployed

INSERT INTO crm.kunden (kunden_nr, firmenname, kundentyp, branche, umsatzklasse, kundenstatus, kundenbewertung, zahlungsziel, skonto_prozent)
VALUES
('K10001', 'Muster Maschinenbau GmbH', 'GESCHAEFTSKUNDE', 'Maschinenbau', 'MITTEL', 'AKTIV', 4, 30, 2.0),
('K10002', 'Alpha Retail AG', 'GESCHAEFTSKUNDE', 'Einzelhandel', 'GROSS', 'AKTIV', 5, 14, 1.0),
('K10003', 'Beta Consulting UG', 'GESCHAEFTSKUNDE', 'Beratung', 'KLEIN', 'AKTIV', 3, 30, 0.0);

-- Leads (inkl. potenzieller Dubletten)
INSERT INTO crm.leads (lead_nr, firmenname, ansprechpartner, email, telefon, quelle, status, prioritaet, wert, beschreibung, naechster_kontakt)
VALUES
('L-2025-0001', 'Muster Maschinenbau GmbH', 'Sabine Müller', 's.mueller@muster-maschinenbau.de', '+49 711 123456', 'WEBSITE', 'NEU', 'NORMAL', 35000.00, 'Anfrage zu Wartungsverträgen', CURRENT_DATE + INTERVAL '7 days'),
('L-2025-0002', 'Muster Maschinenbau', 'Sabine Mueller', 's.mueller@muster-maschinenbau.de', '+49 711 123456', 'EMPFOHLUNG', 'KONTAKTIERT', 'HOCH', 60000.00, 'Projektanfrage Ersatzteillogistik', CURRENT_DATE + INTERVAL '10 days'),
('L-2025-0003', 'Alpha Retail AG', 'Tom Schneider', 't.schneider@alpharetail.com', '+49 30 987654', 'MESSE', 'NEU', 'NORMAL', 120000.00, 'Omni-Channel-ERP Einführungsprojekt', CURRENT_DATE + INTERVAL '14 days'),
('L-2025-0004', 'Alpha Retail', 'Thomas Schneider', NULL, '+49 30 987654', 'WERBUNG', 'NEU', 'NIEDRIG', 15000.00, 'Kleine Erweiterung Wawi', CURRENT_DATE + INTERVAL '21 days'),
('L-2025-0005', 'Beta Consulting UG', 'Elena Kraus', 'elena.kraus@betaconsulting.de', '+49 89 111222', 'WEBSITE', 'INTERESSIERT', 'NORMAL', 18000.00, 'Modul CRM + DMS', CURRENT_DATE + INTERVAL '5 days');