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
import { Loader2, FileText } from "lucide-react";

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
      <div className="flex h-screen">
        {/* Sidebar stays unchanged */}
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          {/* Main content area with subtle blurred background */}
          <main className="flex-1 overflow-y-auto relative">
            {/* Background wrapper - decorative only, matches Project List page */}
            <div className="absolute top-0 left-0 w-full h-full min-h-full overflow-hidden z-0 pointer-events-none">
              {/* Blurred background image */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url(/bkhoa2.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "top center",
                  backgroundRepeat: "no-repeat",
                  filter: "blur(10px)",
                  opacity: 0.6,
                  transform: "scale(1.1)",
                }}
              />
              {/* Gradient overlay - fades to clean white */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.95) 55%)",
                }}
              />
            </div>

            {/* Content layer */}
            <div className="relative z-10 min-h-full flex flex-col items-center py-10 px-6">
              {/* Page header - centered with clear purpose */}
              <div className="text-center mb-8 max-w-xl">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <FileText className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Tạo đề tài mới
                </h1>
                <p className="text-[14px] text-gray-600 mt-2 leading-relaxed">
                  Thiết lập đề tài để sinh viên có thể đăng ký và thực hiện.
                  <br />
                  Vui lòng điền đầy đủ thông tin bên dưới.
                </p>
              </div>

              {/* Form card - stronger visual presence */}
              <Card className="w-full max-w-2xl border border-gray-200 bg-white shadow-md">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title field */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">
                        Tiêu đề đề tài <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Ví dụ: Xây dựng Website E-commerce với React"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="h-11"
                        required
                      />
                    </div>

                    {/* Description field - improved placeholder */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900">
                        Mô tả
                      </label>
                      <textarea
                        placeholder="Mô tả mục tiêu, yêu cầu và phạm vi của đề tài.&#10;&#10;Ví dụ: Xây dựng một hệ thống quản lý bán hàng trực tuyến bao gồm các chức năng: đăng ký, đăng nhập, quản lý sản phẩm, giỏ hàng và thanh toán..."
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-3 border border-gray-200 rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={6}
                      />
                    </div>

                    {/* Deadline field with helper text */}
                    <div className="space-y-2">
                      <div className="flex flex-row gap-4 items-center">
                        <label className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          Ngày hết hạn
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
                          className="h-11 max-w-xs"
                        />
                      </div>

                      {/* Helper text explaining optional nature */}
                      <p className="text-xs text-gray-500">
                        Không bắt buộc. Nếu không đặt hạn, sinh viên có thể đăng
                        ký bất cứ lúc nào.
                      </p>
                    </div>

                    {/* Action buttons - clear primary/secondary distinction */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.push("/teacher/projects")}
                        disabled={loading}
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      >
                        Huỷ
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-6 h-10"
                      >
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Tạo đề tài
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
