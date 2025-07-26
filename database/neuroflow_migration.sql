-- =====================================================
-- VALEO NeuroERP - NeuroFlow Datenbank-Migration
-- =====================================================
-- Migration für fehlende Felder basierend auf der Analyse-Matrix
-- Erstellt: 2025-07-23
-- Status: NeuroFlow-Integration

-- =====================================================
-- 1. LIEFERANTENSTAMMDATEN ERWEITERN
-- =====================================================

-- Neue Felder für einkauf.lieferanten hinzufügen
ALTER TABLE einkauf.lieferanten 
ADD COLUMN IF NOT EXISTS rechtsform VARCHAR(50) CHECK (rechtsform IN ('GmbH', 'AG', 'KG', 'OHG', 'Einzelunternehmen', 'Gbr', 'e.V.', 'Sonstige')),
ADD COLUMN IF NOT EXISTS handelsregister VARCHAR(100),
ADD COLUMN IF NOT EXISTS kreditlimit DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS zuverlaessigkeits_score INTEGER DEFAULT 75 CHECK (zuverlaessigkeits_score >= 0 AND zuverlaessigkeits_score <= 100),
ADD COLUMN IF NOT EXISTS qualitaets_score INTEGER DEFAULT 75 CHECK (qualitaets_score >= 0 AND qualitaets_score <= 100),
ADD COLUMN IF NOT EXISTS liefer_score INTEGER DEFAULT 75 CHECK (liefer_score >= 0 AND liefer_score <= 100),
ADD COLUMN IF NOT EXISTS durchschnittliche_lieferzeit INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS mindestbestellwert DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS kostenlose_lieferung_ab DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS iso_9001 BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS iso_14001 BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS weitere_zertifizierungen TEXT,
ADD COLUMN IF NOT EXISTS ist_bevorzugt BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ist_zertifiziert BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ist_lokal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS vertriebsmitarbeiter VARCHAR(100),
ADD COLUMN IF NOT EXISTS kostenstelle VARCHAR(50),
ADD COLUMN IF NOT EXISTS notizen TEXT;

-- Kommentare für neue Felder
COMMENT ON COLUMN einkauf.lieferanten.rechtsform IS 'Rechtsform des Lieferanten (GmbH, AG, KG, etc.)';
COMMENT ON COLUMN einkauf.lieferanten.handelsregister IS 'Handelsregisternummer';
COMMENT ON COLUMN einkauf.lieferanten.kreditlimit IS 'Kreditlimit in Euro';
COMMENT ON COLUMN einkauf.lieferanten.zuverlaessigkeits_score IS 'Zuverlässigkeits-Score (0-100)';
COMMENT ON COLUMN einkauf.lieferanten.qualitaets_score IS 'Qualitäts-Score (0-100)';
COMMENT ON COLUMN einkauf.lieferanten.liefer_score IS 'Liefer-Score (0-100)';
COMMENT ON COLUMN einkauf.lieferanten.durchschnittliche_lieferzeit IS 'Durchschnittliche Lieferzeit in Tagen';
COMMENT ON COLUMN einkauf.lieferanten.mindestbestellwert IS 'Mindestbestellwert in Euro';
COMMENT ON COLUMN einkauf.lieferanten.kostenlose_lieferung_ab IS 'Kostenlose Lieferung ab diesem Betrag';
COMMENT ON COLUMN einkauf.lieferanten.iso_9001 IS 'ISO 9001 Zertifizierung vorhanden';
COMMENT ON COLUMN einkauf.lieferanten.iso_14001 IS 'ISO 14001 Zertifizierung vorhanden';
COMMENT ON COLUMN einkauf.lieferanten.weitere_zertifizierungen IS 'Weitere Zertifizierungen und Qualitätsstandards';
COMMENT ON COLUMN einkauf.lieferanten.ist_bevorzugt IS 'Bevorzugter Lieferant';
COMMENT ON COLUMN einkauf.lieferanten.ist_zertifiziert IS 'Zertifizierter Lieferant';
COMMENT ON COLUMN einkauf.lieferanten.ist_lokal IS 'Lokaler Lieferant';
COMMENT ON COLUMN einkauf.lieferanten.vertriebsmitarbeiter IS 'Zuständiger Vertriebsmitarbeiter';
COMMENT ON COLUMN einkauf.lieferanten.kostenstelle IS 'Kostenstelle für Buchhaltung';
COMMENT ON COLUMN einkauf.lieferanten.notizen IS 'Zusätzliche Notizen und Informationen';

-- =====================================================
-- 2. CHARGENVERWALTUNG - NEUE TABELLE
-- =====================================================

-- Schema für Chargenverwaltung erstellen
CREATE SCHEMA IF NOT EXISTS chargen;

-- Haupttabelle für Chargenverwaltung
CREATE TABLE chargen.chargen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    charge_nr VARCHAR(50) UNIQUE NOT NULL,
    artikel_nr VARCHAR(50) NOT NULL,
    artikel_name VARCHAR(200) NOT NULL,
    lieferant_nr VARCHAR(50),
    lieferant_name VARCHAR(200),
    produktionsdatum DATE NOT NULL,
    verfallsdatum DATE,
    charge_groesse DECIMAL(10,4) NOT NULL,
    einheit VARCHAR(20) NOT NULL,
    qualitaets_status VARCHAR(50) DEFAULT 'OFFEN' CHECK (qualitaets_status IN ('OFFEN', 'GEPRUEFT', 'FREIGEGEBEN', 'ABGELEHNT', 'QUARANTAENE')),
    vlog_gmo_status VARCHAR(50) DEFAULT 'UNBEKANNT' CHECK (vlog_gmo_status IN ('UNBEKANNT', 'GMO_FREI', 'GMO_HALTIG', 'GEPRUEFT')),
    risiko_score INTEGER DEFAULT 50 CHECK (risiko_score >= 0 AND risiko_score <= 100),
    qualitaets_score INTEGER DEFAULT 75 CHECK (qualitaets_score >= 0 AND qualitaets_score <= 100),
    ki_risiko_bewertung TEXT,
    qualitaets_vorhersage VARCHAR(50),
    anomalie_erkennung BOOLEAN DEFAULT false,
    ki_empfehlungen TEXT,
    workflow_status VARCHAR(50) DEFAULT 'NEU' CHECK (workflow_status IN ('NEU', 'IN_BEARBEITUNG', 'GEPRUEFT', 'FREIGEGEBEN', 'ABGELEHNT')),
    n8n_integration BOOLEAN DEFAULT false,
    automatisierung_status VARCHAR(50) DEFAULT 'MANUELL',
    workflow_trigger VARCHAR(100),
    automatisierte_prozesse TEXT[],
    qualitaets_zertifikate TEXT[],
    compliance_dokumente TEXT[],
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erstellt_von UUID,
    geaendert_von UUID
);

-- Chargen-Qualitätsprüfungen
CREATE TABLE chargen.chargen_qualitaetspruefungen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    charge_id UUID NOT NULL REFERENCES chargen.chargen(id) ON DELETE CASCADE,
    pruefung_nr VARCHAR(50) UNIQUE NOT NULL,
    pruefung_typ VARCHAR(50) NOT NULL,
    pruefer_id UUID,
    pruefdatum DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'OFFEN',
    ergebnis VARCHAR(50),
    bemerkungen TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chargen-Workflow-Historie
CREATE TABLE chargen.chargen_workflow_historie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    charge_id UUID NOT NULL REFERENCES chargen.chargen(id) ON DELETE CASCADE,
    workflow_schritt VARCHAR(100) NOT NULL,
    status_von VARCHAR(50),
    status_nach VARCHAR(50) NOT NULL,
    ausfuehrender_id UUID,
    ausfuehrungsdatum TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bemerkungen TEXT,
    n8n_workflow_id VARCHAR(100),
    automatisierung_erfolgreich BOOLEAN
);

-- =====================================================
-- 3. KI-ANALYSE FELDER FÜR BESTEHENDE TABELLEN
-- =====================================================

-- KI-Felder für einkauf.lieferanten
ALTER TABLE einkauf.lieferanten 
ADD COLUMN IF NOT EXISTS ki_risiko_bewertung TEXT,
ADD COLUMN IF NOT EXISTS ki_qualitaets_vorhersage VARCHAR(50),
ADD COLUMN IF NOT EXISTS ki_anomalie_erkennung BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ki_empfehlungen TEXT,
ADD COLUMN IF NOT EXISTS ki_zuverlaessigkeits_prognose INTEGER,
ADD COLUMN IF NOT EXISTS ki_lieferzeit_prognose INTEGER;

-- KI-Felder für qualitaet.qualitaetspruefungen
ALTER TABLE qualitaet.qualitaetspruefungen 
ADD COLUMN IF NOT EXISTS ki_risiko_bewertung TEXT,
ADD COLUMN IF NOT EXISTS ki_qualitaets_vorhersage VARCHAR(50),
ADD COLUMN IF NOT EXISTS ki_anomalie_erkennung BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ki_empfehlungen TEXT,
ADD COLUMN IF NOT EXISTS ki_automatische_bewertung BOOLEAN DEFAULT false;

-- KI-Felder für crm.kunden
ALTER TABLE crm.kunden 
ADD COLUMN IF NOT EXISTS ki_risiko_bewertung TEXT,
ADD COLUMN IF NOT EXISTS ki_umsatz_prognose DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS ki_kundenwert_prognose INTEGER,
ADD COLUMN IF NOT EXISTS ki_abwanderungsrisiko DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS ki_empfehlungen TEXT;

-- =====================================================
-- 4. N8N WORKFLOW INTEGRATION
-- =====================================================

-- Workflow-Integration für bestehende Tabellen
ALTER TABLE einkauf.lieferanten 
ADD COLUMN IF NOT EXISTS n8n_integration BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(50) DEFAULT 'MANUELL',
ADD COLUMN IF NOT EXISTS workflow_trigger VARCHAR(100),
ADD COLUMN IF NOT EXISTS automatisierte_prozesse TEXT[];

ALTER TABLE qualitaet.qualitaetspruefungen 
ADD COLUMN IF NOT EXISTS n8n_integration BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(50) DEFAULT 'MANUELL',
ADD COLUMN IF NOT EXISTS workflow_trigger VARCHAR(100),
ADD COLUMN IF NOT EXISTS automatisierte_prozesse TEXT[];

ALTER TABLE chargen.chargen 
ADD COLUMN IF NOT EXISTS n8n_integration BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS workflow_status VARCHAR(50) DEFAULT 'MANUELL',
ADD COLUMN IF NOT EXISTS workflow_trigger VARCHAR(100),
ADD COLUMN IF NOT EXISTS automatisierte_prozesse TEXT[];

-- =====================================================
-- 5. INDEXE FÜR PERFORMANCE
-- =====================================================

-- Indexe für neue Lieferanten-Felder
CREATE INDEX IF NOT EXISTS idx_lieferanten_rechtsform ON einkauf.lieferanten(rechtsform);
CREATE INDEX IF NOT EXISTS idx_lieferanten_kreditlimit ON einkauf.lieferanten(kreditlimit);
CREATE INDEX IF NOT EXISTS idx_lieferanten_zuverlaessigkeit ON einkauf.lieferanten(zuverlaessigkeits_score);
CREATE INDEX IF NOT EXISTS idx_lieferanten_qualitaet ON einkauf.lieferanten(qualitaets_score);
CREATE INDEX IF NOT EXISTS idx_lieferanten_lieferzeit ON einkauf.lieferanten(durchschnittliche_lieferzeit);
CREATE INDEX IF NOT EXISTS idx_lieferanten_bevorzugt ON einkauf.lieferanten(ist_bevorzugt);
CREATE INDEX IF NOT EXISTS idx_lieferanten_zertifiziert ON einkauf.lieferanten(ist_zertifiziert);
CREATE INDEX IF NOT EXISTS idx_lieferanten_lokal ON einkauf.lieferanten(ist_lokal);

-- Indexe für Chargenverwaltung
CREATE INDEX IF NOT EXISTS idx_chargen_artikel_nr ON chargen.chargen(artikel_nr);
CREATE INDEX IF NOT EXISTS idx_chargen_lieferant_nr ON chargen.chargen(lieferant_nr);
CREATE INDEX IF NOT EXISTS idx_chargen_produktionsdatum ON chargen.chargen(produktionsdatum);
CREATE INDEX IF NOT EXISTS idx_chargen_verfallsdatum ON chargen.chargen(verfallsdatum);
CREATE INDEX IF NOT EXISTS idx_chargen_qualitaets_status ON chargen.chargen(qualitaets_status);
CREATE INDEX IF NOT EXISTS idx_chargen_risiko_score ON chargen.chargen(risiko_score);
CREATE INDEX IF NOT EXISTS idx_chargen_workflow_status ON chargen.chargen(workflow_status);
CREATE INDEX IF NOT EXISTS idx_chargen_n8n_integration ON chargen.chargen(n8n_integration);

-- Indexe für Chargen-Qualitätsprüfungen
CREATE INDEX IF NOT EXISTS idx_chargen_qualitaetspruefungen_charge ON chargen.chargen_qualitaetspruefungen(charge_id);
CREATE INDEX IF NOT EXISTS idx_chargen_qualitaetspruefungen_typ ON chargen.chargen_qualitaetspruefungen(pruefung_typ);
CREATE INDEX IF NOT EXISTS idx_chargen_qualitaetspruefungen_status ON chargen.chargen_qualitaetspruefungen(status);

-- Indexe für Workflow-Historie
CREATE INDEX IF NOT EXISTS idx_chargen_workflow_historie_charge ON chargen.chargen_workflow_historie(charge_id);
CREATE INDEX IF NOT EXISTS idx_chargen_workflow_historie_datum ON chargen.chargen_workflow_historie(ausfuehrungsdatum);

-- =====================================================
-- 6. TRIGGER UND FUNKTIONEN
-- =====================================================

-- Trigger-Funktion für geaendert_am
CREATE OR REPLACE FUNCTION chargen.update_geaendert_am()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geaendert_am = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für Chargen-Tabelle
CREATE TRIGGER trigger_chargen_update
    BEFORE UPDATE ON chargen.chargen
    FOR EACH ROW EXECUTE FUNCTION chargen.update_geaendert_am();

-- Trigger für Chargen-Qualitätsprüfungen
CREATE TRIGGER trigger_chargen_qualitaetspruefungen_update
    BEFORE UPDATE ON chargen.chargen_qualitaetspruefungen
    FOR EACH ROW EXECUTE FUNCTION chargen.update_geaendert_am();

-- Trigger für bestehende Tabellen (falls noch nicht vorhanden)
CREATE TRIGGER IF NOT EXISTS trigger_lieferanten_ki_update
    BEFORE UPDATE ON einkauf.lieferanten
    FOR EACH ROW EXECUTE FUNCTION einkauf.update_geaendert_am();

CREATE TRIGGER IF NOT EXISTS trigger_qualitaetspruefungen_ki_update
    BEFORE UPDATE ON qualitaet.qualitaetspruefungen
    FOR EACH ROW EXECUTE FUNCTION qualitaet.update_geaendert_am();

-- =====================================================
-- 7. FUNKTIONEN FÜR AUTOMATISIERUNG
-- =====================================================

-- Funktion zur Generierung von Chargennummern
CREATE OR REPLACE FUNCTION chargen.generate_chargennummer()
RETURNS TRIGGER AS $$
DECLARE
    jahr VARCHAR(4);
    monat VARCHAR(2);
    zufall VARCHAR(3);
    neue_nr VARCHAR(50);
BEGIN
    IF NEW.charge_nr IS NULL OR NEW.charge_nr = '' THEN
        jahr := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
        monat := LPAD(EXTRACT(MONTH FROM CURRENT_DATE)::VARCHAR, 2, '0');
        zufall := LPAD(FLOOR(RANDOM() * 1000)::VARCHAR, 3, '0');
        neue_nr := 'CH' || jahr || monat || '-' || zufall;
        
        NEW.charge_nr := neue_nr;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für automatische Chargennummer-Generierung
CREATE TRIGGER trigger_generate_chargennummer
    BEFORE INSERT ON chargen.chargen
    FOR EACH ROW EXECUTE FUNCTION chargen.generate_chargennummer();

-- Funktion für KI-Risiko-Bewertung
CREATE OR REPLACE FUNCTION chargen.ki_risiko_bewertung_berechnen(charge_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    charge_record RECORD;
    risiko_score INTEGER;
    bewertung TEXT;
BEGIN
    SELECT * INTO charge_record FROM chargen.chargen WHERE id = charge_uuid;
    
    IF NOT FOUND THEN
        RETURN 'Charge nicht gefunden';
    END IF;
    
    -- Einfache Risiko-Bewertung basierend auf verschiedenen Faktoren
    risiko_score := charge_record.risiko_score;
    
    IF risiko_score <= 20 THEN
        bewertung := 'Niedriges Risiko - Charge kann freigegeben werden';
    ELSIF risiko_score <= 50 THEN
        bewertung := 'Mittleres Risiko - Zusätzliche Prüfungen empfohlen';
    ELSIF risiko_score <= 80 THEN
        bewertung := 'Hohes Risiko - Intensive Prüfung erforderlich';
    ELSE
        bewertung := 'Kritisches Risiko - Charge sollte abgelehnt werden';
    END IF;
    
    RETURN bewertung;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. VIEWS FÜR REPORTING
-- =====================================================

-- View für Chargen-Übersicht
CREATE VIEW chargen.chargen_uebersicht AS
SELECT 
    c.charge_nr,
    c.artikel_nr,
    c.artikel_name,
    c.lieferant_nr,
    c.lieferant_name,
    c.produktionsdatum,
    c.verfallsdatum,
    c.charge_groesse,
    c.einheit,
    c.qualitaets_status,
    c.vlog_gmo_status,
    c.risiko_score,
    c.qualitaets_score,
    c.workflow_status,
    c.n8n_integration,
    c.erstellt_am,
    c.geaendert_am
FROM chargen.chargen c
ORDER BY c.erstellt_am DESC;

-- View für NeuroFlow-Dashboard-Statistiken
CREATE VIEW chargen.neuroflow_statistiken AS
SELECT 
    COUNT(*) as gesamt_chargen,
    COUNT(CASE WHEN qualitaets_status = 'FREIGEGEBEN' THEN 1 END) as freigegebene_chargen,
    COUNT(CASE WHEN qualitaets_status = 'ABGELEHNT' THEN 1 END) as abgelehnte_chargen,
    COUNT(CASE WHEN qualitaets_status = 'QUARANTAENE' THEN 1 END) as quarantaene_chargen,
    COUNT(CASE WHEN n8n_integration = true THEN 1 END) as automatisierte_chargen,
    AVG(risiko_score) as durchschnittlicher_risiko_score,
    AVG(qualitaets_score) as durchschnittlicher_qualitaets_score
FROM chargen.chargen;

-- =====================================================
-- 9. MIGRATION ABGESCHLOSSEN
-- =====================================================

-- Kommentar für Migration
COMMENT ON SCHEMA chargen IS 'NeuroFlow Chargenverwaltung Schema';
COMMENT ON TABLE chargen.chargen IS 'Haupttabelle für Chargenverwaltung mit KI-Integration';
COMMENT ON TABLE chargen.chargen_qualitaetspruefungen IS 'Qualitätsprüfungen für Chargen';
COMMENT ON TABLE chargen.chargen_workflow_historie IS 'Workflow-Historie für Chargen';

-- Migration erfolgreich abgeschlossen
SELECT 'NeuroFlow Migration erfolgreich abgeschlossen!' as status; 