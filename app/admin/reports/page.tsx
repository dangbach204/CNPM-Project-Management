"use client"

import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockUsers, mockProjects, mockSubmissions, mockGrades } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { redirect } from "next/navigation"

export default function AdminReportsPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!user || user.role !== "admin") redirect("/login")

  // Calculate statistics
  const totalUsers = mockUsers.length
  const totalTeachers = mockUsers.filter((u) => u.role === "teacher").length
  const totalStudents = mockUsers.filter((u) => u.role === "student").length
  const totalProjects = mockProjects.length
  const totalSubmissions = mockSubmissions.length
  const totalGraded = mockGrades.length

  // User distribution
  const userDistribution = [
    { name: "Quản trị viên", value: mockUsers.filter((u) => u.role === "admin").length },
    { name: "Giáo viên", value: totalTeachers },
    { name: "Sinh viên", value: totalStudents },
  ]

  // Project status distribution
  const projectStatus = [
    { name: "Mở", value: mockProjects.filter((p) => p.status === "open").length },
    { name: "Đang thực hiện", value: mockProjects.filter((p) => p.status === "in-progress").length },
    { name: "Hoàn thành", value: mockProjects.filter((p) => p.status === "completed").length },
    { name: "Lưu trữ", value: mockProjects.filter((p) => p.status === "archived").length },
  ]

  // Submission status
  const submissionStatus = [
    { name: "Đã nộp", value: mockSubmissions.filter((s) => s.status === "submitted").length },
    { name: "Đã xem", value: mockSubmissions.filter((s) => s.status === "reviewed").length },
    { name: "Chấp nhận", value: mockSubmissions.filter((s) => s.status === "approved").length },
    { name: "Từ chối", value: mockSubmissions.filter((s) => s.status === "rejected").length },
  ]

  // Average score by project
  const scoreByProject = mockProjects.map((project) => {
    const projectSubmissions = mockSubmissions.filter((s) => s.projectId === project.id)
    const projectGrades = mockGrades.filter((g) => projectSubmissions.some((s) => s.id === g.submissionId))
    const avgScore =
      projectGrades.length > 0
        ? Math.round((projectGrades.reduce((sum, g) => sum + g.score, 0) / projectGrades.length) * 10) / 10
        : 0
    return {
      name: project.title.substring(0, 15),
      score: avgScore,
    }
  })

  const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#ef4444"]

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
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Tổng người dùng</p>
                  <p className="text-3xl font-bold mt-2">{totalUsers}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Giáo viên</p>
                  <p className="text-3xl font-bold mt-2">{totalTeachers}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Sinh viên</p>
                  <p className="text-3xl font-bold mt-2">{totalStudents}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Đề tài</p>
                  <p className="text-3xl font-bold mt-2">{totalProjects}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Bài nộp</p>
                  <p className="text-3xl font-bold mt-2">{totalSubmissions}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Đã chấm</p>
                  <p className="text-3xl font-bold mt-2">{totalGraded}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Phân bố Người dùng</CardTitle>
                  <CardDescription>Số lượng người dùng theo vai trò</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {userDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Project Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Trạng thái Đề tài</CardTitle>
                  <CardDescription>Phân bố theo trạng thái</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={projectStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Submission Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Trạng thái Bài nộp</CardTitle>
                  <CardDescription>Phân bố theo trạng thái</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={submissionStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Average Score by Project */}
              <Card>
                <CardHeader>
                  <CardTitle>Điểm trung bình theo Đề tài</CardTitle>
                  <CardDescription>Điểm TB của mỗi đề tài</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={scoreByProject}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt Hoạt động</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
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

                  <div className="space-y-3">
                    <h3 className="font-semibold">Tỷ lệ Tham gia</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sinh viên</span>
                        <span className="font-medium">
                          {totalStudents > 0
                            ? Math.round(
                                (mockProjects.reduce((sum, p) => sum + p.enrolledStudents.length, 0) / totalStudents) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${
                              totalStudents > 0
                                ? (
                                    mockProjects.reduce((sum, p) => sum + p.enrolledStudents.length, 0) / totalStudents
                                  ) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
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
    </div>
  )
}
