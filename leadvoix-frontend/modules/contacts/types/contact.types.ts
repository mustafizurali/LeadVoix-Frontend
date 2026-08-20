export interface Contact {
  id: number;

  first_name: string;
  last_name: string | null;

  email: string | null;
  phone: string | null;

  company: string | null;

  status: string;

  organization_id: number;

  created_at: string;
  updated_at: string;
}

export interface CreateContactPayload {
  first_name: string;

  last_name?: string;

  email?: string;

  phone?: string;

  company?: string;
}

export interface UpdateContactPayload {
  first_name?: string;

  last_name?: string;

  email?: string;

  phone?: string;

  company?: string;

  status?: string;
}

export interface ContactListResponse {
  items: Contact[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}