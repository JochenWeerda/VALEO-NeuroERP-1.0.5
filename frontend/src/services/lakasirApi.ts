/**
 * VALEO NeuroERP - Lakasir Features API Service
 * API-Kommunikation für die adaptierten Lakasir-Features
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// API Response Interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Barcode Service
export const barcodeApi = {
  // Barcode suchen
  async lookupBarcode(barcode: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/barcode/lookup/${barcode}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  },

  // Barcode registrieren
  async registerBarcode(productId: string, barcode: string, type: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/barcode/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, barcode, type })
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  },

  // Barcode-Vorschläge
  async getSuggestions(partialBarcode: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/barcode/suggestions?q=${encodeURIComponent(partialBarcode)}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  }
};

// Stock Opname Service
export const stockOpnameApi = {
  // Alle Stock Opnames laden
  async getAll(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock-opname`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  },

  // Stock Opname erstellen
  async create(data: {
    responsible_person: string;
    date: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock-opname`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  },

  // Stock Opname Items laden
  async getItems(stockOpnameId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock-opname/${stockOpnameId}/items`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  },

  // Stock Opname Item aktualisieren
  async updateItem(itemId: string, data: {
    actual_quantity: number;
    notes?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock-opname/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  },

  // Stock Opname abschließen
  async close(stockOpnameId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock-opname/${stockOpnameId}/close`, {
        method: 'POST'
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  }
};

// Voucher Service
export const voucherApi = {
  // Alle Vouchers laden
  async getAll(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vouchers`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  },

  // Voucher erstellen
  async create(data: {
    name: string;
    code: string;
    type: 'prozent' | 'betrag' | 'versandkosten';
    nominal: number;
    kuota: number;
    start_date: string;
    expired: string;
    minimal_buying: number;
    is_active: boolean;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  },

  // Voucher aktualisieren
  async update(voucherId: string, data: {
    name: string;
    code: string;
    type: 'prozent' | 'betrag' | 'versandkosten';
    nominal: number;
    kuota: number;
    start_date: string;
    expired: string;
    minimal_buying: number;
    is_active: boolean;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vouchers/${voucherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  },

  // Voucher löschen
  async delete(voucherId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vouchers/${voucherId}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  },

  // Voucher validieren
  async validate(code: string, amount: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vouchers/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, amount })
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  },

  // Voucher verwenden
  async use(voucherId: string, data: {
    transaction_id: string;
    customer_id?: string;
    amount: number;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vouchers/${voucherId}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  },

  // Voucher-Nutzung laden
  async getUsage(voucherId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vouchers/${voucherId}/usage`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler'
      };
    }
  }
};

// Utility Functions
export const lakasirUtils = {
  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  },

  // Format date
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('de-DE');
  },

  // Generate random code
  generateCode(prefix: string = 'VALE'): string {
    return prefix + Math.random().toString(36).substr(2, 8).toUpperCase();
  },

  // Validate barcode format
  validateBarcode(barcode: string): boolean {
    // Basic validation for common barcode formats
    const patterns = {
      ean13: /^[0-9]{13}$/,
      ean8: /^[0-9]{8}$/,
      code128: /^[A-Z0-9]{1,48}$/,
      code39: /^[0-9A-Z\-\.\/\+\s]{1,43}$/,
      upc: /^[0-9]{12}$/
    };

    return Object.values(patterns).some(pattern => pattern.test(barcode));
  }
}; 