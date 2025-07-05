/**
 * Datenstruktur für das ERP-Dashboard
 */

// CRM-Apps
const crmApps = {
  title: 'CRM',
  sections: [
    {
      title: 'Stammdaten',
      apps: [
        { icon: 'person', title: 'Kunden-Stamm\u00ADdaten', hasStammdatenBadge: true },
        { icon: 'business', title: 'Lieferanten-Stamm\u00ADdaten', hasStammdatenBadge: true },
        { icon: 'group', title: 'Kundengruppen' }
      ]
    },
    {
      title: 'Vertrieb',
      apps: [
        { icon: 'sell', title: 'Angebote' },
        { icon: 'handshake', title: 'Kontrakte' },
        { icon: 'assignment', title: 'Aufträge' }
      ]
    },
    {
      title: 'Kommunikation',
      apps: [
        { icon: 'email', title: 'E-Mail Vorlagen' },
        { icon: 'campaign', title: 'Newsletter' },
        { icon: 'forum', title: 'Kundenkommunikation' }
      ]
    }
  ]
};

// ERP-Apps
const erpApps = {
  title: 'ERP',
  sections: [
    {
      title: 'Stammdaten',
      apps: [
        { icon: 'inventory_2', title: 'Artikel-Stamm\u00ADdaten', hasStammdatenBadge: true },
        { icon: 'account_balance', title: 'Artikel-Konten', hasStammdatenBadge: true },
        { icon: 'category', title: 'Artikel-Kategorien' }
      ]
    },
    {
      title: 'Belegfolgen',
      apps: [
        { icon: 'request_page', title: 'Anfragen (Eingang)' },
        { icon: 'shopping_cart', title: 'Bestellungen (Eingang)' },
        { icon: 'inventory', title: 'Waren\u00ADeingang' },
        { icon: 'request_quote', title: 'Rechnungen (Eingang)' },
        { icon: 'sell', title: 'Angebote (Ausgang)' },
        { icon: 'assignment', title: 'Aufträge (Ausgang)' },
        { icon: 'local_shipping', title: 'Liefer\u00ADscheine' },
        { icon: 'receipt', title: 'Rechnungen (Ausgang)' }
      ]
    },
    {
      title: 'Lagerverwaltung',
      apps: [
        { icon: 'warehouse', title: 'Lager\u00ADbestand' },
        { icon: 'add_task', title: 'Wareneingang' },
        { icon: 'local_shipping', title: 'Warenausgang' },
        { icon: 'pending_actions', title: 'Inventur' }
      ]
    },
    {
      title: 'Landwirtschaft',
      apps: [
        { icon: 'scale', title: 'Waage' },
        { icon: 'grass', title: 'Getreideannahme' },
        { icon: 'science', title: 'Pflanzen\u00ADschutz- & Dünge-Datenbank' },
        { icon: 'receipt_long', title: 'Etiketten\u00ADdruck / Gefahrstoff\u00ADkennzeichnung' },
        { icon: 'eco', title: 'THG-Quote' }
      ]
    },
    {
      title: 'System',
      apps: [
        { icon: 'monitor_heart', title: 'Health-Status' }
      ]
    }
  ]
};

// FIBU-Apps
const fibuApps = {
  title: 'FIBU',
  sections: [
    {
      title: 'Stammdaten',
      apps: [
        { icon: 'account_balance_wallet', title: 'Kontenplan', hasStammdatenBadge: true },
        { icon: 'badge', title: 'Personal-Stamm\u00ADdaten', hasStammdatenBadge: true },
        { icon: 'business_center', title: 'Kosten\u00ADstellen / Kosten\u00ADträger', hasStammdatenBadge: true }
      ]
    },
    {
      title: 'Buchhaltung',
      apps: [
        { icon: 'request_quote', title: 'Rechnungs\u00ADeingang' },
        { icon: 'receipt', title: 'Rechnungs\u00ADausgang' },
        { icon: 'receipt_long', title: 'Buchungs\u00ADjournal' },
        { icon: 'payment', title: 'OP-Verwaltung' },
        { icon: 'calendar_month', title: 'Monats\u00ADübernahme' },
        { icon: 'post_add', title: 'DATEV-Export' },
        { icon: 'account_balance', title: 'UStVA' }
      ]
    },
    {
      title: 'Controlling',
      apps: [
        { icon: 'trending_up', title: 'BWA' },
        { icon: 'insert_chart', title: 'Budgetplanung' },
        { icon: 'document_scanner', title: 'Jahres\u00ADabschluss-Vor\u00ADbereitung' }
      ]
    },
    {
      title: 'Lohnbuchhaltung',
      apps: [
        { icon: 'euro', title: 'Lohnabrechnung' },
        { icon: 'rule', title: 'SV-Meldungen' },
        { icon: 'description', title: 'DEÜV-Meldungen' }
      ]
    },
    {
      title: 'Anlagenbuchhaltung',
      apps: [
        { icon: 'precision_manufacturing', title: 'Anlagenstamm' },
        { icon: 'calculate', title: 'AfA' }
      ]
    }
  ]
};

export const dashboardData = {
  columns: [crmApps, erpApps, fibuApps]
};

export default dashboardData; 