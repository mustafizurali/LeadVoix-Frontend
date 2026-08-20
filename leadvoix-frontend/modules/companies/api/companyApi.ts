import api from "@/lib/api/axios";

import {
  Company,
  CompanyListResponse,
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "../types/company.types";

export const getCompanies = async (
  page = 1,
  limit = 10,
  search = "",
  status?: string,
  sort_by = "created_at",
  order = "desc"
): Promise<CompanyListResponse> => {
  const response = await api.get("/companies", {
    params: {
      page,
      limit,
      search,
      status,
      sort_by,
      order,
    },
  });

  return response.data;
};

export const createCompany = async (
  data: CreateCompanyPayload
): Promise<Company> => {
  const response = await api.post("/companies", data);
  return response.data;
};

export const updateCompany = async (
  id: number,
  data: UpdateCompanyPayload
): Promise<Company> => {
  const response = await api.put(`/companies/${id}`, data);
  return response.data;
};

export const deleteCompany = async (
  id: number
): Promise<void> => {
  await api.delete(`/companies/${id}`);
};