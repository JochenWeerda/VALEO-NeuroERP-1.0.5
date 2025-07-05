import axios from 'axios';

// Basisadresse für die API
const API_BASE_URL = '/api/v1/emergency';

// Enum-Typen
export enum EmergencyType {
  FIRE = "Feuer",
  WATER = "Wasserschaden",
  POWER_OUTAGE = "Stromausfall",
  IT_SECURITY = "IT-Sicherheitsvorfall",
  MACHINE_FAILURE = "Maschinenausfall",
  SUPPLY_CHAIN = "Lieferkettenunterbrechung",
  ENVIRONMENTAL = "Umweltvorfall",
  QUALITY_ISSUE = "Qualitätsproblem",
  PERSONNEL = "Personalausfall",
  FINANCIAL = "Finanzieller Notfall",
  OTHER = "Sonstiges"
}

export enum EmergencyStatus {
  NEW = "Neu",
  IN_PROGRESS = "In Bearbeitung",
  CONTAINED = "Eingedämmt",
  RESOLVED = "Gelöst",
  POST_ANALYSIS = "Nachanalyse",
  CLOSED = "Abgeschlossen"
}

export enum EmergencySeverity {
  LOW = "Niedrig",
  MEDIUM = "Mittel",
  HIGH = "Hoch",
  CRITICAL = "Kritisch"
}

// Neue Enum für Eskalationsstufen
export enum EscalationLevel {
  LEVEL1 = "Level 1 - Abteilungsleiter",
  LEVEL2 = "Level 2 - Bereichsleiter",
  LEVEL3 = "Level 3 - Geschäftsführung",
  LEVEL4 = "Level 4 - Externe Stellen",
  LEVEL5 = "Level 5 - Krisenstab"
}

// Typdefinitionen
export interface EmergencyCase {
  id: number;
  title: string;
  description?: string;
  emergency_type: EmergencyType;
  status: EmergencyStatus;
  severity: EmergencySeverity;
  location?: string;
  affected_areas?: string;
  potential_impact?: string;
  response_plan?: Record<string, any>;
  estimated_resolution_time?: string;
  created_at: string;
  updated_at: string;
  reported_by_id?: number;
  assigned_to_id?: number;
  resources: EmergencyResource[];
  contacts: EmergencyContact[];
  updates: EmergencyUpdate[];
  actions: EmergencyAction[];
  escalations: EmergencyEscalation[]; // Neue Eigenschaft
}

export interface EmergencyUpdate {
  id: number;
  emergency_id: number;
  update_text: string;
  created_at: string;
  created_by_id?: number;
}

export interface EmergencyAction {
  id: number;
  emergency_id: number;
  description: string;
  is_completed: boolean;
  due_date?: string;
  completed_at?: string;
  assigned_to_id?: number;
  created_at: string;
}

// Neue Interface für Eskalationen
export interface EmergencyEscalation {
  id: number;
  emergency_id: number;
  escalation_level: EscalationLevel;
  reason: string;
  escalated_at: string;
  escalated_by_id?: number;
  escalation_recipients: number[];
  acknowledgement_required: boolean;
  acknowledgement_time?: string;
  acknowledged_by_id?: number;
  resolution_notes?: string;
  resolved_at?: string;
}

export interface EmergencyResource {
  id: number;
  name: string;
  type: string;
  location?: string;
  quantity: number;
  last_checked?: string;
  next_check_due?: string;
  is_available: boolean;
  notes?: string;
}

export interface EmergencyContact {
  id: number;
  name: string;
  role?: string;
  organization?: string;
  is_external: boolean;
  phone_primary?: string;
  phone_secondary?: string;
  email?: string;
  area_of_expertise?: string;
  notes?: string;
}

export interface EmergencyPlan {
  id: number;
  name: string;
  emergency_type: EmergencyType;
  description?: string;
  steps: Record<string, any>[];
  required_resources: number[];
  required_contacts: number[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface EmergencyDrill {
  id: number;
  plan_id: number;
  date_conducted: string;
  participants: number[];
  duration_minutes?: number;
  outcome?: string;
  notes?: string;
  issues_identified?: string;
  created_at: string;
}

export interface EmergencyStats {
  total_emergencies: number;
  status_distribution: Record<string, number>;
  type_distribution: Record<string, number>;
  avg_resolution_time_hours: number;
  high_priority_open: number;
  time_period_days: number;
}

// Service-Funktionen
const emergencyApi = {
  // Notfall-Fälle
  getEmergencyCases: async (status?: EmergencyStatus, emergencyType?: EmergencyType, severity?: EmergencySeverity, activeOnly: boolean = true) => {
    let url = `${API_BASE_URL}/cases?active_only=${activeOnly}`;
    if (status) url += `&status=${status}`;
    if (emergencyType) url += `&emergency_type=${emergencyType}`;
    if (severity) url += `&severity=${severity}`;
    
    const response = await axios.get(url);
    return response.data as EmergencyCase[];
  },

  getEmergencyCase: async (emergencyId: number) => {
    const response = await axios.get(`${API_BASE_URL}/cases/${emergencyId}`);
    return response.data as EmergencyCase;
  },

  createEmergencyCase: async (emergencyData: Partial<EmergencyCase>) => {
    const response = await axios.post(`${API_BASE_URL}/cases`, emergencyData);
    return response.data as EmergencyCase;
  },

  updateEmergencyCase: async (emergencyId: number, emergencyData: Partial<EmergencyCase>) => {
    const response = await axios.put(`${API_BASE_URL}/cases/${emergencyId}`, emergencyData);
    return response.data as EmergencyCase;
  },

  closeEmergencyCase: async (emergencyId: number, resolutionNotes?: string) => {
    const url = resolutionNotes ? 
      `${API_BASE_URL}/cases/${emergencyId}/close?resolution_notes=${encodeURIComponent(resolutionNotes)}` : 
      `${API_BASE_URL}/cases/${emergencyId}/close`;
    
    const response = await axios.post(url);
    return response.data as EmergencyCase;
  },

  // Updates
  addEmergencyUpdate: async (emergencyId: number, updateText: string, createdById?: number) => {
    const response = await axios.post(`${API_BASE_URL}/cases/${emergencyId}/updates`, {
      update_text: updateText,
      created_by_id: createdById
    });
    return response.data as EmergencyUpdate;
  },

  // Aktionen
  addEmergencyAction: async (emergencyId: number, actionData: Partial<EmergencyAction>) => {
    const response = await axios.post(`${API_BASE_URL}/cases/${emergencyId}/actions`, actionData);
    return response.data as EmergencyAction;
  },

  completeAction: async (actionId: number) => {
    const response = await axios.post(`${API_BASE_URL}/actions/${actionId}/complete`);
    return response.data as EmergencyAction;
  },

  // Neue Funktionen für Eskalationen
  getEscalations: async (emergencyId?: number, level?: EscalationLevel, resolved: boolean = false) => {
    let url = `${API_BASE_URL}/escalations?resolved=${resolved}`;
    if (emergencyId) url += `&emergency_id=${emergencyId}`;
    if (level) url += `&level=${level}`;
    
    const response = await axios.get(url);
    return response.data as EmergencyEscalation[];
  },

  getEscalation: async (escalationId: number) => {
    const response = await axios.get(`${API_BASE_URL}/escalations/${escalationId}`);
    return response.data as EmergencyEscalation;
  },

  createEscalation: async (emergencyId: number, escalationData: Partial<EmergencyEscalation>) => {
    const response = await axios.post(`${API_BASE_URL}/cases/${emergencyId}/escalations`, escalationData);
    return response.data as EmergencyEscalation;
  },

  acknowledgeEscalation: async (escalationId: number, acknowledgedById?: number) => {
    const response = await axios.post(`${API_BASE_URL}/escalations/${escalationId}/acknowledge`, {
      acknowledged_by_id: acknowledgedById
    });
    return response.data as EmergencyEscalation;
  },

  resolveEscalation: async (escalationId: number, resolutionNotes: string) => {
    const response = await axios.post(`${API_BASE_URL}/escalations/${escalationId}/resolve`, {
      resolution_notes: resolutionNotes
    });
    return response.data as EmergencyEscalation;
  },

  // Notfallpläne
  getEmergencyPlans: async (emergencyType?: EmergencyType, activeOnly: boolean = true) => {
    let url = `${API_BASE_URL}/plans?active_only=${activeOnly}`;
    if (emergencyType) url += `&emergency_type=${emergencyType}`;
    
    const response = await axios.get(url);
    return response.data as EmergencyPlan[];
  },

  getEmergencyPlan: async (planId: number) => {
    const response = await axios.get(`${API_BASE_URL}/plans/${planId}`);
    return response.data as EmergencyPlan;
  },

  createEmergencyPlan: async (planData: Partial<EmergencyPlan>) => {
    const response = await axios.post(`${API_BASE_URL}/plans`, planData);
    return response.data as EmergencyPlan;
  },

  updateEmergencyPlan: async (planId: number, planData: Partial<EmergencyPlan>) => {
    const response = await axios.put(`${API_BASE_URL}/plans/${planId}`, planData);
    return response.data as EmergencyPlan;
  },

  applyPlanToEmergency: async (emergencyId: number, planId: number) => {
    const response = await axios.post(`${API_BASE_URL}/cases/${emergencyId}/apply-plan/${planId}`);
    return response.data;
  },

  // Ressourcen
  getResources: async (availableOnly: boolean = false, resourceType?: string) => {
    let url = `${API_BASE_URL}/resources?available_only=${availableOnly}`;
    if (resourceType) url += `&resource_type=${resourceType}`;
    
    const response = await axios.get(url);
    return response.data as EmergencyResource[];
  },

  getResource: async (resourceId: number) => {
    const response = await axios.get(`${API_BASE_URL}/resources/${resourceId}`);
    return response.data as EmergencyResource;
  },

  createResource: async (resourceData: Partial<EmergencyResource>) => {
    const response = await axios.post(`${API_BASE_URL}/resources`, resourceData);
    return response.data as EmergencyResource;
  },

  updateResource: async (resourceId: number, resourceData: Partial<EmergencyResource>) => {
    const response = await axios.put(`${API_BASE_URL}/resources/${resourceId}`, resourceData);
    return response.data as EmergencyResource;
  },

  // Kontakte
  getContacts: async (isExternal?: boolean, areaOfExpertise?: string) => {
    let url = `${API_BASE_URL}/contacts`;
    if (isExternal !== undefined) url += `?is_external=${isExternal}`;
    if (areaOfExpertise) url += `${isExternal !== undefined ? '&' : '?'}area_of_expertise=${areaOfExpertise}`;
    
    const response = await axios.get(url);
    return response.data as EmergencyContact[];
  },

  getContact: async (contactId: number) => {
    const response = await axios.get(`${API_BASE_URL}/contacts/${contactId}`);
    return response.data as EmergencyContact;
  },

  createContact: async (contactData: Partial<EmergencyContact>) => {
    const response = await axios.post(`${API_BASE_URL}/contacts`, contactData);
    return response.data as EmergencyContact;
  },

  updateContact: async (contactId: number, contactData: Partial<EmergencyContact>) => {
    const response = await axios.put(`${API_BASE_URL}/contacts/${contactId}`, contactData);
    return response.data as EmergencyContact;
  },

  // Statistiken
  getEmergencyStats: async (days: number = 30) => {
    const response = await axios.get(`${API_BASE_URL}/stats?days=${days}`);
    return response.data as EmergencyStats;
  },

  // Drills (Übungen)
  getDrills: async (planId?: number) => {
    let url = `${API_BASE_URL}/drills`;
    if (planId) url += `?plan_id=${planId}`;
    
    const response = await axios.get(url);
    return response.data as EmergencyDrill[];
  },

  getDrill: async (drillId: number) => {
    const response = await axios.get(`${API_BASE_URL}/drills/${drillId}`);
    return response.data as EmergencyDrill;
  },

  createDrill: async (drillData: Partial<EmergencyDrill>) => {
    const response = await axios.post(`${API_BASE_URL}/drills`, drillData);
    return response.data as EmergencyDrill;
  }
};

export default emergencyApi; 