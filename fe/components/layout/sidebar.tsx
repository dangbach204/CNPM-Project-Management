"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  FileText,
  BarChart3,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/user";

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    Cookies.remove(ACCESS_TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    router.push("/login");
  };

  if (!user) return null;

  const getMenuItems = () => {
    const baseItems = [
      { href: "/dashboard", label: "General", icon: LayoutDashboard },
    ];

    if (user.role === "admin") {
      return [
        ...baseItems,
        { href: "/admin/users", label: "Quản lý Người dùng", icon: Users },
        { href: "/admin/projects", label: "Quản lý Đề tài", icon: BookOpen },
        { href: "/admin/reports", label: "Báo cáo", icon: BarChart3 },
        { href: "/settings", label: "Cài đặt", icon: Settings },
      ];
    }

    if (user.role === "teacher") {
      return [
        ...baseItems,
        { href: "/teacher/projects", label: "Đề tài", icon: BookOpen },
        { href: "/teacher/submissions", label: "Bài nộp", icon: FileText },
        { href: "/settings", label: "Cài đặt", icon: Settings },
      ];
    }

    if (user.role === "student") {
      return [
        ...baseItems,
        { href: "/student/projects", label: "Đề tài", icon: BookOpen },
        {
          href: "/student/my-project",
          label: "Đề tài của tôi",
          icon: FolderOpen,
        },
        {
          href: "/student/submissions",
          label: "Bài nộp của tôi",
          icon: FileText,
        },
        { href: "/settings", label: "Cài đặt", icon: Settings },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-sidebar-primary">
          Quản lý đồ án
        </h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">
          Quản lý các đề tài
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-3">
          {/* <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-10 h-10 rounded-full" /> */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user.fullName}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user.role === "admin"
                ? "Quản trị viên"
                : user.role === "teacher"
                ? "Giáo viên"
                : "Sinh viên"}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-sidebar-foreground bg-transparent"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
