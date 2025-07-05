import api from './api';
import { BelegStatus } from '../types/belegTypes';

const warenausgangService = {
  // Alle Warenausgänge abrufen
  getWarenausgaenge: async () => {
    try {
      const response = await api.get('/warenausgang');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Warenausgänge:', error);
      throw error;
    }
  },

  // Einen einzelnen Warenausgang abrufen
  getWarenausgang: async (id: string) => {
    try {
      const response = await api.get(`/warenausgang/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Abrufen des Warenausgangs ${id}:`, error);
      throw error;
    }
  },

  // Warenausgang erstellen
  createWarenausgang: async (warenausgang: any) => {
    try {
      const response = await api.post('/warenausgang', warenausgang);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Erstellen des Warenausgangs:', error);
      throw error;
    }
  },

  // Warenausgang aktualisieren
  updateWarenausgang: async (id: string, warenausgang: any) => {
    try {
      const response = await api.put(`/warenausgang/${id}`, warenausgang);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Aktualisieren des Warenausgangs ${id}:`, error);
      throw error;
    }
  },

  // Warenausgang löschen
  deleteWarenausgang: async (id: string) => {
    try {
      const response = await api.delete(`/warenausgang/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Löschen des Warenausgangs ${id}:`, error);
      throw error;
    }
  },

  // Status eines Warenausgangs ändern
  updateWarenausgangStatus: async (id: string, status: BelegStatus) => {
    try {
      const response = await api.patch(`/warenausgang/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Ändern des Status für Warenausgang ${id}:`, error);
      throw error;
    }
  },

  // Warenausgang buchen (Lagerbuchung)
  bucheLagerausgang: async (id: string) => {
    try {
      const response = await api.post(`/warenausgang/${id}/buche-lager`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Buchen des Lagerausgangs für Warenausgang ${id}:`, error);
      throw error;
    }
  },

  // Warenausgänge für einen Kunden abrufen
  getWarenausgaengeForKunde: async (kundeId: string) => {
    try {
      const response = await api.get(`/warenausgang/kunde/${kundeId}`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Abrufen der Warenausgänge für Kunde ${kundeId}:`, error);
      throw error;
    }
  },
  
  // Warenausgänge für einen Lieferschein abrufen
  getWarenausgaengeForLieferschein: async (lieferscheinId: string) => {
    try {
      const response = await api.get(`/warenausgang/lieferschein/${lieferscheinId}`);
      return response.data;
    } catch (error) {
      console.error(`Fehler beim Abrufen der Warenausgänge für Lieferschein ${lieferscheinId}:`, error);
      throw error;
    }
  },
  
  // Lagerbestand prüfen für eine Position
  pruefeLagerbestand: async (artikelId: string, lagerortId: string, menge: number) => {
    try {
      const response = await api.get(`/lager/bestand/${artikelId}/${lagerortId}/pruefen?menge=${menge}`);
      return response.data;
    } catch (error) {
      console.error(`Fehler bei der Lagerbestandsprüfung für Artikel ${artikelId}:`, error);
      throw error;
    }
  }
};

export default warenausgangService; 