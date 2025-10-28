"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mockSubmissions, mockProjects, mockUsers, mockGrades } from "@/lib/mock-data"
import { BarChart3, CheckCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { useAuthStore } from "@/stores/user"

export default function GradingPage() {
  const { user } = useAuthStore()

  if (!user || user.role !== "teacher") redirect("/login")

  const myProjects = user ? mockProjects.filter((p) => p.teacherId === user.id.toString()) : []
  const mySubmissions = user ? mockSubmissions.filter((s) => myProjects.some((p) => p.id === s.projectId)) : []

  const pendingSubmissions = mySubmissions.filter((s) => s.status === "submitted")
  const reviewedSubmissions = mySubmissions.filter((s) => s.status === "reviewed")
  const gradedSubmissions = mySubmissions.filter((s) => mockGrades.some((g) => g.submissionId === s.id))

  const averageScore =
    gradedSubmissions.length > 0
      ? Math.round(
          (mockGrades
            .filter((g) => gradedSubmissions.some((s) => s.id === g.submissionId))
            .reduce((sum, g) => sum + g.score, 0) /
            gradedSubmissions.length) *
            10,
        ) / 10
      : 0

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Chấm điểm</h1>
              <p className="text-muted-foreground mt-2">Quản lý và chấm điểm bài nộp của sinh viên</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Chờ chấm</p>
                      <p className="text-3xl font-bold mt-2">{pendingSubmissions.length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Đã xem</p>
                      <p className="text-3xl font-bold mt-2">{reviewedSubmissions.length}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Đã chấm</p>
                      <p className="text-3xl font-bold mt-2">{gradedSubmissions.length}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Điểm TB</p>
                      <p className="text-3xl font-bold mt-2">{averageScore}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Submissions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Chờ chấm điểm ({pendingSubmissions.length})</h2>
              {pendingSubmissions.length === 0 ? (
                <Card>
                  <CardContent className="pt-8 pb-8 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <p className="text-muted-foreground">Tất cả bài nộp đã được chấm!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {pendingSubmissions.map((submission) => {
                    const project = mockProjects.find((p) => p.id === submission.projectId)
                    const student = mockUsers.find((u) => u.id === submission.studentId)

                    return (
                      <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{submission.title}</h3>
                              <div className="grid grid-cols-3 gap-4 mt-3">
                                <div>
                                  <p className="text-sm text-muted-foreground">Sinh viên</p>
                                  <p className="font-medium">{student?.name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Đề tài</p>
                                  <p className="font-medium">{project?.title}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Ngày nộp</p>
                                  <p className="font-medium">
                                    {new Date(submission.submittedAt).toLocaleDateString("vi-VN")}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Link href={`/teacher/submissions/${submission.id}`}>
                              <Button>Chấm điểm</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Graded Submissions */}
            {gradedSubmissions.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Đã chấm ({gradedSubmissions.length})</h2>
                <div className="grid gap-4">
                  {gradedSubmissions.map((submission) => {
                    const project = mockProjects.find((p) => p.id === submission.projectId)
                    const student = mockUsers.find((u) => u.id === submission.studentId)
                    const grade = mockGrades.find((g) => g.submissionId === submission.id)

                    return (
                      <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold">{submission.title}</h3>
                              <div className="grid grid-cols-4 gap-4 mt-3">
                                <div>
                                  <p className="text-sm text-muted-foreground">Sinh viên</p>
                                  <p className="font-medium">{student?.name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Đề tài</p>
                                  <p className="font-medium">{project?.title}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Ngày chấm</p>
                                  <p className="font-medium">
                                    {grade ? new Date(grade.gradedAt).toLocaleDateString("vi-VN") : "-"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Điểm</p>
                                  <p className="font-medium text-lg text-primary">
                                    {grade ? `${grade.score}/${grade.maxScore}` : "-"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <Link href={`/teacher/submissions/${submission.id}`}>
                              <Button variant="outline">Xem lại</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
