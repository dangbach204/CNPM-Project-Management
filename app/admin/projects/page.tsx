"use client"

import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mockProjects, mockUsers } from "@/lib/mock-data"
import { BookOpen, Edit2, Trash2, Users } from "lucide-react"
import { redirect } from "next/navigation"

export default function AdminProjectsPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user || user.role !== "admin") redirect("/login")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-700"
      case "in-progress":
        return "bg-blue-100 text-blue-700"
      case "completed":
        return "bg-gray-100 text-gray-700"
      case "archived":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Mở"
      case "in-progress":
        return "Đang thực hiện"
      case "completed":
        return "Hoàn thành"
      case "archived":
        return "Lưu trữ"
      default:
        return status
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Quản lý Đề tài</h1>
                <p className="text-muted-foreground mt-2">Quản lý tất cả đề tài trong hệ thống</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng đề tài</p>
                      <p className="text-3xl font-bold mt-2">{mockProjects.length}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Mở</p>
                      <p className="text-3xl font-bold mt-2">
                        {mockProjects.filter((p) => p.status === "open").length}
                      </p>
                    </div>
                    <BookOpen className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Đang thực hiện</p>
                      <p className="text-3xl font-bold mt-2">
                        {mockProjects.filter((p) => p.status === "in-progress").length}
                      </p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Hoàn thành</p>
                      <p className="text-3xl font-bold mt-2">
                        {mockProjects.filter((p) => p.status === "completed").length}
                      </p>
                    </div>
                    <BookOpen className="w-8 h-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projects List */}
            <Card>
              <CardContent className="pt-6">
                {mockProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Không có đề tài nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockProjects.map((project) => {
                      const teacher = mockUsers.find((u) => u.id === project.teacherId)
                      return (
                        <div
                          key={project.id}
                          className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{project.title}</h3>
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}
                              >
                                {getStatusLabel(project.status)}
                              </span>
                            </div>

                            <p className="text-sm text-muted-foreground mb-3">{project.description}</p>

                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Giáo viên</p>
                                <p className="font-medium">{teacher?.name}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  Sinh viên
                                </p>
                                <p className="font-medium">
                                  {project.enrolledStudents.length}/{project.maxStudents}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Bắt đầu</p>
                                <p className="font-medium">{new Date(project.startDate).toLocaleDateString("vi-VN")}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Kết thúc</p>
                                <p className="font-medium">{new Date(project.endDate).toLocaleDateString("vi-VN")}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Edit2 className="w-4 h-4" />
                              Sửa
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                              Xóa
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
