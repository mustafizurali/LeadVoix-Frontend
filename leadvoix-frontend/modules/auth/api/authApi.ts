import api from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { LoginRequest, LoginResponse } from "../types/auth.types";

export const login = async (
  data: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, data);

  return response.data;
};