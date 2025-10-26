"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mockProjects, mockSubmissions, mockUsers } from "@/lib/mock-data"
import { BookOpen, FileText, Users } from "lucide-react"
import Link from "next/link"

export default function TeacherDashboard() {
  const { user } = useAuth()

  const myProjects = mockProjects.filter((p) => p.teacherId === user?.id)
  const mySubmissions = mockSubmissions.filter((s) => myProjects.some((p) => p.id === s.projectId))

  const stats = [
    {
      title: "Đề tài của tôi",
      value: myProjects.length,
      icon: BookOpen,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Bài nộp",
      value: mySubmissions.length,
      icon: FileText,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Sinh viên",
      value: myProjects.reduce((sum, p) => sum + p.enrolledStudents.length, 0),
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
  ]

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Giáo viên</h1>
          <p className="text-muted-foreground mt-2">Quản lý đề tài và bài nộp của sinh viên</p>
        </div>
        <Link href="/teacher/projects/new">
          <Button>Tạo Đề tài Mới</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* My Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đề tài</CardTitle>
          <CardDescription>Danh sách các đề tài bạn đang quản lý</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myProjects.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Chưa có đề tài nào</p>
            ) : (
              myProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="text-muted-foreground">
                        👥 {project.enrolledStudents.length}/{project.maxStudents} sinh viên
                      </span>
                      <span className="text-muted-foreground">
                        📅 {new Date(project.endDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <Link href={`/teacher/projects/${project.id}`}>
                    <Button variant="outline" size="sm">
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Bài nộp gần đây</CardTitle>
          <CardDescription>Các bài nộp cần chấm điểm</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mySubmissions.slice(0, 5).map((submission) => {
              const student = mockUsers.find((u) => u.id === submission.studentId)
              return (
                <div key={submission.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{submission.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">Từ: {student?.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(submission.submittedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <Link href={`/teacher/submissions/${submission.id}`}>
                    <Button variant="outline" size="sm">
                      Xem & Chấm
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
