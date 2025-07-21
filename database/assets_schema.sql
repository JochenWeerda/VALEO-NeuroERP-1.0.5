-- =====================================================
-- VALEO NeuroERP - Anlagenverwaltung Schema
-- Enterprise ERP System - Anlagenmodul
-- =====================================================

-- Schema für Anlagenverwaltung
CREATE SCHEMA IF NOT EXISTS anlagen;

-- =====================================================
-- ANLAGEN-MANAGEMENT
-- =====================================================

-- Hauptanlagentabelle
CREATE TABLE IF NOT EXISTS anlagen.anlagen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anlagennummer VARCHAR(20) UNIQUE NOT NULL,
    bezeichnung VARCHAR(255) NOT NULL,
    beschreibung TEXT,
    anlagenkategorie_id UUID,
    anlagenart VARCHAR(100),
    anschaffungsdatum DATE NOT NULL,
    anschaffungswert DECIMAL(15,2) NOT NULL,
    restbuchwert DECIMAL(15,2) NOT NULL,
    standort VARCHAR(255),
    verantwortlicher UUID REFERENCES users(id),
    lieferant VARCHAR(255),
    lieferanten_rechnungsnr VARCHAR(100),
    garantie_bis DATE,
    versicherungswert DECIMAL(15,2),
    versicherungsnummer VARCHAR(100),
    technische_daten JSONB,
    bilder TEXT[], -- Array von Bild-URLs
    dokumente TEXT[], -- Array von Dokument-URLs
    status VARCHAR(50) DEFAULT 'Aktiv' CHECK (status IN ('Aktiv', 'Inaktiv', 'Verkauft', 'Verschrottet', 'Wartung')),
    ist_verfuegbar BOOLEAN DEFAULT true,
    notizen TEXT,
    erstellt_von UUID REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Anlagenkategorien
CREATE TABLE IF NOT EXISTS anlagen.anlagenkategorien (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kategoriename VARCHAR(100) NOT NULL,
    beschreibung TEXT,
    parent_kategorie_id UUID REFERENCES anlagen.anlagenkategorien(id),
    afa_satz DECIMAL(5,2), -- Abschreibungssatz
    nutzungsdauer INTEGER, -- in Jahren
    ist_aktiv BOOLEAN DEFAULT true,
    erstellt_von UUID REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Anlagenstandorte
CREATE TABLE IF NOT EXISTS anlagen.standorte (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standortname VARCHAR(100) NOT NULL,
    adresse TEXT,
    plz VARCHAR(10),
    ort VARCHAR(100),
    land VARCHAR(100),
    kontaktperson VARCHAR(255),
    telefon VARCHAR(50),
    email VARCHAR(255),
    ist_aktiv BOOLEAN DEFAULT true,
    notizen TEXT,
    erstellt_von UUID REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ABSCHREIBUNGEN
-- =====================================================

-- Abschreibungsplan
CREATE TABLE IF NOT EXISTS anlagen.abschreibungsplan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anlage_id UUID REFERENCES anlagen.anlagen(id),
    jahr INTEGER NOT NULL,
    monat INTEGER NOT NULL,
    abschreibungsbetrag DECIMAL(15,2) NOT NULL,
    restbuchwert DECIMAL(15,2) NOT NULL,
    abschreibungsart VARCHAR(50) DEFAULT 'Linear' CHECK (abschreibungsart IN ('Linear', 'Degressiv', 'Leistungsbezogen')),
    buchung_erstellt BOOLEAN DEFAULT false,
    buchung_id UUID REFERENCES finanz.buchungen(id),
    erstellt_von UUID REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(anlage_id, jahr, monat)
);

-- Abschreibungshistorie
CREATE TABLE IF NOT EXISTS anlagen.abschreibungshistorie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anlage_id UUID REFERENCES anlagen.anlagen(id),
    abschreibungsdatum DATE NOT NULL,
    abschreibungsbetrag DECIMAL(15,2) NOT NULL,
    abschreibungsgrund VARCHAR(100),
    buchung_id UUID REFERENCES finanz.buchungen(id),
    erstellt_von UUID REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- WARTUNG UND INSPEKTIONEN
-- =====================================================

-- Wartungsplan
CREATE TABLE IF NOT EXISTS anlagen.wartungsplan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anlage_id UUID REFERENCES anlagen.anlagen(id),
    wartungstyp VARCHAR(100) NOT NULL,
    beschreibung TEXT,
    intervall_typ VARCHAR(50) CHECK (intervall_typ IN ('Tage', 'Wochen', 'Monate', 'Jahre', 'Betriebsstunden')),
    intervall_wert INTEGER,
    naechste_wartung DATE,
    letzte_wartung DATE,
    kosten_pro_wartung DECIMAL(10,2),
    verantwortlicher UUID REFERENCES users(id),
    ist_aktiv BOOLEAN DEFAULT true,
    erstellt_von UUID REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wartungsaufträge
CREATE TABLE IF NOT EXISTS anlagen.wartungsauftraege (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auftragsnummer VARCHAR(50) UNIQUE NOT NULL,
    anlage_id UUID REFERENCES anlagen.anlagen(id),
    wartungsplan_id UUID REFERENCES anlagen.wartungsplan(id),
    wartungstyp VARCHAR(100) NOT NULL,
    beschreibung TEXT,
    geplantes_datum DATE,
    tatsaechliches_datum DATE,
    status VARCHAR(50) DEFAULT 'Geplant' CHECK (status IN ('Geplant', 'In Bearbeitung', 'Abgeschlossen', 'Abgebrochen')),
    prioritaet VARCHAR(20) DEFAULT 'Normal' CHECK (prioritaet IN ('Niedrig', 'Normal', 'Hoch', 'Kritisch')),
    verantwortlicher UUID REFERENCES users(id),
    durchfuehrender UUID REFERENCES users(id),
    kosten DECIMAL(10,2),
    ergebnis TEXT,
    erstellt_von UUID REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wartungsprotokoll
CREATE TABLE IF NOT EXISTS anlagen.wartungsprotokoll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wartungsauftrag_id UUID REFERENCES anlagen.wartungsauftraege(id),
    protokoll_datum TIMESTAMP NOT NULL,
    durchgeführte_arbeiten TEXT,
    verwendete_teile TEXT,
    beobachtungen TEXT,
    naechste_massnahmen TEXT,
    dokumente TEXT[], -- Array von Dokument-URLs
    erstellt_von UUID REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FUHRPARK-MANAGEMENT
-- =====================================================

-- Fahrzeuge
CREATE TABLE IF NOT EXISTS anlagen.fahrzeuge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fahrzeug_id UUID REFERENCES anlagen.anlagen(id),
    kennzeichen VARCHAR(20) UNIQUE NOT NULL,
    fahrzeugtyp VARCHAR(100),
    marke VARCHAR(100),
    modell VARCHAR(100),
    baujahr INTEGER,
    farbe VARCHAR(50),
    kraftstoffart VARCHAR(50),
    hubraum INTEGER, -- in ccm
    leistung INTEGER, -- in PS
    getriebe VARCHAR(50),
    tuev_bis DATE,
    versicherung_bis DATE,
    steuer_bis DATE,
    kilometerstand INTEGER,
    tankgroesse INTEGER, -- in Litern
    verbrauch_durchschnitt DECIMAL(5,2), -- l/100km
    fahrzeugdokumente TEXT[], -- Array von Dokument-URLs
    erstellt_von UUID REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fahrer
CREATE TABLE IF NOT EXISTS anlagen.fahrer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id UUID REFERENCES personal.personal(id),
    fuehrerschein_klasse VARCHAR(20),
    fuehrerschein_erhalten DATE,
    fuehrerschein_gueltig_bis DATE,
    fahrerlaubnis_erweitert TEXT[], -- Array von erweiterten Berechtigungen
    gesundheitszeugnis_gueltig_bis DATE,
    verantwortlich_fuer_fahrzeuge UUID[], -- Array von Fahrzeug-IDs
    ist_aktiv BOOLEAN DEFAULT true,
    notizen TEXT,
    erstellt_von UUID REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fahrzeugnutzung
CREATE TABLE IF NOT EXISTS anlagen.fahrzeugnutzung (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fahrzeug_id UUID REFERENCES anlagen.fahrzeuge(id),
    fahrer_id UUID REFERENCES anlagen.fahrer(id),
    start_datum TIMESTAMP NOT NULL,
    end_datum TIMESTAMP,
    start_kilometer INTEGER,
    end_kilometer INTEGER,
    gefahrene_kilometer INTEGER,
    zweck VARCHAR(255),
    ziel VARCHAR(255),
    kosten DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'Aktiv' CHECK (status IN ('Aktiv', 'Beendet', 'Abgebrochen')),
    notizen TEXT,
    erstellt_von UUID REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tankvorgänge
CREATE TABLE IF NOT EXISTS anlagen.tankvorgaenge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fahrzeug_id UUID REFERENCES anlagen.fahrzeuge(id),
    fahrer_id UUID REFERENCES anlagen.fahrer(id),
    tankdatum DATE NOT NULL,
    tankstelle VARCHAR(255),
    getankte_menge DECIMAL(5,2), -- in Litern
    preis_pro_liter DECIMAL(5,3),
    gesamtpreis DECIMAL(10,2),
    kilometerstand INTEGER,
    kraftstoffart VARCHAR(50),
    rechnungsnummer VARCHAR(100),
    erstellt_von UUID REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- VERSICHERUNGEN UND VERTRÄGE
-- =====================================================

-- Versicherungen
CREATE TABLE IF NOT EXISTS anlagen.versicherungen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anlage_id UUID REFERENCES anlagen.anlagen(id),
    versicherungsart VARCHAR(100) NOT NULL,
    versicherer VARCHAR(255),
    versicherungsnummer VARCHAR(100),
    versicherungssumme DECIMAL(15,2),
    jaehrliche_praemie DECIMAL(10,2),
    zahlungsintervall VARCHAR(50),
    vertragsbeginn DATE,
    vertragsende DATE,
    kuendigungsfrist INTEGER, -- in Tagen
    ansprechpartner VARCHAR(255),
    telefon VARCHAR(50),
    email VARCHAR(255),
    notizen TEXT,
    erstellt_von UUID REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mietverträge
CREATE TABLE IF NOT EXISTS anlagen.mietvertraege (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anlage_id UUID REFERENCES anlagen.anlagen(id),
    vertragsnummer VARCHAR(100) UNIQUE NOT NULL,
    vermieter VARCHAR(255),
    monatliche_miete DECIMAL(10,2),
    kaution DECIMAL(10,2),
    vertragsbeginn DATE,
    vertragsende DATE,
    kuendigungsfrist INTEGER, -- in Tagen
    ansprechpartner VARCHAR(255),
    telefon VARCHAR(50),
    email VARCHAR(255),
    vertragsdokument TEXT, -- URL zum Vertragsdokument
    status VARCHAR(50) DEFAULT 'Aktiv' CHECK (status IN ('Aktiv', 'Beendet', 'Gekündigt')),
    notizen TEXT,
    erstellt_von UUID REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXE
-- =====================================================

-- Anlagen-Indexe
CREATE INDEX IF NOT EXISTS idx_anlagen_anlagennummer ON anlagen.anlagen(anlagennummer);
CREATE INDEX IF NOT EXISTS idx_anlagen_status ON anlagen.anlagen(status);
CREATE INDEX IF NOT EXISTS idx_anlagen_kategorie ON anlagen.anlagen(anlagenkategorie_id);
CREATE INDEX IF NOT EXISTS idx_anlagen_verantwortlicher ON anlagen.anlagen(verantwortlicher);
CREATE INDEX IF NOT EXISTS idx_anlagen_anschaffungsdatum ON anlagen.anlagen(anschaffungsdatum);

-- Abschreibungs-Indexe
CREATE INDEX IF NOT EXISTS idx_abschreibungsplan_anlage ON anlagen.abschreibungsplan(anlage_id);
CREATE INDEX IF NOT EXISTS idx_abschreibungsplan_jahr_monat ON anlagen.abschreibungsplan(jahr, monat);
CREATE INDEX IF NOT EXISTS idx_abschreibungshistorie_anlage ON anlagen.abschreibungshistorie(anlage_id);
CREATE INDEX IF NOT EXISTS idx_abschreibungshistorie_datum ON anlagen.abschreibungshistorie(abschreibungsdatum);

-- Wartungs-Indexe
CREATE INDEX IF NOT EXISTS idx_wartungsplan_anlage ON anlagen.wartungsplan(anlage_id);
CREATE INDEX IF NOT EXISTS idx_wartungsplan_naechste ON anlagen.wartungsplan(naechste_wartung);
CREATE INDEX IF NOT EXISTS idx_wartungsauftraege_anlage ON anlagen.wartungsauftraege(anlage_id);
CREATE INDEX IF NOT EXISTS idx_wartungsauftraege_status ON anlagen.wartungsauftraege(status);
CREATE INDEX IF NOT EXISTS idx_wartungsauftraege_datum ON anlagen.wartungsauftraege(geplantes_datum);

-- Fuhrpark-Indexe
CREATE INDEX IF NOT EXISTS idx_fahrzeuge_kennzeichen ON anlagen.fahrzeuge(kennzeichen);
CREATE INDEX IF NOT EXISTS idx_fahrzeuge_tuev ON anlagen.fahrzeuge(tuev_bis);
CREATE INDEX IF NOT EXISTS idx_fahrzeuge_versicherung ON anlagen.fahrzeuge(versicherung_bis);
CREATE INDEX IF NOT EXISTS idx_fahrer_personal ON anlagen.fahrer(personal_id);
CREATE INDEX IF NOT EXISTS idx_fahrzeugnutzung_fahrzeug ON anlagen.fahrzeugnutzung(fahrzeug_id);
CREATE INDEX IF NOT EXISTS idx_fahrzeugnutzung_fahrer ON anlagen.fahrzeugnutzung(fahrer_id);
CREATE INDEX IF NOT EXISTS idx_tankvorgaenge_fahrzeug ON anlagen.tankvorgaenge(fahrzeug_id);
CREATE INDEX IF NOT EXISTS idx_tankvorgaenge_datum ON anlagen.tankvorgaenge(tankdatum);

-- Versicherungs-Indexe
CREATE INDEX IF NOT EXISTS idx_versicherungen_anlage ON anlagen.versicherungen(anlage_id);
CREATE INDEX IF NOT EXISTS idx_versicherungen_ende ON anlagen.versicherungen(vertragsende);
CREATE INDEX IF NOT EXISTS idx_mietvertraege_anlage ON anlagen.mietvertraege(anlage_id);
CREATE INDEX IF NOT EXISTS idx_mietvertraege_ende ON anlagen.mietvertraege(vertragsende);

-- =====================================================
-- TRIGGER
-- =====================================================

-- Update-Timestamp-Trigger
CREATE OR REPLACE FUNCTION update_anlagen_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.aktualisiert_am = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_anlagen_updated_at BEFORE UPDATE ON anlagen.anlagen
    FOR EACH ROW EXECUTE FUNCTION update_anlagen_updated_at();

CREATE TRIGGER update_anlagenkategorien_updated_at BEFORE UPDATE ON anlagen.anlagenkategorien
    FOR EACH ROW EXECUTE FUNCTION update_anlagen_updated_at();

CREATE TRIGGER update_wartungsplan_updated_at BEFORE UPDATE ON anlagen.wartungsplan
    FOR EACH ROW EXECUTE FUNCTION update_anlagen_updated_at();

CREATE TRIGGER update_wartungsauftraege_updated_at BEFORE UPDATE ON anlagen.wartungsauftraege
    FOR EACH ROW EXECUTE FUNCTION update_anlagen_updated_at();

CREATE TRIGGER update_fahrzeuge_updated_at BEFORE UPDATE ON anlagen.fahrzeuge
    FOR EACH ROW EXECUTE FUNCTION update_anlagen_updated_at();

CREATE TRIGGER update_fahrer_updated_at BEFORE UPDATE ON anlagen.fahrer
    FOR EACH ROW EXECUTE FUNCTION update_anlagen_updated_at();

-- =====================================================
-- VIEWS
-- =====================================================

-- Anlagen-Übersicht
CREATE OR REPLACE VIEW anlagen.anlagen_uebersicht AS
SELECT 
    a.id,
    a.anlagennummer,
    a.bezeichnung,
    ak.kategoriename,
    a.anschaffungsdatum,
    a.anschaffungswert,
    a.restbuchwert,
    a.status,
    a.standort,
    u.first_name || ' ' || u.last_name as verantwortlicher_name,
    COALESCE(w.anzahl_wartungen, 0) as anzahl_wartungen,
    COALESCE(w.naechste_wartung, 'Keine geplant') as naechste_wartung
FROM anlagen.anlagen a
LEFT JOIN anlagen.anlagenkategorien ak ON a.anlagenkategorie_id = ak.id
LEFT JOIN users u ON a.verantwortlicher = u.id
LEFT JOIN (
    SELECT 
        anlage_id,
        COUNT(*) as anzahl_wartungen,
        MIN(naechste_wartung) as naechste_wartung
    FROM anlagen.wartungsplan
    WHERE ist_aktiv = true
    GROUP BY anlage_id
) w ON a.id = w.anlage_id
WHERE a.status != 'Verschrottet';

-- Fuhrpark-Übersicht
CREATE OR REPLACE VIEW anlagen.fuhrpark_uebersicht AS
SELECT 
    f.id,
    a.anlagennummer,
    f.kennzeichen,
    f.marke,
    f.modell,
    f.baujahr,
    f.kilometerstand,
    f.tuev_bis,
    f.versicherung_bis,
    f.steuer_bis,
    p.vorname || ' ' || p.nachname as hauptfahrer,
    COALESCE(t.letzter_tank, 'Kein Tankvorgang') as letzter_tank,
    COALESCE(t.durchschnittsverbrauch, 0) as durchschnittsverbrauch
FROM anlagen.fahrzeuge f
JOIN anlagen.anlagen a ON f.fahrzeug_id = a.id
LEFT JOIN anlagen.fahrer fr ON fr.verantwortlich_fuer_fahrzeuge @> ARRAY[f.id]
LEFT JOIN personal.personal p ON fr.personal_id = p.id
LEFT JOIN (
    SELECT 
        fahrzeug_id,
        MAX(tankdatum) as letzter_tank,
        AVG(verbrauch_durchschnitt) as durchschnittsverbrauch
    FROM anlagen.tankvorgaenge
    GROUP BY fahrzeug_id
) t ON f.id = t.fahrzeug_id
WHERE a.status = 'Aktiv';

-- Wartungs-Übersicht
CREATE OR REPLACE VIEW anlagen.wartungs_uebersicht AS
SELECT 
    wa.id,
    wa.auftragsnummer,
    a.anlagennummer,
    a.bezeichnung as anlagenbezeichnung,
    wa.wartungstyp,
    wa.geplantes_datum,
    wa.tatsaechliches_datum,
    wa.status,
    wa.prioritaet,
    u.first_name || ' ' || u.last_name as verantwortlicher,
    wa.kosten
FROM anlagen.wartungsauftraege wa
JOIN anlagen.anlagen a ON wa.anlage_id = a.id
LEFT JOIN users u ON wa.verantwortlicher = u.id
ORDER BY wa.geplantes_datum;

-- =====================================================
-- FUNKTIONEN
-- =====================================================

-- Automatische Anlagennummer generieren
CREATE OR REPLACE FUNCTION anlagen.generate_anlagennummer()
RETURNS VARCHAR(20) AS $$
DECLARE
    next_num INTEGER;
    anlagennummer VARCHAR(20);
    year_prefix VARCHAR(4);
BEGIN
    year_prefix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(anlagennummer FROM 9) AS INTEGER)), 0) + 1
    INTO next_num
    FROM anlagen.anlagen
    WHERE anlagennummer LIKE 'ANL-' || year_prefix || '%';
    
    anlagennummer := 'ANL-' || year_prefix || '-' || LPAD(next_num::TEXT, 4, '0');
    RETURN anlagennummer;
END;
$$ LANGUAGE plpgsql;

-- Automatische Wartungsauftragsnummer generieren
CREATE OR REPLACE FUNCTION anlagen.generate_wartungsauftragsnummer()
RETURNS VARCHAR(50) AS $$
DECLARE
    next_num INTEGER;
    auftragsnummer VARCHAR(50);
    year_prefix VARCHAR(4);
BEGIN
    year_prefix := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(auftragsnummer FROM 9) AS INTEGER)), 0) + 1
    INTO next_num
    FROM anlagen.wartungsauftraege
    WHERE auftragsnummer LIKE 'WA-' || year_prefix || '%';
    
    auftragsnummer := 'WA-' || year_prefix || '-' || LPAD(next_num::TEXT, 6, '0');
    RETURN auftragsnummer;
END;
$$ LANGUAGE plpgsql;

-- Abschreibung berechnen
CREATE OR REPLACE FUNCTION anlagen.calculate_abschreibung(
    p_anlage_id UUID,
    p_jahr INTEGER,
    p_monat INTEGER
)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    anlage_record RECORD;
    kategorie_record RECORD;
    abschreibungsbetrag DECIMAL(15,2);
    monate_seit_anschaffung INTEGER;
BEGIN
    -- Anlagendaten abrufen
    SELECT * INTO anlage_record
    FROM anlagen.anlagen
    WHERE id = p_anlage_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Kategoriedaten abrufen
    SELECT * INTO kategorie_record
    FROM anlagen.anlagenkategorien
    WHERE id = anlage_record.anlagenkategorie_id;
    
    -- Monate seit Anschaffung berechnen
    monate_seit_anschaffung := (p_jahr - EXTRACT(YEAR FROM anlage_record.anschaffungsdatum)) * 12 + 
                              (p_monat - EXTRACT(MONTH FROM anlage_record.anschaffungsdatum));
    
    -- Lineare Abschreibung
    IF kategorie_record.afa_satz IS NOT NULL THEN
        abschreibungsbetrag := anlage_record.anschaffungswert * (kategorie_record.afa_satz / 100) / 12;
    ELSE
        abschreibungsbetrag := anlage_record.anschaffungswert / (kategorie_record.nutzungsdauer * 12);
    END IF;
    
    -- Prüfen ob bereits abgeschrieben wurde
    IF monate_seit_anschaffung <= 0 THEN
        RETURN 0;
    END IF;
    
    -- Prüfen ob Nutzungsdauer überschritten
    IF monate_seit_anschaffung > (kategorie_record.nutzungsdauer * 12) THEN
        RETURN 0;
    END IF;
    
    RETURN abschreibungsbetrag;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TESTDATEN
-- =====================================================

-- Anlagenkategorien einfügen
INSERT INTO anlagen.anlagenkategorien (kategoriename, beschreibung, afa_satz, nutzungsdauer) VALUES
('Büroausstattung', 'Büromöbel und -geräte', 20.00, 5),
('IT-Equipment', 'Computer, Server, Netzwerk', 33.33, 3),
('Fahrzeuge', 'Pkw, Lkw, Nutzfahrzeuge', 20.00, 5),
('Maschinen', 'Produktionsmaschinen', 10.00, 10),
('Gebäude', 'Gebäude und Immobilien', 2.00, 50);

-- Standorte einfügen
INSERT INTO anlagen.standorte (standortname, adresse, plz, ort, land) VALUES
('Hauptsitz', 'Musterstraße 1', '12345', 'Musterstadt', 'Deutschland'),
('Niederlassung Nord', 'Nordstraße 10', '20000', 'Hamburg', 'Deutschland'),
('Lager Süd', 'Lagerstraße 5', '80000', 'München', 'Deutschland');

-- Beispiel-Anlagen einfügen
INSERT INTO anlagen.anlagen (anlagennummer, bezeichnung, anlagenart, anschaffungsdatum, anschaffungswert, restbuchwert, standort, status) VALUES
('ANL-2024-0001', 'Dell Latitude Laptop', 'IT-Equipment', '2024-01-15', 1200.00, 800.00, 'Hauptsitz', 'Aktiv'),
('ANL-2024-0002', 'Bürostuhl ergonomisch', 'Büroausstattung', '2024-02-01', 500.00, 400.00, 'Hauptsitz', 'Aktiv'),
('ANL-2024-0003', 'VW Passat Firmenwagen', 'Fahrzeuge', '2024-01-01', 35000.00, 28000.00, 'Hauptsitz', 'Aktiv');

COMMIT; 