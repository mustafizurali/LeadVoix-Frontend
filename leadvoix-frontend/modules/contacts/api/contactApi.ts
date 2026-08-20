import api from "@/lib/api/axios";

import {
  Contact,
  ContactListResponse,
  CreateContactPayload,
  UpdateContactPayload,
} from "../types/contact.types";

export const getContacts = async (
  page = 1,
  limit = 10,
  search = "",
  status?: string,
  company?: string,
  sort_by = "created_at",
  order = "desc"
): Promise<ContactListResponse> => {
  const response = await api.get("/contacts", {
    params: {
      page,
      limit,
      search,
      status,
      company,
      sort_by,
      order,
    },
  });

  return response.data;
};

export const createContact = async (
  data: CreateContactPayload
): Promise<Contact> => {
  const response = await api.post("/contacts", data);
  return response.data;
};

export const updateContact = async (
  id: number,
  data: UpdateContactPayload
): Promise<Contact> => {
  const response = await api.put(`/contacts/${id}`, data);
  return response.data;
};

export const deleteContact = async (
  id: number
): Promise<void> => {
  await api.delete(`/contacts/${id}`);
};