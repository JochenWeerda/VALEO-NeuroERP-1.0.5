-- VALEO NeuroERP - Kassensystem Datenbank-Migrationen
-- Erstellt die Tabellen für das Point-of-Sale System

-- Tabelle für Verkaufstransaktionen
CREATE TABLE IF NOT EXISTS pos_sales (
    id SERIAL PRIMARY KEY,
    beleg_nr VARCHAR(50) UNIQUE NOT NULL,
    kunde_id VARCHAR(50),
    kunde_name VARCHAR(255),
    verkaufsdatum TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    gesamt_netto DECIMAL(10,2) NOT NULL,
    gesamt_brutto DECIMAL(10,2) NOT NULL,
    mwst_gesamt DECIMAL(10,2) NOT NULL,
    rabatt_prozent DECIMAL(5,2) DEFAULT 0,
    rabatt_betrag DECIMAL(10,2) DEFAULT 0,
    zahlungsart VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'offen',
    kassierer_id VARCHAR(50),
    kassierer_name VARCHAR(255),
    tse_signatur TEXT,
    tse_serien_nr VARCHAR(100),
    tse_signatur_counter INTEGER,
    beleg_hash VARCHAR(255),
    notiz TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geloescht_am TIMESTAMP
);

-- Tabelle für Verkaufsartikel
CREATE TABLE IF NOT EXISTS pos_sale_items (
    id SERIAL PRIMARY KEY,
    beleg_nr VARCHAR(50) NOT NULL,
    artikel_nr VARCHAR(50) NOT NULL,
    bezeichnung VARCHAR(255) NOT NULL,
    menge DECIMAL(10,3) NOT NULL,
    einzelpreis_netto DECIMAL(10,2) NOT NULL,
    einzelpreis_brutto DECIMAL(10,2) NOT NULL,
    gesamtpreis_netto DECIMAL(10,2) NOT NULL,
    gesamtpreis_brutto DECIMAL(10,2) NOT NULL,
    mwst_satz DECIMAL(5,2) NOT NULL,
    mwst_betrag DECIMAL(10,2) NOT NULL,
    einheit VARCHAR(20) NOT NULL,
    ean_code VARCHAR(50),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (beleg_nr) REFERENCES pos_sales(beleg_nr) ON DELETE CASCADE
);

-- Tabelle für Tagesjournale
CREATE TABLE IF NOT EXISTS pos_daily_reports (
    id SERIAL PRIMARY KEY,
    datum DATE NOT NULL,
    kasse_id VARCHAR(50) NOT NULL,
    kassierer_id VARCHAR(50) NOT NULL,
    anzahl_belege INTEGER NOT NULL DEFAULT 0,
    gesamt_umsatz_netto DECIMAL(10,2) NOT NULL DEFAULT 0,
    gesamt_umsatz_brutto DECIMAL(10,2) NOT NULL DEFAULT 0,
    mwst_gesamt DECIMAL(10,2) NOT NULL DEFAULT 0,
    zahlungsarten_aufschlüsselung JSONB,
    kassenbestand_anfang DECIMAL(10,2) DEFAULT 0,
    kassenbestand_ende DECIMAL(10,2) DEFAULT 0,
    differenz DECIMAL(10,2) DEFAULT 0,
    tse_signaturen JSONB,
    status VARCHAR(20) DEFAULT 'offen',
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(datum, kasse_id)
);

-- Tabelle für FIBU-Exporte
CREATE TABLE IF NOT EXISTS pos_fibu_exports (
    id SERIAL PRIMARY KEY,
    export_datum TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tagesjournal_datum DATE NOT NULL,
    kasse_id VARCHAR(50) NOT NULL,
    gesamt_umsatz_netto DECIMAL(10,2) NOT NULL,
    gesamt_umsatz_brutto DECIMAL(10,2) NOT NULL,
    mwst_gesamt DECIMAL(10,2) NOT NULL,
    buchungssaetze JSONB,
    status VARCHAR(20) DEFAULT 'erstellt',
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exportiert_am TIMESTAMP
);

-- Tabelle für TSE-Logs
CREATE TABLE IF NOT EXISTS pos_tse_logs (
    id SERIAL PRIMARY KEY,
    beleg_nr VARCHAR(50) NOT NULL,
    tse_signatur TEXT,
    tse_serien_nr VARCHAR(100),
    tse_signatur_counter INTEGER,
    transaction_data JSONB,
    status VARCHAR(20) NOT NULL,
    fehler_meldung TEXT,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (beleg_nr) REFERENCES pos_sales(beleg_nr) ON DELETE CASCADE
);

-- Tabelle für Kassenschubladen-Logs
CREATE TABLE IF NOT EXISTS pos_cash_drawer_logs (
    id SERIAL PRIMARY KEY,
    kasse_id VARCHAR(50) NOT NULL,
    aktion VARCHAR(50) NOT NULL, -- 'open', 'close', 'error'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    benutzer_id VARCHAR(50),
    fehler_meldung TEXT,
    erfolgreich BOOLEAN DEFAULT true
);

-- Tabelle für Zahlungsarten-Konfiguration
CREATE TABLE IF NOT EXISTS pos_payment_methods (
    id SERIAL PRIMARY KEY,
    zahlungsart VARCHAR(50) UNIQUE NOT NULL,
    bezeichnung VARCHAR(255) NOT NULL,
    beschreibung TEXT,
    aktiv BOOLEAN DEFAULT true,
    sortierung INTEGER DEFAULT 0,
    icon VARCHAR(100),
    farbe VARCHAR(20),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle für Kassen-Konfiguration
CREATE TABLE IF NOT EXISTS pos_cash_registers (
    id SERIAL PRIMARY KEY,
    kasse_id VARCHAR(50) UNIQUE NOT NULL,
    bezeichnung VARCHAR(255) NOT NULL,
    standort VARCHAR(255),
    kassierer_id VARCHAR(50),
    tse_serien_nr VARCHAR(100),
    kassenbestand DECIMAL(10,2) DEFAULT 0,
    waehrung VARCHAR(3) DEFAULT 'EUR',
    aktiv BOOLEAN DEFAULT true,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    geaendert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_pos_sales_beleg_nr ON pos_sales(beleg_nr);
CREATE INDEX IF NOT EXISTS idx_pos_sales_verkaufsdatum ON pos_sales(verkaufsdatum);
CREATE INDEX IF NOT EXISTS idx_pos_sales_status ON pos_sales(status);
CREATE INDEX IF NOT EXISTS idx_pos_sales_zahlungsart ON pos_sales(zahlungsart);
CREATE INDEX IF NOT EXISTS idx_pos_sales_kunde_id ON pos_sales(kunde_id);

CREATE INDEX IF NOT EXISTS idx_pos_sale_items_beleg_nr ON pos_sale_items(beleg_nr);
CREATE INDEX IF NOT EXISTS idx_pos_sale_items_artikel_nr ON pos_sale_items(artikel_nr);

CREATE INDEX IF NOT EXISTS idx_pos_daily_reports_datum ON pos_daily_reports(datum);
CREATE INDEX IF NOT EXISTS idx_pos_daily_reports_kasse_id ON pos_daily_reports(kasse_id);

CREATE INDEX IF NOT EXISTS idx_pos_fibu_exports_tagesjournal_datum ON pos_fibu_exports(tagesjournal_datum);
CREATE INDEX IF NOT EXISTS idx_pos_fibu_exports_status ON pos_fibu_exports(status);

CREATE INDEX IF NOT EXISTS idx_pos_tse_logs_beleg_nr ON pos_tse_logs(beleg_nr);
CREATE INDEX IF NOT EXISTS idx_pos_tse_logs_status ON pos_tse_logs(status);

-- Standard-Zahlungsarten einfügen
INSERT INTO pos_payment_methods (zahlungsart, bezeichnung, beschreibung, sortierung, icon, farbe) VALUES
('bar', 'Bar', 'Zahlung mit Bargeld', 1, 'euro', 'success'),
('ec_karte', 'EC-Karte', 'Zahlung mit EC-Karte', 2, 'credit_card', 'primary'),
('kreditkarte', 'Kreditkarte', 'Zahlung mit Kreditkarte', 3, 'credit_card', 'secondary'),
('paypal', 'PayPal', 'Zahlung über PayPal', 4, 'payment', 'warning'),
('klarna', 'Klarna', 'Zahlung über Klarna', 5, 'payment', 'error'),
('ueberweisung', 'Überweisung', 'Zahlung per Überweisung', 6, 'account_balance', 'info'),
('rechnung', 'Rechnung', 'Zahlung auf Rechnung', 7, 'receipt', 'default')
ON CONFLICT (zahlungsart) DO NOTHING;

-- Standard-Kasse einfügen
INSERT INTO pos_cash_registers (kasse_id, bezeichnung, standort, waehrung) VALUES
('KASSE001', 'Hauptkasse', 'Verkaufsraum', 'EUR')
ON CONFLICT (kasse_id) DO NOTHING;

-- Trigger für automatische Aktualisierung des geaendert_am Feldes
CREATE OR REPLACE FUNCTION update_geaendert_am()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geaendert_am = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_pos_sales_geaendert_am
    BEFORE UPDATE ON pos_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_geaendert_am();

CREATE TRIGGER trigger_pos_daily_reports_geaendert_am
    BEFORE UPDATE ON pos_daily_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_geaendert_am();

CREATE TRIGGER trigger_pos_payment_methods_geaendert_am
    BEFORE UPDATE ON pos_payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_geaendert_am();

CREATE TRIGGER trigger_pos_cash_registers_geaendert_am
    BEFORE UPDATE ON pos_cash_registers
    FOR EACH ROW
    EXECUTE FUNCTION update_geaendert_am();

-- Funktion für Tagesjournal-Erstellung
CREATE OR REPLACE FUNCTION create_daily_report(p_kasse_id VARCHAR(50), p_datum DATE)
RETURNS JSON AS $$
DECLARE
    v_report RECORD;
    v_payment_methods JSONB;
    v_tse_signatures JSONB;
    v_sales_count INTEGER;
    v_total_netto DECIMAL(10,2);
    v_total_brutto DECIMAL(10,2);
    v_total_mwst DECIMAL(10,2);
BEGIN
    -- Verkäufe des Tages zählen und summieren
    SELECT 
        COUNT(*) as anzahl_belege,
        COALESCE(SUM(gesamt_netto), 0) as gesamt_umsatz_netto,
        COALESCE(SUM(gesamt_brutto), 0) as gesamt_umsatz_brutto,
        COALESCE(SUM(mwst_gesamt), 0) as mwst_gesamt
    INTO v_report
    FROM pos_sales 
    WHERE DATE(verkaufsdatum) = p_datum 
    AND status = 'abgeschlossen';
    
    -- Zahlungsarten aufschlüsseln
    SELECT jsonb_object_agg(zahlungsart, summe)
    INTO v_payment_methods
    FROM (
        SELECT zahlungsart, SUM(gesamt_brutto) as summe
        FROM pos_sales 
        WHERE DATE(verkaufsdatum) = p_datum 
        AND status = 'abgeschlossen'
        GROUP BY zahlungsart
    ) payment_summary;
    
    -- TSE-Signaturen sammeln
    SELECT jsonb_agg(tse_signatur)
    INTO v_tse_signatures
    FROM pos_sales 
    WHERE DATE(verkaufsdatum) = p_datum 
    AND status = 'abgeschlossen'
    AND tse_signatur IS NOT NULL;
    
    -- Tagesjournal erstellen oder aktualisieren
    INSERT INTO pos_daily_reports (
        datum, kasse_id, kassierer_id, anzahl_belege, 
        gesamt_umsatz_netto, gesamt_umsatz_brutto, mwst_gesamt,
        zahlungsarten_aufschlüsselung, tse_signaturen, status
    ) VALUES (
        p_datum, p_kasse_id, 'SYSTEM', v_report.anzahl_belege,
        v_report.gesamt_umsatz_netto, v_report.gesamt_umsatz_brutto, v_report.mwst_gesamt,
        v_payment_methods, v_tse_signatures, 'erstellt'
    )
    ON CONFLICT (datum, kasse_id) 
    DO UPDATE SET
        anzahl_belege = EXCLUDED.anzahl_belege,
        gesamt_umsatz_netto = EXCLUDED.gesamt_umsatz_netto,
        gesamt_umsatz_brutto = EXCLUDED.gesamt_umsatz_brutto,
        mwst_gesamt = EXCLUDED.mwst_gesamt,
        zahlungsarten_aufschlüsselung = EXCLUDED.zahlungsarten_aufschlüsselung,
        tse_signaturen = EXCLUDED.tse_signaturen,
        status = EXCLUDED.status,
        geaendert_am = CURRENT_TIMESTAMP;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Tagesjournal erfolgreich erstellt',
        'datum', p_datum,
        'kasse_id', p_kasse_id,
        'anzahl_belege', v_report.anzahl_belege,
        'gesamt_umsatz_netto', v_report.gesamt_umsatz_netto,
        'gesamt_umsatz_brutto', v_report.gesamt_umsatz_brutto,
        'mwst_gesamt', v_report.mwst_gesamt
    );
END;
$$ LANGUAGE plpgsql;

-- Funktion für FIBU-Export
CREATE OR REPLACE FUNCTION export_to_fibu(p_datum DATE, p_kasse_id VARCHAR(50))
RETURNS JSON AS $$
DECLARE
    v_daily_report RECORD;
    v_buchungssaetze JSONB;
    v_export_id INTEGER;
BEGIN
    -- Tagesjournal laden
    SELECT * INTO v_daily_report
    FROM pos_daily_reports
    WHERE datum = p_datum AND kasse_id = p_kasse_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Tagesjournal nicht gefunden'
        );
    END IF;
    
    -- Buchungssätze erstellen
    v_buchungssaetze := jsonb_build_array(
        jsonb_build_object(
            'konto', '1200',
            'buchungstext', format('Tagesumsatz %s', p_datum),
            'betrag', v_daily_report.gesamt_umsatz_netto,
            'soll_haben', 'Soll'
        ),
        jsonb_build_object(
            'konto', '3806',
            'buchungstext', format('Umsatzsteuer %s', p_datum),
            'betrag', v_daily_report.mwst_gesamt,
            'soll_haben', 'Soll'
        ),
        jsonb_build_object(
            'konto', '8400',
            'buchungstext', format('Tageserlös %s', p_datum),
            'betrag', v_daily_report.gesamt_umsatz_netto,
            'soll_haben', 'Haben'
        )
    );
    
    -- FIBU-Export erstellen
    INSERT INTO pos_fibu_exports (
        tagesjournal_datum, kasse_id, gesamt_umsatz_netto,
        gesamt_umsatz_brutto, mwst_gesamt, buchungssaetze, status
    ) VALUES (
        p_datum, p_kasse_id, v_daily_report.gesamt_umsatz_netto,
        v_daily_report.gesamt_umsatz_brutto, v_daily_report.mwst_gesamt,
        v_buchungssaetze, 'erstellt'
    ) RETURNING id INTO v_export_id;
    
    -- Tagesjournal als exportiert markieren
    UPDATE pos_daily_reports 
    SET status = 'exportiert', geaendert_am = CURRENT_TIMESTAMP
    WHERE datum = p_datum AND kasse_id = p_kasse_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'FIBU-Export erfolgreich erstellt',
        'export_id', v_export_id,
        'datum', p_datum,
        'kasse_id', p_kasse_id
    );
END;
$$ LANGUAGE plpgsql;

-- Kommentare für Dokumentation
COMMENT ON TABLE pos_sales IS 'Haupttabelle für Verkaufstransaktionen im Kassensystem';
COMMENT ON TABLE pos_sale_items IS 'Einzelne Artikel in Verkaufstransaktionen';
COMMENT ON TABLE pos_daily_reports IS 'Tagesjournale für gesetzeskonforme Kassenführung';
COMMENT ON TABLE pos_fibu_exports IS 'FIBU-Exporte für Finanzbuchhaltung';
COMMENT ON TABLE pos_tse_logs IS 'TSE-Logs für Audit-Trail';
COMMENT ON TABLE pos_cash_drawer_logs IS 'Kassenschubladen-Logs';
COMMENT ON TABLE pos_payment_methods IS 'Konfiguration der Zahlungsarten';
COMMENT ON TABLE pos_cash_registers IS 'Kassen-Konfiguration';

COMMENT ON FUNCTION create_daily_report IS 'Erstellt oder aktualisiert ein Tagesjournal';
COMMENT ON FUNCTION export_to_fibu IS 'Exportiert Tagesjournal in FIBU'; 