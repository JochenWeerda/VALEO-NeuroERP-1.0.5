-- =====================================================
-- VALEO NeuroERP - Produktionsmanagement Schema
-- =====================================================
-- Erstellt: März 2024
-- Beschreibung: Vollständiges Produktionsmanagement-System
-- Erweitert: Landhandels-spezifische Produktion (März 2024)
-- L3-Konformität: PRODUKTION, ARBEITSPLAENE, STUECKLISTEN
-- QS-Konformität: QS-Inspektion für fahrbare Mahl- und Mischanlagen
-- =====================================================

-- Schema für Produktionsmanagement erstellen
CREATE SCHEMA IF NOT EXISTS produktion;

-- =====================================================
-- 1. STÜCKLISTENVERWALTUNG
-- =====================================================

-- Artikel/Produkte
CREATE TABLE produktion.artikel (
    artikel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artikelnummer VARCHAR(50) UNIQUE NOT NULL,
    bezeichnung VARCHAR(200) NOT NULL,
    beschreibung TEXT,
    artikeltyp VARCHAR(50) NOT NULL CHECK (artikeltyp IN ('ROHSTOFF', 'HALBFERTIG', 'FERTIGPRODUKT', 'HILFSSTOFF', 'SCHUETTGUT', 'FLUESSIGKEIT', 'GEBINDE')),
    einheit VARCHAR(20) NOT NULL,
    gewicht_kg DECIMAL(10,3),
    laenge_mm DECIMAL(10,2),
    breite_mm DECIMAL(10,2),
    hoehe_mm DECIMAL(10,2),
    einkaufspreis DECIMAL(10,2),
    verkaufspreis DECIMAL(10,2),
    mindestbestand INTEGER DEFAULT 0,
    optimalbestand INTEGER DEFAULT 0,
    lagerort_id UUID,
    lieferant_id UUID,
    status VARCHAR(20) DEFAULT 'AKTIV' CHECK (status IN ('AKTIV', 'INAKTIV', 'GESPERRT')),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- Stücklisten (BOM - Bill of Materials)
CREATE TABLE produktion.stuecklisten (
    stueckliste_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artikel_id UUID NOT NULL REFERENCES produktion.artikel(artikel_id),
    stueckliste_typ VARCHAR(50) NOT NULL CHECK (stueckliste_typ IN ('PRODUKTION', 'MONTAGE', 'REPARATUR', 'FUTTERMISCHUNG', 'DUENGERMISCHUNG')),
    version VARCHAR(20) NOT NULL,
    gueltig_von DATE NOT NULL,
    gueltig_bis DATE,
    status VARCHAR(20) DEFAULT 'AKTIV' CHECK (status IN ('AKTIV', 'INAKTIV', 'GESPERRT')),
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID,
    UNIQUE(artikel_id, version)
);

-- Stücklistenpositionen
CREATE TABLE produktion.stuecklisten_positionen (
    position_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stueckliste_id UUID NOT NULL REFERENCES produktion.stuecklisten(stueckliste_id),
    komponente_id UUID NOT NULL REFERENCES produktion.artikel(artikel_id),
    position INTEGER NOT NULL,
    menge DECIMAL(10,4) NOT NULL,
    einheit VARCHAR(20) NOT NULL,
    ausschuss_prozent DECIMAL(5,2) DEFAULT 0,
    lagerort_id UUID,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. ARBEITSPLÄNE UND ROUTINGS
-- =====================================================

-- Arbeitspläne
CREATE TABLE produktion.arbeitsplaene (
    arbeitsplan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artikel_id UUID NOT NULL REFERENCES produktion.artikel(artikel_id),
    arbeitsplan_typ VARCHAR(50) NOT NULL CHECK (arbeitsplan_typ IN ('PRODUKTION', 'MONTAGE', 'QUALITAETSPRUEFUNG', 'MAHLEN', 'MISCHEN', 'SPRITZEN', 'KALKEN')),
    version VARCHAR(20) NOT NULL,
    gueltig_von DATE NOT NULL,
    gueltig_bis DATE,
    status VARCHAR(20) DEFAULT 'AKTIV' CHECK (status IN ('AKTIV', 'INAKTIV', 'GESPERRT')),
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID,
    UNIQUE(artikel_id, version)
);

-- Arbeitsplanpositionen (Arbeitsgänge)
CREATE TABLE produktion.arbeitsplan_positionen (
    position_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arbeitsplan_id UUID NOT NULL REFERENCES produktion.arbeitsplaene(arbeitsplan_id),
    position INTEGER NOT NULL,
    arbeitsgang_bezeichnung VARCHAR(200) NOT NULL,
    arbeitsplatz_id UUID,
    maschine_id UUID,
    personal_id UUID,
    vorgangszeit_min INTEGER NOT NULL,
    ruestzeit_min INTEGER DEFAULT 0,
    uebergangszeit_min INTEGER DEFAULT 0,
    parallel_arbeitsschritte INTEGER DEFAULT 1,
    qualitaetspruefung_erforderlich BOOLEAN DEFAULT FALSE,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Arbeitsplätze
CREATE TABLE produktion.arbeitsplaetze (
    arbeitsplatz_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    arbeitsplatz_nr VARCHAR(50) UNIQUE NOT NULL,
    bezeichnung VARCHAR(200) NOT NULL,
    abteilung_id UUID,
    standort VARCHAR(100),
    kapazitaet_pro_stunde DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'AKTIV' CHECK (status IN ('AKTIV', 'INAKTIV', 'WARTUNG')),
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maschinen
CREATE TABLE produktion.maschinen (
    maschine_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maschinen_nr VARCHAR(50) UNIQUE NOT NULL,
    bezeichnung VARCHAR(200) NOT NULL,
    maschinentyp VARCHAR(100),
    hersteller VARCHAR(100),
    modell VARCHAR(100),
    seriennummer VARCHAR(100),
    baujahr INTEGER,
    arbeitsplatz_id UUID REFERENCES produktion.arbeitsplaetze(arbeitsplatz_id),
    status VARCHAR(20) DEFAULT 'AKTIV' CHECK (status IN ('AKTIV', 'INAKTIV', 'WARTUNG', 'DEFEKT')),
    letzte_wartung DATE,
    naechste_wartung DATE,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. PRODUKTIONSAUFTRÄGE
-- =====================================================

-- Produktionsaufträge
CREATE TABLE produktion.produktionsauftraege (
    auftrag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auftragsnummer VARCHAR(50) UNIQUE NOT NULL,
    artikel_id UUID NOT NULL REFERENCES produktion.artikel(artikel_id),
    stueckliste_id UUID REFERENCES produktion.stuecklisten(stueckliste_id),
    arbeitsplan_id UUID REFERENCES produktion.arbeitsplaene(arbeitsplan_id),
    auftragstyp VARCHAR(50) NOT NULL CHECK (auftragstyp IN ('PRODUKTION', 'REPARATUR', 'MONTAGE', 'MAHLEN', 'MISCHEN', 'SPRITZEN', 'KALKEN', 'FRACHT')),
    status VARCHAR(20) DEFAULT 'ERSTELLT' CHECK (status IN ('ERSTELLT', 'FREIGEGEBEN', 'IN_BEARBEITUNG', 'PAUSIERT', 'ABGESCHLOSSEN', 'STORNIERT')),
    menge_geplant DECIMAL(10,4) NOT NULL,
    menge_fertiggestellt DECIMAL(10,4) DEFAULT 0,
    menge_ausschnitt DECIMAL(10,4) DEFAULT 0,
    starttermin DATE,
    endtermin DATE,
    tatsaechlicher_start TIMESTAMP,
    tatsaechliches_ende TIMESTAMP,
    prioritaet INTEGER DEFAULT 5 CHECK (prioritaet BETWEEN 1 AND 10),
    kunde_id UUID,
    auftraggeber_id UUID,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- Produktionsauftragspositionen
CREATE TABLE produktion.produktionsauftrag_positionen (
    position_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auftrag_id UUID NOT NULL REFERENCES produktion.produktionsauftraege(auftrag_id),
    arbeitsplan_position_id UUID REFERENCES produktion.arbeitsplan_positionen(position_id),
    position INTEGER NOT NULL,
    arbeitsgang_bezeichnung VARCHAR(200) NOT NULL,
    arbeitsplatz_id UUID,
    maschine_id UUID,
    personal_id UUID,
    status VARCHAR(20) DEFAULT 'OFFEN' CHECK (status IN ('OFFEN', 'IN_BEARBEITUNG', 'ABGESCHLOSSEN', 'PAUSIERT')),
    geplante_zeit_min INTEGER,
    tatsaechliche_zeit_min INTEGER,
    start_zeit TIMESTAMP,
    end_zeit TIMESTAMP,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. MASCHINENBELEGUNG
-- =====================================================

-- Maschinenbelegung
CREATE TABLE produktion.maschinenbelegung (
    belegung_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maschine_id UUID NOT NULL REFERENCES produktion.maschinen(maschine_id),
    auftrag_position_id UUID REFERENCES produktion.produktionsauftrag_positionen(position_id),
    belegungstyp VARCHAR(50) NOT NULL CHECK (belegungstyp IN ('PRODUKTION', 'WARTUNG', 'REPARATUR', 'RUHEZEIT')),
    start_zeit TIMESTAMP NOT NULL,
    end_zeit TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'GEPLANT' CHECK (status IN ('GEPLANT', 'AKTIV', 'ABGESCHLOSSEN', 'STORNIERT')),
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. QUALITÄTSKONTROLLE
-- =====================================================

-- Qualitätsprüfungen
CREATE TABLE produktion.qualitaetspruefungen (
    pruefung_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auftrag_id UUID REFERENCES produktion.produktionsauftraege(auftrag_id),
    auftrag_position_id UUID REFERENCES produktion.produktionsauftrag_positionen(position_id),
    pruefungstyp VARCHAR(50) NOT NULL CHECK (pruefungstyp IN ('EINGANGSKONTROLLE', 'ZWISCHENKONTROLLE', 'ENDPRÜFUNG', 'STICHPROBE')),
    status VARCHAR(20) DEFAULT 'OFFEN' CHECK (status IN ('OFFEN', 'IN_BEARBEITUNG', 'BESTANDEN', 'NICHT_BESTANDEN')),
    pruefer_id UUID,
    pruefdatum DATE,
    pruefzeit TIMESTAMP,
    ergebnis TEXT,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Qualitätsprüfungsparameter
CREATE TABLE produktion.qualitaetspruefung_parameter (
    parameter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pruefung_id UUID NOT NULL REFERENCES produktion.qualitaetspruefungen(pruefung_id),
    parameter_name VARCHAR(100) NOT NULL,
    soll_wert DECIMAL(10,4),
    ist_wert DECIMAL(10,4),
    toleranz_min DECIMAL(10,4),
    toleranz_max DECIMAL(10,4),
    einheit VARCHAR(20),
    status VARCHAR(20) DEFAULT 'OFFEN' CHECK (status IN ('OFFEN', 'BESTANDEN', 'NICHT_BESTANDEN')),
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. MATERIALVERBRAUCH
-- =====================================================

-- Materialverbrauch
CREATE TABLE produktion.materialverbrauch (
    verbrauch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auftrag_id UUID NOT NULL REFERENCES produktion.produktionsauftraege(auftrag_id),
    artikel_id UUID NOT NULL REFERENCES produktion.artikel(artikel_id),
    stuecklisten_position_id UUID REFERENCES produktion.stuecklisten_positionen(position_id),
    menge_geplant DECIMAL(10,4) NOT NULL,
    menge_verbraucht DECIMAL(10,4) DEFAULT 0,
    lagerort_id UUID,
    verbrauchsdatum DATE DEFAULT CURRENT_DATE,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. PRODUKTIONSSTATISTIKEN
-- =====================================================

-- Produktionszeiten
CREATE TABLE produktion.produktionszeiten (
    zeit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auftrag_id UUID NOT NULL REFERENCES produktion.produktionsauftraege(auftrag_id),
    auftrag_position_id UUID REFERENCES produktion.produktionsauftrag_positionen(position_id),
    zeittyp VARCHAR(50) NOT NULL CHECK (zeittyp IN ('RÜSTZEIT', 'VORGANGSZEIT', 'ÜBERGANGSZEIT', 'STÖRZEIT')),
    start_zeit TIMESTAMP NOT NULL,
    end_zeit TIMESTAMP NOT NULL,
    dauer_min INTEGER,
    grund VARCHAR(200),
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. LANDHANDELS-SPEZIFISCHE ERWEITERUNGEN
-- =====================================================

-- Mobile Mahl- und Mischanlagen (QS-konform)
CREATE TABLE produktion.mobile_anlagen (
    anlage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anlagen_nr VARCHAR(50) UNIQUE NOT NULL,
    bezeichnung VARCHAR(200) NOT NULL,
    anlagentyp VARCHAR(50) NOT NULL CHECK (anlagentyp IN ('MAHLWAGEN', 'MISCHWAGEN', 'KOMBINATIONSANLAGE')),
    hersteller VARCHAR(100),
    modell VARCHAR(100),
    seriennummer VARCHAR(100),
    baujahr INTEGER,
    kapazitaet_kg DECIMAL(10,2),
    fahrzeug_id UUID,
    fahrer_id UUID,
    qs_zulassung BOOLEAN DEFAULT FALSE,
    qs_zulassungsdatum DATE,
    qs_ablaufdatum DATE,
    status VARCHAR(20) DEFAULT 'AKTIV' CHECK (status IN ('AKTIV', 'INAKTIV', 'WARTUNG', 'QS_GESPERRT')),
    letzte_wartung DATE,
    naechste_wartung DATE,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Futtermittel-Rezepturen
CREATE TABLE produktion.futtermittel_rezepturen (
    rezeptur_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rezeptur_nr VARCHAR(50) UNIQUE NOT NULL,
    bezeichnung VARCHAR(200) NOT NULL,
    tierart VARCHAR(50) NOT NULL CHECK (tierart IN ('RINDER', 'SCHWEINE', 'GEFLUEGEL', 'PFERDE', 'SCHAFE', 'ZIEGEN')),
    lebensphase VARCHAR(50),
    rezeptur_typ VARCHAR(50) NOT NULL CHECK (rezeptur_typ IN ('ALLEINFUTTER', 'ERGÄNZUNGSFUTTER', 'MINERALFUTTER', 'VORMISCHUNG')),
    version VARCHAR(20) NOT NULL,
    gueltig_von DATE NOT NULL,
    gueltig_bis DATE,
    status VARCHAR(20) DEFAULT 'AKTIV' CHECK (status IN ('AKTIV', 'INAKTIV', 'GESPERRT')),
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- Rezepturpositionen
CREATE TABLE produktion.rezeptur_positionen (
    position_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rezeptur_id UUID NOT NULL REFERENCES produktion.futtermittel_rezepturen(rezeptur_id),
    artikel_id UUID NOT NULL REFERENCES produktion.artikel(artikel_id),
    position INTEGER NOT NULL,
    anteil_prozent DECIMAL(5,2) NOT NULL,
    menge_kg DECIMAL(10,4),
    einheit VARCHAR(20) NOT NULL,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Frachtaufträge
CREATE TABLE produktion.frachtauftraege (
    frachtauftrag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    frachtauftrag_nr VARCHAR(50) UNIQUE NOT NULL,
    auftragstyp VARCHAR(50) NOT NULL CHECK (auftragstyp IN ('MULDENKIPPER', 'ABSCHIEBEWAGEN', 'KOMBIKIPPER', 'LADEBORDWAGEN')),
    kunde_id UUID,
    lieferant_id UUID,
    startort VARCHAR(200) NOT NULL,
    zielort VARCHAR(200) NOT NULL,
    frachtgut VARCHAR(200),
    menge DECIMAL(10,4),
    einheit VARCHAR(20),
    fahrzeug_id UUID,
    fahrer_id UUID,
    starttermin TIMESTAMP,
    endtermin TIMESTAMP,
    status VARCHAR(20) DEFAULT 'GEPLANT' CHECK (status IN ('GEPLANT', 'IN_BEARBEITUNG', 'UNTERWEGS', 'ABGESCHLOSSEN', 'STORNIERT')),
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- Lohnspritzen
CREATE TABLE produktion.lohnspritzen (
    spritzauftrag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spritzauftrag_nr VARCHAR(50) UNIQUE NOT NULL,
    kunde_id UUID,
    flaeche_ha DECIMAL(10,2) NOT NULL,
    spritzmittel_id UUID REFERENCES produktion.artikel(artikel_id),
    spritzmittel_menge DECIMAL(10,4),
    einheit VARCHAR(20),
    fahrzeug_id UUID,
    fahrer_id UUID,
    spritztermin DATE,
    startzeit TIMESTAMP,
    endzeit TIMESTAMP,
    status VARCHAR(20) DEFAULT 'GEPLANT' CHECK (status IN ('GEPLANT', 'IN_BEARBEITUNG', 'ABGESCHLOSSEN', 'STORNIERT')),
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- Lohnkalken
CREATE TABLE produktion.lohnkalken (
    kalkauftrag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kalkauftrag_nr VARCHAR(50) UNIQUE NOT NULL,
    kunde_id UUID,
    flaeche_ha DECIMAL(10,2) NOT NULL,
    kalkart VARCHAR(50) NOT NULL CHECK (kalkart IN ('BRANNTKALK', 'KOHLENSAURER_KALK', 'KALKSTEINMEHL', 'DOLOMIT')),
    kalkmenge DECIMAL(10,4),
    einheit VARCHAR(20),
    fahrzeug_id UUID,
    fahrer_id UUID,
    kalktermin DATE,
    startzeit TIMESTAMP,
    endzeit TIMESTAMP,
    status VARCHAR(20) DEFAULT 'GEPLANT' CHECK (status IN ('GEPLANT', 'IN_BEARBEITUNG', 'ABGESCHLOSSEN', 'STORNIERT')),
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- QS-Dokumentation
CREATE TABLE produktion.qs_dokumentation (
    dokument_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dokument_nr VARCHAR(50) UNIQUE NOT NULL,
    dokument_typ VARCHAR(50) NOT NULL CHECK (dokument_typ IN ('HACCP', 'EIGENKONTROLLE', 'LIEFERANTENAUDIT', 'PERSONALSCHULUNG', 'WARTUNG')),
    referenz_id UUID,
    referenz_typ VARCHAR(50),
    dokument_datum DATE NOT NULL,
    verantwortlicher_id UUID,
    status VARCHAR(20) DEFAULT 'OFFEN' CHECK (status IN ('OFFEN', 'IN_BEARBEITUNG', 'ABGESCHLOSSEN', 'ÜBERFÄLLIG')),
    naechste_pruefung DATE,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- =====================================================
-- 9. INDEXE UND CONSTRAINTS
-- =====================================================

-- Indexe für bessere Performance
CREATE INDEX idx_artikel_artikelnummer ON produktion.artikel(artikelnummer);
CREATE INDEX idx_artikel_status ON produktion.artikel(status);
CREATE INDEX idx_stuecklisten_artikel ON produktion.stuecklisten(artikel_id);
CREATE INDEX idx_stuecklisten_status ON produktion.stuecklisten(status);
CREATE INDEX idx_arbeitsplaene_artikel ON produktion.arbeitsplaene(artikel_id);
CREATE INDEX idx_produktionsauftraege_status ON produktion.produktionsauftraege(status);
CREATE INDEX idx_produktionsauftraege_starttermin ON produktion.produktionsauftraege(starttermin);
CREATE INDEX idx_produktionsauftraege_auftragsnummer ON produktion.produktionsauftraege(auftragsnummer);
CREATE INDEX idx_maschinenbelegung_maschine ON produktion.maschinenbelegung(maschine_id);
CREATE INDEX idx_maschinenbelegung_zeitraum ON produktion.maschinenbelegung(start_zeit, end_zeit);
CREATE INDEX idx_qualitaetspruefungen_auftrag ON produktion.qualitaetspruefungen(auftrag_id);
CREATE INDEX idx_materialverbrauch_auftrag ON produktion.materialverbrauch(auftrag_id);
CREATE INDEX idx_mobile_anlagen_qs ON produktion.mobile_anlagen(qs_zulassung);
CREATE INDEX idx_futtermittel_rezepturen_tierart ON produktion.futtermittel_rezepturen(tierart);
CREATE INDEX idx_frachtauftraege_status ON produktion.frachtauftraege(status);
CREATE INDEX idx_spritzauftrag_status ON produktion.lohnspritzen(status);
CREATE INDEX idx_kalkauftrag_status ON produktion.lohnkalken(status);
CREATE INDEX idx_qs_dokumentation_typ ON produktion.qs_dokumentation(dokument_typ);

-- =====================================================
-- 10. TRIGGER FÜR AUTOMATISCHE UPDATES
-- =====================================================

-- Trigger für geaendert_am
CREATE OR REPLACE FUNCTION update_geaendert_am()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geaendert_am = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger auf alle Tabellen anwenden
CREATE TRIGGER trigger_artikel_geaendert_am
    BEFORE UPDATE ON produktion.artikel
    FOR EACH ROW EXECUTE FUNCTION update_geaendert_am();

CREATE TRIGGER trigger_stuecklisten_geaendert_am
    BEFORE UPDATE ON produktion.stuecklisten
    FOR EACH ROW EXECUTE FUNCTION update_geaendert_am();

CREATE TRIGGER trigger_arbeitsplaene_geaendert_am
    BEFORE UPDATE ON produktion.arbeitsplaene
    FOR EACH ROW EXECUTE FUNCTION update_geaendert_am();

CREATE TRIGGER trigger_produktionsauftraege_geaendert_am
    BEFORE UPDATE ON produktion.produktionsauftraege
    FOR EACH ROW EXECUTE FUNCTION update_geaendert_am();

-- =====================================================
-- 11. FUNKTIONEN FÜR BERECHNUNGEN
-- =====================================================

-- Funktion für automatische Auftragsnummern
CREATE OR REPLACE FUNCTION generate_auftragsnummer()
RETURNS VARCHAR(50) AS $$
DECLARE
    next_number INTEGER;
    new_number VARCHAR(50);
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(auftragsnummer FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM produktion.produktionsauftraege
    WHERE auftragsnummer LIKE 'PAU%';
    
    new_number := 'PAU' || LPAD(next_number::TEXT, 6, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Funktion für Produktionsfortschritt
CREATE OR REPLACE FUNCTION get_produktionsfortschritt(auftrag_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    geplant DECIMAL(10,4);
    fertig DECIMAL(10,4);
    fortschritt DECIMAL(5,2);
BEGIN
    SELECT menge_geplant, menge_fertiggestellt
    INTO geplant, fertig
    FROM produktion.produktionsauftraege
    WHERE auftrag_id = auftrag_uuid;
    
    IF geplant > 0 THEN
        fortschritt := (fertig / geplant) * 100;
    ELSE
        fortschritt := 0;
    END IF;
    
    RETURN LEAST(fortschritt, 100);
END;
$$ LANGUAGE plpgsql;

-- Funktion für QS-Überwachung
CREATE OR REPLACE FUNCTION check_qs_anforderungen()
RETURNS TABLE(anlage_id UUID, anlagen_nr VARCHAR(50), problem VARCHAR(200)) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ma.anlage_id,
        ma.anlagen_nr,
        CASE 
            WHEN ma.qs_ablaufdatum < CURRENT_DATE THEN 'QS-Zulassung abgelaufen'
            WHEN ma.qs_ablaufdatum < CURRENT_DATE + INTERVAL '30 days' THEN 'QS-Zulassung läuft bald ab'
            WHEN ma.naechste_wartung < CURRENT_DATE THEN 'Wartung überfällig'
            WHEN ma.naechste_wartung < CURRENT_DATE + INTERVAL '7 days' THEN 'Wartung fällig'
            ELSE 'Keine Probleme'
        END as problem
    FROM produktion.mobile_anlagen ma
    WHERE ma.status = 'AKTIV' AND ma.qs_zulassung = TRUE
    AND (
        ma.qs_ablaufdatum < CURRENT_DATE + INTERVAL '30 days' OR
        ma.naechste_wartung < CURRENT_DATE + INTERVAL '7 days'
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. VIEWS FÜR BERICHTE
-- =====================================================

-- Produktionsübersicht
CREATE VIEW produktion.produktionsuebersicht AS
SELECT 
    pa.auftrag_id,
    pa.auftragsnummer,
    a.bezeichnung as artikel_bezeichnung,
    pa.auftragstyp,
    pa.status,
    pa.menge_geplant,
    pa.menge_fertiggestellt,
    pa.menge_ausschnitt,
    get_produktionsfortschritt(pa.auftrag_id) as fortschritt_prozent,
    pa.starttermin,
    pa.endtermin,
    pa.prioritaet,
    pa.erstellt_am
FROM produktion.produktionsauftraege pa
JOIN produktion.artikel a ON pa.artikel_id = a.artikel_id
ORDER BY pa.prioritaet DESC, pa.starttermin;

-- Maschinenauslastung
CREATE VIEW produktion.maschinenauslastung AS
SELECT 
    m.maschinen_nr,
    m.bezeichnung as maschinen_bezeichnung,
    m.status as maschinen_status,
    COUNT(mb.belegung_id) as anzahl_belegungen,
    SUM(EXTRACT(EPOCH FROM (mb.end_zeit - mb.start_zeit))/3600) as belegungsstunden,
    m.naechste_wartung
FROM produktion.maschinen m
LEFT JOIN produktion.maschinenbelegung mb ON m.maschine_id = mb.maschine_id
    AND mb.start_zeit >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY m.maschine_id, m.maschinen_nr, m.bezeichnung, m.status, m.naechste_wartung
ORDER BY belegungsstunden DESC;

-- Qualitätsstatistiken
CREATE VIEW produktion.qualitaetsstatistiken AS
SELECT 
    DATE_TRUNC('month', qp.pruefdatum) as monat,
    COUNT(*) as anzahl_pruefungen,
    COUNT(CASE WHEN qp.status = 'BESTANDEN' THEN 1 END) as bestanden,
    COUNT(CASE WHEN qp.status = 'NICHT_BESTANDEN' THEN 1 END) as nicht_bestanden,
    ROUND(
        COUNT(CASE WHEN qp.status = 'BESTANDEN' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as qualitaetsquote_prozent
FROM produktion.qualitaetspruefungen qp
WHERE qp.pruefdatum >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', qp.pruefdatum)
ORDER BY monat DESC;

-- Landhandels-Übersicht
CREATE VIEW produktion.landhandels_uebersicht AS
SELECT 
    'Futtermittel' as kategorie,
    COUNT(*) as anzahl_auftraege,
    SUM(menge_geplant) as gesamtmenge,
    COUNT(CASE WHEN status = 'IN_BEARBEITUNG' THEN 1 END) as in_bearbeitung
FROM produktion.produktionsauftraege 
WHERE auftragstyp IN ('MAHLEN', 'MISCHEN')
UNION ALL
SELECT 
    'Frachtaufträge' as kategorie,
    COUNT(*) as anzahl_auftraege,
    SUM(menge) as gesamtmenge,
    COUNT(CASE WHEN status = 'IN_BEARBEITUNG' THEN 1 END) as in_bearbeitung
FROM produktion.frachtauftraege
UNION ALL
SELECT 
    'Lohnspritzen' as kategorie,
    COUNT(*) as anzahl_auftraege,
    SUM(flaeche_ha) as gesamtmenge,
    COUNT(CASE WHEN status = 'IN_BEARBEITUNG' THEN 1 END) as in_bearbeitung
FROM produktion.lohnspritzen
UNION ALL
SELECT 
    'Lohnkalken' as kategorie,
    COUNT(*) as anzahl_auftraege,
    SUM(flaeche_ha) as gesamtmenge,
    COUNT(CASE WHEN status = 'IN_BEARBEITUNG' THEN 1 END) as in_bearbeitung
FROM produktion.lohnkalken;

-- =====================================================
-- 13. BEISPIELDATEN
-- =====================================================

-- Beispiel-Artikel einfügen
INSERT INTO produktion.artikel (artikelnummer, bezeichnung, artikeltyp, einheit, gewicht_kg, einkaufspreis, verkaufspreis) VALUES
('ART-001', 'Motorblock Typ A', 'FERTIGPRODUKT', 'Stück', 45.5, 0, 1250.00),
('ART-002', 'Kolben Typ B', 'HALBFERTIG', 'Stück', 0.8, 15.50, 25.00),
('ART-003', 'Ventil Typ C', 'HALBFERTIG', 'Stück', 0.3, 8.75, 12.50),
('ART-004', 'Stahlblech 2mm', 'ROHSTOFF', 'm²', 15.7, 45.00, 0),
('ART-005', 'Schraube M8x20', 'ROHSTOFF', 'Stück', 0.02, 0.15, 0),
('ART-006', 'Weizen', 'SCHUETTGUT', 'kg', 0, 0.35, 0.45),
('ART-007', 'Sojaschrot', 'SCHUETTGUT', 'kg', 0, 0.55, 0.65),
('ART-008', 'Mineralstoffmischung', 'GEBINDE', 'kg', 25.0, 2.50, 3.00),
('ART-009', 'Flüssigdünger NPK', 'FLUESSIGKEIT', 'l', 1.2, 1.80, 2.20),
('ART-010', 'Pflanzenschutzmittel', 'GEBINDE', 'l', 1.0, 15.00, 18.00);

-- Beispiel-Arbeitsplätze
INSERT INTO produktion.arbeitsplaetze (arbeitsplatz_nr, bezeichnung, kapazitaet_pro_stunde) VALUES
('AP-001', 'Fertigungshalle A - Station 1', 10.0),
('AP-002', 'Fertigungshalle A - Station 2', 8.5),
('AP-003', 'Montagehalle B - Station 1', 12.0),
('AP-004', 'Qualitätskontrolle', 15.0),
('AP-005', 'Mobile Mahl- und Mischanlage', 5.0),
('AP-006', 'Frachtlogistik', 8.0),
('AP-007', 'Lohnspritzen', 3.0),
('AP-008', 'Lohnkalken', 4.0);

-- Beispiel-Maschinen
INSERT INTO produktion.maschinen (maschinen_nr, bezeichnung, maschinentyp, hersteller, arbeitsplatz_id) VALUES
('MAS-001', 'CNC-Fräse Typ X', 'CNC-Fräse', 'DMG MORI', (SELECT arbeitsplatz_id FROM produktion.arbeitsplaetze WHERE arbeitsplatz_nr = 'AP-001')),
('MAS-002', 'Drehmaschine Typ Y', 'Drehmaschine', 'GILDEMEISTER', (SELECT arbeitsplatz_id FROM produktion.arbeitsplaetze WHERE arbeitsplatz_nr = 'AP-002')),
('MAS-003', 'Schweißroboter Typ Z', 'Schweißroboter', 'KUKA', (SELECT arbeitsplatz_id FROM produktion.arbeitsplaetze WHERE arbeitsplatz_nr = 'AP-003')),
('MAS-004', 'Mobile Mahl- und Mischanlage', 'MAHLWAGEN', 'Bühler', (SELECT arbeitsplatz_id FROM produktion.arbeitsplaetze WHERE arbeitsplatz_nr = 'AP-005')),
('MAS-005', 'Muldenkipper 7,5t', 'MULDENKIPPER', 'MAN', (SELECT arbeitsplatz_id FROM produktion.arbeitsplaetze WHERE arbeitsplatz_nr = 'AP-006')),
('MAS-006', 'Spritze 3000l', 'SPRITZE', 'Amazone', (SELECT arbeitsplatz_id FROM produktion.arbeitsplaetze WHERE arbeitsplatz_nr = 'AP-007')),
('MAS-007', 'Kalkstreuer 2000kg', 'KALKSTREUER', 'Rauch', (SELECT arbeitsplatz_id FROM produktion.arbeitsplaetze WHERE arbeitsplatz_nr = 'AP-008'));

-- Beispiel-Mobile Anlagen
INSERT INTO produktion.mobile_anlagen (anlagen_nr, bezeichnung, anlagentyp, hersteller, kapazitaet_kg, qs_zulassung, qs_zulassungsdatum, qs_ablaufdatum) VALUES
('MOB-001', 'Mahl- und Mischanlage Typ A', 'KOMBINATIONSANLAGE', 'Bühler', 5000.0, TRUE, '2024-01-01', '2025-01-01'),
('MOB-002', 'Mischwagen Typ B', 'MISCHWAGEN', 'Storti', 3000.0, TRUE, '2024-02-01', '2025-02-01'),
('MOB-003', 'Mahlwagen Typ C', 'MAHLWAGEN', 'Bühler', 2000.0, FALSE, NULL, NULL);

-- Beispiel-Futtermittel-Rezepturen
INSERT INTO produktion.futtermittel_rezepturen (rezeptur_nr, bezeichnung, tierart, lebensphase, rezeptur_typ, version, gueltig_von) VALUES
('REZ-001', 'Milchkuh Alleinfutter', 'RINDER', 'LAKTIEREND', 'ALLEINFUTTER', '1.0', '2024-01-01'),
('REZ-002', 'Mastschwein Futter', 'SCHWEINE', 'MAST', 'ALLEINFUTTER', '1.0', '2024-01-01'),
('REZ-003', 'Legehennen Futter', 'GEFLUEGEL', 'LEGE', 'ALLEINFUTTER', '1.0', '2024-01-01');

COMMIT; 