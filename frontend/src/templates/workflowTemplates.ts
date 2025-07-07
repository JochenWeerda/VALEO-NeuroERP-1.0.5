export const workflowTemplates = [
  {
    label: 'Rechnungsfreigabe',
    json: {
      name: 'Rechnungsfreigabe',
      description: 'Beispiel-Workflow für die Freigabe einer Rechnung',
      steps: [
        { name: 'start', type: 'noop', config: {}, dependencies: [] },
        { name: 'prüfung_betrag', type: 'decision', config: { grenze: 1000 }, dependencies: ['start'] },
        { name: 'freigabe_teamleiter', type: 'approval', config: {}, dependencies: ['prüfung_betrag'] },
        { name: 'freigabe_buchhaltung', type: 'approval', config: {}, dependencies: ['freigabe_teamleiter'] },
        { name: 'abschluss', type: 'noop', config: {}, dependencies: ['freigabe_buchhaltung'] }
      ],
      config: {}
    }
  },
  {
    label: 'Urlaubsantrag',
    json: {
      name: 'Urlaubsantrag',
      description: 'Genehmigungsprozess für einen Urlaubsantrag',
      steps: [
        { name: 'start', type: 'noop', config: {}, dependencies: [] },
        { name: 'prüfung_vertretung', type: 'decision', config: {}, dependencies: ['start'] },
        { name: 'freigabe_teamleiter', type: 'approval', config: {}, dependencies: ['prüfung_vertretung'] },
        { name: 'freigabe_personalabteilung', type: 'approval', config: {}, dependencies: ['freigabe_teamleiter'] },
        { name: 'abschluss', type: 'noop', config: {}, dependencies: ['freigabe_personalabteilung'] }
      ],
      config: {}
    }
  },
  {
    label: 'Getreideannahme',
    json: {
      name: 'Getreideannahme',
      description: 'Workflow für die Annahme und Qualitätsprüfung von Getreide',
      steps: [
        { name: 'start', type: 'noop', config: {}, dependencies: [] },
        { name: 'verwiegung', type: 'operation', config: {}, dependencies: ['start'] },
        { name: 'qualitätsprüfung', type: 'inspection', config: {}, dependencies: ['verwiegung'] },
        { name: 'freigabe_lagerung', type: 'decision', config: {}, dependencies: ['qualitätsprüfung'] },
        { name: 'einlagerung', type: 'operation', config: {}, dependencies: ['freigabe_lagerung'] },
        { name: 'abschluss', type: 'noop', config: {}, dependencies: ['einlagerung'] }
      ],
      config: {}
    }
  },
  {
    label: 'Gefahrgut-Handling',
    json: {
      name: 'Gefahrgut-Handling',
      description: 'Workflow für die Annahme und Freigabe von Gefahrgut',
      steps: [
        { name: 'start', type: 'noop', config: {}, dependencies: [] },
        { name: 'prüfung_kennzeichnung', type: 'inspection', config: {}, dependencies: ['start'] },
        { name: 'prüfung_dokumente', type: 'inspection', config: {}, dependencies: ['prüfung_kennzeichnung'] },
        { name: 'freigabe_sicherheitsbeauftragter', type: 'approval', config: {}, dependencies: ['prüfung_dokumente'] },
        { name: 'einlagerung', type: 'operation', config: {}, dependencies: ['freigabe_sicherheitsbeauftragter'] },
        { name: 'abschluss', type: 'noop', config: {}, dependencies: ['einlagerung'] }
      ],
      config: {}
    }
  },
  {
    label: 'Wiegeschein',
    json: {
      name: 'Wiegeschein',
      description: 'Standardprozess für Wiegescheine im Landhandel',
      steps: [
        { name: 'Anmeldung', type: 'noop', config: {}, dependencies: [] },
        { name: 'Wiegung 1', type: 'operation', config: {}, dependencies: ['Anmeldung'] },
        { name: 'Beladung/Entladung', type: 'operation', config: {}, dependencies: ['Wiegung 1'] },
        { name: 'Wiegung 2', type: 'operation', config: {}, dependencies: ['Beladung/Entladung'] },
        { name: 'Wiegeschein erstellen', type: 'operation', config: {}, dependencies: ['Wiegung 2'] },
        { name: 'Abschluss', type: 'noop', config: {}, dependencies: ['Wiegeschein erstellen'] }
      ],
      config: {}
    }
  },
  {
    label: 'Dokumentenprüfung KI',
    json: {
      name: 'Dokumentenprüfung KI',
      description: 'Workflow für automatisierte Dokumentenprüfung mit KI',
      steps: [
        { name: 'Upload', type: 'noop', config: {}, dependencies: [] },
        { name: 'OCR', type: 'operation', config: {}, dependencies: ['Upload'] },
        { name: 'KI-Prüfung', type: 'inspection', config: {}, dependencies: ['OCR'] },
        { name: 'Freigabe', type: 'approval', config: {}, dependencies: ['KI-Prüfung'] },
        { name: 'Archivierung', type: 'operation', config: {}, dependencies: ['Freigabe'] },
        { name: 'Abschluss', type: 'noop', config: {}, dependencies: ['Archivierung'] }
      ],
      config: {}
    }
  },
  {
    label: 'Eskalation',
    json: {
      name: 'Eskalation',
      description: 'Automatischer Eskalationsprozess bei Fristüberschreitung',
      steps: [
        { name: 'Start', type: 'noop', config: {}, dependencies: [] },
        { name: 'Fristüberwachung', type: 'operation', config: {}, dependencies: ['Start'] },
        { name: 'Frist überschritten?', type: 'decision', config: {}, dependencies: ['Fristüberwachung'] },
        { name: 'Benachrichtigung', type: 'operation', config: {}, dependencies: ['Frist überschritten?'] },
        { name: 'Eskalation', type: 'approval', config: {}, dependencies: ['Benachrichtigung'] },
        { name: 'Abschluss', type: 'noop', config: {}, dependencies: ['Eskalation'] }
      ],
      config: {}
    }
  }
]; 