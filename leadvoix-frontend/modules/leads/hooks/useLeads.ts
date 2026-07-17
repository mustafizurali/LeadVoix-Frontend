"use client";

import { useQuery } from "@tanstack/react-query";
import { getLeads } from "../api/leadApi";

export const useLeads = () => {
  return useQuery({
    queryKey: ["leads"],
    queryFn: getLeads,
  });
};