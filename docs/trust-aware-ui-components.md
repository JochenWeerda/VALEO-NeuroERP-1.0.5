# VALEO NeuroERP - Trust-Aware UI-Komponenten

## Übersicht

Das VALEO NeuroERP-System implementiert eine vollständige Trust-basierte UI-Architektur, die Vertrauenswürdigkeit, Transparenz und Benutzerkontrolle in den Mittelpunkt stellt. Alle Komponenten sind darauf ausgelegt, Halluzinationen zu verhindern und faktenbasierte Kommunikation zu gewährleisten.

## Implementierte Komponenten

### 1. TrustIndicator
**Datei:** `frontend/src/components/TrustIndicator.tsx`

**Zweck:** Zentrale Komponente zur Anzeige des Vertrauenslevels von Daten und KI-Vorschlägen.

**Features:**
- Farbkodierte Vertrauenslevels (Grün=Fact, Gelb=Assumption, Orange=Uncertain, Rot=Error, Blau=Processing)
- Konfidenz-Anzeige (0-100%)
- Daten-Quelle und Validierungszeitpunkt
- Benutzer-Entscheidungs-Buttons bei Unsicherheiten
- Hover-Details mit vollständigen Informationen

**Verwendung:**
```tsx
<TrustIndicator
  level="assumption"
  confidence={75}
  source="KI-Agent: Lager-Optimierung"
  lastValidated={new Date()}
  requiresUserDecision={true}
  onUserDecision={(accepted) => console.log('User decision:', accepted)}
/>
```

### 2. Sidebar
**Datei:** `frontend/src/components/Sidebar.tsx`

**Zweck:** Vertikale Navigation mit Trust-Indikatoren für alle ERP-Module.

**Features:**
- Responsive Design (kollabierbar)
- Trust-Indikatoren für jedes Modul
- System-Status und KI-Agenten-Status
- Tooltips für kollabierte Ansicht
- Benutzer-Informationen im Footer

**Verwendung:**
```tsx
<Sidebar
  modules={modules}
  activeModule="crm"
  onModuleChange={setActiveModule}
  collapsed={false}
  onToggleCollapse={() => setCollapsed(!collapsed)}
/>
```

### 3. NotificationDropdown
**Datei:** `frontend/src/components/NotificationDropdown.tsx`

**Zweck:** Benachrichtigungssystem mit Trust-Indikatoren und Kategorisierung.

**Features:**
- Filterung nach Kategorien (Alle, Ungelesen, KI-Agenten)
- Trust-Indikatoren für jede Benachrichtigung
- Zeitstempel und Kategorisierung
- "Alle als gelesen markieren" Funktion
- Responsive Dropdown-Design

**Verwendung:**
```tsx
<NotificationDropdown
  notifications={notifications}
  unreadCount={5}
  onMarkAsRead={handleMarkAsRead}
  onMarkAllAsRead={handleMarkAllAsRead}
  onNotificationClick={handleNotificationClick}
/>
```

### 4. UserDropdown
**Datei:** `frontend/src/components/UserDropdown.tsx`

**Zweck:** Benutzer-Profil-Dropdown mit Trust-Indikatoren und Berechtigungen.

**Features:**
- Benutzer-Informationen mit Avatar
- Trust-Level des Benutzer-Accounts
- Berechtigungs-Anzeige
- Letzter Login-Zeitpunkt
- Profil-, Einstellungs- und Abmelde-Optionen

**Verwendung:**
```tsx
<UserDropdown
  user={user}
  onProfileClick={handleProfileClick}
  onSettingsClick={handleSettingsClick}
  onLogout={handleLogout}
/>
```

### 5. TrustAwareLayout
**Datei:** `frontend/src/components/TrustAwareLayout.tsx`

**Zweck:** Haupt-Layout-Komponente, die alle Trust-basierten Komponenten integriert.

**Features:**
- Integrierte Sidebar, Notifications und User-Dropdown
- System-Status-Anzeige
- KI-Agenten-Status
- Responsive Header mit globaler Suche
- Trust-Indikatoren im Footer

**Verwendung:**
```tsx
<TrustAwareLayout
  modules={modules}
  activeModule={activeModule}
  onModuleChange={setActiveModule}
  notifications={notifications}
  user={user}
  onNotificationClick={handleNotificationClick}
  onMarkNotificationAsRead={handleMarkAsRead}
  onMarkAllNotificationsAsRead={handleMarkAllAsRead}
  onProfileClick={handleProfileClick}
  onSettingsClick={handleSettingsClick}
  onLogout={handleLogout}
>
  {children}
</TrustAwareLayout>
```

### 6. ModuleCard
**Datei:** `frontend/src/components/ModuleCard.tsx`

**Zweck:** Karten-Komponente für ERP-Module mit Feature-Liste und Trust-Indikatoren.

**Features:**
- Modul-Kategorisierung (Core, Business, Analytics, etc.)
- Feature-Liste mit Verfügbarkeits-Status
- Trust-Indikatoren für Module und Features
- Status-Anzeige (Aktiv, Wartung, Geplant, Veraltet)
- Aktions-Buttons (Öffnen, Details)

**Verwendung:**
```tsx
<ModuleCard
  id="crm"
  title="Kundenverwaltung"
  description="CRM-System mit KI-Integration"
  icon="fas fa-user-tie"
  category="business"
  features={features}
  trustLevel="fact"
  confidence={92}
  status="active"
  onOpen={() => navigateToModule('crm')}
  onDetails={() => showModuleDetails('crm')}
/>
```

### 7. ChatSidebar
**Datei:** `frontend/src/components/ChatSidebar.tsx`

**Zweck:** KI-Chat-System mit Trust-Indikatoren und Sprachsteuerung.

**Features:**
- Chat- und Transkript-Modi
- Trust-Indikatoren für KI-Antworten
- Benutzer-Entscheidungs-Buttons bei Unsicherheiten
- Sprachsteuerung mit Aufnahme-Indikator
- Auto-Scroll und Nachrichtenverlauf

**Verwendung:**
```tsx
<ChatSidebar
  isOpen={chatOpen}
  onClose={() => setChatOpen(false)}
  messages={chatMessages}
  onSendMessage={handleSendMessage}
  onUserDecision={handleUserDecision}
/>
```

### 8. FloatingVoiceControl
**Datei:** `frontend/src/components/ChatSidebar.tsx`

**Zweck:** Floating Action Button für Sprachsteuerung.

**Features:**
- Animierte Aufnahme-Indikation
- Hover-Effekte
- Responsive Positionierung
- Integration mit ChatSidebar

**Verwendung:**
```tsx
<FloatingVoiceControl
  onClick={() => setChatOpen(true)}
  isActive={isRecording}
/>
```

## Trust-Level System

### Farbkodierung
- **🟢 Grün (Fact)**: Fakten-basiert, validiert, sicher
- **🟡 Gelb (Assumption)**: Vermutung, nicht vollständig validiert
- **🟠 Orange (Uncertain)**: Unsicher, benötigt weitere Validierung
- **🔴 Rot (Error)**: Fehler, nicht validiert, abgelehnt
- **🔵 Blau (Processing)**: Informativ, neutral, verarbeitend

### Icon-System
- **✅ Fakten-Check**: Häkchen mit Schild
- **❓ Unsicher**: Fragezeichen mit gelbem Hintergrund
- **⚠️ Warnung**: Ausrufezeichen mit gelbem Dreieck
- **🚫 Abgelehnt**: X mit rotem Kreis
- **🔄 Verarbeitung**: Spinner mit blauem Kreis
- **📊 Daten-Quelle**: Diagramm-Icon
- **🔍 Audit**: Lupe mit Schild

## Integration mit Backend/Middleware

### API-Integration
Alle Komponenten sind vorbereitet für die Integration mit:
- **Backend-APIs**: Datenvalidierung und -abfrage
- **KI-Agenten**: Vertrauenslevel-Bewertung
- **Audit-System**: Vollständige Nachverfolgung
- **Benachrichtigungsservice**: Echtzeit-Updates

### State-Management
- **Zentrale Stores**: Für Benutzer, Notifications, Module-Status
- **React Context**: Für globale Trust-Einstellungen
- **React Query**: Für Server-State und Caching
- **Zustand**: Für lokalen UI-State

## Sicherheits- und Vertrauensaspekte

### Halluzinations-Prävention
1. **Strikte Validierung**: Keine unbestätigten Daten anzeigen
2. **Klare Kennzeichnung**: Vermutungen deutlich markieren
3. **Benutzer-Kontrolle**: Mensch entscheidet bei Unsicherheiten
4. **Audit-Trail**: Vollständige Nachverfolgung aller Aktionen

### Transparenz
1. **Daten-Quelle**: Immer sichtbar
2. **Validierungszeitpunkt**: Aktualität anzeigen
3. **Konfidenz-Level**: Numerische Bewertung
4. **Benutzer-Entscheidungen**: Dokumentiert und nachverfolgbar

## Responsive Design

Alle Komponenten sind vollständig responsive und unterstützen:
- **Desktop**: Vollständige Funktionalität
- **Tablet**: Angepasste Layouts
- **Mobile**: Optimierte Touch-Interaktionen
- **Kollabierte Sidebar**: Tooltips und Overlays

## Performance-Optimierung

- **Lazy Loading**: Komponenten werden bei Bedarf geladen
- **Memoization**: React.memo für teure Komponenten
- **Virtualisierung**: Für lange Listen (Notifications, Chat)
- **Debouncing**: Für Such- und Eingabefelder

## Nächste Schritte

1. **Backend-Integration**: API-Endpunkte für Trust-Validierung
2. **KI-Agenten**: LangGraph-Integration für Vertrauensbewertung
3. **Audit-System**: Vollständige Nachverfolgung implementieren
4. **Benutzer-Training**: Onboarding für Trust-System
5. **Performance-Monitoring**: Trust-Level-Metriken

Diese Trust-basierte UI-Architektur stellt sicher, dass das VALEO NeuroERP-System höchste Standards an Vertrauenswürdigkeit, Transparenz und Benutzerkontrolle erfüllt. 