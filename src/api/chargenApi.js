/**
 * API-Service für Chargen und Chargenberichte
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Holt alle Chargen vom Server
 * @returns {Promise<Array>} Liste aller Chargen
 */
export const getChargen = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chargen`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Abrufen der Chargen:', error);
    throw error;
  }
};

/**
 * Holt eine bestimmte Charge vom Server
 * @param {number} id - ID der Charge
 * @returns {Promise<Object>} Charge-Objekt
 */
export const getChargeById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chargen/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Fehler beim Abrufen der Charge ${id}:`, error);
    throw error;
  }
};

/**
 * Holt die Liste der verfügbaren Berichtstypen
 * @returns {Promise<Array>} Liste der Berichtstypen
 */
export const getBerichtTypen = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chargen/berichte`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fehler beim Abrufen der Berichtstypen:', error);
    throw error;
  }
};

/**
 * Generiert einen Bericht für eine Charge
 * @param {number} chargeId - ID der Charge
 * @param {string} berichtTyp - Typ des Berichts (z.B. "qualitaet", "rueckverfolgung", "lager")
 * @param {Object} params - Zusätzliche Parameter für den Bericht
 * @returns {Promise<Object>} Generierter Bericht
 */
export const generateBericht = async (chargeId, berichtTyp, params = {}) => {
  try {
    // Parameter als Query-String formatieren
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${API_BASE_URL}/api/chargen/${chargeId}/berichte/${berichtTyp}${queryString}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Fehler beim Generieren des Berichts für Charge ${chargeId}:`, error);
    throw error;
  }
};

/**
 * Exportiert einen Bericht als PDF (Simuliert im Demomodus)
 * @param {Object} bericht - Der Bericht, der exportiert werden soll
 * @returns {Promise<string>} URL zum heruntergeladenen PDF
 */
export const exportBerichtAsPDF = async (bericht) => {
  // In einer realen Anwendung würde hier ein API-Aufruf erfolgen,
  // der ein PDF generiert und zurückgibt
  
  // Für die Demo simulieren wir einen erfolgreichen Export
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('PDF Export für Bericht:', bericht);
      resolve(`chargenbericht_${bericht.charge_id}_${bericht.bericht_typ}.pdf`);
    }, 1000);
  });
};

/**
 * Exportiert einen Bericht als Excel (Simuliert im Demomodus)
 * @param {Object} bericht - Der Bericht, der exportiert werden soll
 * @returns {Promise<string>} URL zum heruntergeladenen Excel
 */
export const exportBerichtAsExcel = async (bericht) => {
  // In einer realen Anwendung würde hier ein API-Aufruf erfolgen,
  // der eine Excel-Datei generiert und zurückgibt
  
  // Für die Demo simulieren wir einen erfolgreichen Export
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Excel Export für Bericht:', bericht);
      resolve(`chargenbericht_${bericht.charge_id}_${bericht.bericht_typ}.xlsx`);
    }, 1000);
  });
}; 