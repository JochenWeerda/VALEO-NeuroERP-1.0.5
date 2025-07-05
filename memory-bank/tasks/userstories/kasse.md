# User Stories: Kassensystem

## US-KASSE-001: Kassenoberfläche nutzen
**Als** Kassierer  
**Möchte ich** eine intuitive und effiziente Kassenoberfläche nutzen können  
**Damit** ich Verkäufe schnell und fehlerfrei abwickeln kann

**Akzeptanzkriterien:**
- Touchscreen-optimierte Benutzeroberfläche
- Schnellwahltasten für häufig verkaufte Artikel
- Artikelsuche nach verschiedenen Kriterien (Name, Artikelnummer, Barcode)
- Übersichtliche Darstellung des aktuellen Kassenvorgangs
- Anpassbare Layouts für verschiedene Anwendungsfälle
- Unterstützung für verschiedene Bildschirmgrößen
- Barrierefreiheit gemäß WCAG-Richtlinien

## US-KASSE-002: Artikel erfassen
**Als** Kassierer  
**Möchte ich** Artikel auf verschiedene Weisen erfassen können  
**Damit** ich flexibel auf Kundenwünsche reagieren kann

**Akzeptanzkriterien:**
- Barcode-Scanning mit verschiedenen Barcode-Typen (EAN, UPC, QR)
- Manuelle Artikelsuche und -auswahl
- Schnellwahltasten für häufig verkaufte Artikel
- Mengen- und Gewichtseingabe
- Preisänderungen auf Artikelebene mit entsprechender Berechtigung
- Artikelattribute (Farbe, Größe, etc.) können ausgewählt werden
- Artikelbilder werden angezeigt

## US-KASSE-003: Rabatte verwalten
**Als** Kassierer  
**Möchte ich** Rabatte auf Artikel oder den gesamten Einkauf gewähren können  
**Damit** ich flexible Preisgestaltung umsetzen kann

**Akzeptanzkriterien:**
- Prozentuale und absolute Rabatte auf Artikelebene
- Prozentuale und absolute Rabatte auf den Gesamtbetrag
- Rabattaktionen können automatisch angewendet werden
- Manuelle Rabatte erfordern entsprechende Berechtigungen
- Rabattgründe können erfasst werden
- Rabattlimits können konfiguriert werden
- Rabatte werden auf dem Kassenbon ausgewiesen

## US-KASSE-004: Zahlungen abwickeln
**Als** Kassierer  
**Möchte ich** verschiedene Zahlungsmethoden akzeptieren können  
**Damit** ich Kunden flexible Zahlungsmöglichkeiten bieten kann

**Akzeptanzkriterien:**
- Barzahlung mit automatischer Wechselgeldberechnung
- Kartenzahlung (EC, Kredit, Debit) mit Kartenlesegerät-Integration
- Mobile Payment (Apple Pay, Google Pay, etc.)
- Gutscheineinlösung und -verkauf
- Fremdwährungen mit konfigurierbaren Wechselkursen
- Teilzahlungen mit verschiedenen Zahlungsmitteln
- Zahlungsbelege werden automatisch erstellt

## US-KASSE-005: Retouren bearbeiten
**Als** Kassierer  
**Möchte ich** Retouren und Umtausch abwickeln können  
**Damit** ich Kundenreklamationen effizient bearbeiten kann

**Akzeptanzkriterien:**
- Retouren können über Belegnummer oder Artikelsuche erfasst werden
- Teilretouren sind möglich
- Retourengründe können erfasst werden
- Rückerstattung auf das ursprüngliche Zahlungsmittel
- Alternative Rückerstattungsmethoden sind verfügbar
- Umtausch gegen andere Artikel ist möglich
- Retourenbelege werden automatisch erstellt

## US-KASSE-006: Kassenabschluss durchführen
**Als** Filialleiter  
**Möchte ich** einen Kassenabschluss durchführen können  
**Damit** ich die Einnahmen und das Kassenbestand kontrollieren kann

**Akzeptanzkriterien:**
- Tagesabschluss mit Umsatzermittlung
- Kassenbestandsprüfung mit Differenzermittlung
- Z-Bericht (Tagesabschluss) und X-Bericht (Zwischenbericht)
- Kassenjournal mit allen Transaktionen
- Schichtübergabe mit Kassenübergabeprotokoll
- Kassendifferenzen können erfasst und begründet werden
- Abschlussdaten werden automatisch an die Finanzbuchhaltung übermittelt

## US-KASSE-007: Technische Sicherheitseinrichtung nutzen
**Als** Unternehmer  
**Möchte ich** eine gesetzeskonforme technische Sicherheitseinrichtung (TSE) nutzen  
**Damit** ich die gesetzlichen Anforderungen an Kassensysteme erfülle

**Akzeptanzkriterien:**
- Integration einer zertifizierten TSE (Hardware- oder Cloud-Lösung)
- Jede Transaktion wird durch die TSE signiert
- TSE-Signatur wird auf dem Kassenbon ausgewiesen
- DSFinV-K-Export für Betriebsprüfungen
- Automatische Überwachung der TSE-Kapazität und -Zertifikatslaufzeit
- Notfallverfahren bei TSE-Ausfall
- Konformität mit der Kassensicherungsverordnung

## US-KASSE-008: Berichte und Statistiken erstellen
**Als** Filialleiter  
**Möchte ich** Berichte und Statistiken über Kassenvorgänge erstellen können  
**Damit** ich den Verkaufserfolg analysieren kann

**Akzeptanzkriterien:**
- Umsatzberichte nach verschiedenen Kriterien (Artikel, Kategorie, Zeitraum)
- Verkäuferstatistiken
- Rabattübersichten
- Retourenanalysen
- Zahlungsmittelverteilung
- Stornoquoten
- Export der Berichte in verschiedene Formate (PDF, Excel, CSV)

## US-KASSE-009: Kassensystem konfigurieren
**Als** Administrator  
**Möchte ich** das Kassensystem konfigurieren können  
**Damit** ich es an die Bedürfnisse des Unternehmens anpassen kann

**Akzeptanzkriterien:**
- Benutzer- und Rechteverwaltung
- Konfiguration von Steuersätzen
- Anpassung von Kassenbelegen
- Einrichtung von Zahlungsmethoden
- Konfiguration von Hardware (Drucker, Scanner, Kassenschublade)
- Einrichtung von Rabattaktionen
- Backup- und Wiederherstellungsfunktionen

## US-KASSE-010: Integration mit anderen Modulen
**Als** Systemadministrator  
**Möchte ich** das Kassensystem mit anderen Modulen integrieren können  
**Damit** ich eine durchgängige Datenverarbeitung sicherstellen kann

**Akzeptanzkriterien:**
- Integration mit der Finanzbuchhaltung (automatische Buchungen)
- Integration mit dem CRM (Kundenidentifikation, Bonusprogramm)
- Integration mit der Lagerverwaltung (Bestandsaktualisierung)
- Integration mit dem BI-System (Verkaufsanalysen)
- Event-basierte Kommunikation zwischen Modulen
- Offline-Fähigkeit bei temporären Verbindungsausfällen
- Automatische Synchronisation nach Wiederherstellung der Verbindung 