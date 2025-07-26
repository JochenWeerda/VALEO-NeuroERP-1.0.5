// CRM Service für VALEO NeuroERP
import { Customer, ContactPerson, CustomerFilter, ContactPersonFilter, ContactPersonFormData, mapFormDataToApiContact, ContactRole, ContactPermission, CustomerSegment } from '../types/crm';

// Mock-Daten für Kontaktpersonen
const mockContactPersons: ContactPerson[] = [
  {
    id: '1',
    customerId: 'customer-1',
    salutation: 'Herr',
    firstName: 'Max',
    lastName: 'Mustermann',
    position: 'Geschäftsführer',
    department: 'Geschäftsleitung',
    phone1: '+49 123 456789',
    phone2: '+49 123 456788',
    email: 'max.mustermann@example.com',
    mobile: '+49 170 123456',
    whatsapp: '+49 170 123456',
    skype: 'max.mustermann',
    linkedin: 'max-mustermann',
    website: 'www.example.com',
    isMainContact: true,
    isActive: true,
          role: ContactRole.DECISION_MAKER,
      permissions: [ContactPermission.VIEW_ORDERS, ContactPermission.PLACE_ORDERS, ContactPermission.VIEW_INVOICES],
    notes: 'Hauptansprechpartner für alle geschäftlichen Angelegenheiten',
    tags: ['geschäftsführer', 'entscheider'],
    contactSchedule: {
      monday: { available: true, startTime: '09:00', endTime: '17:00', notes: '' },
      tuesday: { available: true, startTime: '09:00', endTime: '17:00', notes: '' },
      wednesday: { available: true, startTime: '09:00', endTime: '17:00', notes: '' },
      thursday: { available: true, startTime: '09:00', endTime: '17:00', notes: '' },
      friday: { available: true, startTime: '09:00', endTime: '16:00', notes: 'Freitag früher Schluss' },
      saturday: { available: false, startTime: '', endTime: '', notes: 'Wochenende' },
      sunday: { available: false, startTime: '', endTime: '', notes: 'Wochenende' }
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    lastContactDate: '2024-01-20T14:30:00Z',
    createdBy: 'system'
  },
  {
    id: '2',
    customerId: 'customer-1',
    salutation: 'Frau',
    firstName: 'Anna',
    lastName: 'Schmidt',
    position: 'Einkaufsleiterin',
    department: 'Einkauf',
    phone1: '+49 123 456787',
    email: 'anna.schmidt@example.com',
    mobile: '+49 170 123457',
    isMainContact: false,
    isActive: true,
          role: ContactRole.INFLUENCER,
      permissions: [ContactPermission.VIEW_ORDERS, ContactPermission.VIEW_INVOICES],
    notes: 'Zuständig für alle Einkaufsangelegenheiten',
    tags: ['einkauf', 'beeinflusser'],
    contactSchedule: {
      monday: { available: true, startTime: '08:00', endTime: '16:00', notes: '' },
      tuesday: { available: true, startTime: '08:00', endTime: '16:00', notes: '' },
      wednesday: { available: true, startTime: '08:00', endTime: '16:00', notes: '' },
      thursday: { available: true, startTime: '08:00', endTime: '16:00', notes: '' },
      friday: { available: true, startTime: '08:00', endTime: '15:00', notes: 'Freitag früher Schluss' },
      saturday: { available: false, startTime: '', endTime: '', notes: 'Wochenende' },
      sunday: { available: false, startTime: '', endTime: '', notes: 'Wochenende' }
    },
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z',
    lastContactDate: '2024-01-19T09:15:00Z',
    createdBy: 'system'
  }
];

// Mock-Daten für Kunden
const mockCustomers: Customer[] = [
  {
    id: 'customer-1',
    customerNumber: 'CUST-001',
    debtorAccount: '1200',
    customerGroup: 'Premium',
    salesRep: 'Vertriebsmitarbeiter 1',
    dispatcher: 'Disponent 1',
    creditLimit: 50000,
    name: 'Musterfirma GmbH',
    address: {
      street: 'Musterstraße 123',
      zipCode: '12345',
      city: 'Musterstadt',
      country: 'Deutschland'
    },
    phone: '+49 123 456789',
    email: 'info@musterfirma.de',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    totalRevenue: 150000,
    openInvoices: 3,
    creditUsed: 25000,
    paymentTerms: '30 Tage netto',
          customerSegment: CustomerSegment.PREMIUM,
    riskScore: 2,
    priority: 'high'
  }
];

class CRMService {
  // Kontaktpersonen-Methoden
  async getContactPersons(customerId: string, filter?: ContactPersonFilter): Promise<ContactPerson[]> {
    // Simuliere API-Verzögerung
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let contacts = mockContactPersons.filter(contact => contact.customerId === customerId);
    
    // Filter anwenden
    if (filter) {
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        contacts = contacts.filter(contact => 
          contact.firstName.toLowerCase().includes(searchTerm) ||
          contact.lastName.toLowerCase().includes(searchTerm) ||
          contact.position.toLowerCase().includes(searchTerm) ||
          contact.department?.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filter.isMainContact !== undefined) {
        contacts = contacts.filter(contact => contact.isMainContact === filter.isMainContact);
      }
      
      if (filter.isActive !== undefined) {
        contacts = contacts.filter(contact => contact.isActive === filter.isActive);
      }
      
      if (filter.role) {
        contacts = contacts.filter(contact => contact.role === filter.role);
      }
    }
    
    return contacts;
  }

  async getContactPersonById(id: string): Promise<ContactPerson | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockContactPersons.find(contact => contact.id === id) || null;
  }

  async createContactPerson(formData: ContactPersonFormData): Promise<ContactPerson> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newContact: ContactPerson = {
      id: `contact-${Date.now()}`,
      customerId: 'customer-1', // In der echten Implementierung würde dies aus dem Kontext kommen
      salutation: formData.salutation,
      firstName: formData.firstName,
      lastName: formData.lastName,
      position: formData.position,
      department: formData.department,
      birthDate: formData.birthDate,
      phone1: formData.phone1,
      phone2: formData.phone2,
      fax: formData.fax,
      email: formData.email,
      mobile: formData.mobile,
      whatsapp: formData.whatsapp,
      skype: formData.skype,
      linkedin: formData.linkedin,
      website: formData.website,
      isMainContact: formData.isMainContact,
      isActive: formData.isActive,
      role: formData.role,
      permissions: formData.permissions,
      notes: formData.notes,
      tags: formData.tags,
      contactSchedule: formData.contactSchedule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastContactDate: undefined,
      createdBy: 'current-user'
    };
    
    mockContactPersons.push(newContact);
    return newContact;
  }

  async updateContactPerson(id: string, formData: ContactPersonFormData): Promise<ContactPerson> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockContactPersons.findIndex(contact => contact.id === id);
    if (index === -1) {
      throw new Error('Kontakt nicht gefunden');
    }
    
    const updatedContact: ContactPerson = {
      ...mockContactPersons[index],
      salutation: formData.salutation,
      firstName: formData.firstName,
      lastName: formData.lastName,
      position: formData.position,
      department: formData.department,
      birthDate: formData.birthDate,
      phone1: formData.phone1,
      phone2: formData.phone2,
      fax: formData.fax,
      email: formData.email,
      mobile: formData.mobile,
      whatsapp: formData.whatsapp,
      skype: formData.skype,
      linkedin: formData.linkedin,
      website: formData.website,
      isMainContact: formData.isMainContact,
      isActive: formData.isActive,
      role: formData.role,
      permissions: formData.permissions,
      notes: formData.notes,
      tags: formData.tags,
      contactSchedule: formData.contactSchedule,
      updatedAt: new Date().toISOString()
    };
    
    mockContactPersons[index] = updatedContact;
    return updatedContact;
  }

  async deleteContactPerson(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = mockContactPersons.findIndex(contact => contact.id === id);
    if (index === -1) {
      throw new Error('Kontakt nicht gefunden');
    }
    
    mockContactPersons.splice(index, 1);
  }

  // Kunden-Methoden
  async getCustomers(filter?: CustomerFilter): Promise<Customer[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let customers = [...mockCustomers];
    
    if (filter) {
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        customers = customers.filter(customer => 
          customer.name.toLowerCase().includes(searchTerm) ||
          customer.customerNumber.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filter.customerGroup) {
        customers = customers.filter(customer => customer.customerGroup === filter.customerGroup);
      }
      
      if (filter.status) {
        customers = customers.filter(customer => customer.status === filter.status);
      }
    }
    
    return customers;
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    // Simuliere API-Verzögerung
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCustomers.find(customer => customer.id === id) || null;
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    // Simuliere API-Verzögerung
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const customerIndex = mockCustomers.findIndex(customer => customer.id === id);
    if (customerIndex === -1) {
      throw new Error(`Kunde mit ID ${id} nicht gefunden`);
    }
    
    // Aktualisiere den Kunden
    mockCustomers[customerIndex] = {
      ...mockCustomers[customerIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return mockCustomers[customerIndex];
  }
}

export const crmService = new CRMService(); 