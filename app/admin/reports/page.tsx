"use client"

import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { mockUsers, mockProjects, mockSubmissions, mockGrades } from "@/lib/mock-data"
import { redirect } from "next/navigation"
import { useState } from "react"

export default function AdminReportsPage() {
  const { user, isLoading } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (isLoading) return null
  if (!user || user.role !== "admin") redirect("/login")

  // Calculate statistics
  const totalUsers = mockUsers.length
  const totalTeachers = mockUsers.filter((u) => u.role === "teacher").length
  const totalStudents = mockUsers.filter((u) => u.role === "student").length
  const totalProjects = mockProjects.length
  const totalSubmissions = mockSubmissions.length
  const totalGraded = mockGrades.length

  const handleCardClick = (category: string) => {
    setSelectedCategory(category)
    setIsModalOpen(true)
  }

  const getDetailData = () => {
    switch (selectedCategory) {
      case "users":
        return mockUsers
      case "teachers":
        return mockUsers.filter((u) => u.role === "teacher")
      case "students":
        return mockUsers.filter((u) => u.role === "student")
      case "projects":
        return mockProjects
      case "submissions":
        return mockSubmissions
      case "graded":
        return mockGrades
      default:
        return []
    }
  }

  const getDetailTitle = () => {
    switch (selectedCategory) {
      case "users":
        return "Danh sách Người dùng"
      case "teachers":
        return "Danh sách Giáo viên"
      case "students":
        return "Danh sách Sinh viên"
      case "projects":
        return "Danh sách Đề tài"
      case "submissions":
        return "Danh sách Bài nộp"
      case "graded":
        return "Danh sách Bài đã chấm"
      default:
        return ""
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Báo cáo Hệ thống</h1>
              <p className="text-muted-foreground mt-2">Tổng quan thống kê toàn hệ thống</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <Card
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-primary"
                onClick={() => handleCardClick("users")}
              >
                <CardContent className="pt-6 text-center ">
                  <p className="text-sm text-muted-foreground">Tổng người dùng</p>
                  <p className="text-3xl font-bold mt-2">{totalUsers}</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-primary"
                onClick={() => handleCardClick("teachers")}
              >
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Giáo viên</p>
                  <p className="text-3xl font-bold mt-2">{totalTeachers}</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-primary"
                onClick={() => handleCardClick("students")}
              >
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Sinh viên</p>
                  <p className="text-3xl font-bold mt-2">{totalStudents}</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-primary"
                onClick={() => handleCardClick("projects")}
              >
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Đề tài</p>
                  <p className="text-3xl font-bold mt-2">{totalProjects}</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-primary"
                onClick={() => handleCardClick("submissions")}
              >
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Bài nộp</p>
                  <p className="text-3xl font-bold mt-2">{totalSubmissions}</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-xl transition-all hover:scale-105 border-l-4 border-l-primary"
                onClick={() => handleCardClick("graded")}
              >
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground">Đã chấm</p>
                  <p className="text-3xl font-bold mt-2">{totalGraded}</p>
                </CardContent>
              </Card>
            </div>

            {/* Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt Hoạt động</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8 divide-y md:divide-y-0 md:divide-x">
                  <div className="space-y-3 md:pr-8 flex-1">
                    <h3 className="font-semibold">Tỷ lệ Hoàn thành</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Bài nộp</span>
                        <span className="font-medium">
                          {totalSubmissions > 0 ? Math.round((totalGraded / totalSubmissions) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${totalSubmissions > 0 ? (totalGraded / totalSubmissions) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 md:pl-8 flex-1">
                    <h3 className="font-semibold">Trung bình Điểm</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tất cả bài</span>
                        <span className="font-medium">
                          {totalGraded > 0
                            ? Math.round((mockGrades.reduce((sum, g) => sum + g.score, 0) / totalGraded) * 10) / 10
                            : 0}
                          /100
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${
                              totalGraded > 0
                                ? (mockGrades.reduce((sum, g) => sum + g.score, 0) / totalGraded / 100) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getDetailTitle()}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedCategory === "users" || selectedCategory === "teachers" || selectedCategory === "students" ? (
              <div className="space-y-3">
                {getDetailData().map((user: any) => (
                  <div key={user.id} className="p-3 border rounded-lg hover:bg-muted/50">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Vai trò: {user.role}</p>
                  </div>
                ))}
              </div>
            ) : selectedCategory === "projects" ? (
              <div className="space-y-3">
                {getDetailData().map((project: any) => (
                  <div key={project.id} className="p-3 border rounded-lg hover:bg-muted/50">
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                    <p className="text-xs text-muted-foreground">Trạng thái: {project.status}</p>
                  </div>
                ))}
              </div>
            ) : selectedCategory === "submissions" ? (
              <div className="space-y-3">
                {getDetailData().map((submission: any) => (
                  <div key={submission.id} className="p-3 border rounded-lg hover:bg-muted/50">
                    <p className="font-medium">Bài nộp ID: {submission.id}</p>
                    <p className="text-sm text-muted-foreground">Dự án ID: {submission.projectId}</p>
                    <p className="text-xs text-muted-foreground">Trạng thái: {submission.status}</p>
                  </div>
                ))}
              </div>
            ) : selectedCategory === "graded" ? (
              <div className="space-y-3">
                {getDetailData().map((grade: any) => (
                  <div key={grade.id} className="p-3 border rounded-lg hover:bg-muted/50">
                    <p className="font-medium">Điểm: {grade.score}/100</p>
                    <p className="text-sm text-muted-foreground">Bài nộp ID: {grade.submissionId}</p>
                    <p className="text-xs text-muted-foreground">Nhận xét: {grade.feedback}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
