-- Testdaten für Finanz (Debitoren-Rechnungen und Zahlungen)
-- Annahme: Schema aus finance_schema.sql wurde bereits deployed

-- Dummy-Debitoren
INSERT INTO finanz.debitoren (debitor_nr, kreditlimit, zahlungsziel, zahlungsart, ist_aktiv)
VALUES
('D10001', 50000, 30, 'Überweisung', true),
('D10002', 100000, 14, 'Überweisung', true);

-- Rechnungen
INSERT INTO finanz.debitoren_rechnungen (rechnungsnummer, debitor_id, rechnungsdatum, faelligkeitsdatum, netto_betrag, steuerbetrag, brutto_betrag, status)
VALUES
('R-2025-0001', (SELECT id FROM finanz.debitoren WHERE debitor_nr='D10001'), CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '5 days', 1000.00, 190.00, 1190.00, 'Offen'),
('R-2025-0002', (SELECT id FROM finanz.debitoren WHERE debitor_nr='D10001'), CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '10 days', 500.00, 95.00, 595.00, 'Offen'),
('R-2025-0003', (SELECT id FROM finanz.debitoren WHERE debitor_nr='D10002'), CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE - INTERVAL '15 days', 2500.00, 475.00, 2975.00, 'Offen');

-- Zahlungen (Referenzen enthalten Rechnungsnummern)
INSERT INTO finanz.debitoren_zahlungen (zahlungsnummer, rechnung_id, zahlungsdatum, zahlungsart, zahlungsbetrag, zahlungsreferenz, status)
VALUES
('Z-2025-0001', (SELECT id FROM finanz.debitoren_rechnungen WHERE rechnungsnummer='R-2025-0002'), CURRENT_DATE - INTERVAL '2 days', 'Überweisung', 595.00, 'Rechnungsnr R-2025-0002', 'Eingegangen');