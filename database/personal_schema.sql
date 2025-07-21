-- VALEO NeuroERP Personal-Management Schema
-- Basierend auf L3-Standard Anforderungen
-- Version: 2.2

-- Personalwesen Haupttabellen
CREATE TABLE IF NOT EXISTS personal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personalnummer VARCHAR(20) UNIQUE NOT NULL,
    vorname VARCHAR(100) NOT NULL,
    nachname VARCHAR(100) NOT NULL,
    geburtsdatum DATE,
    eintrittsdatum DATE NOT NULL,
    austrittsdatum DATE,
    abteilung VARCHAR(100),
    position VARCHAR(100),
    gehalt DECIMAL(10,2),
    urlaubstage INTEGER DEFAULT 30,
    krankheitstage INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'inaktiv', 'beurlaubt', 'gekündigt')),
    email VARCHAR(255),
    telefon VARCHAR(20),
    mobile VARCHAR(20),
    adresse TEXT,
    plz VARCHAR(10),
    ort VARCHAR(100),
    land VARCHAR(100) DEFAULT 'Deutschland',
    steuernummer VARCHAR(50),
    sozialversicherungsnummer VARCHAR(50),
    bankverbindung JSONB,
    notfallkontakt JSONB,
    qualifikationen TEXT[],
    zertifikate TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Abteilungen
CREATE TABLE IF NOT EXISTS abteilungen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    abteilungsnummer VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    beschreibung TEXT,
    leiter_id UUID REFERENCES personal(id),
    standort VARCHAR(100),
    budget DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positionen
CREATE TABLE IF NOT EXISTS positionen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    positionsnummer VARCHAR(20) UNIQUE NOT NULL,
    bezeichnung VARCHAR(100) NOT NULL,
    beschreibung TEXT,
    abteilung_id UUID REFERENCES abteilungen(id),
    gehaltsstufe VARCHAR(20),
    min_gehalt DECIMAL(10,2),
    max_gehalt DECIMAL(10,2),
    anforderungen TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gehaltshistorie
CREATE TABLE IF NOT EXISTS gehaltshistorie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id UUID REFERENCES personal(id) ON DELETE CASCADE,
    gehaltsdatum DATE NOT NULL,
    gehalt DECIMAL(10,2) NOT NULL,
    gehaltsart VARCHAR(50) DEFAULT 'grundgehalt' CHECK (gehaltsart IN ('grundgehalt', 'bonus', 'erhöhung', 'reduzierung')),
    grund TEXT,
    genehmigt_von UUID REFERENCES personal(id),
    genehmigt_am TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Urlaubsanträge
CREATE TABLE IF NOT EXISTS urlaubsantraege (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id UUID REFERENCES personal(id) ON DELETE CASCADE,
    antragsdatum DATE NOT NULL,
    urlaubsbeginn DATE NOT NULL,
    urlaubsende DATE NOT NULL,
    urlaubstage INTEGER NOT NULL,
    urlaubsart VARCHAR(50) DEFAULT 'jahresurlaub' CHECK (urlaubsart IN ('jahresurlaub', 'sonderurlaub', 'krankheit', 'unpaid')),
    grund TEXT,
    status VARCHAR(50) DEFAULT 'beantragt' CHECK (status IN ('beantragt', 'genehmigt', 'abgelehnt', 'storniert')),
    genehmigt_von UUID REFERENCES personal(id),
    genehmigt_am TIMESTAMP,
    ablehnungsgrund TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Krankmeldungen
CREATE TABLE IF NOT EXISTS krankmeldungen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id UUID REFERENCES personal(id) ON DELETE CASCADE,
    krankheitsbeginn DATE NOT NULL,
    krankheitsende DATE,
    krankheitstage INTEGER,
    diagnose TEXT,
    arzt VARCHAR(100),
    arzt_telefon VARCHAR(20),
    krankschreibung_vorhanden BOOLEAN DEFAULT false,
    krankschreibung_datum DATE,
    status VARCHAR(50) DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'beendet', 'verlängert')),
    notizen TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Arbeitszeiten
CREATE TABLE IF NOT EXISTS arbeitszeiten (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id UUID REFERENCES personal(id) ON DELETE CASCADE,
    datum DATE NOT NULL,
    startzeit TIME,
    endzeit TIME,
    pause_minuten INTEGER DEFAULT 0,
    arbeitsstunden DECIMAL(4,2) GENERATED ALWAYS AS (
        CASE 
            WHEN startzeit IS NOT NULL AND endzeit IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (endzeit - startzeit)) / 3600 - pause_minuten / 60.0
            ELSE 0
        END
    ) STORED,
    arbeitsart VARCHAR(50) DEFAULT 'normal' CHECK (arbeitsart IN ('normal', 'überstunden', 'nachtschicht', 'feiertag', 'wochenende')),
    projekt_id UUID,
    notizen TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weiterbildungen
CREATE TABLE IF NOT EXISTS weiterbildungen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id UUID REFERENCES personal(id) ON DELETE CASCADE,
    bezeichnung VARCHAR(255) NOT NULL,
    beschreibung TEXT,
    anbieter VARCHAR(100),
    startdatum DATE,
    enddatum DATE,
    kosten DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'geplant' CHECK (status IN ('geplant', 'laufend', 'abgeschlossen', 'abgebrochen')),
    zertifikat_vorhanden BOOLEAN DEFAULT false,
    zertifikat_datum DATE,
    bewertung INTEGER CHECK (bewertung >= 1 AND bewertung <= 5),
    notizen TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Beurteilungen
CREATE TABLE IF NOT EXISTS beurteilungen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id UUID REFERENCES personal(id) ON DELETE CASCADE,
    beurteilungsdatum DATE NOT NULL,
    beurteiler_id UUID REFERENCES personal(id),
    beurteilungszeitraum_start DATE,
    beurteilungszeitraum_ende DATE,
    leistungsbewertung INTEGER CHECK (leistungsbewertung >= 1 AND leistungsbewertung <= 5),
    verhaltensbewertung INTEGER CHECK (verhaltensbewertung >= 1 AND verhaltensbewertung <= 5),
    entwicklungsziele TEXT,
    maßnahmen TEXT,
    gesamtbewertung INTEGER CHECK (gesamtbewertung >= 1 AND gesamtbewertung <= 5),
    unterschrift_mitarbeiter BOOLEAN DEFAULT false,
    unterschrift_vorgesetzter BOOLEAN DEFAULT false,
    notizen TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verträge
CREATE TABLE IF NOT EXISTS vertraege (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id UUID REFERENCES personal(id) ON DELETE CASCADE,
    vertragsnummer VARCHAR(50) UNIQUE NOT NULL,
    vertragsart VARCHAR(50) NOT NULL CHECK (vertragsart IN ('unbefristet', 'befristet', 'probezeit', 'werkvertrag', 'freelancer')),
    vertragsbeginn DATE NOT NULL,
    vertragsende DATE,
    probezeit_bis DATE,
    kündigungsfrist INTEGER DEFAULT 30,
    gehalt DECIMAL(10,2) NOT NULL,
    wochenarbeitszeit INTEGER DEFAULT 40,
    urlaubstage INTEGER DEFAULT 30,
    vertragsstatus VARCHAR(50) DEFAULT 'aktiv' CHECK (vertragsstatus IN ('aktiv', 'beendet', 'gekündigt', 'verlängert')),
    notizen TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_personal_personalnummer ON personal(personalnummer);
CREATE INDEX IF NOT EXISTS idx_personal_status ON personal(status);
CREATE INDEX IF NOT EXISTS idx_personal_abteilung ON personal(abteilung);
CREATE INDEX IF NOT EXISTS idx_personal_eintrittsdatum ON personal(eintrittsdatum);
CREATE INDEX IF NOT EXISTS idx_abteilungen_abteilungsnummer ON abteilungen(abteilungsnummer);
CREATE INDEX IF NOT EXISTS idx_positionen_positionsnummer ON positionen(positionsnummer);
CREATE INDEX IF NOT EXISTS idx_gehaltshistorie_personal_id ON gehaltshistorie(personal_id);
CREATE INDEX IF NOT EXISTS idx_gehaltshistorie_gehaltsdatum ON gehaltshistorie(gehaltsdatum);
CREATE INDEX IF NOT EXISTS idx_urlaubsantraege_personal_id ON urlaubsantraege(personal_id);
CREATE INDEX IF NOT EXISTS idx_urlaubsantraege_status ON urlaubsantraege(status);
CREATE INDEX IF NOT EXISTS idx_krankmeldungen_personal_id ON krankmeldungen(personal_id);
CREATE INDEX IF NOT EXISTS idx_krankmeldungen_status ON krankmeldungen(status);
CREATE INDEX IF NOT EXISTS idx_arbeitszeiten_personal_id ON arbeitszeiten(personal_id);
CREATE INDEX IF NOT EXISTS idx_arbeitszeiten_datum ON arbeitszeiten(datum);
CREATE INDEX IF NOT EXISTS idx_weiterbildungen_personal_id ON weiterbildungen(personal_id);
CREATE INDEX IF NOT EXISTS idx_beurteilungen_personal_id ON beurteilungen(personal_id);
CREATE INDEX IF NOT EXISTS idx_vertraege_personal_id ON vertraege(personal_id);
CREATE INDEX IF NOT EXISTS idx_vertraege_vertragsnummer ON vertraege(vertragsnummer);

-- Trigger für updated_at
CREATE TRIGGER update_personal_updated_at BEFORE UPDATE ON personal
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_abteilungen_updated_at BEFORE UPDATE ON abteilungen
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positionen_updated_at BEFORE UPDATE ON positionen
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_urlaubsantraege_updated_at BEFORE UPDATE ON urlaubsantraege
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_krankmeldungen_updated_at BEFORE UPDATE ON krankmeldungen
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weiterbildungen_updated_at BEFORE UPDATE ON weiterbildungen
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beurteilungen_updated_at BEFORE UPDATE ON beurteilungen
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vertraege_updated_at BEFORE UPDATE ON vertraege
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views für Berichte
CREATE OR REPLACE VIEW personal_uebersicht AS
SELECT 
    p.id,
    p.personalnummer,
    p.vorname,
    p.nachname,
    p.abteilung,
    p.position,
    p.gehalt,
    p.status,
    p.eintrittsdatum,
    p.urlaubstage,
    p.krankheitstage,
    a.name as abteilungsname,
    pos.bezeichnung as positionsbezeichnung
FROM personal p
LEFT JOIN abteilungen a ON p.abteilung = a.name
LEFT JOIN positionen pos ON p.position = pos.bezeichnung
ORDER BY p.nachname, p.vorname;

CREATE OR REPLACE VIEW urlaubsuebersicht AS
SELECT 
    p.personalnummer,
    p.vorname,
    p.nachname,
    p.abteilung,
    u.urlaubsbeginn,
    u.urlaubsende,
    u.urlaubstage,
    u.urlaubsart,
    u.status,
    u.genehmigt_von,
    genehmiger.vorname || ' ' || genehmiger.nachname as genehmiger_name
FROM urlaubsantraege u
JOIN personal p ON u.personal_id = p.id
LEFT JOIN personal genehmiger ON u.genehmigt_von = genehmiger.id
ORDER BY u.urlaubsbeginn;

CREATE OR REPLACE VIEW krankheitsuebersicht AS
SELECT 
    p.personalnummer,
    p.vorname,
    p.nachname,
    p.abteilung,
    k.krankheitsbeginn,
    k.krankheitsende,
    k.krankheitstage,
    k.diagnose,
    k.arzt,
    k.status
FROM krankmeldungen k
JOIN personal p ON k.personal_id = p.id
ORDER BY k.krankheitsbeginn DESC;

-- Funktionen
CREATE OR REPLACE FUNCTION get_mitarbeiter_urlaubstage(p_personal_id UUID)
RETURNS TABLE (
    personalnummer VARCHAR(20),
    vorname VARCHAR(100),
    nachname VARCHAR(100),
    urlaubstage_verfuegbar INTEGER,
    urlaubstage_genommen INTEGER,
    urlaubstage_rest INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.personalnummer,
        p.vorname,
        p.nachname,
        p.urlaubstage as urlaubstage_verfuegbar,
        COALESCE(SUM(ua.urlaubstage), 0) as urlaubstage_genommen,
        p.urlaubstage - COALESCE(SUM(ua.urlaubstage), 0) as urlaubstage_rest
    FROM personal p
    LEFT JOIN urlaubsantraege ua ON p.id = ua.personal_id 
        AND ua.status = 'genehmigt'
        AND EXTRACT(YEAR FROM ua.urlaubsbeginn) = EXTRACT(YEAR FROM CURRENT_DATE)
    WHERE p.id = p_personal_id
    GROUP BY p.id, p.personalnummer, p.vorname, p.nachname, p.urlaubstage;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_abteilungsstatistik()
RETURNS TABLE (
    abteilung VARCHAR(100),
    mitarbeiter_anzahl BIGINT,
    durchschnittsgehalt DECIMAL(10,2),
    urlaubstage_gesamt INTEGER,
    krankheitstage_gesamt INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.abteilung,
        COUNT(*) as mitarbeiter_anzahl,
        AVG(p.gehalt) as durchschnittsgehalt,
        SUM(p.urlaubstage) as urlaubstage_gesamt,
        SUM(p.krankheitstage) as krankheitstage_gesamt
    FROM personal p
    WHERE p.status = 'aktiv'
    GROUP BY p.abteilung
    ORDER BY mitarbeiter_anzahl DESC;
END;
$$ LANGUAGE plpgsql;

-- Seed-Daten
INSERT INTO abteilungen (abteilungsnummer, name, beschreibung, standort) VALUES
('ABT001', 'IT', 'Informationstechnologie', 'Berlin'),
('ABT002', 'HR', 'Human Resources', 'München'),
('ABT003', 'Finanzen', 'Finanz- und Rechnungswesen', 'Hamburg'),
('ABT004', 'Vertrieb', 'Verkauf und Marketing', 'Frankfurt'),
('ABT005', 'Produktion', 'Produktion und Fertigung', 'Stuttgart')
ON CONFLICT (abteilungsnummer) DO NOTHING;

INSERT INTO positionen (positionsnummer, bezeichnung, beschreibung, abteilung_id, gehaltsstufe, min_gehalt, max_gehalt) VALUES
('POS001', 'Senior Entwickler', 'Senior Software Entwickler', (SELECT id FROM abteilungen WHERE name = 'IT'), 'E13', 60000, 80000),
('POS002', 'HR Manager', 'Human Resources Manager', (SELECT id FROM abteilungen WHERE name = 'HR'), 'E12', 55000, 70000),
('POS003', 'Controller', 'Finanzcontroller', (SELECT id FROM abteilungen WHERE name = 'Finanzen'), 'E11', 50000, 65000),
('POS004', 'Vertriebsleiter', 'Leiter Vertrieb', (SELECT id FROM abteilungen WHERE name = 'Vertrieb'), 'E12', 55000, 75000),
('POS005', 'Produktionsleiter', 'Leiter Produktion', (SELECT id FROM abteilungen WHERE name = 'Produktion'), 'E12', 55000, 75000)
ON CONFLICT (positionsnummer) DO NOTHING;

COMMIT; 