"use client";

import { useAuthVerify } from "@/hooks/useAuthVerify";
import { useAuthStore } from "@/stores/user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * Protected Route Component
 * Verifies authentication and optionally checks user role
 */
export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isVerifying, isAuthenticated } = useAuthVerify();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isVerifying && isAuthenticated && allowedRoles && user) {
      // Check if user role is allowed
      if (!allowedRoles.includes(user.role || "")) {
        router.push("/dashboard");
      }
    }
  }, [isVerifying, isAuthenticated, allowedRoles, user, router]);

  // Show loading while verifying
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

  // If not authenticated, useAuthVerify will handle redirect
  if (!isAuthenticated || !user) {
    return null;
  }

  // If role check fails, wait for redirect
  if (allowedRoles && !allowedRoles.includes(user.role || "")) {
    return null;
  }

  return <>{children}</>;
}
