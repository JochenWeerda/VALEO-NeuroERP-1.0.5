const appData = [
  // Zeile 1 – Vertrieb & Kunden
  {
    id: 'kundenverwaltung',
    icon: 'people',
    title: 'Kundenverwaltung',
    description: 'Kundendaten & CRM',
    color: '#3F51B5',
    category: 'vertrieb'
  },
  {
    id: 'kundenstammdaten',
    icon: 'contacts',
    title: 'Kundenstammdaten',
    description: 'Erweiterte Kundendaten',
    color: '#4527A0',
    category: 'vertrieb',
    path: '/kunden',
    badge: 'Neu'
  },
  {
    id: 'cpd-konten',
    icon: 'account_balance',
    title: 'CPD-Konten',
    description: 'Kreditor-Stammdaten',
    color: '#512DA8',
    category: 'vertrieb',
    path: '/cpd-konten',
    badge: 'Neu'
  },
  {
    id: 'angebote',
    icon: 'description',
    title: 'Angebote',
    description: 'Angebote erstellen',
    color: '#5C6BC0',
    category: 'vertrieb'
  },
  {
    id: 'auftraege',
    icon: 'shopping_bag',
    title: 'Aufträge',
    description: 'Auftragsverwaltung',
    color: '#7986CB',
    category: 'vertrieb',
    badge: 3
  },
  {
    id: 'tourenplanung',
    icon: 'route',
    title: 'Tourenplanung',
    description: 'Liefertouren planen',
    color: '#9FA8DA',
    category: 'vertrieb'
  },
  {
    id: 'telefonnotizen',
    icon: 'phone',
    title: 'Telefonnotizen',
    description: 'Anrufe dokumentieren',
    color: '#C5CAE9',
    category: 'vertrieb'
  },
  {
    id: 'cross-selling',
    icon: 'add_shopping_cart',
    title: 'Cross-Selling',
    description: 'Zusatzverkäufe',
    color: '#E8EAF6',
    category: 'vertrieb'
  },

  // Zeile 2 – Einkauf & Artikel
  {
    id: 'lieferanten',
    icon: 'local_shipping',
    title: 'Lieferanten',
    description: 'Lieferantenverwaltung',
    color: '#2196F3',
    category: 'einkauf'
  },
  {
    id: 'bestellungen',
    icon: 'receipt_long',
    title: 'Bestellungen',
    description: 'Bestellverwaltung',
    color: '#42A5F5',
    category: 'einkauf',
    badge: 2
  },
  {
    id: 'artikelstammdaten',
    icon: 'inventory_2',
    title: 'Artikelstammdaten',
    description: 'Produktdatenbank',
    color: '#64B5F6',
    category: 'einkauf'
  },
  {
    id: 'preise-aktionen',
    icon: 'local_offer',
    title: 'Preise & Aktionen',
    description: 'Preisgestaltung',
    color: '#90CAF9',
    category: 'einkauf'
  },
  {
    id: 'lagerbestand',
    icon: 'inventory',
    title: 'Lagerbestand',
    description: 'Bestandsübersicht',
    color: '#BBDEFB',
    category: 'einkauf'
  },
  {
    id: 'wareneingang',
    icon: 'input',
    title: 'Wareneingang',
    description: 'Eingangskontrolle',
    color: '#E3F2FD',
    category: 'einkauf'
  },

  // Zeile 3 – Finanzen & Buchhaltung
  {
    id: 'rechnungen',
    icon: 'receipt',
    title: 'Rechnungen',
    description: 'Rechnungswesen',
    color: '#9C27B0',
    category: 'finanzen'
  },
  {
    id: 'zahlungen',
    icon: 'payments',
    title: 'Zahlungen',
    description: 'Zahlungsverwaltung',
    color: '#AB47BC',
    category: 'finanzen'
  },
  {
    id: 'mahnwesen',
    icon: 'mark_email_unread',
    title: 'Mahnwesen',
    description: 'Mahnungsmanagement',
    color: '#BA68C8',
    category: 'finanzen'
  },
  {
    id: 'kassenbuch',
    icon: 'point_of_sale',
    title: 'Kassenbuch',
    description: 'Kassenverwaltung',
    color: '#CE93D8',
    category: 'finanzen'
  },
  {
    id: 'kostenstellen',
    icon: 'account_balance',
    title: 'Kostenstellen',
    description: 'Kostenrechnung',
    color: '#E1BEE7',
    category: 'finanzen'
  },
  {
    id: 'datev-export',
    icon: 'upload_file',
    title: 'DATEV-Export',
    description: 'Buchhaltungsexport',
    color: '#F3E5F5',
    category: 'finanzen'
  },

  // Zeile 4 – Warenwirtschaft & Logistik
  {
    id: 'ladelisten',
    icon: 'list_alt',
    title: 'Ladelisten',
    description: 'Transportplanung',
    color: '#4CAF50',
    category: 'logistik'
  },
  {
    id: 'frachtabrechnung',
    icon: 'calculate',
    title: 'Frachtabrechnung',
    description: 'Transportkosten',
    color: '#66BB6A',
    category: 'logistik'
  },
  {
    id: 'lagerorte',
    icon: 'warehouse',
    title: 'Lagerorte',
    description: 'Lagerverwaltung',
    color: '#81C784',
    category: 'logistik'
  },
  {
    id: 'verpackungseinheiten',
    icon: 'category',
    title: 'Verpackungseinheiten',
    description: 'Verpackungen',
    color: '#A5D6A7',
    category: 'logistik'
  },
  {
    id: 'kommissionierung',
    icon: 'conveyor_belt',
    title: 'Kommissionierung',
    description: 'Auftragsabwicklung',
    color: '#C8E6C9',
    category: 'logistik'
  },
  {
    id: 'versandetiketten',
    icon: 'qr_code',
    title: 'Versandetiketten',
    description: 'Etikettendruck',
    color: '#E8F5E9',
    category: 'logistik'
  },

  // Zeile 5 – Fachbereiche & Rechtliches
  {
    id: 'duengemittelverwaltung',
    icon: 'agriculture',
    title: 'Düngemittelverwaltung',
    description: 'Düngerverwaltung',
    color: '#FFC107',
    category: 'fachbereiche'
  },
  {
    id: 'pflanzenschutz',
    icon: 'eco',
    title: 'Pflanzenschutz',
    description: 'Pflanzenschutzmittel',
    color: '#FFCA28',
    category: 'fachbereiche'
  },
  {
    id: 'thg-erfassung',
    icon: 'co2',
    title: 'THG-Erfassung',
    description: 'Treibhausgase',
    color: '#FFD54F',
    category: 'fachbereiche'
  },
  {
    id: 'bio-zertifikate',
    icon: 'eco',
    title: 'Bio-Zertifikate',
    description: 'Bio-Nachweise',
    color: '#FFE082',
    category: 'fachbereiche'
  },
  {
    id: 'qs-dokumentation',
    icon: 'fact_check',
    title: 'QS-Dokumentation',
    description: 'Qualitätssicherung',
    color: '#FFECB3',
    category: 'fachbereiche'
  },
  {
    id: 'produktsicherheit',
    icon: 'security',
    title: 'Produktsicherheit',
    description: 'Sicherheitsrichtlinien',
    color: '#FFF8E1',
    category: 'fachbereiche'
  },

  // Zeile 6 – Personal & Administration
  {
    id: 'mitarbeiter',
    icon: 'badge',
    title: 'Mitarbeiter',
    description: 'Personalverwaltung',
    color: '#F44336',
    category: 'personal'
  },
  {
    id: 'urlaubsverwaltung',
    icon: 'beach_access',
    title: 'Urlaubsverwaltung',
    description: 'Urlaubsplanung',
    color: '#EF5350',
    category: 'personal'
  },
  {
    id: 'arbeitszeiten',
    icon: 'schedule',
    title: 'Arbeitszeiten',
    description: 'Zeiterfassung',
    color: '#E57373',
    category: 'personal'
  },
  {
    id: 'lohnexport',
    icon: 'payments',
    title: 'Lohnexport',
    description: 'Lohndatenexport',
    color: '#EF9A9A',
    category: 'personal'
  },
  {
    id: 'aufgaben',
    icon: 'task_alt',
    title: 'Aufgaben',
    description: 'Aufgabenverwaltung',
    color: '#FFCDD2',
    category: 'personal',
    badge: 5
  },
  {
    id: 'dokumente',
    icon: 'folder',
    title: 'Dokumente',
    description: 'Dokumentenarchiv',
    color: '#FFEBEE',
    category: 'personal'
  },

  // Zeile 7 – Marketing & Auswertungen
  {
    id: 'newsletter',
    icon: 'mail',
    title: 'Newsletter',
    description: 'E-Mail-Marketing',
    color: '#00BCD4',
    category: 'marketing'
  },
  {
    id: 'kundenhistorie',
    icon: 'history',
    title: 'Kundenhistorie',
    description: 'Kundenaktivitäten',
    color: '#26C6DA',
    category: 'marketing'
  },
  {
    id: 'rueckverfolgbarkeit',
    icon: 'travel_explore',
    title: 'Rückverfolgbarkeit',
    description: 'Chargenrückverfolgung',
    color: '#4DD0E1',
    category: 'marketing'
  },
  {
    id: 'aussendienstberichte',
    icon: 'summarize',
    title: 'Außendienstberichte',
    description: 'Vertriebsberichte',
    color: '#80DEEA',
    category: 'marketing'
  },
  {
    id: 'bi-dashboard',
    icon: 'insights',
    title: 'BI-Dashboard',
    description: 'Business Intelligence',
    color: '#B2EBF2',
    category: 'marketing'
  },
  {
    id: 'kalender',
    icon: 'calendar_month',
    title: 'Kalender',
    description: 'Terminplanung',
    color: '#E0F7FA',
    category: 'marketing'
  }
];

export default appData; 