"use client";

import { ACCESS_TOKEN_KEY } from "@/constants";
import { useAuthStore } from "@/stores/user";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAuthVerify() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAuth = () => {
      const accessToken = Cookies.get(ACCESS_TOKEN_KEY);

      if (!accessToken) {
        logout();
        Cookies.remove(ACCESS_TOKEN_KEY);
        localStorage.removeItem("auth-store");
        router.push("/login");
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      if (!user) {
        const timeoutId = setTimeout(() => {
          const storedUser = localStorage.getItem("auth-store");
          if (!storedUser) {
            logout();
            Cookies.remove(ACCESS_TOKEN_KEY);
            router.push("/login");
            setIsAuthenticated(false);
          }
          setIsVerifying(false);
        }, 200);
        return () => clearTimeout(timeoutId);
      }

      setIsAuthenticated(true);
      setIsVerifying(false);
    };

    verifyAuth();
  }, [user, router, logout]);

  return { isVerifying, isAuthenticated };
}
