import api from "@/lib/api/axios";
import {
  Lead,
  LeadListResponse,
  CreateLeadPayload,
  UpdateLeadPayload, 
} from "../types/lead.types";

export const getLeads = async (
  page = 1,
  limit = 10,
  search = "",
  status?: string,
  source?: string,
  company?: string,
  sort_by = "created_at",
  order = "desc"
): Promise<LeadListResponse> => {
  const response = await api.get("/leads", {
    params: {
      page,
      limit,
      search,
      status,
      source,
      company,
      sort_by,
      order,
    },
  });

  return response.data;
};

export const createLead = async (
  data: CreateLeadPayload
): Promise<Lead> => {
  const response = await api.post("/leads", data);

  return response.data;
};

export const updateLead = async (
  id: number,
  data: UpdateLeadPayload
): Promise<Lead> => {
  const response = await api.put(`/leads/${id}`, data);

  return response.data;
};

export const deleteLead = async (
  id: number
): Promise<void> => {
  await api.delete(`/leads/${id}`);
};

export const getLeadCalls = async (
  leadId: number
) => {
  const response = await api.get(
    `/leads/${leadId}/calls`
  );

  return response.data;
};