"use client"

import type React from "react"

import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mockSubmissions, mockProjects, mockGrades, mockComments, mockUsers } from "@/lib/mock-data"
import { ArrowLeft, MessageSquare, Download } from "lucide-react"
import Link from "next/link"
import { redirect, useParams } from "next/navigation"
import { useState } from "react"
import { useAuthStore } from "@/stores/user"

export default function SubmissionDetailPage() {
  const { user } = useAuthStore()
  const params = useParams()
  const submissionId = params.id as string
  const [newComment, setNewComment] = useState("")

  if (!user || user.role !== "student") redirect("/login")

  const submission = mockSubmissions.find((s) => s.id === submissionId)
  if (!submission || submission.studentId !== user.id.toString()) redirect("/student/submissions")

  const project = mockProjects.find((p) => p.id === submission.projectId)
  const grade = mockGrades.find((g) => g.submissionId === submissionId)
  const comments = mockComments.filter((c) => c.submissionId === submissionId)

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      alert("Bình luận đã được gửi!")
      setNewComment("")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            <Link href="/student/submissions" className="inline-flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Submission Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>{submission.title}</CardTitle>
                    <CardDescription>{project?.title}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Mô tả</p>
                      <p className="text-sm">{submission.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Ngày nộp</p>
                        <p className="font-medium">{new Date(submission.submittedAt).toLocaleDateString("vi-VN")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Trạng thái</p>
                        <p className="font-medium capitalize">{submission.status}</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button variant="outline" className="gap-2 bg-transparent">
                        <Download className="w-4 h-4" />
                        Tải xuống Tệp
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Grade */}
                {grade && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-green-900">Điểm số</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-green-900">Điểm của bạn</span>
                        <span className="text-4xl font-bold text-green-600">
                          {grade.score}/{grade.maxScore}
                        </span>
                      </div>

                      <div className="pt-4 border-t border-green-200">
                        <p className="text-sm font-medium text-green-900 mb-2">Nhận xét:</p>
                        <p className="text-sm text-green-800">{grade.feedback}</p>
                      </div>

                      <div className="text-xs text-green-700 pt-2">
                        Chấm điểm vào: {new Date(grade.gradedAt).toLocaleDateString("vi-VN")}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Comments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Bình luận ({comments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Comment List */}
                    <div className="space-y-4">
                      {comments.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Chưa có bình luận nào</p>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3 pb-4 border-b last:border-0">
                            <img
                              src={mockUsers.find((u) => u.id === comment.userId)?.avatar || "/placeholder.svg"}
                              alt={comment.userName}
                              className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm">{comment.userName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment */}
                    <form onSubmit={handleAddComment} className="pt-4 border-t space-y-3">
                      <textarea
                        placeholder="Viết bình luận..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                        rows={3}
                      />
                      <Button type="submit" size="sm">
                        Gửi Bình luận
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Thông tin Đề tài</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tiêu đề</p>
                      <p className="font-medium">{project?.title}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Hạn chót</p>
                      <p className="font-medium">{new Date(project?.endDate || "").toLocaleDateString("vi-VN")}</p>
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
