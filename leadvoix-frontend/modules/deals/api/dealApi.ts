import api from "@/lib/api/axios";

import {
  Deal,
  DealFilters,
  DealListResponse,
  DealPayload,
} from "../types/deal.types";

/* ================================
   DEALS
================================ */

export const getDeals = async (
  filters: DealFilters
): Promise<DealListResponse> => {
  const response = await api.get("/deals/", {
    params: {
      ...filters,
      search: filters.search || undefined,
    },
  });

  return response.data;
};

export const createDeal = async (
  data: DealPayload
): Promise<Deal> => {
  const response = await api.post("/deals/", data);

  return response.data;
};

export const updateDeal = async (
  id: number,
  data: Partial<DealPayload>
): Promise<Deal> => {
  const response = await api.put(`/deals/${id}`, data);

  return response.data;
};

export const deleteDeal = async (
  id: number
): Promise<void> => {
  await api.delete(`/deals/${id}`);
};