"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store/authStore";

export default function Header() {
  const router = useRouter();

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-xl font-semibold">
          Dashboard
        </h2>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
      >
        Logout
      </button>
    </header>
  );
}