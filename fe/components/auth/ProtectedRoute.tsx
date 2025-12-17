"use client";

import { useAuthVerify } from "@/hooks/useAuthVerify";
import { useAuthStore } from "@/stores/user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isVerifying, isAuthenticated } = useAuthVerify();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isVerifying && isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.role || "")) {
        router.push("/dashboard");
      }
    }
  }, [isVerifying, isAuthenticated, allowedRoles, user, router]);

  if (isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role || "")) {
    return null;
  }

  return <>{children}</>;
}
