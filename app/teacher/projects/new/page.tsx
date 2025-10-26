"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { redirect } from "next/navigation"

export default function NewProjectPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    maxStudents: 3,
    startDate: "",
    endDate: "",
  })

  if (isLoading) return null
  if (!user || user.role !== "teacher") redirect("/login")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Đề tài đã được tạo thành công!")
    router.push("/teacher/projects")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto flex justify-center items-start">
          <div className="p-8 max-w-2xl w-full">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-center">Tạo đề tài mới</h1>
              <p className="text-muted-foreground mt-2 text-center">Nhập thông tin chi tiết cho đề tài của bạn</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tiêu đề Đề tài</label>
                    <Input
                      placeholder="Ví dụ: Xây dựng Website E-commerce"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mô tả</label>
                    <textarea
                      placeholder="Mô tả chi tiết về đề tài..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      rows={5}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Số lượng sinh viên tối đa</label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
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
                    <Button type="submit">Tạo Đề tài</Button>
                    <Button type="button" variant="outline" onClick={() => router.push("/teacher/projects")}>
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
