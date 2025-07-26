import { InvoiceSummary, InvoiceFilter, InvoiceStatus } from '../types/invoices';

// Mock-Daten für E-Invoicing
const mockInvoices: InvoiceSummary[] = [
  {
    id: '1',
    invoiceId: 'INV-2024-001',
    customerName: 'Max Mustermann GmbH',
    customerEmail: 'max@mustermann.de',
    amount: 1250.00,
    status: 'paid',
    createdAt: '2024-01-15T10:30:00Z',
    dueDate: '2024-02-15T00:00:00Z',
    taxAmount: 237.50,
    totalAmount: 1487.50,
    currency: 'EUR',
    description: 'Webdesign und Entwicklung',
    items: [
      {
        id: '1',
        name: 'Webdesign',
        quantity: 1,
        unitPrice: 800.00,
        totalPrice: 800.00,
        taxRate: 19,
        taxAmount: 152.00
      },
      {
        id: '2',
        name: 'Entwicklung',
        quantity: 10,
        unitPrice: 45.00,
        totalPrice: 450.00,
        taxRate: 19,
        taxAmount: 85.50
      }
    ]
  },
  {
    id: '2',
    invoiceId: 'INV-2024-002',
    customerName: 'Anna Schmidt e.K.',
    customerEmail: 'anna@schmidt.de',
    amount: 850.00,
    status: 'open',
    createdAt: '2024-01-20T14:15:00Z',
    dueDate: '2024-02-20T00:00:00Z',
    taxAmount: 161.50,
    totalAmount: 1011.50,
    currency: 'EUR',
    description: 'Marketing Beratung',
    items: [
      {
        id: '3',
        name: 'Marketing Beratung',
        quantity: 8,
        unitPrice: 106.25,
        totalPrice: 850.00,
        taxRate: 19,
        taxAmount: 161.50
      }
    ]
  },
  {
    id: '3',
    invoiceId: 'INV-2024-003',
    customerName: 'Tech Solutions AG',
    customerEmail: 'info@techsolutions.de',
    amount: 2200.00,
    status: 'overdue',
    createdAt: '2024-01-10T09:00:00Z',
    dueDate: '2024-02-10T00:00:00Z',
    taxAmount: 418.00,
    totalAmount: 2618.00,
    currency: 'EUR',
    description: 'Software-Entwicklung',
    items: [
      {
        id: '4',
        name: 'Software-Entwicklung',
        quantity: 20,
        unitPrice: 110.00,
        totalPrice: 2200.00,
        taxRate: 19,
        taxAmount: 418.00
      }
    ]
  }
];

export class EInvoicingApi {
  /**
   * Lädt alle Rechnungen basierend auf den Filtern
   */
  static async getInvoices(filter: InvoiceFilter): Promise<InvoiceSummary[]> {
    // Simuliere API-Verzögerung
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredInvoices = [...mockInvoices];

    // Filter nach Status
    if (filter.status) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === filter.status);
    }

    // Filter nach Datum
    if (filter.startDate && filter.endDate) {
      filteredInvoices = filteredInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.createdAt);
        const startDate = new Date(filter.startDate!);
        const endDate = new Date(filter.endDate!);
        return invoiceDate >= startDate && invoiceDate <= endDate;
      });
    }

    // Filter nach Suchbegriff
    if (filter.searchTerm) {
      const searchTerm = filter.searchTerm.toLowerCase();
      filteredInvoices = filteredInvoices.filter(invoice =>
        invoice.customerName.toLowerCase().includes(searchTerm) ||
        invoice.invoiceId.toLowerCase().includes(searchTerm) ||
        invoice.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter nach Betrag
    if (filter.minAmount) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.amount >= filter.minAmount!);
    }
    if (filter.maxAmount) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.amount <= filter.maxAmount!);
    }

    return filteredInvoices;
  }

  /**
   * Lädt eine einzelne Rechnung
   */
  static async getInvoice(id: string): Promise<InvoiceSummary | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockInvoices.find(invoice => invoice.id === id) || null;
  }

  /**
   * Erstellt eine neue Rechnung
   */
  static async createInvoice(invoiceData: Partial<InvoiceSummary>): Promise<InvoiceSummary> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newInvoice: InvoiceSummary = {
      id: Date.now().toString(),
      invoiceId: `INV-2024-${String(mockInvoices.length + 1).padStart(3, '0')}`,
      customerName: invoiceData.customerName || '',
      customerEmail: invoiceData.customerEmail || '',
      amount: invoiceData.amount || 0,
      status: 'open',
      createdAt: new Date().toISOString(),
      dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      taxAmount: invoiceData.taxAmount || 0,
      totalAmount: invoiceData.totalAmount || 0,
      currency: invoiceData.currency || 'EUR',
      description: invoiceData.description || '',
      items: invoiceData.items || []
    };

    mockInvoices.push(newInvoice);
    return newInvoice;
  }

  /**
   * Aktualisiert eine Rechnung
   */
  static async updateInvoice(id: string, invoiceData: Partial<InvoiceSummary>): Promise<InvoiceSummary> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const index = mockInvoices.findIndex(invoice => invoice.id === id);
    if (index === -1) {
      throw new Error('Rechnung nicht gefunden');
    }

    mockInvoices[index] = { ...mockInvoices[index], ...invoiceData };
    return mockInvoices[index];
  }

  /**
   * Löscht eine Rechnung
   */
  static async deleteInvoice(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockInvoices.findIndex(invoice => invoice.id === id);
    if (index === -1) {
      throw new Error('Rechnung nicht gefunden');
    }

    mockInvoices.splice(index, 1);
  }

  /**
   * Lädt eine Rechnung als PDF herunter
   */
  static async downloadInvoice(id: string): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const invoice = mockInvoices.find(inv => inv.id === id);
    if (!invoice) {
      throw new Error('Rechnung nicht gefunden');
    }

    // Simuliere PDF-Generierung
    const pdfContent = `
      Rechnung ${invoice.invoiceId}
      
      Kunde: ${invoice.customerName}
      E-Mail: ${invoice.customerEmail}
      
      Betrag: ${invoice.totalAmount} ${invoice.currency}
      Status: ${invoice.status}
      
      Erstellt: ${invoice.createdAt}
      Fällig: ${invoice.dueDate}
    `;

    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * Sendet eine Rechnung per E-Mail
   */
  static async sendInvoice(id: string, email?: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const invoice = mockInvoices.find(inv => inv.id === id);
    if (!invoice) {
      throw new Error('Rechnung nicht gefunden');
    }

    console.log(`Rechnung ${invoice.invoiceId} wurde an ${email || invoice.customerEmail} gesendet`);
  }

  /**
   * Markiert eine Rechnung als bezahlt
   */
  static async markAsPaid(id: string): Promise<InvoiceSummary> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockInvoices.findIndex(invoice => invoice.id === id);
    if (index === -1) {
      throw new Error('Rechnung nicht gefunden');
    }

    mockInvoices[index].status = 'paid';
    return mockInvoices[index];
  }

  /**
   * Lädt Statistiken
   */
  static async getStatistics(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const totalInvoices = mockInvoices.length;
    const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidInvoices = mockInvoices.filter(inv => inv.status === 'paid').length;
    const openInvoices = mockInvoices.filter(inv => inv.status === 'open').length;
    const overdueInvoices = mockInvoices.filter(inv => inv.status === 'overdue').length;

    return {
      totalInvoices,
      totalAmount,
      paidInvoices,
      openInvoices,
      overdueInvoices,
      averageAmount: totalInvoices > 0 ? totalAmount / totalInvoices : 0
    };
  }
} 