"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockUsers, mockProjects, mockSubmissions } from "@/lib/mock-data"
import { Users, BookOpen, FileText } from "lucide-react"

export default function AdminDashboard() {
  const teachers = mockUsers.filter((u) => u.role === "teacher")
  const students = mockUsers.filter((u) => u.role === "student")
  const totalProjects = mockProjects.length
  const totalSubmissions = mockSubmissions.length

  const stats = [
    {
      title: "Tổng Giáo viên",
      value: teachers.length,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Tổng Sinh viên",
      value: students.length,
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Tổng Đề tài",
      value: totalProjects,
      icon: BookOpen,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Bài Nộp",
      value: totalSubmissions,
      icon: FileText,
      color: "bg-orange-100 text-orange-600",
    },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Quản trị</h1>
        <p className="text-muted-foreground mt-2">Tổng quan hệ thống quản lý đề tài</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Đề tài Gần đây</CardTitle>
            <CardDescription>Các đề tài được tạo gần đây nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProjects.slice(0, 3).map((project) => (
                <div key={project.id} className="flex items-start justify-between pb-4 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.enrolledStudents.length}/{project.maxStudents} sinh viên
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      project.status === "open"
                        ? "bg-green-100 text-green-700"
                        : project.status === "in-progress"
                          ? "bg-blue-100 text-blue-700"
                          : project.status === "completed"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {project.status === "open"
                      ? "Mở"
                      : project.status === "in-progress"
                        ? "Đang thực hiện"
                        : project.status === "completed"
                          ? "Hoàn thành"
                          : "Lưu trữ"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Bài Nộp Gần đây</CardTitle>
            <CardDescription>Các bài nộp mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSubmissions.slice(0, 3).map((submission) => (
                <div key={submission.id} className="flex items-start justify-between pb-4 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{submission.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(submission.submittedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      submission.status === "submitted"
                        ? "bg-yellow-100 text-yellow-700"
                        : submission.status === "reviewed"
                          ? "bg-blue-100 text-blue-700"
                          : submission.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {submission.status === "submitted"
                      ? "Đã nộp"
                      : submission.status === "reviewed"
                        ? "Đã xem"
                        : submission.status === "approved"
                          ? "Chấp nhận"
                          : "Từ chối"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
