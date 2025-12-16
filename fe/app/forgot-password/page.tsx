"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { forgotPassword } from "@/service/auth-service";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-primary/10 to-primary/5">
      {/* 🔹 Logo Bách Khoa (trái trên) */}
      <div className="absolute top-4 left-4 flex items-center space-x-3">
        <Image
          src="/logobk.png"
          alt="Logo Trường Đại học Bách Khoa Đà Nẵng"
          width={48}
          height={48}
          className="object-contain"
        />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-blue-800 leading-tight">
            ĐẠI HỌC ĐÀ NẴNG
          </p>
          <p className="text-base font-extrabold text-blue-900 leading-tight">
            TRƯỜNG ĐẠI HỌC BÁCH KHOA
          </p>
        </div>
      </div>

      {/* 🔹 Logo Khoa Điện tử Viễn thông (phải trên) */}
      <div className="absolute top-4 right-4 flex items-center space-x-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-blue-800 leading-tight">
            KHOA
          </p>
          <p className="text-base font-extrabold text-blue-900 leading-tight">
            ĐIỆN TỬ - VIỄN THÔNG
          </p>
        </div>
        <Image
          src="/logokhoa.jpeg"
          alt="Logo Khoa Điện tử Viễn thông"
          width={48}
          height={48}
          className="object-contain rounded-full"
        />
      </div>

      {/* Nội dung chính */}
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Quản lý đồ án</h1>
          <p className="text-muted-foreground">
            Hệ thống Quản lý Đồ án Sinh viên
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quên mật khẩu</CardTitle>
            <CardDescription>
              {submitted
                ? "Kiểm tra email của bạn"
                : "Nhập email để đặt lại mật khẩu"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-5xl">📧</div>
                <p className="text-sm text-muted-foreground">
                  Chúng tôi đã gửi liên kết đặt lại mật khẩu đến {email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Vui lòng kiểm tra email của bạn (bao gồm thư mục spam)
                </p>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                Quay lại đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
