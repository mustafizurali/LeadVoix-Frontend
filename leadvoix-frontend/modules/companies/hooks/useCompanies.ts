"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanies } from "../api/companyApi";

interface UseCompaniesProps {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort_by?: string;
  order?: string;
}

export const useCompanies = ({
  page = 1,
  limit = 10,
  search = "",
  status,
  sort_by = "created_at",
  order = "desc",
}: UseCompaniesProps = {}) => {
  return useQuery({
    queryKey: [
      "companies",
      page,
      limit,
      search,
      status,
      sort_by,
      order,
    ],
    queryFn: () =>
      getCompanies(
        page,
        limit,
        search,
        status,
        sort_by,
        order
      ),
  });
};