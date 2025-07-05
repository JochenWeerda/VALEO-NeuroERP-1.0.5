# User Stories: Finanzbuchhaltung

## US-FIN-001: Kontenplan verwalten
**Als** Buchhalter  
**Möchte ich** einen strukturierten Kontenplan anlegen und verwalten können  
**Damit** ich alle Buchungen entsprechend den gesetzlichen Vorgaben kategorisieren kann

**Akzeptanzkriterien:**
- SKR04 (Standardkontenrahmen für Kapitalgesellschaften) ist standardmäßig vorinstalliert
- Bei Erstinstallation wird der passende Kontenrahmen abgefragt
- Weitere Kontenrahmen (SKR03, Schweizer KMU, Österreich RLG, etc.) können bei Bedarf nachgeladen werden
- Konten können angelegt, bearbeitet und (sofern nicht verwendet) gelöscht werden
- Konten können hierarchisch strukturiert werden (Hauptkonten, Unterkonten)
- Konten können als Aktiv-, Passiv-, Aufwands- oder Ertragskonten klassifiziert werden
- Kontenplan kann exportiert werden (CSV, Excel)

## US-FIN-002: Buchungen erfassen
**Als** Buchhalter  
**Möchte ich** manuelle und automatische Buchungen erfassen können  
**Damit** ich alle Geschäftsvorfälle korrekt abbilden kann

**Akzeptanzkriterien:**
- Buchungen können manuell erfasst werden (Soll/Haben)
- Buchungen können aus Belegen automatisch generiert werden
- Buchungen können als wiederkehrend definiert werden
- Buchungsvorlagen können erstellt und verwendet werden
- Buchungen können storniert werden
- Buchungen sind unveränderlich nach Abschluss einer Periode

## US-FIN-003: Finanzberichte erstellen
**Als** Geschäftsführer  
**Möchte ich** standardisierte Finanzberichte abrufen können  
**Damit** ich die finanzielle Lage des Unternehmens bewerten kann

**Akzeptanzkriterien:**
- Bilanz kann erstellt werden
- Gewinn- und Verlustrechnung kann erstellt werden
- Cashflow-Rechnung kann erstellt werden
- Berichte können für verschiedene Zeiträume erstellt werden
- Berichte können mit Vorperioden verglichen werden
- Berichte können exportiert werden (PDF, Excel)
- Benutzerdefinierte Berichte können erstellt werden

## US-FIN-004: Perioden verwalten
**Als** Buchhalter  
**Möchte ich** Buchungsperioden verwalten können  
**Damit** ich den Jahresabschluss ordnungsgemäß durchführen kann

**Akzeptanzkriterien:**
- Perioden können geöffnet und geschlossen werden
- Geschlossene Perioden können bei Bedarf wiedereröffnet werden
- Buchungen in geschlossenen Perioden sind nicht möglich
- Jahresabschluss kann durchgeführt werden
- Eröffnungsbuchungen für das neue Jahr werden automatisch erstellt
- Periodenübergreifende Berichte können erstellt werden

## US-FIN-005: Anlagenbuchhaltung führen
**Als** Buchhalter  
**Möchte ich** Anlagegüter verwalten und abschreiben können  
**Damit** ich den Wertverlust von Anlagegütern korrekt erfassen kann

**Akzeptanzkriterien:**
- Anlagegüter können erfasst werden
- Verschiedene Abschreibungsmethoden sind verfügbar (linear, degressiv)
- Abschreibungen können automatisch gebucht werden
- Anlagenspiegel kann erstellt werden
- Anlagegüter können verkauft oder ausgebucht werden
- Anlagenhistorie ist verfügbar

## US-FIN-006: Kostenstellenrechnung durchführen
**Als** Controller  
**Möchte ich** Kosten auf Kostenstellen verteilen können  
**Damit** ich die Kosten verschiedener Unternehmensbereiche analysieren kann

**Akzeptanzkriterien:**
- Kostenstellen können angelegt und verwaltet werden
- Buchungen können Kostenstellen zugeordnet werden
- Kostenstellenberichte können erstellt werden
- Kostenstellenverteilungen können automatisiert werden
- Kostenstellenhierarchien können definiert werden
- Kostenstellenvergleiche können durchgeführt werden

## US-FIN-007: Steuern verwalten
**Als** Buchhalter  
**Möchte ich** Steuern korrekt erfassen und verwalten können  
**Damit** ich die Steuerdeklaration ordnungsgemäß vorbereiten kann

**Akzeptanzkriterien:**
- Verschiedene Steuerarten können konfiguriert werden
- Steuersätze können verwaltet werden
- Vorsteuer und Umsatzsteuer werden automatisch berechnet
- Steuerberichte können erstellt werden
- Umsatzsteuervoranmeldung kann generiert werden
- Steuerkonten werden automatisch aktualisiert

## US-FIN-008: Fremdwährungen verwalten
**Als** Buchhalter  
**Möchte ich** Transaktionen in Fremdwährungen erfassen können  
**Damit** ich internationale Geschäftsbeziehungen korrekt abbilden kann

**Akzeptanzkriterien:**
- Fremdwährungen können konfiguriert werden
- Wechselkurse können manuell eingegeben oder automatisch aktualisiert werden
- Buchungen können in Fremdwährungen erfasst werden
- Währungsumrechnungen werden automatisch durchgeführt
- Währungsgewinne und -verluste werden automatisch gebucht
- Berichte können in verschiedenen Währungen erstellt werden

## US-FIN-009: Offene Posten verwalten
**Als** Buchhalter  
**Möchte ich** offene Posten verwalten können  
**Damit** ich ausstehende Forderungen und Verbindlichkeiten im Blick behalte

**Akzeptanzkriterien:**
- Offene Posten werden automatisch aus Buchungen generiert
- Offene Posten können manuell erfasst werden
- Zahlungseingänge können offenen Posten zugeordnet werden
- Mahnwesen kann konfiguriert werden
- Fälligkeitsanalysen können durchgeführt werden
- Zahlungsvorschläge können generiert werden

## US-FIN-010: Integration mit anderen Modulen
**Als** Systemadministrator  
**Möchte ich** das Finanzbuchhaltungsmodul mit anderen Modulen integrieren können  
**Damit** ich eine durchgängige Datenverarbeitung sicherstellen kann

**Akzeptanzkriterien:**
- Integration mit dem Kassensystem (automatische Buchungen aus Verkaufstransaktionen)
- Integration mit dem CRM (Kundenzahlungen, offene Posten)
- Integration mit dem Bestellwesen (Lieferantenrechnungen, Bestellinformationen)
- Integration mit der Lagerverwaltung (Bestandsbewertung, Warenbewegungen)
- Integration mit dem BI-System (Finanzanalysen, Reporting)
- Bidirektionaler Datenfluss zwischen Modulen 