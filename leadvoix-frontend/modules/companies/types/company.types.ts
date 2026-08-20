export interface Company {
  id: number;
  name: string;
  domain: string | null;
  industry: string | null;
  company_size: string | null;
  website: string | null;
  notes: string | null;
  status: string;
  organization_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyPayload {
  name: string;
  domain?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  notes?: string;
}

export interface UpdateCompanyPayload {
  name?: string;
  domain?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  notes?: string;
  status?: string;
}

export interface CompanyListResponse {
  items: Company[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}