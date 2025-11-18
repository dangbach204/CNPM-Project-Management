"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockSubmissions, mockProjects, mockGrades } from "@/lib/mock-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useAuthStore } from "@/stores/user"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function GradingStatisticsPage() {
  const { user } = useAuthStore()

  const myProjects = user ? mockProjects.filter((p) => p.teacherId === user.id.toString()) : []
  const mySubmissions = mockSubmissions.filter((s) => myProjects.some((p) => p.id === s.projectId))
  const myGrades = mockGrades.filter((g) => mySubmissions.some((s) => s.id === g.submissionId))

  // Calculate statistics
  const totalSubmissions = mySubmissions.length
  const gradedSubmissions = myGrades.length
  const averageScore =
    myGrades.length > 0 ? Math.round((myGrades.reduce((sum, g) => sum + g.score, 0) / myGrades.length) * 10) / 10 : 0
  const highestScore = myGrades.length > 0 ? Math.max(...myGrades.map((g) => g.score)) : 0
  const lowestScore = myGrades.length > 0 ? Math.min(...myGrades.map((g) => g.score)) : 0

  // Score distribution
  const scoreRanges = [
    { range: "90-100", count: myGrades.filter((g) => g.score >= 90).length },
    { range: "80-89", count: myGrades.filter((g) => g.score >= 80 && g.score < 90).length },
    { range: "70-79", count: myGrades.filter((g) => g.score >= 70 && g.score < 80).length },
    { range: "60-69", count: myGrades.filter((g) => g.score >= 60 && g.score < 70).length },
    { range: "< 60", count: myGrades.filter((g) => g.score < 60).length },
  ]

  // Submission status
  const statusData = [
    { name: "Đã nộp", value: mySubmissions.filter((s) => s.status === "submitted").length },
    { name: "Đã xem", value: mySubmissions.filter((s) => s.status === "reviewed").length },
    { name: "Chấp nhận", value: mySubmissions.filter((s) => s.status === "approved").length },
    { name: "Từ chối", value: mySubmissions.filter((s) => s.status === "rejected").length },
  ]

  const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#ef4444"]

  ]

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Thống kê Chấm điểm</h1>
              <p className="text-muted-foreground mt-2">Phân tích chi tiết về điểm số và bài nộp</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Tổng bài nộp</p>
                  <p className="text-3xl font-bold mt-2">{totalSubmissions}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Đã chấm</p>
                  <p className="text-3xl font-bold mt-2">{gradedSubmissions}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Điểm TB</p>
                  <p className="text-3xl font-bold mt-2">{averageScore}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Cao nhất</p>
                  <p className="text-3xl font-bold mt-2">{highestScore}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Thấp nhất</p>
                  <p className="text-3xl font-bold mt-2">{lowestScore}</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Phân bố Điểm số</CardTitle>
                  <CardDescription>Số lượng bài nộp theo khoảng điểm</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scoreRanges}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
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
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Score Range Details */}
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết Khoảng Điểm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scoreRanges.map((range) => (
                    <div key={range.range} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{range.range}</p>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(range.count / Math.max(...scoreRanges.map((r) => r.count), 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="ml-4 font-semibold text-lg">{range.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      </div>
    </ProtectedRoute>
  )
}
