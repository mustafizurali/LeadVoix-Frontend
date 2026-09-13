"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { register } from "../api/authApi";
import { SignupRequest } from "../types/auth.types";

export const useSignup = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: SignupRequest) => register(data),

    onSuccess: () => {
      router.replace("/login");
    },

    onError: (error) => {
      console.error(error);
    },
  });
};