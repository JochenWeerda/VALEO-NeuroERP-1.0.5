"""
SQLAlchemy ORM Models für VALEO NeuroERP 2.0
"""

# Warenwirtschaft (WaWi) Module
from .warenwirtschaft import (
    # Artikel-Management
    ArtikelStammdaten, AlternativeEinheit, VerkaufsPreis, EinkaufsPreis,
    ArtikelBild, ArtikelDokument, ArtikelBewertung, ArtikelHistorie,
    ArtikelVerknuepfung, ArtikelImport,
    
    # Lager-Management
    Lager, Lagerzone, Lagerplatz, LagerBewegung, LagerBestand,
    LagerKategorie, LagerTyp, LagerStatus, LagerBerechtigung,
    LagerAudit,
    
    # Einlagerung/Auslagerung
    Einlagerung, EinlagerungPosition, Auslagerung, AuslagerungPosition,
    
    # Bestell-Management
    Bestellung, BestellPosition, BestellStatus, BestellHistorie,
    BestellBewilligung, BestellTemplate, BestellWiederholung,
    BestellPrioritaet, BestellKategorie,
    
    # Lieferanten-Management
    Lieferant, LieferantenKontakt, LieferantenBewertung,
    LieferantenKategorie, LieferantenHistorie, LieferantenVertrag,
    LieferantenZahlung, LieferantenAudit,
    
    # Qualitäts-Management
    Qualitaetskontrolle, QualitaetsPruefung, QualitaetsStandard,
    QualitaetsZertifikat, QualitaetsHistorie, QualitaetsBewertung,
    QualitaetsKategorie, QualitaetsAudit,
    
    # Logistik-Management
    Versand, VersandPosition, VersandStatus, VersandHistorie,
    VersandKategorie, VersandTyp, VersandBerechtigung,
    VersandAudit, VersandTracking,
    
    # Inventur
    Inventur, InventurPosition, InventurStatus, InventurHistorie,
    InventurKategorie, InventurTyp, InventurBerechtigung,
    InventurAudit
)

# Finanzbuchhaltung (FiBu) Module
from .finanzbuchhaltung import (
    # Konten-Management
    Konto, Kontengruppe, KontoTyp, KontoStatus, KontoHistorie,
    KontoBerechtigung, KontoAudit, KontoTemplate,
    
    # Buchungs-Management
    Buchung, BuchungsPosition, Buchungsvorlage, BuchungsStatus,
    BuchungsHistorie, BuchungsKategorie, BuchungsTyp,
    BuchungsBerechtigung, BuchungsAudit,
    
    # Rechnungs-Management
    Rechnung, RechnungPosition, RechnungsStatus, RechnungsHistorie,
    RechnungsKategorie, RechnungsTyp, RechnungsBerechtigung,
    RechnungsAudit, RechnungsTemplate,
    
    # Zahlungs-Management
    Zahlung, Zahlungsplan, ZahlungsStatus, ZahlungsHistorie,
    ZahlungsKategorie, ZahlungsTyp, ZahlungsBerechtigung,
    ZahlungsAudit, ZahlungsTemplate,
    
    # Kostenstellen
    Kostenstelle, KostenstellenBuchung, KostenstellenKategorie,
    KostenstellenTyp, KostenstellenStatus, KostenstellenHistorie,
    KostenstellenBerechtigung, KostenstellenAudit,
    
    # Budget-Management
    Budget, BudgetVerbrauch, BudgetKategorie, BudgetTyp,
    BudgetStatus, BudgetHistorie, BudgetBerechtigung,
    BudgetAudit, BudgetTemplate,
    
    # Jahresabschluss
    Jahresabschluss, BilanzPosition, GewinnVerlustPosition,
    JahresabschlussStatus, JahresabschlussHistorie,
    JahresabschlussBerechtigung, JahresabschlussAudit,
    
    # Steuern
    Steuer, SteuerBuchung, SteuerKategorie, SteuerTyp,
    SteuerStatus, SteuerHistorie, SteuerBerechtigung,
    SteuerAudit, SteuerTemplate,
    
    # Debitoren/Kreditoren
    Debitor, Kreditor, DebitorKontakt, KreditorKontakt,
    DebitorHistorie, KreditorHistorie, DebitorBewertung,
    KreditorBewertung, DebitorAudit, KreditorAudit
)

# CRM Module
from .crm import (
    # Kunden-Management
    Kunde, Kontakt, KundenKategorie, KundenStatus, KundenHistorie,
    KundenBewertung, KundenAudit, KundenTemplate,
    
    # Angebote
    Angebot, AngebotPosition, AngebotsStatus, AngebotsHistorie,
    AngebotsKategorie, AngebotsTyp, AngebotsBerechtigung,
    AngebotsAudit, AngebotsTemplate,
    
    # Aufträge
    Auftrag, AuftragPosition, AuftragsStatus, AuftragsHistorie,
    AuftragsKategorie, AuftragsTyp, AuftragsBerechtigung,
    AuftragsAudit, AuftragsTemplate,
    
    # Verkaufschancen
    Verkaufschance, VerkaufschanceAktivitaet, VerkaufschanceStatus,
    VerkaufschanceHistorie, VerkaufschanceKategorie, VerkaufschanceTyp,
    VerkaufschanceBerechtigung, VerkaufschanceAudit,
    
    # Marketing
    MarketingKampagne, KampagnenTeilnehmer, MarketingKategorie,
    MarketingTyp, MarketingStatus, MarketingHistorie,
    MarketingBerechtigung, MarketingAudit, MarketingTemplate,
    
    # Kundenservice
    Kundenservice, TicketAntwort, ServiceKategorie, ServiceTyp,
    ServiceStatus, ServiceHistorie, ServiceBerechtigung,
    ServiceAudit, ServiceTemplate,
    
    # Berichte
    Bericht, BerichtsKategorie, BerichtsTyp, BerichtsStatus,
    BerichtsHistorie, BerichtsBerechtigung, BerichtsAudit,
    BerichtsTemplate,
    
    # Automatisierung
    Automatisierung, AutomatisierungsRegel, AutomatisierungsKategorie,
    AutomatisierungsTyp, AutomatisierungsStatus, AutomatisierungsHistorie,
    AutomatisierungsBerechtigung, AutomatisierungsAudit,
    
    # Integration
    Integration, IntegrationsKategorie, IntegrationsTyp, IntegrationsStatus,
    IntegrationsHistorie, IntegrationsBerechtigung, IntegrationsAudit
)

# Übergreifende Services Module
from .uebergreifende_services import (
    # Benutzerverwaltung
    Benutzer, Rolle, BenutzerRolle, Permission, RollenPermission,
    BenutzerAktivitaet, BenutzerSession,
    
    # Systemeinstellungen
    SystemEinstellung, ModulEinstellung,
    
    # Workflow-Engine
    WorkflowDefinition, WorkflowExecution, WorkflowExecutionStep,
    
    # Berichte & Analytics
    BerichtDefinition, BerichtExecution, AnalyticsEvent,
    
    # Integration
    Integration, IntegrationSyncLog,
    
    # Backup & Wiederherstellung
    Backup, BackupExecution,
    
    # Monitoring
    MonitoringAlert, MonitoringMetric, MonitoringAlertTrigger,
    
    # API-Management
    APIEndpoint, APIKey, APIUsageLog,
    
    # Dokumentenverwaltung
    Dokument, DokumentVersion, DokumentShare,
    
    # Enums
    UserStatus, PermissionLevel, WorkflowStatus, IntegrationType,
    BackupType, MonitoringLevel, DocumentType
)

# Alle Modelle für Alembic
__all__ = [
    # Warenwirtschaft
    'ArtikelStammdaten', 'AlternativeEinheit', 'VerkaufsPreis', 'EinkaufsPreis',
    'ArtikelBild', 'ArtikelDokument', 'ArtikelBewertung', 'ArtikelHistorie',
    'ArtikelVerknuepfung', 'ArtikelImport', 'Lager', 'Lagerzone', 'Lagerplatz',
    'LagerBewegung', 'LagerBestand', 'LagerKategorie', 'LagerTyp', 'LagerStatus',
    'LagerBerechtigung', 'LagerAudit', 'Einlagerung', 'EinlagerungPosition',
    'Auslagerung', 'AuslagerungPosition', 'Bestellung', 'BestellPosition',
    'BestellStatus', 'BestellHistorie', 'BestellBewilligung', 'BestellTemplate',
    'BestellWiederholung', 'BestellPrioritaet', 'BestellKategorie', 'Lieferant',
    'LieferantenKontakt', 'LieferantenBewertung', 'LieferantenKategorie',
    'LieferantenHistorie', 'LieferantenVertrag', 'LieferantenZahlung',
    'LieferantenAudit', 'Qualitaetskontrolle', 'QualitaetsPruefung',
    'QualitaetsStandard', 'QualitaetsZertifikat', 'QualitaetsHistorie',
    'QualitaetsBewertung', 'QualitaetsKategorie', 'QualitaetsAudit', 'Versand',
    'VersandPosition', 'VersandStatus', 'VersandHistorie', 'VersandKategorie',
    'VersandTyp', 'VersandBerechtigung', 'VersandAudit', 'VersandTracking',
    'Inventur', 'InventurPosition', 'InventurStatus', 'InventurHistorie',
    'InventurKategorie', 'InventurTyp', 'InventurBerechtigung', 'InventurAudit',
    
    # Finanzbuchhaltung
    'Konto', 'Kontengruppe', 'KontoTyp', 'KontoStatus', 'KontoHistorie',
    'KontoBerechtigung', 'KontoAudit', 'KontoTemplate', 'Buchung',
    'BuchungsPosition', 'Buchungsvorlage', 'BuchungsStatus', 'BuchungsHistorie',
    'BuchungsKategorie', 'BuchungsTyp', 'BuchungsBerechtigung', 'BuchungsAudit',
    'Rechnung', 'RechnungPosition', 'RechnungsStatus', 'RechnungsHistorie',
    'RechnungsKategorie', 'RechnungsTyp', 'RechnungsBerechtigung',
    'RechnungsAudit', 'RechnungsTemplate', 'Zahlung', 'Zahlungsplan',
    'ZahlungsStatus', 'ZahlungsHistorie', 'ZahlungsKategorie', 'ZahlungsTyp',
    'ZahlungsBerechtigung', 'ZahlungsAudit', 'ZahlungsTemplate', 'Kostenstelle',
    'KostenstellenBuchung', 'KostenstellenKategorie', 'KostenstellenTyp',
    'KostenstellenStatus', 'KostenstellenHistorie', 'KostenstellenBerechtigung',
    'KostenstellenAudit', 'Budget', 'BudgetVerbrauch', 'BudgetKategorie',
    'BudgetTyp', 'BudgetStatus', 'BudgetHistorie', 'BudgetBerechtigung',
    'BudgetAudit', 'BudgetTemplate', 'Jahresabschluss', 'BilanzPosition',
    'GewinnVerlustPosition', 'JahresabschlussStatus', 'JahresabschlussHistorie',
    'JahresabschlussBerechtigung', 'JahresabschlussAudit', 'Steuer',
    'SteuerBuchung', 'SteuerKategorie', 'SteuerTyp', 'SteuerStatus',
    'SteuerHistorie', 'SteuerBerechtigung', 'SteuerAudit', 'SteuerTemplate',
    'Debitor', 'Kreditor', 'DebitorKontakt', 'KreditorKontakt',
    'DebitorHistorie', 'KreditorHistorie', 'DebitorBewertung',
    'KreditorBewertung', 'DebitorAudit', 'KreditorAudit',
    
    # CRM
    'Kunde', 'Kontakt', 'KundenKategorie', 'KundenStatus', 'KundenHistorie',
    'KundenBewertung', 'KundenAudit', 'KundenTemplate', 'Angebot',
    'AngebotPosition', 'AngebotsStatus', 'AngebotsHistorie', 'AngebotsKategorie',
    'AngebotsTyp', 'AngebotsBerechtigung', 'AngebotsAudit', 'AngebotsTemplate',
    'Auftrag', 'AuftragPosition', 'AuftragsStatus', 'AuftragsHistorie',
    'AuftragsKategorie', 'AuftragsTyp', 'AuftragsBerechtigung', 'AuftragsAudit',
    'AuftragsTemplate', 'Verkaufschance', 'VerkaufschanceAktivitaet',
    'VerkaufschanceStatus', 'VerkaufschanceHistorie', 'VerkaufschanceKategorie',
    'VerkaufschanceTyp', 'VerkaufschanceBerechtigung', 'VerkaufschanceAudit',
    'MarketingKampagne', 'KampagnenTeilnehmer', 'MarketingKategorie',
    'MarketingTyp', 'MarketingStatus', 'MarketingHistorie', 'MarketingBerechtigung',
    'MarketingAudit', 'MarketingTemplate', 'Kundenservice', 'TicketAntwort',
    'ServiceKategorie', 'ServiceTyp', 'ServiceStatus', 'ServiceHistorie',
    'ServiceBerechtigung', 'ServiceAudit', 'ServiceTemplate', 'Bericht',
    'BerichtsKategorie', 'BerichtsTyp', 'BerichtsStatus', 'BerichtsHistorie',
    'BerichtsBerechtigung', 'BerichtsAudit', 'BerichtsTemplate', 'Automatisierung',
    'AutomatisierungsRegel', 'AutomatisierungsKategorie', 'AutomatisierungsTyp',
    'AutomatisierungsStatus', 'AutomatisierungsHistorie', 'AutomatisierungsBerechtigung',
    'AutomatisierungsAudit', 'Integration', 'IntegrationsKategorie', 'IntegrationsTyp',
    'IntegrationsStatus', 'IntegrationsHistorie', 'IntegrationsBerechtigung',
    'IntegrationsAudit',
    
    # Übergreifende Services
    'Benutzer', 'Rolle', 'BenutzerRolle', 'Permission', 'RollenPermission',
    'BenutzerAktivitaet', 'BenutzerSession', 'SystemEinstellung', 'ModulEinstellung',
    'WorkflowDefinition', 'WorkflowExecution', 'WorkflowExecutionStep',
    'BerichtDefinition', 'BerichtExecution', 'AnalyticsEvent', 'Integration',
    'IntegrationSyncLog', 'Backup', 'BackupExecution', 'MonitoringAlert',
    'MonitoringMetric', 'MonitoringAlertTrigger', 'APIEndpoint', 'APIKey',
    'APIUsageLog', 'Dokument', 'DokumentVersion', 'DokumentShare',
    'UserStatus', 'PermissionLevel', 'WorkflowStatus', 'IntegrationType',
    'BackupType', 'MonitoringLevel', 'DocumentType'
] 