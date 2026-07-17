export interface Lead {
  id: number;

  first_name: string;
  last_name: string | null;

  email: string | null;
  phone: string | null;

  company: string | null;

  source: string | null;

  notes: string | null;

  status: string;

  organization_id: number;

  created_at: string;
  updated_at: string;
}

export interface CreateLeadPayload {
  first_name: string;

  last_name?: string;

  email?: string;

  phone?: string;

  company?: string;

  source?: string;

  notes?: string;
}

export interface UpdateLeadPayload {
  first_name?: string;

  last_name?: string;

  email?: string;

  phone?: string;

  company?: string;

  source?: string;

  notes?: string;

  status?: string;
}