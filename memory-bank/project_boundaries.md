# Projektabgrenzung: SDK vs. VALEO-NeuroERP

## Software Development Kit (SDK)

Das SDK ist ein Framework zur KI-gestützten Softwareentwicklung und besteht aus:

### 1. APM Framework
- Agentic Project Management Framework
- Steuert den Entwicklungsprozess durch verschiedene Phasen (VAN, PLAN, CREATE, IMPLEMENT, REVIEW)
- Basis für die strukturierte KI-gestützte Entwicklung

### 2. Multi-Agent System
- Implementiert die verschiedenen Agentenrollen
- Koordiniert die Zusammenarbeit zwischen Agenten
- Ermöglicht parallele und strukturierte Verarbeitung

### 3. MCP (Model Context Protocol)
- Standardisierte Schnittstelle für Tool-Interaktionen
- Ermöglicht Agenten den Zugriff auf externe Tools
- Verwaltet den Kontext der Tool-Aufrufe

### 4. RAG (Retrieval Augmented Generation)
- System für kontextbasierte Informationsgewinnung
- Verbessert die Qualität der KI-Ausgaben
- Ermöglicht das Einbinden von domänenspezifischem Wissen

### 5. LangGraph
- Framework für strukturierte KI-Workflows
- Ermöglicht die Definition von Agenten-Workflows
- Verwaltet Zustandsübergänge und Kommunikation

➡️ **Zweck des SDK**: 
- Bereitstellung von Tools und Frameworks für die KI-gestützte Softwareentwicklung
- Ermöglichung strukturierter und automatisierter Entwicklungsprozesse
- Basis für die Entwicklung komplexer Anwendungen

## VALEO-NeuroERP (Das Produkt)

VALEO-NeuroERP ist ein konkretes Softwareprojekt, das mit Hilfe des SDK entwickelt wird:

### 1. Geschäftszweck
- Warenwirtschaftssystem für ein Landhandelsunternehmen
- KI-getriebene Prozessautomatisierung
- Responsive Softwarelösung

### 2. Hauptkomponenten
- ERP-Kernfunktionen
- Finanzbuchhaltung (FIBU)
- Warenwirtschaft
- Weitere branchenspezifische Tools

### 3. Spezifische Funktionen
- Lagerverwaltung
- Auftragsabwicklung
- Kundenmanagement
- Lieferantenmanagement
- Finanzmanagement
- Reporting und Analytics

➡️ **Zweck des ERP-Systems**:
- Digitalisierung der Geschäftsprozesse
- KI-gestützte Prozessoptimierung
- Effiziente Warenwirtschaft
- Integrierte Finanzverwaltung

## Klare Abgrenzung

### SDK (Das Werkzeug)
- Entwicklungsframework
- Wiederverwendbare Komponenten
- Generische Funktionen
- Kann für verschiedene Projekte eingesetzt werden
- Fokus auf Entwicklungsprozess und Automatisierung

### VALEO-NeuroERP (Das Produkt)
- Spezifische Geschäftsanwendung
- Kundenspezifische Anforderungen
- Branchenspezifische Funktionen
- Konkreter Geschäftszweck
- Fokus auf Geschäftsprozesse und Nutzerinteraktion

## Zusammenhang

- Das SDK wird verwendet, um VALEO-NeuroERP zu entwickeln
- VALEO-NeuroERP ist ein konkretes Anwendungsbeispiel für das SDK
- Das SDK stellt die Werkzeuge bereit, während VALEO-NeuroERP das damit erstellte Produkt ist
- Entwicklungserfahrungen aus VALEO-NeuroERP können zur Verbesserung des SDK beitragen

## Wichtige Hinweise

1. Bei der Entwicklung immer klar unterscheiden:
   - Handelt es sich um eine Verbesserung des SDK?
   - Oder um eine Funktion für VALEO-NeuroERP?

2. Dokumentation:
   - SDK-Dokumentation fokussiert auf Entwicklerwerkzeuge
   - VALEO-NeuroERP-Dokumentation fokussiert auf Geschäftsfunktionen

3. Codeorganisation:
   - SDK-Code in Framework-Repositories
   - VALEO-NeuroERP-Code in Produkt-Repositories 