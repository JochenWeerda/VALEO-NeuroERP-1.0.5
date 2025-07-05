# SERM-Datenmodell für das AI-gesteuerte ERP-System - Artikel-Stammdaten-Erweiterung

## Einführung zur Artikel-Stammdaten-Erweiterung

Die Artikel-Stammdaten-Erweiterung baut auf dem bestehenden SERM-Datenmodell auf und implementiert ein umfassendes Stammdatenmodell für Artikel mit KI-Erweiterungen. Diese Erweiterung vertieft die im Basis-SERM-Modell definierte Produktstruktur und fügt spezialisierte Entitäten für erweiterte Stammdaten, alternative Einheiten, Verkaufspreise, Dokumente, und KI-gestützte Funktionen hinzu.

## Erweitertes SERM-Modell für Artikel-Stammdaten

### 1. Artikel-Stammdaten (Erweiterung der Produktstruktur)

```
ArtikelStammdaten [0..1 ⟷ 1 Artikel]
├── ID (PK)
├── Artikel_ID (FK → Artikel, unique)
├── Kurztext
├── Zweite_Matchcode
├── Artikel_Art
├── Artikel_Gruppe
├── Artikel_Gesperrt (Boolean)
├── Druck_Beschreibung (JSON)
│   ├── aufAnfrageBestell (Boolean)
│   ├── aufAngebot (Boolean)
│   ├── aufAuftragsbest (Boolean)
│   ├── aufLieferschein (Boolean)
│   ├── aufRechnung (Boolean)
│   ├── aufKontrakt (Boolean)
│   └── aufWiegeschein (Boolean)
├── Anzeigeoptionen (JSON)
│   ├── stattArtikelBezeichnung (Boolean)
│   ├── zusätzlich (Boolean)
│   ├── langtextImGrafik (Boolean)
│   └── langtextInklFormeln (Boolean)
├── Mengen_Einheit
├── Gewicht
├── Hilfsgewicht
├── Preis_Je
├── Verpackungseinheit
├── Verpackung
├── Gebinde (JSON)
│   ├── Einheit
│   └── Menge
├── Steuer (JSON)
│   ├── Steuerschlüssel
│   ├── Bewertungsart
│   └── BewertungsProzent
├── Haupt_Artikel_ID (FK → Artikel, nullable)
├── EAN_Code
├── EAN_Code_Einheit
├── Interner_Code
├── Sichtbarkeit_Webshop (Boolean)
├── Etiketten_Druck (Boolean)
├── MHD_Kennzeichnung (Boolean)
├── Empfohlener_VK
├── Einkaufspreis
├── Kalkulatorischer_EK
├── Rabatt_Gruppe
├── Konditionen
├── Umsatz_Trend
├── Durchschnittlicher_Absatz
├── Gefahrgut_Klasse
├── Gefahrgut_Nummer
├── Gefahrgut_Beschreibung
├── Ruecknahme_Erlaubt (Boolean)
├── MHD_Pflicht (Boolean)
├── Toleranz_Menge
├── Kasse_Sonderbehandlung
├── Commission (Boolean)
├── Etikett_Info
├── Erstellt_Am
├── Erstellt_Von (FK → User)
├── Geaendert_Am
└── Geaendert_Von (FK → User)
```

### 2. Unterstützende Entitäten für Artikel-Stammdaten

```
AlternativArtikel [0..* ⟷ 1 ArtikelStammdaten]
├── ID (PK)
├── Stammdaten_ID (FK)
├── Alternativ_Artikel_ID (FK → Artikel)
└── Erstellt_Am

AlternativeEinheit [0..* ⟷ 1 ArtikelStammdaten]
├── ID (PK)
├── Stammdaten_ID (FK)
├── Einheit
├── Umrechnung
├── Einheit_Runden
└── Erstellt_Am

VerkaufsPreis [0..* ⟷ 1 ArtikelStammdaten]
├── ID (PK)
├── Stammdaten_ID (FK)
├── Tabellen_Bezeichnung
├── Gueltig_Von
├── Gueltig_Bis
├── Basis_Preiseinheit
├── Preis_Ab_Menge
├── Brutto
├── Netto
├── MwSt
├── Erstellt_Am
└── Geaendert_Am

ArtikelDokument [0..* ⟷ 1 ArtikelStammdaten]
├── ID (PK)
├── Stammdaten_ID (FK)
├── Dateiname
├── Dateityp
├── Ablage_Kategorie
├── Gueltig_Ab
├── Gueltig_Bis
└── Erstellt_Am

ArtikelUnterlage [0..* ⟷ 1 ArtikelStammdaten]
├── ID (PK)
├── Stammdaten_ID (FK)
├── Bezeichnung
├── Angelegt_Am
├── Gueltig_Ab
├── Gueltig_Bis
├── Bediener
├── Anzahl_Seiten
├── Kategorie
└── Erstellt_Am

ArtikelKonto [0..* ⟷ 1 ArtikelStammdaten]
├── ID (PK)
├── Stammdaten_ID (FK)
├── Beginn_Datum
├── Buchungsdatum
├── Verkaeufe
├── Einkaeufe
└── Erstellt_Am

ArtikelLagerbestand [0..* ⟷ 1 ArtikelStammdaten]
├── ID (PK)
├── Stammdaten_ID (FK)
├── Lagerort
├── Buch_Bestand
├── Lager_Bewertung
├── Letzte_Bewegung
├── Erstellt_Am
└── Geaendert_Am
```

### 3. KI-Erweiterungen für Artikel-Stammdaten

```
KIErweiterung [0..1 ⟷ 1 ArtikelStammdaten]
├── ID (PK)
├── Stammdaten_ID (FK, unique)
├── Warengruppe_Erkennung_KI (Boolean)
├── Klassifikation_Confidence
├── Preis_VK_Automatisch
├── Preis_EK_Automatisch
├── Nachbestellung_Prognose
├── Beschreibung_GPT
├── Langtext_GPT
├── Auto_Preis_Update (Boolean)
├── Auto_Lagerauffuellung (Boolean)
├── Auto_Kundengruppenrabatt (Boolean)
├── Anomalie_Erkannt (Boolean)
├── Letzter_Check
├── Geprueft_Von
├── Erstellt_Am
└── Geaendert_Am

KIAlternative [0..* ⟷ 1 KIErweiterung]
├── ID (PK)
├── KI_Erweiterung_ID (FK)
├── Artikel_ID (FK → Artikel)
├── Relevanz_Score
└── Erstellt_Am

SEOKeyword [0..* ⟷ 1 KIErweiterung]
├── ID (PK)
├── KI_Erweiterung_ID (FK)
├── Keyword
├── Relevanz
└── Erstellt_Am
```

## Integration mit dem Basis-SERM-Modell

Das erweiterte Artikel-Stammdaten-Modell integriert sich in das Basis-SERM-Modell durch die Beziehung zwischen `ArtikelStammdaten` und der existierenden `Artikel`-Entität (entspricht `Produktvorlage` im Basis-SERM).

### Beziehungen zum Basis-SERM-Modell

- **ArtikelStammdaten ⟷ Produktvorlage**: 1:1-Beziehung, wobei jeder Artikel (Produktvorlage) eine erweiterte Stammdatensatz haben kann
- **KIErweiterung ⟷ ArtikelStammdaten**: 1:1-Beziehung, wobei jeder Stammdatensatz optional KI-Erweiterungen haben kann
- **AlternativArtikel ⟷ Produktvorlage**: n:m-Beziehung über die Zwischentabelle AlternativArtikel

## Erweiterungen zum Basis-SERM-Modell

Das erweiterte Modell fügt folgende Konzepte zum Basis-SERM-Modell hinzu:

1. **Erweiterte Artikeldaten**: Detaillierte Attribute für Artikel, die über das Basismodell hinausgehen
2. **Druck- und Anzeigeoptionen**: Konfigurierbare Optionen für die Darstellung in verschiedenen Dokumenten
3. **Alternative Einheiten**: Unterstützung für multiple Maßeinheiten pro Artikel mit Umrechnungsfaktoren
4. **Preismanagement**: Zeitbasierte und mengenbasierte Preisgestaltung
5. **Dokumentenmanagement**: Verwaltung von artikelbezogenen Dokumenten und Unterlagen
6. **KI-Integration**: 
   - Automatische Klassifikation von Artikeln
   - Preisempfehlungen basierend auf Marktdaten
   - Automatische Textgenerierung für Beschreibungen
   - Anomalieerkennung und Qualitätsprüfung
   - Intelligente Vorschläge für alternative Produkte
   - SEO-Optimierung durch Keyword-Analyse

## Vorteile des erweiterten Modells

1. **Vollständige Artikeldatenverwaltung**: Umfassende Abbildung aller relevanten Artikelinformationen
2. **Flexibilität**: Anpassbarkeit an unterschiedliche Artikelarten und Geschäftsprozesse
3. **KI-Integration**: Direkte Einbindung von künstlicher Intelligenz in die Stammdatenverwaltung
4. **Dokumentenmanagement**: Strukturierte Verwaltung aller artikelbezogenen Dokumente
5. **Preismanagement**: Flexible Preisgestaltung mit zeitlicher und mengenmäßiger Differenzierung

## Implementierungshinweise

- Die JSON-Felder erlauben flexible Erweiterungen ohne Schemaänderungen
- Alle Entitäten enthalten Tracking-Felder für Auditing und Nachvollziehbarkeit
- Die KI-Erweiterungen sind optional und können bei Bedarf aktiviert werden
- Das Modell ist für zukünftige Erweiterungen (z.B. weitere KI-Funktionen) vorbereitet

## Fazit

Das erweiterte Artikel-Stammdaten-Modell bietet eine umfassende Lösung für die Verwaltung von Artikeldaten mit KI-Unterstützung. Es ergänzt das Basis-SERM-Modell um spezialisierte Entitäten für fortgeschrittene Anforderungen an die Artikelstammdatenverwaltung und bereitet das System auf zukünftige KI-gestützte Funktionen vor. 