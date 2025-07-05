import { BehaviorSubject, Subject } from 'rxjs';

export interface ChargenNotification {
  id: string;
  titel: string;
  beschreibung: string;
  chargenId: string;
  chargenNummer: string;
  prioritaet: 'niedrig' | 'mittel' | 'hoch' | 'kritisch';
  typ: 'mhd' | 'qualitaet' | 'lager' | 'rueckruf' | 'bewegung' | 'system';
  zeitstempel: string;
  gelesen: boolean;
  details?: any;
}

class ChargenNotificationService {
  private static instance: ChargenNotificationService;
  private webSocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 Sekunden

  // Observable für neue Benachrichtigungen
  private notificationSubject = new Subject<ChargenNotification>();
  public notifications$ = this.notificationSubject.asObservable();

  // BehaviorSubject für die Liste aller Benachrichtigungen
  private allNotificationsSubject = new BehaviorSubject<ChargenNotification[]>([]);
  public allNotifications$ = this.allNotificationsSubject.asObservable();

  // Indikator für die Verbindung
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  // Dummy-Benachrichtigungen für die Entwicklung
  private dummyNotifications: ChargenNotification[] = [
    {
      id: '1',
      titel: 'MHD-Überschreitung',
      beschreibung: 'Die Charge MM-2025-002 hat das Mindesthaltbarkeitsdatum überschritten.',
      chargenId: '2',
      chargenNummer: 'MM-2025-002',
      prioritaet: 'hoch',
      typ: 'mhd',
      zeitstempel: new Date().toISOString(),
      gelesen: false,
      details: {
        mhd: '2025-06-10',
        produkt: 'Maismehl',
        lagerort: 'Hauptlager'
      }
    },
    {
      id: '2',
      titel: 'Qualitätsprobleme',
      beschreibung: 'Bei der Charge MR-2025-001 wurden Qualitätsprobleme festgestellt.',
      chargenId: '4',
      chargenNummer: 'MR-2025-001',
      prioritaet: 'mittel',
      typ: 'qualitaet',
      zeitstempel: new Date(Date.now() - 3600000).toISOString(), // 1 Stunde zurück
      gelesen: false,
      details: {
        problemTyp: 'Feuchtigkeitsgehalt zu hoch',
        messwert: '18.5%',
        sollwert: 'max. 15.0%',
        produkt: 'Mineralfutter Rind'
      }
    },
    {
      id: '3',
      titel: 'Lagertemperatur außerhalb Toleranz',
      beschreibung: 'Die Lagertemperatur für Charge SF-2025-001 liegt außerhalb der Toleranz.',
      chargenId: '3',
      chargenNummer: 'SF-2025-001',
      prioritaet: 'niedrig',
      typ: 'lager',
      zeitstempel: new Date(Date.now() - 7200000).toISOString(), // 2 Stunden zurück
      gelesen: true,
      details: {
        temperatur: '26.8°C',
        sollBereich: '15.0°C - 25.0°C',
        lagerort: 'Fertigwarenlager',
        produkt: 'Schweinefutter Premium'
      }
    }
  ];

  private constructor() {
    // Im Entwicklungsmodus Dummy-Daten verwenden
    this.allNotificationsSubject.next(this.dummyNotifications);
    
    // Verbindungsstatus initial setzen
    this.connectionStatusSubject.next(false);
  }

  public static getInstance(): ChargenNotificationService {
    if (!ChargenNotificationService.instance) {
      ChargenNotificationService.instance = new ChargenNotificationService();
    }
    return ChargenNotificationService.instance;
  }

  /**
   * Verbindung zum WebSocket-Server herstellen
   * @param url Die URL des WebSocket-Servers
   */
  public connect(url: string = 'ws://localhost:8003/api/v1/chargen/notifications'): void {
    if (this.webSocket && (this.webSocket.readyState === WebSocket.OPEN || this.webSocket.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket-Verbindung besteht bereits oder wird hergestellt');
      return;
    }

    try {
      this.webSocket = new WebSocket(url);

      this.webSocket.onopen = () => {
        console.log('WebSocket-Verbindung hergestellt');
        this.reconnectAttempts = 0;
        this.connectionStatusSubject.next(true);
      };

      this.webSocket.onmessage = (event) => {
        try {
          const notification: ChargenNotification = JSON.parse(event.data);
          this.handleNewNotification(notification);
        } catch (error) {
          console.error('Fehler beim Verarbeiten der WebSocket-Nachricht:', error);
        }
      };

      this.webSocket.onerror = (error) => {
        console.error('WebSocket-Fehler:', error);
        this.connectionStatusSubject.next(false);
      };

      this.webSocket.onclose = (event) => {
        console.log(`WebSocket geschlossen: ${event.code} ${event.reason}`);
        this.connectionStatusSubject.next(false);
        this.reconnect(url);
      };
    } catch (error) {
      console.error('Fehler beim Herstellen der WebSocket-Verbindung:', error);
      this.connectionStatusSubject.next(false);
      this.reconnect(url);
    }
  }

  /**
   * Verbindung zum WebSocket-Server trennen
   */
  public disconnect(): void {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
      this.connectionStatusSubject.next(false);
    }
  }

  /**
   * Benachrichtigung als gelesen markieren
   * @param notificationId ID der Benachrichtigung
   */
  public markAsRead(notificationId: string): void {
    const currentNotifications = this.allNotificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, gelesen: true };
      }
      return notification;
    });
    this.allNotificationsSubject.next(updatedNotifications);

    // In einer echten Implementierung würde hier ein API-Aufruf stattfinden
    this.sendMarkAsReadToServer(notificationId);
  }

  /**
   * Alle Benachrichtigungen als gelesen markieren
   */
  public markAllAsRead(): void {
    const currentNotifications = this.allNotificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => {
      return { ...notification, gelesen: true };
    });
    this.allNotificationsSubject.next(updatedNotifications);

    // In einer echten Implementierung würde hier ein API-Aufruf stattfinden
    this.sendMarkAllAsReadToServer();
  }

  /**
   * Benachrichtigung löschen
   * @param notificationId ID der Benachrichtigung
   */
  public deleteNotification(notificationId: string): void {
    const currentNotifications = this.allNotificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(notification => notification.id !== notificationId);
    this.allNotificationsSubject.next(updatedNotifications);

    // In einer echten Implementierung würde hier ein API-Aufruf stattfinden
    this.sendDeleteNotificationToServer(notificationId);
  }

  /**
   * Alle Benachrichtigungen löschen
   */
  public clearAllNotifications(): void {
    this.allNotificationsSubject.next([]);

    // In einer echten Implementierung würde hier ein API-Aufruf stattfinden
    this.sendClearAllNotificationsToServer();
  }

  /**
   * Nur zu Testzwecken: Manuelle Hinzufügung einer Benachrichtigung
   * @param notification Die hinzuzufügende Benachrichtigung
   */
  public addTestNotification(notification: Partial<ChargenNotification>): void {
    const fullNotification: ChargenNotification = {
      id: `test-${Date.now()}`,
      titel: notification.titel || 'Test-Benachrichtigung',
      beschreibung: notification.beschreibung || 'Dies ist eine Test-Benachrichtigung',
      chargenId: notification.chargenId || '0',
      chargenNummer: notification.chargenNummer || 'TEST-0000',
      prioritaet: notification.prioritaet || 'niedrig',
      typ: notification.typ || 'system',
      zeitstempel: notification.zeitstempel || new Date().toISOString(),
      gelesen: notification.gelesen || false,
      details: notification.details || {}
    };

    this.handleNewNotification(fullNotification);
  }

  // Private Hilfsmethoden

  /**
   * Verarbeitung einer neuen Benachrichtigung
   * @param notification Die neue Benachrichtigung
   */
  private handleNewNotification(notification: ChargenNotification): void {
    // Füge die neue Benachrichtigung zur Liste hinzu
    const currentNotifications = this.allNotificationsSubject.value;
    this.allNotificationsSubject.next([notification, ...currentNotifications]);

    // Veröffentliche die neue Benachrichtigung für Echtzeit-Updates
    this.notificationSubject.next(notification);

    // Optional: Desktop-Benachrichtigung anzeigen
    this.showDesktopNotification(notification);
  }

  /**
   * Anzeige einer Desktop-Benachrichtigung
   * @param notification Die anzuzeigende Benachrichtigung
   */
  private showDesktopNotification(notification: ChargenNotification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = `${this.getPriorityPrefix(notification.prioritaet)} ${notification.titel}`;
      const options = {
        body: notification.beschreibung,
        icon: '/logo.png', // Pfad zum Icon
        tag: notification.id
      };
      new Notification(title, options);
    }
  }

  /**
   * Erneuter Verbindungsversuch bei Verbindungsabbruch
   * @param url Die URL des WebSocket-Servers
   */
  private reconnect(url: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Versuche erneut zu verbinden (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(url);
      }, this.reconnectInterval);
    } else {
      console.error('Maximale Anzahl an Wiederverbindungsversuchen erreicht.');
    }
  }

  /**
   * Präfix für die Priorität einer Benachrichtigung
   * @param prioritaet Die Priorität der Benachrichtigung
   * @returns Das Präfix für die Priorität
   */
  private getPriorityPrefix(prioritaet: string): string {
    switch (prioritaet) {
      case 'kritisch':
        return '‼️';
      case 'hoch':
        return '❗';
      case 'mittel':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  }

  // API-Aufrufe (Dummy-Implementierungen)

  private sendMarkAsReadToServer(notificationId: string): void {
    console.log(`API-Aufruf: Markiere Benachrichtigung ${notificationId} als gelesen`);
    // Hier würde ein tatsächlicher API-Aufruf stattfinden
  }

  private sendMarkAllAsReadToServer(): void {
    console.log('API-Aufruf: Markiere alle Benachrichtigungen als gelesen');
    // Hier würde ein tatsächlicher API-Aufruf stattfinden
  }

  private sendDeleteNotificationToServer(notificationId: string): void {
    console.log(`API-Aufruf: Lösche Benachrichtigung ${notificationId}`);
    // Hier würde ein tatsächlicher API-Aufruf stattfinden
  }

  private sendClearAllNotificationsToServer(): void {
    console.log('API-Aufruf: Lösche alle Benachrichtigungen');
    // Hier würde ein tatsächlicher API-Aufruf stattfinden
  }
}

// Singleton-Instanz exportieren
const chargenNotificationService = ChargenNotificationService.getInstance();
export default chargenNotificationService; 