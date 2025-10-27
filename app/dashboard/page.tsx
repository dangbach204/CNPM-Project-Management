"use client"

import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { redirect } from "next/navigation"
import AdminDashboard from "./admin-dashboard"
import TeacherDashboard from "./teacher-dashboard"
import StudentDashboard from "./student-dashboard"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {user.role === "admin" && <AdminDashboard />}
          {user.role === "teacher" && <TeacherDashboard />}
          {user.role === "student" && <StudentDashboard />}
        </main>
      </div>
    </div>
  )
}
