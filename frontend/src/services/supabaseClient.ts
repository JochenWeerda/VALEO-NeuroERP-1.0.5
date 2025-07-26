import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Typen für Supabase-Tabellen
export interface Database {
  public: {
    Tables: {
      nachrichten: {
        Row: {
          id: string;
          empfaenger_gruppe: string;
          betreff: string;
          inhalt: string;
          empfaenger: any[];
          gelesen_von: string[];
          bestaetigt_von: string[];
          erstellt_am: string;
          erstellt_von: string;
          gesendet_am?: string;
          archiviert_am?: string;
          status: string;
          prioritaet: string;
          kategorie: string;
          tags: string[];
          ki_generiert: boolean;
          lese_bestaetigung_erforderlich: boolean;
          archivierung_erzwingen: boolean;
          auto_protokoll_anhaengen: boolean;
          kontext?: any;
        };
        Insert: {
          id?: string;
          empfaenger_gruppe: string;
          betreff: string;
          inhalt: string;
          empfaenger: any[];
          gelesen_von?: string[];
          bestaetigt_von?: string[];
          erstellt_am?: string;
          erstellt_von: string;
          gesendet_am?: string;
          archiviert_am?: string;
          status?: string;
          prioritaet?: string;
          kategorie?: string;
          tags?: string[];
          ki_generiert?: boolean;
          lese_bestaetigung_erforderlich?: boolean;
          archivierung_erzwingen?: boolean;
          auto_protokoll_anhaengen?: boolean;
          kontext?: any;
        };
        Update: {
          id?: string;
          empfaenger_gruppe?: string;
          betreff?: string;
          inhalt?: string;
          empfaenger?: any[];
          gelesen_von?: string[];
          bestaetigt_von?: string[];
          erstellt_am?: string;
          erstellt_von?: string;
          gesendet_am?: string;
          archiviert_am?: string;
          status?: string;
          prioritaet?: string;
          kategorie?: string;
          tags?: string[];
          ki_generiert?: boolean;
          lese_bestaetigung_erforderlich?: boolean;
          archivierung_erzwingen?: boolean;
          auto_protokoll_anhaengen?: boolean;
          kontext?: any;
        };
      };
      benutzer: {
        Row: {
          id: string;
          name: string;
          email?: string;
          gruppe: string;
          rolle: string;
          aktiv: boolean;
        };
        Insert: {
          id: string;
          name: string;
          email?: string;
          gruppe: string;
          rolle: string;
          aktiv?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          gruppe?: string;
          rolle?: string;
          aktiv?: boolean;
        };
      };
      bestellungen: {
        Row: {
          id: string;
          nummer: string;
          lieferant: string;
          gesamtbetrag: number;
          status: string;
          erstellt_am: string;
        };
        Insert: {
          id?: string;
          nummer: string;
          lieferant: string;
          gesamtbetrag: number;
          status?: string;
          erstellt_am?: string;
        };
        Update: {
          id?: string;
          nummer?: string;
          lieferant?: string;
          gesamtbetrag?: number;
          status?: string;
          erstellt_am?: string;
        };
      };
      lieferungen: {
        Row: {
          id: string;
          nummer: string;
          lieferant: string;
          status: string;
          erstellt_am: string;
        };
        Insert: {
          id?: string;
          nummer: string;
          lieferant: string;
          status?: string;
          erstellt_am?: string;
        };
        Update: {
          id?: string;
          nummer?: string;
          lieferant?: string;
          status?: string;
          erstellt_am?: string;
        };
      };
      rechnungen: {
        Row: {
          id: string;
          nummer: string;
          kunde: string;
          gesamtbetrag: number;
          status: string;
          erstellt_am: string;
        };
        Insert: {
          id?: string;
          nummer: string;
          kunde: string;
          gesamtbetrag: number;
          status?: string;
          erstellt_am?: string;
        };
        Update: {
          id?: string;
          nummer?: string;
          kunde?: string;
          gesamtbetrag?: number;
          status?: string;
          erstellt_am?: string;
        };
      };
    };
  };
}

// Typisierte Supabase-Client
export const typedSupabase = supabase as any; 