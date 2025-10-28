"use client"


import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { redirect } from "next/navigation"
import AdminDashboard from "./admin-dashboard"
import TeacherDashboard from "./teacher-dashboard"
import StudentDashboard from "./student-dashboard"
import { useAuthStore } from "@/stores/user"

export default function DashboardPage() {
  const { user } = useAuthStore();

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
