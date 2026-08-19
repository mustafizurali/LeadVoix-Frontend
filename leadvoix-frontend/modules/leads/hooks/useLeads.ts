"use client";

import { useQuery } from "@tanstack/react-query";
import { getLeads } from "../api/leadApi";

interface UseLeadsProps {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  source?: string;
  company?: string;
  sort_by?: string;
  order?: string;
}

export const useLeads = ({
  page = 1,
  limit = 10,
  search = "",
  status,
  source,
  company,
  sort_by = "created_at",
  order = "desc",
}: UseLeadsProps = {}) => {
  return useQuery({
    queryKey: [
      "leads",
      page,
      limit,
      search,
      status,
      source,
      company,
      sort_by,
      order,
    ],
    queryFn: () =>
      getLeads(
        page,
        limit,
        search,
        status,
        source,
        company,
        sort_by,
        order
      ),
  });
};