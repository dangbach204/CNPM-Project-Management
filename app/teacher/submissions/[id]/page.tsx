"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockSubmissions, mockProjects, mockUsers, mockGrades, mockComments } from "@/lib/mock-data"
import { ArrowLeft, Download, MessageSquare, Star } from "lucide-react"
import Link from "next/link"
import { redirect, useParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function GradeSubmissionPage() {
  const { user, isLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const submissionId = params.id as string

  const [score, setScore] = useState("")
  const [feedback, setFeedback] = useState("")
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isLoading) return null
  if (!user || user.role !== "teacher") redirect("/login")

  const submission = mockSubmissions.find((s) => s.id === submissionId)
  if (!submission) redirect("/teacher/submissions")

  const project = mockProjects.find((p) => p.id === submission.projectId)
  const student = mockUsers.find((u) => u.id === submission.studentId)
  const existingGrade = mockGrades.find((g) => g.submissionId === submissionId)
  const comments = mockComments.filter((c) => c.submissionId === submissionId)

  // Initialize form with existing grade if available
  if (existingGrade && !score) {
    setScore(existingGrade.score.toString())
    setFeedback(existingGrade.feedback)
  }

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    alert("Điểm số đã được lưu thành công!")
    setIsSubmitting(false)
    router.push("/teacher/submissions")
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      alert("Bình luận đã được gửi!")
      setNewComment("")
    }
  }

  const maxScore = 100

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            <Link href="/teacher/submissions" className="inline-flex items-center gap-2 text-primary hover:underline">
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
                    <CardDescription>
                      Từ: <strong>{student?.name}</strong> - Đề tài: <strong>{project?.title}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Mô tả bài nộp</p>
                      <p className="text-sm">{submission.description}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">Ngày nộp</p>
                        <p className="font-medium">{new Date(submission.submittedAt).toLocaleDateString("vi-VN")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Trạng thái</p>
                        <p className="font-medium capitalize">{submission.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tệp đính kèm</p>
                        <Button variant="outline" size="sm" className="gap-2 mt-1 bg-transparent">
                          <Download className="w-4 h-4" />
                          Tải xuống
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Grading Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Chấm điểm</CardTitle>
                    <CardDescription>Nhập điểm số và nhận xét cho bài nộp này</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitGrade} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Điểm số</label>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Input
                              type="number"
                              min="0"
                              max={maxScore}
                              placeholder="0"
                              value={score}
                              onChange={(e) => setScore(e.target.value)}
                              required
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">/ {maxScore}</span>
                        </div>
                        {score && (
                          <div className="mt-2">
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${(Number.parseInt(score) / maxScore) * 100}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {((Number.parseInt(score) / maxScore) * 100).toFixed(0)}%
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nhận xét / Feedback</label>
                        <textarea
                          placeholder="Viết nhận xét chi tiết về bài nộp..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          rows={6}
                        />
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                          <strong>Mẹo:</strong> Hãy viết nhận xét chi tiết, cụ thể về những điểm mạnh, điểm yếu và những
                          cải thiện cần thiết.
                        </p>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Đang lưu..." : existingGrade ? "Cập nhật Điểm" : "Lưu Điểm"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                          Hủy
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Comments Section */}
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
                        comments.map((comment) => {
                          const commenter = mockUsers.find((u) => u.id === comment.userId)
                          return (
                            <div key={comment.id} className="flex gap-3 pb-4 border-b last:border-0">
                              <img
                                src={commenter?.avatar || "/placeholder.svg"}
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
                          )
                        })
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
                {/* Student Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Thông tin Sinh viên</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={student?.avatar || "/placeholder.svg"}
                        alt={student?.name}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{student?.name}</p>
                        <p className="text-sm text-muted-foreground">{student?.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Info */}
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

                {/* Grading Rubric */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Tiêu chí chấm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Chất lượng code</span>
                        <span className="text-muted-foreground">25%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: "25%" }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tính năng</span>
                        <span className="text-muted-foreground">35%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: "35%" }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tài liệu</span>
                        <span className="text-muted-foreground">20%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: "20%" }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Trình bày</span>
                        <span className="text-muted-foreground">20%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: "20%" }} />
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
