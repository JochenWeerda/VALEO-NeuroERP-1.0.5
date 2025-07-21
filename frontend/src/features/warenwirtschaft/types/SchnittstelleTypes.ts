import type { TrustLevel } from '../../../lib/schemas';

export type SchnittstelleType = 
  | 'edi'
  | 'logistik'
  | 'kasse'
  | 'l3connect'
  | 'mobile';

export interface SchnittstelleBase {
  id: string;
  name: string;
  typ: SchnittstelleType;
  aktiv: boolean;
  status: 'online' | 'offline' | 'fehler' | 'wartung';
  trustLevel: TrustLevel;
  confidence?: number;
}

export interface EdiSchnittstelle extends SchnittstelleBase {
  typ: 'edi';
  partnerId: string;
  partnerName: string;
  nachrichtenTypen: string[];
}

export interface LogistikSchnittstelle extends SchnittstelleBase {
  typ: 'logistik';
  versanddienstleister: 'UPS' | 'DHL' | 'DPD' | 'GLS' | 'custom';
  apiKey?: string;
  endpoint?: string;
}

export interface Kassenschnittstelle extends SchnittstelleBase {
  typ: 'kasse';
  kassenId: string;
  tseAktiv: boolean;
  tseSignatur: string;
} 