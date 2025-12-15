"use client";

import type React from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect, useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/user";
import { useStudentSubmission } from "@/hooks/useStudentSubmission";

export default function SubmitProjectPage() {
  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  const [reportLink, setReportLink] = useState("");
  const { handleSubmitProject, submitLoading } = useStudentSubmission();

  if (!user || user.role !== "student") redirect("/login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportLink.trim()) {
      return;
    }

    const success = await handleSubmitProject(projectId, reportLink);
    if (success) {
      router.push(`/student/projects/${projectId}`);
    }
  };

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
              <p className="text-muted-foreground mt-2">
                Nộp link báo cáo cho dự án
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin Bài nộp</CardTitle>
                <CardDescription>
                  Điền link báo cáo của bạn (Google Drive, GitHub, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Link Báo cáo</label>
                    <Input
                      type="url"
                      placeholder="https://drive.google.com/... hoặc https://github.com/..."
                      value={reportLink}
                      onChange={(e) => setReportLink(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Đảm bảo link có thể truy cập công khai hoặc đã chia sẻ với
                      giảng viên
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Lưu ý:</strong> Hãy đảm bảo link của bạn chứa tất
                      cả báo cáo, mã nguồn và tài liệu cần thiết.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={submitLoading}>
                      {submitLoading ? "Đang gửi..." : "Nộp Bài"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
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
  );
}
