"use client";

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants";
import { login } from "@/service/auth-service";

import { useAuthStore } from "@/stores/user";

import Cookies from "js-cookie";
import router from "next/router";
import { useState } from "react";

export function useAuth() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const handleLogin = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await login(username, password);

      const access = result?.data?.access;
      const refresh = result?.data?.refresh;

      if (!access || !refresh) {
        const msg = result.data?.message || "Đăng nhập thất bại.";
        setError(msg);
        return { success: false, message: msg };
      }

      // Set cookies first
      Cookies.set(ACCESS_TOKEN_KEY, access);
      Cookies.set(REFRESH_TOKEN_KEY, refresh);

      // Set user to store
      setUser(result?.data?.user);

      // Wait a bit for store to persist to localStorage
      await new Promise((resolve) => setTimeout(resolve, 100));

      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.message || "Đăng nhập thất bại.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    localStorage.removeItem("auth-store");
    router.push("/login");
  };
  return {
    isLoading,
    message,
    error,
    handleLogin,
    handleLogout,
  };
}
