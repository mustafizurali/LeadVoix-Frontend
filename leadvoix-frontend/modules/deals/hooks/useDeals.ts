"use client";

import { useQuery } from "@tanstack/react-query";

import { getDeals } from "../api/dealApi";
import { DealFilters } from "../types/deal.types";

export const useDeals = (filters: DealFilters) => {
  return useQuery({
    queryKey: ["deals", filters],
    queryFn: () => getDeals(filters),
  });
};