import type { TrustLevel } from '../../../lib/schemas';

export type BelegType = 
  | 'wareneingang'
  | 'eingangsrechnung'
  | 'angebot'
  | 'auftrag'
  | 'lieferschein'
  | 'ausgangsrechnung'
  | 'kassenbeleg';

export interface BelegBase {
  id: string;
  belegnummer: string;
  erstellungsdatum: Date;
  status: string;
  trustLevel: TrustLevel;
  confidence?: number;
}

export interface BelegPosition {
  artikelId: string;
  artikelName: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
} 