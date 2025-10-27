"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockProjects } from "@/lib/mock-data"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { redirect, useParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function SubmitProjectPage() {
  const { user, isLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fileName: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading) return null
  if (!user || user.role !== "student") redirect("/login")

  const project = mockProjects.find((p) => p.id === projectId)
  if (!project || !project.enrolledStudents.includes(user.id)) {
    redirect("/student/projects")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, fileName: file.name })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    alert("Bài nộp đã được gửi thành công!")
    setIsSubmitting(false)
    router.push(`/student/projects/${projectId}`)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-2xl space-y-8">
            <Link
              href={`/student/projects/${projectId}`}
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Link>

            <div>
              <h1 className="text-3xl font-bold">Nộp Bài</h1>
              <p className="text-muted-foreground mt-2">Nộp bài cho đề tài: {project.title}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin Bài nộp</CardTitle>
                <CardDescription>Điền đầy đủ thông tin và tải lên tệp bài làm</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tiêu đề Bài nộp</label>
                    <Input
                      placeholder="Ví dụ: Phiên bản 1.0 - Frontend hoàn thành"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mô tả Bài nộp</label>
                    <textarea
                      placeholder="Mô tả chi tiết về bài làm của bạn, những tính năng đã hoàn thành, những khó khăn gặp phải..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tải lên Tệp</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <input type="file" onChange={handleFileChange} className="hidden" id="file-input" required />
                      <label htmlFor="file-input" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Kéo thả tệp hoặc nhấp để chọn</p>
                        <p className="text-xs text-muted-foreground mt-1">{formData.fileName || "Chưa chọn tệp"}</p>
                      </label>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Lưu ý:</strong> Hãy đảm bảo tệp của bạn chứa tất cả mã nguồn, tài liệu và hướng dẫn cài
                      đặt.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Đang gửi..." : "Nộp Bài"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Hủy
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
