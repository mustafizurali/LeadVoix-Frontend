"use client";

import { useQuery } from "@tanstack/react-query";
import { getContacts } from "../api/contactApi";

interface UseContactsProps {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  company?: string;
  sort_by?: string;
  order?: string;
}

export const useContacts = ({
  page = 1,
  limit = 10,
  search = "",
  status,
  company,
  sort_by = "created_at",
  order = "desc",
}: UseContactsProps = {}) => {
  return useQuery({
    queryKey: [
      "contacts",
      page,
      limit,
      search,
      status,
      company,
      sort_by,
      order,
    ],
    queryFn: () =>
      getContacts(
        page,
        limit,
        search,
        status,
        company,
        sort_by,
        order
      ),
  });
};