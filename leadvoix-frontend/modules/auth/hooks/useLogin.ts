import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { login } from "../api/authApi";
import { useAuthStore } from "../store/authStore";

import { tokenStorage } from "@/lib/api/tokenStorage";

export const useLogin = () => {
  const router = useRouter();

  const setAccessToken = useAuthStore(
    (state) => state.setAccessToken
  );

  return useMutation({
    mutationFn: login,

    onSuccess: (data) => {
      tokenStorage.setToken(data.access_token);

      setAccessToken(data.access_token);

      router.push("/dashboard");
    },
  });
};