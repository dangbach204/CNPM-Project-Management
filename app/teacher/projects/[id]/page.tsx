"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockProjects, mockUsers } from "@/lib/mock-data"
import { ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { redirect, useParams } from "next/navigation"
import { useState } from "react"

export default function EditProjectPage() {
  const { user, isLoading } = useAuth()
  const params = useParams()
  const projectId = params.id as string

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    maxStudents: 0,
    startDate: "",
    endDate: "",
  })

  const project = mockProjects.find((p) => p.id === projectId)

  if (isLoading) return null
  if (!user || user.role !== "teacher") redirect("/login")
  if (!project || project.teacherId !== user.id) redirect("/teacher/projects")

  setFormData({
    title: project.title,
    description: project.description,
    maxStudents: project.maxStudents,
    startDate: project.startDate,
    endDate: project.endDate,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Đề tài đã được cập nhật!")
    // In a real app, this would update the project
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            <Link href="/teacher/projects" className="inline-flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Edit Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Chỉnh sửa Đề tài</CardTitle>
                    <CardDescription>Cập nhật thông tin đề tài</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tiêu đề</label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Mô tả</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          rows={5}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Số lượng sinh viên tối đa</label>
                          <Input
                            type="number"
                            min="1"
                            value={formData.maxStudents}
                            onChange={(e) => setFormData({ ...formData, maxStudents: Number.parseInt(e.target.value) })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Ngày bắt đầu</label>
                          <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Ngày kết thúc</label>
                          <Input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button type="submit">Lưu Thay đổi</Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                          Hủy
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Sinh viên ({project.enrolledStudents.length}/{project.maxStudents})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.enrolledStudents.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Chưa có sinh viên nào tham gia</p>
                    ) : (
                      <div className="space-y-3">
                        {project.enrolledStudents.map((studentId) => {
                          const student = mockUsers.find((u) => u.id === studentId)
                          return (
                            <div key={studentId} className="flex items-center gap-2">
                              <img
                                src={student?.avatar || "/placeholder.svg"}
                                alt={student?.name}
                                className="w-8 h-8 rounded-full"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{student?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{student?.email}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Thông tin Đề tài</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Trạng thái</p>
                      <p className="font-medium capitalize">{project.status}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ngày tạo</p>
                      <p className="font-medium">{new Date(project.createdAt).toLocaleDateString("vi-VN")}</p>
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
