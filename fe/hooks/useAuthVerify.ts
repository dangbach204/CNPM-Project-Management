"use client";

import { ACCESS_TOKEN_KEY } from "@/constants";
import { useAuthStore } from "@/stores/user";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Hook to verify authentication status
 * Checks if user has valid token, otherwise redirects to login
 */
export function useAuthVerify() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAuth = () => {
      const accessToken = Cookies.get(ACCESS_TOKEN_KEY);

      // If no access token, logout and redirect
      if (!accessToken) {
        logout();
        Cookies.remove(ACCESS_TOKEN_KEY);
        localStorage.removeItem("auth-store");
        router.push("/login");
        setIsAuthenticated(false);
        setIsVerifying(false);
        return;
      }

      // If has token but no user, wait a bit for store to hydrate
      if (!user) {
        // Give store time to hydrate from localStorage
        const timeoutId = setTimeout(() => {
          // Check again after delay
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

      // User exists and has token
      setIsAuthenticated(true);
      setIsVerifying(false);
    };

    verifyAuth();
  }, [user, router, logout]);

  return { isVerifying, isAuthenticated };
}
