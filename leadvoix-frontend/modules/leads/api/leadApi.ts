import api from "@/lib/api/axios";
import {
  Lead,
  CreateLeadPayload,
  UpdateLeadPayload,
} from "../types/lead.types";

export const getLeads = async (): Promise<Lead[]> => {
  const response = await api.get("/leads");

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