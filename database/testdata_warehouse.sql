-- Testdaten für Lager/Artikelbestände
-- Annahme: Schema aus warehouse_schema.sql wurde bereits deployed und es existiert ein Lagerort (vereinfachte Inserts mit Dummy-IDs)

-- Beispiel-Lagerort
INSERT INTO lager.lagerorte (lagerort_nr, bezeichnung, lagerort_typ, standort)
VALUES ('L-01', 'Hauptlager Stuttgart', 'HAUPTLAGER', 'Stuttgart');

-- Dummy-IDs ermitteln (vereinfachter Ansatz: zuletzt angelegter Lagerort)
-- In echten Skripten würden wir WITH/RETURNING nutzen; hier für Tests kann direkte UUID eingesetzt werden.

-- Beispiel-Bestände (angenommen einheit "Stk")
-- Felder: artikel_id, lagerort_id, menge_verfuegbar, einheit, mindestbestand, optimalbestand, max_bestand
-- Hinweis: artikel_id muss aus Artikelstamm kommen; für Tests nutzen wir gen_random_uuid()

INSERT INTO lager.artikel_bestaende (artikel_id, lagerort_id, menge_verfuegbar, einheit, mindestbestand, optimalbestand, max_bestand)
VALUES
(gen_random_uuid(), (SELECT lagerort_id FROM lager.lagerorte WHERE lagerort_nr='L-01'), 25, 'Stk', 40, 80, 200),
(gen_random_uuid(), (SELECT lagerort_id FROM lager.lagerorte WHERE lagerort_nr='L-01'), 120, 'Stk', 50, 150, 300),
(gen_random_uuid(), (SELECT lagerort_id FROM lager.lagerorte WHERE lagerort_nr='L-01'), 5, 'Stk', 20, 60, 120),
(gen_random_uuid(), (SELECT lagerort_id FROM lager.lagerorte WHERE lagerort_nr='L-01'), 75, 'Stk', 30, 90, 180);