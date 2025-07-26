import { supabase } from './supabaseClient';
import type { 
  Nachricht, 
  NachrichtEntwurf, 
  Empfaenger, 
  Tagesprotokoll,
  KINachrichtenVorschlag,
  NachrichtenStatistik,
  EmpfaengerGruppe,
  NachrichtenStatus,
  NachrichtenPrioritaet
} from '../types/messaging';

export class MessagingService {
  private static instance: MessagingService;
  private performanceMetrics: Array<{ operation: string; duration: number; timestamp: Date }> = [];

  public static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  // Nachrichten erstellen und senden
  async createMessage(nachricht: NachrichtEntwurf): Promise<Nachricht> {
    const startTime = performance.now();
    
    try {
      // Empfänger basierend auf Gruppe ermitteln
      const empfaenger = await this.getEmpfaengerByGruppe(nachricht.empfaengerGruppe);
      
      // Tagesprotokoll anhängen falls gewünscht
      let inhalt = nachricht.inhalt;
      if (nachricht.autoProtokollAnhaengen) {
        const protokoll = await this.generateTagesprotokoll();
        inhalt += `\n\n--- Tagesprotokoll ---\n${protokoll.zusammenfassung}`;
      }

      const neueNachricht: Omit<Nachricht, 'id'> = {
        ...nachricht,
        empfaenger,
        gelesenVon: [],
        bestaetigtVon: [],
        erstelltAm: new Date(),
        erstelltVon: await this.getCurrentUserId(),
        status: 'gesendet',
        gesendetAm: new Date(),
        prioritaet: 'normal',
        kategorie: 'allgemein',
        tags: [],
        inhalt
      };

      const { data, error } = await supabase
        .from('nachrichten')
        .insert(neueNachricht)
        .select()
        .single();

      if (error) throw error;

      this.recordPerformanceMetric('createMessage', performance.now() - startTime);
      return data as Nachricht;

    } catch (error) {
      console.error('Fehler beim Erstellen der Nachricht:', error);
      throw error;
    }
  }

  // Nachrichten abrufen
  async getMessages(filters?: {
    status?: NachrichtenStatus;
    empfaengerGruppe?: EmpfaengerGruppe;
    erstelltVon?: string;
    limit?: number;
    offset?: number;
  }): Promise<Nachricht[]> {
    const startTime = performance.now();
    
    try {
      let query = supabase
        .from('nachrichten')
        .select('*')
        .order('erstelltAm', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.empfaengerGruppe) {
        query = query.eq('empfaengerGruppe', filters.empfaengerGruppe);
      }
      if (filters?.erstelltVon) {
        query = query.eq('erstelltVon', filters.erstelltVon);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      this.recordPerformanceMetric('getMessages', performance.now() - startTime);
      return data as Nachricht[];

    } catch (error) {
      console.error('Fehler beim Abrufen der Nachrichten:', error);
      throw error;
    }
  }

  // Nachricht als gelesen markieren
  async markAsRead(nachrichtenId: string, userId: string): Promise<void> {
    try {
      // Zuerst aktuelle Nachricht abrufen
      const { data: currentMessage, error: fetchError } = await supabase
        .from('nachrichten')
        .select('gelesenVon')
        .eq('id', nachrichtenId)
        .single();

      if (fetchError) throw fetchError;

      // Neues Array mit dem neuen Benutzer erstellen
      const updatedGelesenVon = [...(currentMessage.gelesenVon || []), userId];

      const { error } = await supabase
        .from('nachrichten')
        .update({ 
          gelesenVon: updatedGelesenVon,
          status: 'gelesen'
        })
        .eq('id', nachrichtenId);

      if (error) throw error;

    } catch (error) {
      console.error('Fehler beim Markieren als gelesen:', error);
      throw error;
    }
  }

  // Nachricht bestätigen
  async confirmMessage(nachrichtenId: string, userId: string): Promise<void> {
    try {
      // Zuerst aktuelle Nachricht abrufen
      const { data: currentMessage, error: fetchError } = await supabase
        .from('nachrichten')
        .select('bestaetigtVon')
        .eq('id', nachrichtenId)
        .single();

      if (fetchError) throw fetchError;

      // Neues Array mit dem neuen Benutzer erstellen
      const updatedBestaetigtVon = [...(currentMessage.bestaetigtVon || []), userId];

      const { error } = await supabase
        .from('nachrichten')
        .update({ 
          bestaetigtVon: updatedBestaetigtVon,
          status: 'bestaetigt'
        })
        .eq('id', nachrichtenId);

      if (error) throw error;

    } catch (error) {
      console.error('Fehler beim Bestätigen der Nachricht:', error);
      throw error;
    }
  }

  // Tagesprotokoll generieren
  async generateTagesprotokoll(): Promise<Tagesprotokoll> {
    const startTime = performance.now();
    
    try {
      const heute = new Date();
      heute.setHours(0, 0, 0, 0);

      // Bestellungen des Tages abrufen
      const { data: bestellungen } = await supabase
        .from('bestellungen')
        .select('*')
        .gte('erstellt_am', heute.toISOString());

      // Lieferungen des Tages abrufen
      const { data: lieferungen } = await supabase
        .from('lieferungen')
        .select('*')
        .gte('erstellt_am', heute.toISOString());

      // Rechnungen des Tages abrufen
      const { data: rechnungen } = await supabase
        .from('rechnungen')
        .select('*')
        .gte('erstellt_am', heute.toISOString());

      const protokoll: Tagesprotokoll = {
        id: `protokoll-${heute.toISOString().split('T')[0]}`,
        datum: heute,
        zusammenfassung: `Tagesprotokoll vom ${heute.toLocaleDateString('de-DE')}`,
        bestellungen: bestellungen?.length || 0,
        lieferungen: lieferungen?.length || 0,
        rechnungen: rechnungen?.length || 0,
        warnungen: [],
        details: []
      };

      // Details hinzufügen
      if (bestellungen) {
        bestellungen.forEach(bestellung => {
          protokoll.details.push({
            typ: 'bestellung',
            beschreibung: `Bestellung ${bestellung.nummer} - ${bestellung.lieferant}`,
            zeitpunkt: new Date(bestellung.erstellt_am),
            betrag: bestellung.gesamtbetrag,
            status: bestellung.status
          });
        });
      }

      if (lieferungen) {
        lieferungen.forEach(lieferung => {
          protokoll.details.push({
            typ: 'lieferung',
            beschreibung: `Lieferung ${lieferung.nummer} - ${lieferung.lieferant}`,
            zeitpunkt: new Date(lieferung.erstellt_am),
            status: lieferung.status
          });
        });
      }

      if (rechnungen) {
        rechnungen.forEach(rechnung => {
          protokoll.details.push({
            typ: 'rechnung',
            beschreibung: `Rechnung ${rechnung.nummer} - ${rechnung.kunde}`,
            zeitpunkt: new Date(rechnung.erstellt_am),
            betrag: rechnung.gesamtbetrag,
            status: rechnung.status
          });
        });
      }

      this.recordPerformanceMetric('generateTagesprotokoll', performance.now() - startTime);
      return protokoll;

    } catch (error) {
      console.error('Fehler beim Generieren des Tagesprotokolls:', error);
      throw error;
    }
  }

  // KI-Nachrichten-Vorschläge generieren
  async generateKINachrichtenVorschlaege(kontext?: {
    modul?: string;
    prozess?: string;
    referenzId?: string;
  }): Promise<KINachrichtenVorschlag[]> {
    const startTime = performance.now();
    
    try {
      // Hier würde die KI-Integration erfolgen
      // Für jetzt: Intelligente Vorschläge basierend auf Kontext
      const vorschlaege: KINachrichtenVorschlag[] = [];

      if (kontext?.modul === 'neuroflow') {
        vorschlaege.push({
          betreff: 'NeuroFlow System-Update',
          inhalt: 'Das NeuroFlow-System wurde erfolgreich aktualisiert. Alle Funktionen sind verfügbar.',
          empfaengerGruppe: 'neuroflow',
          prioritaet: 'normal',
          konfidenz: 0.85,
          begruendung: 'Automatische Benachrichtigung nach System-Update'
        });
      }

      if (kontext?.prozess === 'bestellung') {
        vorschlaege.push({
          betreff: 'Bestellbestätigung',
          inhalt: 'Ihre Bestellung wurde erfolgreich verarbeitet und wird vorbereitet.',
          empfaengerGruppe: 'allgemein',
          prioritaet: 'normal',
          konfidenz: 0.90,
          begruendung: 'Standard-Bestellbestätigung'
        });
      }

      // Tagesprotokoll-Vorschlag
      const jetzt = new Date();
      if (jetzt.getHours() >= 17) { // Nach 17 Uhr
        vorschlaege.push({
          betreff: `Tagesprotokoll vom ${jetzt.toLocaleDateString('de-DE')}`,
          inhalt: 'Das Tagesprotokoll wurde automatisch generiert und steht zur Verfügung.',
          empfaengerGruppe: 'allgemein',
          prioritaet: 'niedrig',
          konfidenz: 0.95,
          begruendung: 'Automatische Tagesprotokoll-Benachrichtigung'
        });
      }

      this.recordPerformanceMetric('generateKINachrichtenVorschlaege', performance.now() - startTime);
      return vorschlaege;

    } catch (error) {
      console.error('Fehler beim Generieren der KI-Vorschläge:', error);
      throw error;
    }
  }

  // Empfänger nach Gruppe abrufen
  private async getEmpfaengerByGruppe(gruppe: EmpfaengerGruppe): Promise<Empfaenger[]> {
    try {
      const { data, error } = await supabase
        .from('benutzer')
        .select('id, name, email, gruppe, rolle')
        .eq('gruppe', gruppe)
        .eq('aktiv', true);

      if (error) throw error;

      return data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        gruppe: user.gruppe as EmpfaengerGruppe,
        rolle: user.rolle as any
      }));

    } catch (error) {
      console.error('Fehler beim Abrufen der Empfänger:', error);
      throw error;
    }
  }

  // Aktuelle Benutzer-ID abrufen
  private async getCurrentUserId(): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || 'system';
    } catch (error) {
      console.error('Fehler beim Abrufen der Benutzer-ID:', error);
      return 'system';
    }
  }

  // Performance-Metriken aufzeichnen
  private recordPerformanceMetric(operation: string, duration: number): void {
    this.performanceMetrics.push({
      operation,
      duration,
      timestamp: new Date()
    });

    // Nur die letzten 100 Metriken behalten
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100);
    }
  }

  // Performance-Report abrufen
  getPerformanceReport(): {
    averageResponseTime: number;
    totalOperations: number;
    slowestOperations: Array<{ operation: string; averageTime: number }>;
  } {
    const operationStats = new Map<string, number[]>();

    this.performanceMetrics.forEach(metric => {
      if (!operationStats.has(metric.operation)) {
        operationStats.set(metric.operation, []);
      }
      operationStats.get(metric.operation)!.push(metric.duration);
    });

    const slowestOperations = Array.from(operationStats.entries())
      .map(([operation, times]) => ({
        operation,
        averageTime: times.reduce((sum, time) => sum + time, 0) / times.length
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5);

    const allTimes = this.performanceMetrics.map(m => m.duration);
    const averageResponseTime = allTimes.length > 0 
      ? allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length 
      : 0;

    return {
      averageResponseTime,
      totalOperations: this.performanceMetrics.length,
      slowestOperations
    };
  }

  // Statistiken abrufen
  async getStatistics(): Promise<NachrichtenStatistik> {
    try {
      const { data: nachrichten } = await supabase
        .from('nachrichten')
        .select('status, empfaengerGruppe, kiGeneriert, erstelltAm');

      if (!nachrichten) {
        return {
          gesendet: 0,
          gelesen: 0,
          bestaetigt: 0,
          archiviert: 0,
          durchschnittlicheLesezeit: 0,
          beliebtesteEmpfaengerGruppe: 'allgemein',
          kiGenerierteNachrichten: 0
        };
      }

      const stats: NachrichtenStatistik = {
        gesendet: nachrichten.filter(n => n.status === 'gesendet').length,
        gelesen: nachrichten.filter(n => n.status === 'gelesen').length,
        bestaetigt: nachrichten.filter(n => n.status === 'bestaetigt').length,
        archiviert: nachrichten.filter(n => n.status === 'archiviert').length,
        durchschnittlicheLesezeit: 0, // Würde aus gelesenAm - gesendetAm berechnet
        beliebtesteEmpfaengerGruppe: 'allgemein',
        kiGenerierteNachrichten: nachrichten.filter(n => n.kiGeneriert).length
      };

      // Beliebte Empfängergruppe ermitteln
      const gruppenCount = new Map<string, number>();
      nachrichten.forEach(n => {
        const count = gruppenCount.get(n.empfaengerGruppe) || 0;
        gruppenCount.set(n.empfaengerGruppe, count + 1);
      });

      const beliebtesteGruppe = Array.from(gruppenCount.entries())
        .sort((a, b) => b[1] - a[1])[0];
      
      if (beliebtesteGruppe) {
        stats.beliebtesteEmpfaengerGruppe = beliebtesteGruppe[0] as EmpfaengerGruppe;
      }

      return stats;

    } catch (error) {
      console.error('Fehler beim Abrufen der Statistiken:', error);
      throw error;
    }
  }
}

// Singleton-Instanz exportieren
export const messagingService = MessagingService.getInstance(); 