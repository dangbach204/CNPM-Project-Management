"use client"

import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockProjects, mockUsers } from "@/lib/mock-data"
import { Search, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { useState } from "react"

export default function StudentProjectsPage() {
  const { user, isLoading } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  if (isLoading) return null
  if (!user || user.role !== "student") redirect("/login")

  const enrolledProjectIds = mockProjects.filter((p) => p.enrolledStudents.includes(user.id)).map((p) => p.id)

  const filteredProjects = mockProjects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === "enrolled") {
      return matchesSearch && enrolledProjectIds.includes(p.id)
    } else if (filterStatus === "available") {
      return (
        matchesSearch &&
        !enrolledProjectIds.includes(p.id) &&
        p.status === "open" &&
        p.enrolledStudents.length < p.maxStudents
      )
    }

    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-700"
      case "in-progress":
        return "bg-blue-100 text-blue-700"
      case "completed":
        return "bg-gray-100 text-gray-700"
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
            <div>
              <h1 className="text-3xl font-bold">Tìm Đề tài</h1>
              <p className="text-muted-foreground mt-2">Duyệt và tham gia các đề tài</p>
            </div>

            {/* Search and Filter */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm đề tài..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button variant={filterStatus === "all" ? "default" : "outline"} onClick={() => setFilterStatus("all")}>
                  Tất cả
                </Button>
                <Button
                  variant={filterStatus === "enrolled" ? "default" : "outline"}
                  onClick={() => setFilterStatus("enrolled")}
                >
                  Đã tham gia ({enrolledProjectIds.length})
                </Button>
                <Button
                  variant={filterStatus === "available" ? "default" : "outline"}
                  onClick={() => setFilterStatus("available")}
                >
                  Có sẵn
                </Button>
              </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground">Không tìm thấy đề tài nào</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredProjects.map((project) => {
                  const isEnrolled = enrolledProjectIds.includes(project.id)
                  const isFull = project.enrolledStudents.length >= project.maxStudents
                  const teacher = mockUsers.find((u) => u.id === project.teacherId)

                  return (
                    <Card key={project.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold">{project.title}</h3>
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}
                              >
                                {getStatusLabel(project.status)}
                              </span>
                              {isEnrolled && (
                                <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                  Đã tham gia
                                </span>
                              )}
                            </div>

                            <p className="text-muted-foreground mb-4">{project.description}</p>

                            <div className="grid grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Giáo viên</p>
                                <p className="font-medium">{teacher?.name}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  Sinh viên
                                </p>
                                <p className="font-medium">
                                  {project.enrolledStudents.length}/{project.maxStudents}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Bắt đầu
                                </p>
                                <p className="font-medium">{new Date(project.startDate).toLocaleDateString("vi-VN")}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Kết thúc
                                </p>
                                <p className="font-medium">{new Date(project.endDate).toLocaleDateString("vi-VN")}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {isEnrolled ? (
                              <Link href={`/student/projects/${project.id}`}>
                                <Button variant="outline">Xem chi tiết</Button>
                              </Link>
                            ) : (
                              <>
                                <Link href={`/student/projects/${project.id}`}>
                                  <Button variant="outline" className="w-full bg-transparent">
                                    Xem chi tiết
                                  </Button>
                                </Link>
                                <Button disabled={isFull || project.status !== "open"}>
                                  {isFull ? "Đã đầy" : project.status !== "open" ? "Đã đóng" : "Tham gia"}
                                </Button>
                              </>
                            )}
                          </div>
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
