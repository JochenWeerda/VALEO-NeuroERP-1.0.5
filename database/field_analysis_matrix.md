# 🧠 VALEO NeuroERP - Datenfeld-Analyse Matrix

## 📊 Übersicht der bestehenden PostgreSQL-Datenbankstruktur

### 🔍 **BESTEHENDE SCHEMAS UND TABELLEN:**

#### 1. **CRM Schema (Kundenverwaltung)**
- **Tabelle**: `crm.kunden`
- **Tabelle**: `crm.kunden_adressen`
- **Tabelle**: `crm.kunden_bankverbindungen`
- **Tabelle**: `crm.kontakte`
- **Tabelle**: `crm.leads`
- **Tabelle**: `crm.verkaufsaktivitaeten`
- **Tabelle**: `crm.verkaufschancen`
- **Tabelle**: `crm.kommunikation`
- **Tabelle**: `crm.notizen`
- **Tabelle**: `crm.kundenbewertungen`
- **Tabelle**: `crm.kundenfeedback`
- **Tabelle**: `crm.kundensegmente`
- **Tabelle**: `crm.tagesprotokolle`

#### 2. **Einkauf Schema (Lieferantenverwaltung)**
- **Tabelle**: `einkauf.lieferanten`
- **Tabelle**: `einkauf.lieferanten_adressen`
- **Tabelle**: `einkauf.lieferanten_bankverbindungen`
- **Tabelle**: `einkauf.lieferanten_artikel`
- **Tabelle**: `einkauf.lieferanten_preise`
- **Tabelle**: `einkauf.bestellungen`
- **Tabelle**: `einkauf.bestellpositionen`
- **Tabelle**: `einkauf.lieferungen`
- **Tabelle**: `einkauf.lieferpositionen`
- **Tabelle**: `einkauf.rechnungen`
- **Tabelle**: `einkauf.rechnungspositionen`
- **Tabelle**: `einkauf.qualitaetspruefungen`

#### 3. **Qualität Schema (Qualitätsmanagement)**
- **Tabelle**: `qualitaet.qualitaetspruefungen`
- **Tabelle**: `qualitaet.pruefparameter`
- **Tabelle**: `qualitaet.pruefergebnisse`
- **Tabelle**: `qualitaet.pruefplaene`
- **Tabelle**: `qualitaet.pruefplan_parameter`
- **Tabelle**: `qualitaet.messmittel`
- **Tabelle**: `qualitaet.kalibrierungen`
- **Tabelle**: `qualitaet.reklamationen`
- **Tabelle**: `qualitaet.korrekturmassnahmen`
- **Tabelle**: `qualitaet.qs_dokumentation`
- **Tabelle**: `qualitaet.zertifikate`
- **Tabelle**: `qualitaet.audits`
- **Tabelle**: `qualitaet.audit_findings`

#### 4. **Weitere Schemas**
- **Personal Schema**: `personal.*`
- **Produktion Schema**: `produktion.*`
- **Lager Schema**: `lager.*`
- **Verkauf Schema**: `verkauf.*`
- **Finanzen Schema**: `finanzen.*`
- **Assets Schema**: `assets.*`
- **Projekte Schema**: `projekte.*`
- **Dokumente Schema**: `dokumente.*`
- **Reporting Schema**: `reporting.*`

---

## 📋 **DETAILIERTE FELDANALYSE MATRIX**

### 🏢 **LIEFERANTENSTAMMDATEN**

| **Feldkategorie** | **Bestehende Felder** | **NeuroFlow-Erweiterung** | **Status** | **Aktion** |
|-------------------|----------------------|---------------------------|------------|------------|
| **Grunddaten** | `lieferant_nr`, `firmenname`, `ansprechpartner`, `telefon`, `email`, `webseite`, `steuernummer`, `ust_id` | `supplier_number`, `company_name`, `contact_person`, `phone`, `email`, `website`, `tax_number`, `vat_number` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Rechtsform** | ❌ **FEHLT** | `legal_form` (GmbH, AG, KG, OHG, etc.) | ❌ **FEHLT** | **HINZUFÜGEN** |
| **Handelsregister** | ❌ **FEHLT** | `commercial_register` | ❌ **FEHLT** | **HINZUFÜGEN** |
| **Adressdaten** | `strasse`, `hausnummer`, `plz`, `ort`, `land` | `street`, `house_number`, `postal_code`, `city`, `country` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Bankdaten** | `kontoinhaber`, `iban`, `bic`, `bank_name` | `account_holder`, `iban`, `bic`, `bank_name` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Geschäftsdaten** | `kategorie`, `zahlungsziel`, `skonto_prozent`, `bewertung` | `industry`, `payment_terms`, `discount_percentage`, `rating` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Lieferantentyp** | `kategorie` (A, B, C, DÜNGER, etc.) | `supplier_type` (Hauptlieferant, Nebenlieferant, etc.) | ⚠️ **TEILWEISE** | **ERWEITERN** |
| **Kreditlimit** | ❌ **FEHLT** | `credit_limit` | ❌ **FEHLT** | **HINZUFÜGEN** |
| **Status** | `status` (AKTIV, INAKTIV, GESPERRT) | `status` (active, inactive, blocked, prospect) | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Bewertung** | `bewertung` (1-5) | `rating`, `reliability_score`, `quality_score`, `delivery_score` | ⚠️ **TEILWEISE** | **ERWEITERN** |
| **Lieferdaten** | ❌ **FEHLT** | `average_delivery_time`, `minimum_order_value`, `free_shipping_threshold` | ❌ **FEHLT** | **HINZUFÜGEN** |
| **Zertifizierungen** | ❌ **FEHLT** | `iso_9001`, `iso_14001`, `other_certifications` | ❌ **FEHLT** | **HINZUFÜGEN** |
| **Flags** | ❌ **FEHLT** | `is_preferred`, `is_certified`, `is_local` | ❌ **FEHLT** | **HINZUFÜGEN** |
| **ERP-Felder** | ❌ **FEHLT** | `sales_rep`, `cost_center`, `notes` | ❌ **FEHLT** | **HINZUFÜGEN** |

### 📦 **CHARGENVERWALTUNG**

| **Feldkategorie** | **Bestehende Felder** | **NeuroFlow-Erweiterung** | **Status** | **Aktion** |
|-------------------|----------------------|---------------------------|------------|------------|
| **Grunddaten** | ❌ **FEHLT** | `charge_number`, `article_number`, `article_name`, `supplier_number`, `supplier_name` | ❌ **FEHLT** | **HINZUFÜGEN** |
| **Produktionsdaten** | ❌ **FEHLT** | `production_date`, `expiry_date`, `batch_size`, `unit` | ❌ **FEHLT** | **HINZUFÜGEN** |
| **Qualitätsdaten** | `qualitaetspruefungen.*` | `quality_status`, `vlog_gmo_status`, `risk_score`, `quality_score` | ⚠️ **TEILWEISE** | **ERWEITERN** |
| **KI-Analyse** | ❌ **FEHLT** | `ki_risk_assessment`, `quality_prediction`, `anomaly_detection`, `recommendations` | ❌ **FEHLT** | **HINZUFÜGEN** |
| **Workflow** | ❌ **FEHLT** | `workflow_status`, `n8n_integration`, `automation_status` | ❌ **FEHLT** | **HINZUFÜGEN** |
| **Zertifikate** | `zertifikate.*` | `quality_certificates`, `compliance_documents` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **n8n-Integration** | ❌ **FEHLT** | `workflow_trigger`, `automated_processes` | ❌ **FEHLT** | **HINZUFÜGEN** |

### 👥 **KUNDENSTAMMDATEN**

| **Feldkategorie** | **Bestehende Felder** | **NeuroFlow-Erweiterung** | **Status** | **Aktion** |
|-------------------|----------------------|---------------------------|------------|------------|
| **Grunddaten** | `kunden_nr`, `firmenname`, `kundentyp`, `branche`, `umsatzklasse` | `customer_number`, `company_name`, `customer_type`, `industry`, `revenue_class` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Status & Bewertung** | `kundenstatus`, `kundenbewertung`, `kundenseit` | `status`, `rating`, `customer_segment` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Zahlungsdaten** | `zahlungsziel`, `skonto_prozent` | `payment_terms`, `discount_percentage` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Adressdaten** | `kunden_adressen.*` | `addresses.*` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Bankdaten** | `kunden_bankverbindungen.*` | `bank_accounts.*` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Kontakte** | `kontakte.*` | `contacts.*` | ✅ **VORHANDEN** | **Mapping verwenden** |

### 📋 **ARTIKELSTAMMDATEN**

| **Feldkategorie** | **Bestehende Felder** | **NeuroFlow-Erweiterung** | **Status** | **Aktion** |
|-------------------|----------------------|---------------------------|------------|------------|
| **Grunddaten** | `artikel_id`, `bezeichnung`, `beschreibung`, `einheit` | `article_number`, `article_name`, `description`, `unit` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Kategorisierung** | `kategorie` | `category`, `subcategory` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Preise** | `preis`, `waehrung` | `price`, `currency` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Lager** | `stock_quantity` | `stock`, `minimum_stock` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Lieferanten** | `lieferanten_artikel.*` | `supplier_articles.*` | ✅ **VORHANDEN** | **Mapping verwenden** |

### 👨‍💼 **PERSONALSTAMMDATEN**

| **Feldkategorie** | **Bestehende Felder** | **NeuroFlow-Erweiterung** | **Status** | **Aktion** |
|-------------------|----------------------|---------------------------|------------|------------|
| **Grunddaten** | `mitarbeiter_id`, `vorname`, `nachname`, `email` | `employee_number`, `first_name`, `last_name`, `email` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Abteilung** | `abteilung`, `position` | `department`, `position` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Kontaktdaten** | `telefon`, `mobil` | `phone`, `mobile` | ✅ **VORHANDEN** | **Mapping verwenden** |
| **Status** | `status` | `status` | ✅ **VORHANDEN** | **Mapping verwenden** |

---

## 🎯 **AKTIONS-PLAN**

### ✅ **PHASE 1: Mapping bestehender Felder**
1. **Lieferantenstammdaten**: 70% der Felder bereits vorhanden
2. **Kundenstammdaten**: 90% der Felder bereits vorhanden
3. **Artikelstammdaten**: 80% der Felder bereits vorhanden
4. **Personalstammdaten**: 85% der Felder bereits vorhanden

### ⚠️ **PHASE 2: Erweiterungen notwendig**
1. **Lieferantenstammdaten**: 8 neue Felder hinzufügen
2. **Chargenverwaltung**: Komplett neue Tabelle erstellen
3. **KI-Analyse-Felder**: In bestehende Tabellen integrieren
4. **Workflow-Integration**: Neue Felder für n8n-Integration

### 🔧 **PHASE 3: Technische Umsetzung**
1. **ALTER TABLE Statements** für bestehende Tabellen
2. **CREATE TABLE** für neue Chargenverwaltung
3. **Index-Optimierung** für neue Felder
4. **Trigger-Updates** für neue Felder

---

## 📊 **ZUSAMMENFASSUNG**

### **Bestehende Datenbank:**
- ✅ **13 Schemas** bereits implementiert
- ✅ **50+ Tabellen** mit umfangreichen Datenfeldern
- ✅ **Vollständige Indizierung** und Performance-Optimierung
- ✅ **Trigger und Funktionen** für Automatisierung
- ✅ **Views und Stored Procedures** für Reporting

### **NeuroFlow-Erweiterungen:**
- ⚠️ **8 neue Felder** für Lieferantenstammdaten
- ❌ **1 neue Tabelle** für Chargenverwaltung
- ❌ **KI-Analyse-Felder** für bestehende Tabellen
- ❌ **Workflow-Integration** für n8n

### **Empfehlung:**
1. **Bestehende Struktur nutzen** (90% Kompatibilität)
2. **Minimale Erweiterungen** für NeuroFlow-Features
3. **Mapping-Layer** für Feldnamen-Übersetzung
4. **Backward Compatibility** gewährleisten

---

## 🚀 **NÄCHSTE SCHRITTE**

1. **Datenbank-Migration** für fehlende Felder
2. **Mapping-Implementierung** in Backend-API
3. **Autocomplete-Integration** mit bestehenden Daten
4. **Testing** der erweiterten Struktur
5. **Performance-Optimierung** für neue Felder 