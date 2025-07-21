-- =====================================================
-- VALEO NeuroERP - Qualitätsmanagement Schema
-- =====================================================

-- Schema erstellen
CREATE SCHEMA IF NOT EXISTS qualitaet;

-- =====================================================
-- GRUNDTABELLEN
-- =====================================================

-- Qualitätsprüfungen
CREATE TABLE qualitaet.qualitaetspruefungen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pruefung_nr VARCHAR(20) UNIQUE NOT NULL,
    pruefung_typ VARCHAR(50) NOT NULL, -- 'EINGANGSKONTROLLE', 'PRODUKTION', 'AUSGANGSKONTROLLE', 'PERIODISCH'
    artikel_id UUID,
    lieferant_id UUID,
    produktionsauftrag_id UUID,
    pruefer_id UUID,
    pruefdatum DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OFFEN', -- 'OFFEN', 'IN_BEARBEITUNG', 'ABGESCHLOSSEN', 'ABGELEHNT'
    ergebnis VARCHAR(20), -- 'BESTANDEN', 'NICHT_BESTANDEN', 'MIT_AUFLAGEN'
    bemerkungen TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prüfparameter
CREATE TABLE qualitaet.pruefparameter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parameter_name VARCHAR(100) NOT NULL,
    parameter_typ VARCHAR(50) NOT NULL, -- 'ZAHL', 'TEXT', 'BOOLEAN', 'AUSWAHL'
    einheit VARCHAR(20),
    min_wert DECIMAL(10,3),
    max_wert DECIMAL(10,3),
    soll_wert DECIMAL(10,3),
    toleranz_plus DECIMAL(10,3),
    toleranz_minus DECIMAL(10,3),
    auswahl_optionen TEXT[], -- Für Auswahl-Parameter
    beschreibung TEXT,
    aktiv BOOLEAN DEFAULT true,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prüfergebnisse
CREATE TABLE qualitaet.pruefergebnisse (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pruefung_id UUID NOT NULL REFERENCES qualitaet.qualitaetspruefungen(id),
    parameter_id UUID NOT NULL REFERENCES qualitaet.pruefparameter(id),
    gemessener_wert DECIMAL(10,3),
    text_wert TEXT,
    boolean_wert BOOLEAN,
    auswahl_wert VARCHAR(100),
    ist_ok BOOLEAN,
    bemerkung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prüfpläne
CREATE TABLE qualitaet.pruefplaene (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name VARCHAR(100) NOT NULL,
    plan_typ VARCHAR(50) NOT NULL, -- 'ARTIKEL', 'LIEFERANT', 'PRODUKTION'
    artikel_id UUID,
    lieferant_id UUID,
    produktionsauftrag_id UUID,
    beschreibung TEXT,
    aktiv BOOLEAN DEFAULT true,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prüfplan-Parameter
CREATE TABLE qualitaet.pruefplan_parameter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pruefplan_id UUID NOT NULL REFERENCES qualitaet.pruefplaene(id),
    parameter_id UUID NOT NULL REFERENCES qualitaet.pruefparameter(id),
    reihenfolge INTEGER NOT NULL,
    pflicht BOOLEAN DEFAULT true,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MESSMITTEL UND KALIBRIERUNG
-- =====================================================

-- Messmittel
CREATE TABLE qualitaet.messmittel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    messmittel_nr VARCHAR(20) UNIQUE NOT NULL,
    bezeichnung VARCHAR(100) NOT NULL,
    typ VARCHAR(50) NOT NULL, -- 'WAAGE', 'THERMOMETER', 'PH_METER', 'SONSTIGES'
    hersteller VARCHAR(100),
    modell VARCHAR(100),
    seriennummer VARCHAR(100),
    kalibrier_zyklus INTEGER, -- Tage
    naechste_kalibrierung DATE,
    status VARCHAR(20) DEFAULT 'AKTIV', -- 'AKTIV', 'KALIBRIERUNG', 'DEFEKT', 'AUSGEMUSTERT'
    standort VARCHAR(100),
    verantwortlicher_id UUID,
    bemerkungen TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kalibrierungen
CREATE TABLE qualitaet.kalibrierungen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    messmittel_id UUID NOT NULL REFERENCES qualitaet.messmittel(id),
    kalibrier_nr VARCHAR(20) UNIQUE NOT NULL,
    kalibrier_datum DATE NOT NULL,
    naechste_kalibrierung DATE NOT NULL,
    kalibrier_stelle VARCHAR(100),
    kalibrierer VARCHAR(100),
    ergebnis VARCHAR(20) NOT NULL, -- 'BESTANDEN', 'NICHT_BESTANDEN'
    abweichungen TEXT,
    zertifikat_nr VARCHAR(100),
    kosten DECIMAL(10,2),
    bemerkungen TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- REKLAMATIONEN UND MASSNAHMEN
-- =====================================================

-- Reklamationen
CREATE TABLE qualitaet.reklamationen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reklamation_nr VARCHAR(20) UNIQUE NOT NULL,
    reklamation_typ VARCHAR(50) NOT NULL, -- 'LIEFERANT', 'KUNDE', 'INTERN'
    artikel_id UUID,
    lieferant_id UUID,
    kunde_id UUID,
    produktionsauftrag_id UUID,
    reklamation_datum DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'OFFEN', -- 'OFFEN', 'IN_BEARBEITUNG', 'GELOEST', 'GESCHLOSSEN'
    prioritaet VARCHAR(20) DEFAULT 'NORMAL', -- 'NIEDRIG', 'NORMAL', 'HOCH', 'KRITISCH'
    beschreibung TEXT NOT NULL,
    ursache TEXT,
    massnahmen TEXT,
    verantwortlicher_id UUID,
    loesungs_datum DATE,
    bemerkungen TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Korrekturmaßnahmen
CREATE TABLE qualitaet.korrekturmassnahmen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reklamation_id UUID REFERENCES qualitaet.reklamationen(id),
    massnahme_nr VARCHAR(20) UNIQUE NOT NULL,
    massnahme_typ VARCHAR(50) NOT NULL, -- 'SOFORTMASSNAHME', 'KORREKTURMASSNAHME', 'VORBEUGEMASSNAHME'
    beschreibung TEXT NOT NULL,
    verantwortlicher_id UUID,
    start_datum DATE,
    end_datum DATE,
    status VARCHAR(20) DEFAULT 'GEPLANT', -- 'GEPLANT', 'IN_BEARBEITUNG', 'ABGESCHLOSSEN'
    effektivitaet VARCHAR(20), -- 'EFFEKTIV', 'TEILWEISE_EFFEKTIV', 'NICHT_EFFEKTIV'
    bemerkungen TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- QS-DOKUMENTATION UND ZERTIFIKATE
-- =====================================================

-- QS-Dokumentation
CREATE TABLE qualitaet.qs_dokumentation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dokument_nr VARCHAR(20) UNIQUE NOT NULL,
    dokument_typ VARCHAR(50) NOT NULL, -- 'HACCP', 'EIGENKONTROLLE', 'SUPPLIER_AUDIT', 'INTERNES_AUDIT'
    titel VARCHAR(200) NOT NULL,
    beschreibung TEXT,
    version VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'ENTWURF', -- 'ENTWURF', 'FREIGEGEBEN', 'ARCHIVIERT'
    verantwortlicher_id UUID,
    freigabe_datum DATE,
    naechste_pruefung DATE,
    datei_pfad VARCHAR(500),
    bemerkungen TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Zertifikate
CREATE TABLE qualitaet.zertifikate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zertifikat_nr VARCHAR(20) UNIQUE NOT NULL,
    zertifikat_typ VARCHAR(50) NOT NULL, -- 'ISO_9001', 'ISO_14001', 'HACCP', 'QS', 'SONSTIGES'
    bezeichnung VARCHAR(200) NOT NULL,
    aussteller VARCHAR(100),
    ausstellungs_datum DATE,
    gueltig_bis DATE,
    status VARCHAR(20) DEFAULT 'AKTIV', -- 'AKTIV', 'ABGELAUFEN', 'WIDERRUFEN'
    verantwortlicher_id UUID,
    datei_pfad VARCHAR(500),
    bemerkungen TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- AUDITS UND BEWERTUNGEN
-- =====================================================

-- Audits
CREATE TABLE qualitaet.audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_nr VARCHAR(20) UNIQUE NOT NULL,
    audit_typ VARCHAR(50) NOT NULL, -- 'INTERN', 'EXTERN', 'LIEFERANT', 'ZERTIFIZIERER'
    audit_datum DATE NOT NULL,
    audit_ort VARCHAR(100),
    auditiert_von VARCHAR(100),
    auditiert_an VARCHAR(100),
    ergebnis VARCHAR(20) NOT NULL, -- 'BESTANDEN', 'MIT_AUFLAGEN', 'NICHT_BESTANDEN'
    bewertung INTEGER, -- 1-5 Skala
    bemerkungen TEXT,
    naechstes_audit DATE,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit-Findings
CREATE TABLE qualitaet.audit_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES qualitaet.audits(id),
    finding_nr VARCHAR(20) NOT NULL,
    typ VARCHAR(20) NOT NULL, -- 'MAJOR', 'MINOR', 'OBSERVATION'
    beschreibung TEXT NOT NULL,
    abteilung VARCHAR(100),
    verantwortlicher_id UUID,
    status VARCHAR(20) DEFAULT 'OFFEN', -- 'OFFEN', 'IN_BEARBEITUNG', 'GELOEST', 'GESCHLOSSEN'
    loesungs_datum DATE,
    bemerkungen TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Qualitätsprüfungen
CREATE INDEX idx_qualitaetspruefungen_status ON qualitaet.qualitaetspruefungen(status);
CREATE INDEX idx_qualitaetspruefungen_typ ON qualitaet.qualitaetspruefungen(pruefung_typ);
CREATE INDEX idx_qualitaetspruefungen_datum ON qualitaet.qualitaetspruefungen(pruefdatum);
CREATE INDEX idx_qualitaetspruefungen_artikel ON qualitaet.qualitaetspruefungen(artikel_id);
CREATE INDEX idx_qualitaetspruefungen_lieferant ON qualitaet.qualitaetspruefungen(lieferant_id);

-- Prüfergebnisse
CREATE INDEX idx_pruefergebnisse_pruefung ON qualitaet.pruefergebnisse(pruefung_id);
CREATE INDEX idx_pruefergebnisse_parameter ON qualitaet.pruefergebnisse(parameter_id);

-- Messmittel
CREATE INDEX idx_messmittel_status ON qualitaet.messmittel(status);
CREATE INDEX idx_messmittel_kalibrierung ON qualitaet.messmittel(naechste_kalibrierung);

-- Kalibrierungen
CREATE INDEX idx_kalibrierungen_messmittel ON qualitaet.kalibrierungen(messmittel_id);
CREATE INDEX idx_kalibrierungen_datum ON qualitaet.kalibrierungen(kalibrier_datum);

-- Reklamationen
CREATE INDEX idx_reklamationen_status ON qualitaet.reklamationen(status);
CREATE INDEX idx_reklamationen_typ ON qualitaet.reklamationen(reklamation_typ);
CREATE INDEX idx_reklamationen_datum ON qualitaet.reklamationen(reklamation_datum);
CREATE INDEX idx_reklamationen_prioritaet ON qualitaet.reklamationen(prioritaet);

-- QS-Dokumentation
CREATE INDEX idx_qs_dokumentation_typ ON qualitaet.qs_dokumentation(dokument_typ);
CREATE INDEX idx_qs_dokumentation_status ON qualitaet.qs_dokumentation(status);

-- Zertifikate
CREATE INDEX idx_zertifikate_typ ON qualitaet.zertifikate(zertifikat_typ);
CREATE INDEX idx_zertifikate_status ON qualitaet.zertifikate(status);
CREATE INDEX idx_zertifikate_gueltig ON qualitaet.zertifikate(gueltig_bis);

-- Audits
CREATE INDEX idx_audits_typ ON qualitaet.audits(audit_typ);
CREATE INDEX idx_audits_datum ON qualitaet.audits(audit_datum);
CREATE INDEX idx_audits_ergebnis ON qualitaet.audits(ergebnis);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger-Funktion für automatische Timestamp-Updates
CREATE OR REPLACE FUNCTION qualitaet.update_geaendert_am()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geaendert_am = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers für alle Tabellen
CREATE TRIGGER trigger_qualitaetspruefungen_update
    BEFORE UPDATE ON qualitaet.qualitaetspruefungen
    FOR EACH ROW EXECUTE FUNCTION qualitaet.update_geaendert_am();

CREATE TRIGGER trigger_pruefparameter_update
    BEFORE UPDATE ON qualitaet.pruefparameter
    FOR EACH ROW EXECUTE FUNCTION qualitaet.update_geaendert_am();

CREATE TRIGGER trigger_pruefergebnisse_update
    BEFORE UPDATE ON qualitaet.pruefergebnisse
    FOR EACH ROW EXECUTE FUNCTION qualitaet.update_geaendert_am();

CREATE TRIGGER trigger_pruefplaene_update
    BEFORE UPDATE ON qualitaet.pruefplaene
    FOR EACH ROW EXECUTE FUNCTION qualitaet.update_geaendert_am();

CREATE TRIGGER trigger_pruefplan_parameter_update
    BEFORE UPDATE ON qualitaet.pruefplan_parameter
    FOR EACH ROW EXECUTE FUNCTION qualitaet.update_geaendert_am();

CREATE TRIGGER trigger_messmittel_update
    BEFORE UPDATE ON qualitaet.messmittel
    FOR EACH ROW EXECUTE FUNCTION qualitaet.update_geaendert_am();

CREATE TRIGGER trigger_kalibrierungen_update
    BEFORE UPDATE ON qualitaet.kalibrierungen
    FOR EACH ROW EXECUTE FUNCTION qualitaet.update_geaendert_am();

CREATE TRIGGER trigger_reklamationen_update
    BEFORE UPDATE ON qualitaet.reklamationen
    FOR EACH ROW EXECUTE FUNCTION qualitaet.update_geaendert_am();

CREATE TRIGGER trigger_korrekturmassnahmen_update
    BEFORE UPDATE ON qualitaet.korrekturmassnahmen
    FOR EACH ROW EXECUTE FUNCTION qualitaet.update_geaendert_am();

CREATE TRIGGER trigger_qs_dokumentation_update
    BEFORE UPDATE ON qualitaet.qs_dokumentation
    FOR EACH ROW EXECUTE FUNCTION qualitaet.update_geaendert_am();

CREATE TRIGGER trigger_zertifikate_update
    BEFORE UPDATE ON qualitaet.zertifikate
    FOR EACH ROW EXECUTE FUNCTION qualitaet.update_geaendert_am();

CREATE TRIGGER trigger_audits_update
    BEFORE UPDATE ON qualitaet.audits
    FOR EACH ROW EXECUTE FUNCTION qualitaet.update_geaendert_am();

CREATE TRIGGER trigger_audit_findings_update
    BEFORE UPDATE ON qualitaet.audit_findings
    FOR EACH ROW EXECUTE FUNCTION qualitaet.update_geaendert_am();

-- =====================================================
-- FUNKTIONEN
-- =====================================================

-- Automatische Prüfnummer-Generierung
CREATE OR REPLACE FUNCTION qualitaet.generate_pruefnummer()
RETURNS TRIGGER AS $$
DECLARE
    jahr INTEGER;
    naechste_nummer INTEGER;
    neue_nummer VARCHAR(20);
BEGIN
    jahr := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Nächste Nummer für das aktuelle Jahr ermitteln
    SELECT COALESCE(MAX(CAST(SUBSTRING(pruefung_nr FROM 9) AS INTEGER)), 0) + 1
    INTO naechste_nummer
    FROM qualitaet.qualitaetspruefungen
    WHERE pruefung_nr LIKE 'QP-' || jahr || '-%';
    
    neue_nummer := 'QP-' || jahr || '-' || LPAD(naechste_nummer::TEXT, 4, '0');
    NEW.pruefung_nr := neue_nummer;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für automatische Prüfnummer-Generierung
CREATE TRIGGER trigger_generate_pruefnummer
    BEFORE INSERT ON qualitaet.qualitaetspruefungen
    FOR EACH ROW EXECUTE FUNCTION qualitaet.generate_pruefnummer();

-- Automatische Reklamationsnummer-Generierung
CREATE OR REPLACE FUNCTION qualitaet.generate_reklamationsnummer()
RETURNS TRIGGER AS $$
DECLARE
    jahr INTEGER;
    naechste_nummer INTEGER;
    neue_nummer VARCHAR(20);
BEGIN
    jahr := EXTRACT(YEAR FROM CURRENT_DATE);
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(reklamation_nr FROM 9) AS INTEGER)), 0) + 1
    INTO naechste_nummer
    FROM qualitaet.reklamationen
    WHERE reklamation_nr LIKE 'REK-' || jahr || '-%';
    
    neue_nummer := 'REK-' || jahr || '-' || LPAD(naechste_nummer::TEXT, 4, '0');
    NEW.reklamation_nr := neue_nummer;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für automatische Reklamationsnummer-Generierung
CREATE TRIGGER trigger_generate_reklamationsnummer
    BEFORE INSERT ON qualitaet.reklamationen
    FOR EACH ROW EXECUTE FUNCTION qualitaet.generate_reklamationsnummer();

-- Qualitätsstatistiken berechnen
CREATE OR REPLACE FUNCTION qualitaet.get_qualitaetsstatistiken(
    start_datum DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_datum DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    gesamt_pruefungen BIGINT,
    bestanden BIGINT,
    nicht_bestanden BIGINT,
    bestanden_prozent DECIMAL(5,2),
    offene_reklamationen BIGINT,
    geloeste_reklamationen BIGINT,
    durchschnittliche_loesungszeit DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(qp.id)::BIGINT as gesamt_pruefungen,
        COUNT(CASE WHEN qp.ergebnis = 'BESTANDEN' THEN 1 END)::BIGINT as bestanden,
        COUNT(CASE WHEN qp.ergebnis = 'NICHT_BESTANDEN' THEN 1 END)::BIGINT as nicht_bestanden,
        ROUND(
            (COUNT(CASE WHEN qp.ergebnis = 'BESTANDEN' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(qp.id), 0)) * 100, 2
        ) as bestanden_prozent,
        COUNT(CASE WHEN r.status IN ('OFFEN', 'IN_BEARBEITUNG') THEN 1 END)::BIGINT as offene_reklamationen,
        COUNT(CASE WHEN r.status = 'GELOEST' THEN 1 END)::BIGINT as geloeste_reklamationen,
        ROUND(
            AVG(
                CASE 
                    WHEN r.status = 'GELOEST' AND km.end_datum IS NOT NULL 
                    THEN (km.end_datum - r.reklamation_datum)::DECIMAL
                    ELSE NULL 
                END
            ), 2
        ) as durchschnittliche_loesungszeit
    FROM qualitaet.qualitaetspruefungen qp
    LEFT JOIN qualitaet.reklamationen r ON r.artikel_id = qp.artikel_id
    LEFT JOIN qualitaet.korrekturmassnahmen km ON km.reklamation_id = r.id
    WHERE qp.pruefdatum BETWEEN start_datum AND end_datum;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS
-- =====================================================

-- Qualitätsübersicht
CREATE VIEW qualitaet.qualitaets_uebersicht AS
SELECT 
    qp.id,
    qp.pruefung_nr,
    qp.pruefung_typ,
    qp.pruefdatum,
    qp.status,
    qp.ergebnis,
    a.bezeichnung as artikel_bezeichnung,
    l.firmenname as lieferant_name,
    p.name as pruefer_name,
    COUNT(pe.id) as anzahl_parameter,
    COUNT(CASE WHEN pe.ist_ok = true THEN 1 END) as ok_parameter,
    COUNT(CASE WHEN pe.ist_ok = false THEN 1 END) as nok_parameter
FROM qualitaet.qualitaetspruefungen qp
LEFT JOIN produktion.artikel a ON a.id = qp.artikel_id
LEFT JOIN einkauf.lieferanten l ON l.id = qp.lieferant_id
LEFT JOIN personal.mitarbeiter p ON p.id = qp.pruefer_id
LEFT JOIN qualitaet.pruefergebnisse pe ON pe.pruefung_id = qp.id
GROUP BY qp.id, qp.pruefung_nr, qp.pruefung_typ, qp.pruefdatum, qp.status, qp.ergebnis, 
         a.bezeichnung, l.firmenname, p.name;

-- Reklamationsübersicht
CREATE VIEW qualitaet.reklamations_uebersicht AS
SELECT 
    r.id,
    r.reklamation_nr,
    r.reklamation_typ,
    r.reklamation_datum,
    r.status,
    r.prioritaet,
    r.beschreibung,
    a.bezeichnung as artikel_bezeichnung,
    l.firmenname as lieferant_name,
    k.firmenname as kunde_name,
    p.name as verantwortlicher_name,
    COUNT(km.id) as anzahl_massnahmen,
    COUNT(CASE WHEN km.status = 'ABGESCHLOSSEN' THEN 1 END) as abgeschlossene_massnahmen
FROM qualitaet.reklamationen r
LEFT JOIN produktion.artikel a ON a.id = r.artikel_id
LEFT JOIN einkauf.lieferanten l ON l.id = r.lieferant_id
LEFT JOIN verkauf.kunden k ON k.id = r.kunde_id
LEFT JOIN personal.mitarbeiter p ON p.id = r.verantwortlicher_id
LEFT JOIN qualitaet.korrekturmassnahmen km ON km.reklamation_id = r.id
GROUP BY r.id, r.reklamation_nr, r.reklamation_typ, r.reklamation_datum, r.status, r.prioritaet,
         r.beschreibung, a.bezeichnung, l.firmenname, k.firmenname, p.name;

-- Messmittelübersicht
CREATE VIEW qualitaet.messmittel_uebersicht AS
SELECT 
    m.id,
    m.messmittel_nr,
    m.bezeichnung,
    m.typ,
    m.hersteller,
    m.modell,
    m.status,
    m.standort,
    m.naechste_kalibrierung,
    p.name as verantwortlicher_name,
    k.kalibrier_datum as letzte_kalibrierung,
    k.naechste_kalibrierung as naechste_kalibrierung_aktuell,
    CASE 
        WHEN m.naechste_kalibrierung < CURRENT_DATE THEN 'ÜBERFÄLLIG'
        WHEN m.naechste_kalibrierung <= CURRENT_DATE + INTERVAL '30 days' THEN 'BALD_FÄLLIG'
        ELSE 'OK'
    END as kalibrier_status
FROM qualitaet.messmittel m
LEFT JOIN personal.mitarbeiter p ON p.id = m.verantwortlicher_id
LEFT JOIN LATERAL (
    SELECT kalibrier_datum, naechste_kalibrierung
    FROM qualitaet.kalibrierungen
    WHERE messmittel_id = m.id
    ORDER BY kalibrier_datum DESC
    LIMIT 1
) k ON true;

-- =====================================================
-- BEISPIELDATEN
-- =====================================================

-- Prüfparameter
INSERT INTO qualitaet.pruefparameter (parameter_name, parameter_typ, einheit, min_wert, max_wert, soll_wert, toleranz_plus, toleranz_minus, beschreibung) VALUES
('Gewicht', 'ZAHL', 'kg', 24.5, 25.5, 25.0, 0.5, 0.5, 'Sollgewicht des Produkts'),
('pH-Wert', 'ZAHL', 'pH', 6.5, 7.5, 7.0, 0.5, 0.5, 'pH-Wert der Lösung'),
('Feuchtigkeit', 'ZAHL', '%', 8.0, 12.0, 10.0, 2.0, 2.0, 'Feuchtigkeitsgehalt'),
('Farbe', 'AUSWAHL', NULL, NULL, NULL, NULL, NULL, NULL, 'Farbe des Produkts'),
('Geruch', 'BOOLEAN', NULL, NULL, NULL, NULL, NULL, NULL, 'Geruchstest'),
('Verpackung', 'BOOLEAN', NULL, NULL, NULL, NULL, NULL, NULL, 'Verpackungszustand');

-- Auswahloptionen für Farbe
UPDATE qualitaet.pruefparameter 
SET auswahl_optionen = ARRAY['Weiß', 'Gelb', 'Braun', 'Grün', 'Blau']
WHERE parameter_name = 'Farbe';

-- Messmittel
INSERT INTO qualitaet.messmittel (messmittel_nr, bezeichnung, typ, hersteller, modell, seriennummer, kalibrier_zyklus, naechste_kalibrierung, standort) VALUES
('MM-001', 'Laborwaage 25kg', 'WAAGE', 'Sartorius', 'CP225D', 'SN123456', 365, '2024-12-15', 'Labor'),
('MM-002', 'pH-Meter', 'PH_METER', 'Hanna Instruments', 'HI98107', 'SN789012', 180, '2024-06-20', 'Labor'),
('MM-003', 'Thermometer', 'THERMOMETER', 'Testo', '0560 1041', 'SN345678', 365, '2024-11-30', 'Produktion');

-- QS-Dokumentation
INSERT INTO qualitaet.qs_dokumentation (dokument_nr, dokument_typ, titel, beschreibung, version, status, freigabe_datum) VALUES
('QS-DOK-001', 'HACCP', 'HACCP-Konzept Futtermittel', 'HACCP-Konzept für die Futtermittelproduktion', '1.0', 'FREIGEGEBEN', '2024-01-15'),
('QS-DOK-002', 'EIGENKONTROLLE', 'Eigenkontrollplan', 'Plan für die betriebliche Eigenkontrolle', '2.1', 'FREIGEGEBEN', '2024-02-01'),
('QS-DOK-003', 'SUPPLIER_AUDIT', 'Lieferantenbewertung', 'Kriterien für die Lieferantenbewertung', '1.2', 'FREIGEGEBEN', '2024-01-20');

-- Zertifikate
INSERT INTO qualitaet.zertifikate (zertifikat_nr, zertifikat_typ, bezeichnung, aussteller, ausstellungs_datum, gueltig_bis, status) VALUES
('ZERT-001', 'QS', 'QS-Zertifikat Futtermittel', 'QS Qualität und Sicherheit GmbH', '2023-01-15', '2025-01-15', 'AKTIV'),
('ZERT-002', 'ISO_9001', 'ISO 9001:2015', 'TÜV Süd', '2023-03-20', '2026-03-20', 'AKTIV'),
('ZERT-003', 'HACCP', 'HACCP-Zertifikat', 'DIN CERTCO', '2023-06-10', '2025-06-10', 'AKTIV');

-- Qualitätsprüfungen (Beispiel)
INSERT INTO qualitaet.qualitaetspruefungen (pruefung_typ, artikel_id, lieferant_id, pruefer_id, pruefdatum, status, ergebnis) VALUES
('EINGANGSKONTROLLE', (SELECT id FROM produktion.artikel LIMIT 1), (SELECT id FROM einkauf.lieferanten LIMIT 1), (SELECT id FROM personal.mitarbeiter LIMIT 1), '2024-01-15', 'ABGESCHLOSSEN', 'BESTANDEN'),
('PRODUKTION', (SELECT id FROM produktion.artikel LIMIT 1), NULL, (SELECT id FROM personal.mitarbeiter LIMIT 1), '2024-01-16', 'ABGESCHLOSSEN', 'BESTANDEN'),
('AUSGANGSKONTROLLE', (SELECT id FROM produktion.artikel LIMIT 1), NULL, (SELECT id FROM personal.mitarbeiter LIMIT 1), '2024-01-17', 'IN_BEARBEITUNG', NULL);

-- Reklamationen (Beispiel)
INSERT INTO qualitaet.reklamationen (reklamation_typ, artikel_id, lieferant_id, reklamation_datum, status, prioritaet, beschreibung) VALUES
('LIEFERANT', (SELECT id FROM produktion.artikel LIMIT 1), (SELECT id FROM einkauf.lieferanten LIMIT 1), '2024-01-10', 'GELOEST', 'HOCH', 'Verpackung beschädigt bei Lieferung'),
('KUNDE', (SELECT id FROM produktion.artikel LIMIT 1), NULL, '2024-01-12', 'IN_BEARBEITUNG', 'NORMAL', 'Produkt entspricht nicht der Spezifikation'),
('INTERN', (SELECT id FROM produktion.artikel LIMIT 1), NULL, '2024-01-14', 'OFFEN', 'NIEDRIG', 'Leichte Abweichung bei der Produktion');

COMMIT; 