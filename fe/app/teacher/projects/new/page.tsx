"use client";

import type React from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/stores/user";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { createProject } from "@/service/teacher-service";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function NewProjectPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    expireAt: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề đề tài",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await createProject({
        title: formData.title,
        description: formData.description,
        expireAt: formData.expireAt || undefined,
      });

      toast({
        title: "Thành công",
        description: "Đề tài đã được tạo thành công!",
      });

      router.push("/teacher/projects");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Có lỗi xảy ra khi tạo đề tài";
      toast({
        title: "Tạo đề tài thất bại",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto flex justify-center items-start">
            <div className="p-8 max-w-2xl w-full">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-center">
                  Tạo đề tài mới
                </h1>
                <p className="text-muted-foreground mt-2 text-center">
                  Nhập thông tin chi tiết cho đề tài của bạn
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Tiêu đề Đề tài
                      </label>
                      <Input
                        placeholder="Ví dụ: Xây dựng Website E-commerce"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mô tả</label>
                      <textarea
                        placeholder="Mô tả chi tiết về đề tài..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        rows={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Ngày hết hạn (không bắt buộc)
                      </label>
                      <Input
                        type="date"
                        value={formData.expireAt}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expireAt: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={loading}>
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Tạo Đề tài
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/teacher/projects")}
                        disabled={loading}
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
    </ProtectedRoute>
  );
}
