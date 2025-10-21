"use client"

import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mockProjects, mockUsers, mockSubmissions } from "@/lib/mock-data"
import { Calendar, Users, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect, useParams } from "next/navigation"

export default function ProjectDetailPage() {
  const { user, isLoading } = useAuth()
  const params = useParams()
  const projectId = params.id as string

  if (isLoading) return null
  if (!user || user.role !== "student") redirect("/login")

  const project = mockProjects.find((p) => p.id === projectId)
  if (!project) redirect("/student/projects")

  const teacher = mockUsers.find((u) => u.id === project.teacherId)
  const isEnrolled = project.enrolledStudents.includes(user.id)
  const studentSubmissions = mockSubmissions.filter((s) => s.projectId === projectId && s.studentId === user.id)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Back Button */}
            <Link href="/student/projects" className="inline-flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Link>

            {/* Project Header */}
            <div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <p className="text-muted-foreground mt-2">{project.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Project Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin Đề tài</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Giáo viên hướng dẫn</p>
                        <p className="font-medium">{teacher?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bộ môn</p>
                        <p className="font-medium">{teacher?.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Ngày bắt đầu
                        </p>
                        <p className="font-medium">{new Date(project.startDate).toLocaleDateString("vi-VN")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Hạn chót
                        </p>
                        <p className="font-medium">{new Date(project.endDate).toLocaleDateString("vi-VN")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enrolled Students */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Sinh viên tham gia ({project.enrolledStudents.length}/{project.maxStudents})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.enrolledStudents.length === 0 ? (
                      <p className="text-muted-foreground">Chưa có sinh viên nào tham gia</p>
                    ) : (
                      <div className="space-y-3">
                        {project.enrolledStudents.map((studentId) => {
                          const student = mockUsers.find((u) => u.id === studentId)
                          return (
                            <div key={studentId} className="flex items-center gap-3 p-3 border rounded-lg">
                              <img
                                src={student?.avatar || "/placeholder.svg"}
                                alt={student?.name}
                                className="w-10 h-10 rounded-full"
                              />
                              <div>
                                <p className="font-medium">{student?.name}</p>
                                <p className="text-sm text-muted-foreground">{student?.email}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* My Submissions */}
                {isEnrolled && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Bài nộp của tôi
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {studentSubmissions.length === 0 ? (
                        <p className="text-muted-foreground">Bạn chưa nộp bài nào</p>
                      ) : (
                        <div className="space-y-3">
                          {studentSubmissions.map((submission) => (
                            <div key={submission.id} className="p-3 border rounded-lg">
                              <p className="font-medium">{submission.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Nộp: {new Date(submission.submittedAt).toLocaleDateString("vi-VN")}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Trạng thái:{" "}
                                <span
                                  className={
                                    submission.status === "approved"
                                      ? "text-green-600"
                                      : submission.status === "rejected"
                                        ? "text-red-600"
                                        : "text-blue-600"
                                  }
                                >
                                  {submission.status === "submitted"
                                    ? "Đã nộp"
                                    : submission.status === "reviewed"
                                      ? "Đã xem"
                                      : submission.status === "approved"
                                        ? "Chấp nhận"
                                        : "Từ chối"}
                                </span>
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {isEnrolled ? (
                  <>
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="pt-6">
                        <p className="text-sm text-green-700 font-medium">Bạn đã tham gia đề tài này</p>
                      </CardContent>
                    </Card>
                    <Link href={`/student/projects/${projectId}/submit`}>
                      <Button className="w-full">Nộp Bài</Button>
                    </Link>
                  </>
                ) : (
                  <Button className="w-full" disabled={project.enrolledStudents.length >= project.maxStudents}>
                    {project.enrolledStudents.length >= project.maxStudents ? "Đã đầy" : "Tham gia Đề tài"}
                  </Button>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Thông tin Giáo viên</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={teacher?.avatar || "/placeholder.svg"}
                        alt={teacher?.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{teacher?.name}</p>
                        <p className="text-sm text-muted-foreground">{teacher?.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
