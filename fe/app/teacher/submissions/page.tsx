"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mockSubmissions, mockProjects, mockUsers, mockGrades } from "@/lib/mock-data"
import { FileText, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { useAuthStore } from "@/stores/user"

export default function TeacherSubmissionsPage() {
  const { user } = useAuthStore()

  if (!user || user.role !== "teacher") redirect("/login")

  const myProjects = user ? mockProjects.filter((p) => p.teacherId === user.id.toString()) : []
  const mySubmissions = user ? mockSubmissions.filter((s) => myProjects.some((p) => p.id === s.projectId)) : []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-yellow-100 text-yellow-700"
      case "reviewed":
        return "bg-blue-100 text-blue-700"
      case "approved":
        return "bg-green-100 text-green-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "submitted":
        return "Đã nộp"
      case "reviewed":
        return "Đã xem"
      case "approved":
        return "Chấp nhận"
      case "rejected":
        return "Từ chối"
      default:
        return status
    }
  }

  const pendingSubmissions = mySubmissions.filter((s) => s.status === "submitted")
  const gradedSubmissions = mySubmissions.filter((s) => mockGrades.some((g) => g.submissionId === s.id))

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Quản lý, chấm điểm</h1>
              <p className="text-muted-foreground mt-2">Quản lý và chấm điểm bài nộp của sinh viên</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tổng bài đã nộp</p>
                      <p className="text-3xl font-bold mt-2">{mySubmissions.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Chờ chấm điểm</p>
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
                      <p className="text-sm text-muted-foreground">Đã chấm</p>
                      <p className="text-3xl font-bold mt-2">{gradedSubmissions.length}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submissions List */}
            {mySubmissions.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground">Chưa có bài nộp nào</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {mySubmissions.map((submission) => {
                  const project = mockProjects.find((p) => p.id === submission.projectId)
                  const student = mockUsers.find((u) => u.id === submission.studentId)
                  const grade = mockGrades.find((g) => g.submissionId === submission.id)

                  return (
                    <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{submission.title}</h3>
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(submission.status)}`}
                              >
                                {getStatusLabel(submission.status)}
                              </span>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mb-4">
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
                              {grade && (
                                <div>
                                  <p className="text-sm text-muted-foreground">Điểm</p>
                                  <p className="font-medium text-lg text-primary">
                                    {grade.score}/{grade.maxScore}
                                  </p>
                                </div>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground">{submission.description}</p>
                          </div>

                          <Link href={`/teacher/submissions/${submission.id}`}>
                            <Button variant={grade ? "outline" : "default"}>{grade ? "Xem lại" : "Chấm điểm"}</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
