# Startseiten-Design für VALEO NeuroERP

## Ziel
Moderne, responsive, modulare Startseite für ERP/CRM/Fibu, inspiriert von Best Practices (u.a. mydb-uoat0o.ozma.org) und aktuellen UI-Frameworks.

## Tech-Stack-Empfehlung
- Next.js (React)
- shadcn/ui (Komponenten)
- TailwindCSS (Layout, Responsive)
- Zustand (State-Management)
- TanStack Table (Tabellen)
- NextAuth (Auth)
- PWA-Features

## UX-Prinzipien
- Responsive (Desktop, Tablet, Mobile)
- Sidebar-Navigation (Desktop), Bottom-Tab-Bar (Mobile)
- Cards/Grid für Module
- Floating Action Button für KI/Quick Actions
- Dark/Light Mode
- Suchleiste, User-Avatar, Benachrichtigungen

## Module auf der Startseite
- Dashboard (Home)
- CRM
- Belege
- Fibu
- Lager
- Kasse
- Waage
- BI
- Einstellungen
- KI-Assistent

## Komponentenstruktur (Beispiel)
/ui
 ├── /components
 │    ├── Sidebar.tsx
 │    ├── TopNav.tsx
 │    ├── ModuleCard.tsx
 │    ├── BottomNav.tsx
 │    ├── FAB.tsx
 │    └── AssistantButton.tsx
 ├── /modules
 │    ├── crm/
 │    │    └── KundenListe.tsx
 │    ├── fibu/
 │    │    └── BelegeErstellen.tsx
 │    └── lager/
 │         └── BestandTabelle.tsx
 ├── /pages
 │    ├── index.tsx ← Startseite
 │    └── login.tsx
 └── /lib
      └── api.ts

## Grafana-Dashboards als eigene Unterseite
- Name: System Health & Status
- Inhalt: Live-Metriken, Systemzustand, Alerts
- Verlinkung von der Startseite aus

## Mobile Inspiration
- Bottom Navigation
- Große, touchfreundliche Module
- Floating Action Button

## KI-Integration
- Sidebar- oder FAB-Button für KI-gestützte Aktionen
- Prompt-Dialoge für Workflows

---

# System Health & Status (Grafana)
- Eigene Unterseite im Portal
- Übersicht aller Systemmetriken, Health-Checks, Alerts
- Verlinkung: Sidebar oder Bottom-Tab 

---

## Fallback-Design (Archiv)

Die bisherige statische Startseite (Design-Prototyp) wird als Fallback gesichert:

- Datei: frontend/public/VALEO-final-design/index.html
- Sicherungskopie: backup/VALEO-final-design_index_fallback.html

Das Fallback kann jederzeit als statische Notfall-Startseite verwendet werden, falls das neue Portal-UI nicht verfügbar ist oder ein Rollback nötig wird. 