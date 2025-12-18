"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/user";
import { useState, useEffect } from "react";

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        { href: "/student/projects", label: "Đề tài hiện có", icon: BookOpen },
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
    <aside
      className={cn(
        "bg-white border-r border-gray-200 h-screen flex flex-col shadow-sm transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -right-3 top-20 z-50 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors",
          isMobile && "hidden md:flex"
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Logo */}
      <div
        className={cn(
          "border-b border-gray-200 bg-linear-to-r from-blue-50 to-indigo-50",
          isCollapsed ? "p-4" : "p-6"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "gap-3"
          )}
        >
          <img
            src="/logobk.png"
            alt="Logo Bách Khoa"
            className={cn(
              "object-contain shrink-0 transition-all duration-300",
              isCollapsed ? "w-10 h-10" : "w-12 h-12"
            )}
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-blue-700 leading-tight">
                Bách Khoa Đà Nẵng
              </h1>
              <p className="text-xs text-gray-500 mt-1">Quản lý đồ án</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full transition-all duration-200 relative",
                  isCollapsed
                    ? "justify-center px-2"
                    : "justify-start gap-3 px-4",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600 rounded-l-none hover:bg-blue-100"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-l-4 border-transparent"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "shrink-0 transition-colors",
                    isCollapsed ? "w-5 h-5" : "w-5 h-5",
                    isActive ? "text-blue-600" : "text-gray-500"
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {isActive && !isCollapsed && (
                  <div className="absolute right-2 w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div
        className={cn(
          "border-t border-gray-200 space-y-3 bg-gray-50",
          isCollapsed ? "p-3" : "p-4"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "gap-3"
          )}
        >
          <div className="relative">
            <Avatar
              className={cn(
                "ring-2 ring-blue-100 ring-offset-2 transition-all",
                isCollapsed ? "w-10 h-10" : "w-11 h-11"
              )}
            >
              <AvatarImage src={user.avatar || undefined} alt={user.fullName} />
              <AvatarFallback className="bg-linear-to-br from-blue-500 to-blue-700 text-white font-semibold">
                {user.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user.fullName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.role === "admin"
                  ? "Quản trị viên"
                  : user.role === "teacher"
                  ? "Giảng viên"
                  : "Sinh viên"}
              </p>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          className={cn(
            "w-full text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors",
            isCollapsed ? "justify-center px-2" : "justify-start gap-2"
          )}
          onClick={handleLogout}
          title={isCollapsed ? "Đăng xuất" : undefined}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && "Đăng xuất"}
        </Button>
      </div>
    </aside>
  );
}
