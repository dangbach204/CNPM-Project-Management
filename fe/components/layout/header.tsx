"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/user";
import { NotificationBell } from "@/components/admin/NotificationBell";

export function Header() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <header className="bg-background border-b border-border h-16 flex items-center justify-between px-6">
      <div></div>
      <div className="flex items-center gap-4">
        {user.role === "admin" || user.role === "student" || user.role === "teacher" ? (
          <NotificationBell />
        ) : (
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
        )}
      </div>
    </header>
  );
}
