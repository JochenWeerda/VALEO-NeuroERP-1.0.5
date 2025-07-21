-- =====================================================
-- VERKAUFSMANAGEMENT SCHEMA
-- =====================================================

-- Schema erstellen
CREATE SCHEMA IF NOT EXISTS verkauf;

-- 1. GRUNDLEGENDE VERKAUFSSTRUKTUREN
-- Kunden
CREATE TABLE verkauf.kunden (
    kunde_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kunde_nr VARCHAR(50) UNIQUE NOT NULL,
    firmenname VARCHAR(200),
    vorname VARCHAR(100),
    nachname VARCHAR(100),
    ansprechpartner VARCHAR(100),
    telefon VARCHAR(50),
    email VARCHAR(100),
    webseite VARCHAR(200),
    steuernummer VARCHAR(50),
    ust_id VARCHAR(50),
    kundentyp VARCHAR(50) CHECK (kundentyp IN ('PRIVAT', 'GEWERBE', 'LANDWIRT', 'HÄNDLER', 'GROSSHÄNDLER')),
    kategorie VARCHAR(50) CHECK (kategorie IN ('A', 'B', 'C', 'DÜNGER', 'FUTTERMITTEL', 'PSM', 'MASCHINEN', 'DIENSTLEISTUNG')),
    bonitaet VARCHAR(20) DEFAULT 'GUT' CHECK (bonitaet IN ('SEHR_GUT', 'GUT', 'MITTEL', 'SCHLECHT', 'GESPERRT')),
    zahlungsziel INTEGER DEFAULT 30,
    skonto_prozent DECIMAL(5,2) DEFAULT 0,
    skonto_tage INTEGER DEFAULT 0,
    kreditlimit DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'AKTIV' CHECK (status IN ('AKTIV', 'INAKTIV', 'GESPERRT')),
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- Kunden-Adressen
CREATE TABLE verkauf.kunden_adressen (
    adresse_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kunde_id UUID NOT NULL REFERENCES verkauf.kunden(kunde_id) ON DELETE CASCADE,
    adress_typ VARCHAR(20) NOT NULL CHECK (adress_typ IN ('RECHNUNG', 'LIEFERUNG', 'HAUPTADRESSE')),
    strasse VARCHAR(200) NOT NULL,
    hausnummer VARCHAR(20),
    plz VARCHAR(10) NOT NULL,
    ort VARCHAR(100) NOT NULL,
    land VARCHAR(50) DEFAULT 'Deutschland',
    ist_standard BOOLEAN DEFAULT FALSE,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kunden-Bankverbindungen
CREATE TABLE verkauf.kunden_bankverbindungen (
    bankverbindung_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kunde_id UUID NOT NULL REFERENCES verkauf.kunden(kunde_id) ON DELETE CASCADE,
    kontoinhaber VARCHAR(200) NOT NULL,
    iban VARCHAR(34) NOT NULL,
    bic VARCHAR(11),
    bank_name VARCHAR(200),
    verwendungszweck VARCHAR(200),
    ist_standard BOOLEAN DEFAULT FALSE,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ANGEBOTE UND AUFTRÄGE
-- Angebote
CREATE TABLE verkauf.angebote (
    angebot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    angebot_nr VARCHAR(50) UNIQUE NOT NULL,
    kunde_id UUID NOT NULL REFERENCES verkauf.kunden(kunde_id),
    angebot_datum DATE NOT NULL,
    gueltig_bis DATE NOT NULL,
    angebot_typ VARCHAR(20) DEFAULT 'NORMAL' CHECK (angebot_typ IN ('NORMAL', 'DRINGEND', 'RAHMENANGEBOT')),
    status VARCHAR(20) DEFAULT 'ERSTELLT' CHECK (status IN ('ERSTELLT', 'VERSENDET', 'ANGENOMMEN', 'ABGELEHNT', 'ABGELAUFEN')),
    gesamtbetrag DECIMAL(12,2) DEFAULT 0,
    mwst_betrag DECIMAL(12,2) DEFAULT 0,
    rabatt_prozent DECIMAL(5,2) DEFAULT 0,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- Angebotspositionen
CREATE TABLE verkauf.angebotspositionen (
    position_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    angebot_id UUID NOT NULL REFERENCES verkauf.angebote(angebot_id) ON DELETE CASCADE,
    artikel_id UUID REFERENCES produktion.artikel(artikel_id),
    position_nr INTEGER NOT NULL,
    bezeichnung VARCHAR(200) NOT NULL,
    beschreibung TEXT,
    menge DECIMAL(10,4) NOT NULL,
    einheit VARCHAR(20) NOT NULL,
    einheitspreis DECIMAL(10,4) NOT NULL,
    rabatt_prozent DECIMAL(5,2) DEFAULT 0,
    mwst_prozent DECIMAL(5,2) DEFAULT 19,
    gesamtpreis DECIMAL(12,2) GENERATED ALWAYS AS (
        menge * einheitspreis * (1 - rabatt_prozent / 100)
    ) STORED,
    lieferzeit_tage INTEGER,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aufträge
CREATE TABLE verkauf.auftraege (
    auftrag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auftrag_nr VARCHAR(50) UNIQUE NOT NULL,
    kunde_id UUID NOT NULL REFERENCES verkauf.kunden(kunde_id),
    angebot_id UUID REFERENCES verkauf.angebote(angebot_id),
    auftrag_datum DATE NOT NULL,
    liefer_datum DATE,
    auftrag_typ VARCHAR(20) DEFAULT 'NORMAL' CHECK (auftrag_typ IN ('NORMAL', 'DRINGEND', 'VORBESTELLUNG')),
    status VARCHAR(20) DEFAULT 'ERSTELLT' CHECK (status IN ('ERSTELLT', 'BESTÄTIGT', 'IN_BEARBEITUNG', 'TEILLIEFERUNG', 'VOLLSTÄNDIG', 'STORNIERT')),
    gesamtbetrag DECIMAL(12,2) DEFAULT 0,
    mwst_betrag DECIMAL(12,2) DEFAULT 0,
    rabatt_prozent DECIMAL(5,2) DEFAULT 0,
    zahlungsziel DATE,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- Auftragspositionen
CREATE TABLE verkauf.auftragspositionen (
    position_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auftrag_id UUID NOT NULL REFERENCES verkauf.auftraege(auftrag_id) ON DELETE CASCADE,
    angebotsposition_id UUID REFERENCES verkauf.angebotspositionen(position_id),
    artikel_id UUID REFERENCES produktion.artikel(artikel_id),
    position_nr INTEGER NOT NULL,
    bezeichnung VARCHAR(200) NOT NULL,
    beschreibung TEXT,
    menge_bestellt DECIMAL(10,4) NOT NULL,
    menge_geliefert DECIMAL(10,4) DEFAULT 0,
    einheit VARCHAR(20) NOT NULL,
    einheitspreis DECIMAL(10,4) NOT NULL,
    rabatt_prozent DECIMAL(5,2) DEFAULT 0,
    mwst_prozent DECIMAL(5,2) DEFAULT 19,
    gesamtpreis DECIMAL(12,2) GENERATED ALWAYS AS (
        menge_bestellt * einheitspreis * (1 - rabatt_prozent / 100)
    ) STORED,
    liefer_datum DATE,
    status VARCHAR(20) DEFAULT 'OFFEN' CHECK (status IN ('OFFEN', 'TEILLIEFERUNG', 'VOLLSTÄNDIG', 'STORNIERT')),
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. LIEFERUNGEN
-- Lieferungen
CREATE TABLE verkauf.lieferungen (
    lieferung_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lieferung_nr VARCHAR(50) UNIQUE NOT NULL,
    auftrag_id UUID REFERENCES verkauf.auftraege(auftrag_id),
    kunde_id UUID NOT NULL REFERENCES verkauf.kunden(kunde_id),
    liefer_datum DATE NOT NULL,
    liefer_zeit TIME,
    lkw_kennzeichen VARCHAR(20),
    fahrer_name VARCHAR(100),
    lieferung_typ VARCHAR(20) DEFAULT 'NORMAL' CHECK (lieferung_typ IN ('NORMAL', 'DRINGEND', 'NACHTLIEFERUNG')),
    status VARCHAR(20) DEFAULT 'ANGEKÜNDIGT' CHECK (status IN ('ANGEKÜNDIGT', 'UNTERWEGS', 'ANGEKOMMEN', 'ENTLADEN', 'ABGESCHLOSSEN')),
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- Lieferpositionen
CREATE TABLE verkauf.lieferpositionen (
    lieferposition_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lieferung_id UUID NOT NULL REFERENCES verkauf.lieferungen(lieferung_id) ON DELETE CASCADE,
    auftragsposition_id UUID REFERENCES verkauf.auftragspositionen(position_id),
    artikel_id UUID REFERENCES produktion.artikel(artikel_id),
    position_nr INTEGER NOT NULL,
    gelieferte_menge DECIMAL(10,4) NOT NULL,
    einheitspreis DECIMAL(10,4),
    chargen_nr VARCHAR(100),
    mindesthaltbarkeit DATE,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. RECHNUNGSWESEN
-- Rechnungen
CREATE TABLE verkauf.rechnungen (
    rechnung_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rechnung_nr VARCHAR(50) UNIQUE NOT NULL,
    kunde_id UUID NOT NULL REFERENCES verkauf.kunden(kunde_id),
    auftrag_id UUID REFERENCES verkauf.auftraege(auftrag_id),
    lieferung_id UUID REFERENCES verkauf.lieferungen(lieferung_id),
    rechnungs_datum DATE NOT NULL,
    faelligkeits_datum DATE NOT NULL,
    rechnungs_betrag DECIMAL(12,2) NOT NULL,
    mwst_betrag DECIMAL(12,2) DEFAULT 0,
    rabatt_betrag DECIMAL(12,2) DEFAULT 0,
    zahlungs_betrag DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'OFFEN' CHECK (status IN ('OFFEN', 'TEILZAHLUNG', 'VOLLSTÄNDIG', 'ÜBERFÄLLIG', 'STORNIERT')),
    zahlungs_datum DATE,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- Rechnungspositionen
CREATE TABLE verkauf.rechnungspositionen (
    rechnungsposition_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rechnung_id UUID NOT NULL REFERENCES verkauf.rechnungen(rechnung_id) ON DELETE CASCADE,
    auftragsposition_id UUID REFERENCES verkauf.auftragspositionen(position_id),
    artikel_id UUID REFERENCES produktion.artikel(artikel_id),
    position_nr INTEGER NOT NULL,
    bezeichnung VARCHAR(200) NOT NULL,
    menge DECIMAL(10,4) NOT NULL,
    einheit VARCHAR(20) NOT NULL,
    einheitspreis DECIMAL(10,4) NOT NULL,
    rabatt_prozent DECIMAL(5,2) DEFAULT 0,
    mwst_prozent DECIMAL(5,2) DEFAULT 19,
    gesamtpreis DECIMAL(12,2) GENERATED ALWAYS AS (
        menge * einheitspreis * (1 - rabatt_prozent / 100)
    ) STORED,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ZAHLUNGSEINGÄNGE
-- Zahlungseingänge
CREATE TABLE verkauf.zahlungseingaenge (
    zahlung_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zahlung_nr VARCHAR(50) UNIQUE NOT NULL,
    kunde_id UUID NOT NULL REFERENCES verkauf.kunden(kunde_id),
    rechnung_id UUID REFERENCES verkauf.rechnungen(rechnung_id),
    zahlungs_datum DATE NOT NULL,
    zahlungs_betrag DECIMAL(12,2) NOT NULL,
    zahlungs_art VARCHAR(50) NOT NULL CHECK (zahlungs_art IN ('ÜBERWEISUNG', 'LASTSCHRIFT', 'BAR', 'EC-KARTE', 'KREDITKARTE', 'SCHEIN')),
    zahlungs_referenz VARCHAR(100),
    skonto_betrag DECIMAL(12,2) DEFAULT 0,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- 6. MAHNWESEN
-- Mahnungen
CREATE TABLE verkauf.mahnungen (
    mahnung_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mahnung_nr VARCHAR(50) UNIQUE NOT NULL,
    kunde_id UUID NOT NULL REFERENCES verkauf.kunden(kunde_id),
    rechnung_id UUID REFERENCES verkauf.rechnungen(rechnung_id),
    mahnstufe INTEGER NOT NULL CHECK (mahnstufe BETWEEN 1 AND 3),
    mahnung_datum DATE NOT NULL,
    mahngebuehr DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'OFFEN' CHECK (status IN ('OFFEN', 'BEZAHLT', 'STUNDUNG')),
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- 7. INDEXE
CREATE INDEX idx_kunden_status ON verkauf.kunden(status);
CREATE INDEX idx_kunden_kategorie ON verkauf.kunden(kategorie);
CREATE INDEX idx_kunden_bonitaet ON verkauf.kunden(bonitaet);
CREATE INDEX idx_angebote_status ON verkauf.angebote(status);
CREATE INDEX idx_angebote_datum ON verkauf.angebote(angebot_datum);
CREATE INDEX idx_auftraege_status ON verkauf.auftraege(status);
CREATE INDEX idx_auftraege_datum ON verkauf.auftraege(auftrag_datum);
CREATE INDEX idx_lieferungen_status ON verkauf.lieferungen(status);
CREATE INDEX idx_lieferungen_datum ON verkauf.lieferungen(liefer_datum);
CREATE INDEX idx_rechnungen_status ON verkauf.rechnungen(status);
CREATE INDEX idx_rechnungen_faelligkeit ON verkauf.rechnungen(faelligkeits_datum);
CREATE INDEX idx_zahlungseingaenge_datum ON verkauf.zahlungseingaenge(zahlungs_datum);
CREATE INDEX idx_mahnungen_status ON verkauf.mahnungen(status);

-- 8. TRIGGER FÜR AUTOMATISCHE TIMESTAMP-UPDATES
CREATE OR REPLACE FUNCTION verkauf.update_geaendert_am()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geaendert_am = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_kunden_update
    BEFORE UPDATE ON verkauf.kunden
    FOR EACH ROW EXECUTE FUNCTION verkauf.update_geaendert_am();

CREATE TRIGGER trigger_angebote_update
    BEFORE UPDATE ON verkauf.angebote
    FOR EACH ROW EXECUTE FUNCTION verkauf.update_geaendert_am();

CREATE TRIGGER trigger_angebotspositionen_update
    BEFORE UPDATE ON verkauf.angebotspositionen
    FOR EACH ROW EXECUTE FUNCTION verkauf.update_geaendert_am();

CREATE TRIGGER trigger_auftraege_update
    BEFORE UPDATE ON verkauf.auftraege
    FOR EACH ROW EXECUTE FUNCTION verkauf.update_geaendert_am();

CREATE TRIGGER trigger_auftragspositionen_update
    BEFORE UPDATE ON verkauf.auftragspositionen
    FOR EACH ROW EXECUTE FUNCTION verkauf.update_geaendert_am();

CREATE TRIGGER trigger_lieferungen_update
    BEFORE UPDATE ON verkauf.lieferungen
    FOR EACH ROW EXECUTE FUNCTION verkauf.update_geaendert_am();

CREATE TRIGGER trigger_lieferpositionen_update
    BEFORE UPDATE ON verkauf.lieferpositionen
    FOR EACH ROW EXECUTE FUNCTION verkauf.update_geaendert_am();

CREATE TRIGGER trigger_rechnungen_update
    BEFORE UPDATE ON verkauf.rechnungen
    FOR EACH ROW EXECUTE FUNCTION verkauf.update_geaendert_am();

CREATE TRIGGER trigger_rechnungspositionen_update
    BEFORE UPDATE ON verkauf.rechnungspositionen
    FOR EACH ROW EXECUTE FUNCTION verkauf.update_geaendert_am();

CREATE TRIGGER trigger_zahlungseingaenge_update
    BEFORE UPDATE ON verkauf.zahlungseingaenge
    FOR EACH ROW EXECUTE FUNCTION verkauf.update_geaendert_am();

CREATE TRIGGER trigger_mahnungen_update
    BEFORE UPDATE ON verkauf.mahnungen
    FOR EACH ROW EXECUTE FUNCTION verkauf.update_geaendert_am();

-- 9. FUNKTIONEN FÜR AUTOMATISCHE NUMMERIERUNG
CREATE OR REPLACE FUNCTION verkauf.generate_angebotsnummer()
RETURNS VARCHAR(50) AS $$
DECLARE
    next_num INTEGER;
    result VARCHAR(50);
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(angebot_nr FROM 4) AS INTEGER)), 0) + 1
    INTO next_num
    FROM verkauf.angebote
    WHERE angebot_nr LIKE 'ANG%';
    
    result := 'ANG' || LPAD(next_num::TEXT, 6, '0');
    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verkauf.generate_auftragsnummer()
RETURNS VARCHAR(50) AS $$
DECLARE
    next_num INTEGER;
    result VARCHAR(50);
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(auftrag_nr FROM 4) AS INTEGER)), 0) + 1
    INTO next_num
    FROM verkauf.auftraege
    WHERE auftrag_nr LIKE 'AUF%';
    
    result := 'AUF' || LPAD(next_num::TEXT, 6, '0');
    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verkauf.generate_liefernummer()
RETURNS VARCHAR(50) AS $$
DECLARE
    next_num INTEGER;
    result VARCHAR(50);
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(lieferung_nr FROM 4) AS INTEGER)), 0) + 1
    INTO next_num
    FROM verkauf.lieferungen
    WHERE lieferung_nr LIKE 'LIE%';
    
    result := 'LIE' || LPAD(next_num::TEXT, 6, '0');
    RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verkauf.generate_rechnungsnummer()
RETURNS VARCHAR(50) AS $$
DECLARE
    next_num INTEGER;
    result VARCHAR(50);
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(rechnung_nr FROM 4) AS INTEGER)), 0) + 1
    INTO next_num
    FROM verkauf.rechnungen
    WHERE rechnung_nr LIKE 'REK%';
    
    result := 'REK' || LPAD(next_num::TEXT, 6, '0');
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 10. FUNKTIONEN FÜR BERECHNUNGEN
CREATE OR REPLACE FUNCTION verkauf.get_umsatz(kunde_uuid UUID, jahr INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE))
RETURNS DECIMAL(12,2) AS $$
BEGIN
    RETURN COALESCE((
        SELECT SUM(r.rechnungs_betrag)
        FROM verkauf.rechnungen r
        WHERE r.kunde_id = kunde_uuid
        AND EXTRACT(YEAR FROM r.rechnungs_datum) = jahr
        AND r.status IN ('VOLLSTÄNDIG', 'TEILZAHLUNG')
    ), 0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verkauf.get_offene_forderungen(kunde_uuid UUID)
RETURNS DECIMAL(12,2) AS $$
BEGIN
    RETURN COALESCE((
        SELECT SUM(r.rechnungs_betrag - r.zahlungs_betrag)
        FROM verkauf.rechnungen r
        WHERE r.kunde_id = kunde_uuid
        AND r.status IN ('OFFEN', 'TEILZAHLUNG', 'ÜBERFÄLLIG')
    ), 0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verkauf.get_lieferfortschritt(auftrag_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    bestellt DECIMAL(10,4);
    geliefert DECIMAL(10,4);
    fortschritt DECIMAL(5,2);
BEGIN
    SELECT SUM(menge_bestellt), SUM(menge_geliefert)
    INTO bestellt, geliefert
    FROM verkauf.auftragspositionen
    WHERE auftrag_id = auftrag_uuid;
    
    IF bestellt > 0 THEN
        fortschritt := (geliefert / bestellt) * 100;
    ELSE
        fortschritt := 0;
    END IF;
    
    RETURN LEAST(fortschritt, 100);
END;
$$ LANGUAGE plpgsql;

-- 11. VIEWS FÜR REPORTING
-- Verkaufsübersicht
CREATE VIEW verkauf.verkaufs_uebersicht AS
SELECT 
    k.kunde_id,
    k.kunde_nr,
    COALESCE(k.firmenname, k.vorname || ' ' || k.nachname) as kundenname,
    k.kundentyp,
    k.kategorie,
    k.bonitaet,
    k.status,
    COUNT(DISTINCT a.angebot_id) as anzahl_angebote,
    COUNT(DISTINCT auf.auftrag_id) as anzahl_auftraege,
    COUNT(DISTINCT r.rechnung_id) as anzahl_rechnungen,
    verkauf.get_umsatz(k.kunde_id) as umsatz_aktuelles_jahr,
    verkauf.get_offene_forderungen(k.kunde_id) as offene_forderungen,
    k.erstellt_am
FROM verkauf.kunden k
LEFT JOIN verkauf.angebote a ON k.kunde_id = a.kunde_id
LEFT JOIN verkauf.auftraege auf ON k.kunde_id = auf.kunde_id
LEFT JOIN verkauf.rechnungen r ON k.kunde_id = r.kunde_id
GROUP BY k.kunde_id, k.kunde_nr, k.firmenname, k.vorname, k.nachname, k.kundentyp, k.kategorie, k.bonitaet, k.status, k.erstellt_am;

-- Auftragsübersicht
CREATE VIEW verkauf.auftrags_uebersicht AS
SELECT 
    auf.auftrag_id,
    auf.auftrag_nr,
    auf.auftrag_datum,
    auf.liefer_datum,
    auf.status,
    auf.gesamtbetrag,
    COALESCE(k.firmenname, k.vorname || ' ' || k.nachname) as kunde,
    k.kategorie as kunden_kategorie,
    COUNT(aufp.position_id) as anzahl_positionen,
    SUM(aufp.menge_bestellt) as gesamtmenge,
    SUM(aufp.menge_geliefert) as gelieferte_menge,
    verkauf.get_lieferfortschritt(auf.auftrag_id) as lieferfortschritt_prozent
FROM verkauf.auftraege auf
JOIN verkauf.kunden k ON auf.kunde_id = k.kunde_id
LEFT JOIN verkauf.auftragspositionen aufp ON auf.auftrag_id = aufp.auftrag_id
GROUP BY auf.auftrag_id, auf.auftrag_nr, auf.auftrag_datum, auf.liefer_datum, auf.status, auf.gesamtbetrag, k.firmenname, k.vorname, k.nachname, k.kategorie;

-- Rechnungsübersicht
CREATE VIEW verkauf.rechnungs_uebersicht AS
SELECT 
    r.rechnung_id,
    r.rechnung_nr,
    r.rechnungs_datum,
    r.faelligkeits_datum,
    r.rechnungs_betrag,
    r.zahlungs_betrag,
    (r.rechnungs_betrag - r.zahlungs_betrag) as offener_betrag,
    r.status,
    COALESCE(k.firmenname, k.vorname || ' ' || k.nachname) as kunde,
    k.kategorie as kunden_kategorie,
    CASE 
        WHEN r.faelligkeits_datum < CURRENT_DATE AND r.status IN ('OFFEN', 'TEILZAHLUNG') 
        THEN CURRENT_DATE - r.faelligkeits_datum 
        ELSE 0 
    END as ueberfaellig_tage
FROM verkauf.rechnungen r
JOIN verkauf.kunden k ON r.kunde_id = k.kunde_id;

-- 12. BEISPIELDATEN
-- Kunden
INSERT INTO verkauf.kunden (kunde_nr, firmenname, ansprechpartner, telefon, email, kundentyp, kategorie, bonitaet) VALUES
('KUN001', 'Landwirtschaft Müller GmbH', 'Hans Müller', '+49 123 456789', 'h.mueller@landwirtschaft-mueller.de', 'LANDWIRT', 'DÜNGER', 'SEHR_GUT'),
('KUN002', 'Tierhaltung Schmidt KG', 'Maria Schmidt', '+49 234 567890', 'info@tierhaltung-schmidt.de', 'LANDWIRT', 'FUTTERMITTEL', 'GUT'),
('KUN003', 'Agrarhandel Weber', 'Peter Weber', '+49 345 678901', 'p.weber@agrar-weber.de', 'HÄNDLER', 'PSM', 'GUT'),
('KUN004', 'Max Mustermann', 'Max Mustermann', '+49 456 789012', 'max.mustermann@email.de', 'PRIVAT', 'MASCHINEN', 'MITTEL'),
('KUN005', 'Großhandel Meyer', 'Anna Meyer', '+49 567 890123', 'a.meyer@grosshandel-meyer.de', 'GROSSHÄNDLER', 'DIENSTLEISTUNG', 'SEHR_GUT');

-- Kunden-Adressen
INSERT INTO verkauf.kunden_adressen (kunde_id, adress_typ, strasse, hausnummer, plz, ort, ist_standard) VALUES
((SELECT kunde_id FROM verkauf.kunden WHERE kunde_nr = 'KUN001'), 'HAUPTADRESSE', 'Hauptstraße', '123', '12345', 'Musterstadt', TRUE),
((SELECT kunde_id FROM verkauf.kunden WHERE kunde_nr = 'KUN002'), 'HAUPTADRESSE', 'Industrieweg', '45', '23456', 'Beispielort', TRUE),
((SELECT kunde_id FROM verkauf.kunden WHERE kunde_nr = 'KUN003'), 'HAUPTADRESSE', 'Gewerbepark', '67', '34567', 'Testdorf', TRUE),
((SELECT kunde_id FROM verkauf.kunden WHERE kunde_nr = 'KUN004'), 'HAUPTADRESSE', 'Privatstraße', '89', '45678', 'Landstadt', TRUE),
((SELECT kunde_id FROM verkauf.kunden WHERE kunde_nr = 'KUN005'), 'HAUPTADRESSE', 'Großhandelsweg', '12', '56789', 'Frachtort', TRUE);

-- Angebote
INSERT INTO verkauf.angebote (angebot_nr, kunde_id, angebot_datum, gueltig_bis, status, gesamtbetrag) VALUES
('ANG000001', (SELECT kunde_id FROM verkauf.kunden WHERE kunde_nr = 'KUN001'), CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'VERSENDET', 2500.00),
('ANG000002', (SELECT kunde_id FROM verkauf.kunden WHERE kunde_nr = 'KUN002'), CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', 'ANGENOMMEN', 1800.00),
('ANG000003', (SELECT kunde_id FROM verkauf.kunden WHERE kunde_nr = 'KUN003'), CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '5 days', 'ABGELAUFEN', 3200.00);

-- Aufträge
INSERT INTO verkauf.auftraege (auftrag_nr, kunde_id, angebot_id, auftrag_datum, liefer_datum, status, gesamtbetrag) VALUES
('AUF000001', (SELECT kunde_id FROM verkauf.kunden WHERE kunde_nr = 'KUN001'), (SELECT angebot_id FROM verkauf.angebote WHERE angebot_nr = 'ANG000001'), CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'BESTÄTIGT', 2500.00),
('AUF000002', (SELECT kunde_id FROM verkauf.kunden WHERE kunde_nr = 'KUN002'), (SELECT angebot_id FROM verkauf.angebote WHERE angebot_nr = 'ANG000002'), CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '4 days', 'IN_BEARBEITUNG', 1800.00),
('AUF000003', (SELECT kunde_id FROM verkauf.kunden WHERE kunde_nr = 'KUN005'), NULL, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '8 days', 'VOLLSTÄNDIG', 4500.00);

-- Rechnungen
INSERT INTO verkauf.rechnungen (rechnung_nr, kunde_id, auftrag_id, rechnungs_datum, faelligkeits_datum, rechnungs_betrag, status) VALUES
('REK000001', (SELECT kunde_id FROM verkauf.kunden WHERE kunde_nr = 'KUN001'), (SELECT auftrag_id FROM verkauf.auftraege WHERE auftrag_nr = 'AUF000001'), CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 2500.00, 'OFFEN'),
('REK000002', (SELECT kunde_id FROM verkauf.kunden WHERE kunde_nr = 'KUN002'), (SELECT auftrag_id FROM verkauf.auftraege WHERE auftrag_nr = 'AUF000002'), CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 1800.00, 'OFFEN'),
('REK000003', (SELECT kunde_id FROM verkauf.kunden WHERE kunde_nr = 'KUN005'), (SELECT auftrag_id FROM verkauf.auftraege WHERE auftrag_nr = 'AUF000003'), CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '5 days', 4500.00, 'VOLLSTÄNDIG'); 