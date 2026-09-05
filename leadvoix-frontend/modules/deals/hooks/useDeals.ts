"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getDeals,
  createDeal,
  updateDeal,
  deleteDeal,
} from "../api/dealApi";

import type {
  Deal,
  DealFilters,
  DealListResponse,
  DealPayload,
} from "../types/deal.types";

/* ================================
   GET DEALS
================================ */

export const useDeals = (filters: DealFilters) => {
  return useQuery<DealListResponse>({
    queryKey: ["deals", filters],
    queryFn: () => getDeals(filters),
  });
};

/* ================================
   CREATE DEAL
================================ */

export const useCreateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation<Deal, Error, DealPayload>({
    mutationFn: (data) => createDeal(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["deals"],
      });
    },
  });
};

/* ================================
   UPDATE DEAL
================================ */

export const useUpdateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Deal,
    Error,
    { id: number; data: Partial<DealPayload> }
  >({
    mutationFn: ({ id, data }) => updateDeal(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["deals"],
      });
    },
  });
};

/* ================================
   DELETE DEAL
================================ */

export const useDeleteDeal = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => deleteDeal(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["deals"],
      });
    },
  });
};