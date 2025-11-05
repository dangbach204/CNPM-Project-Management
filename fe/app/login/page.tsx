"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/stores/user";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { handleLogin, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await handleLogin(email, password);
    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.message || "Email hoặc mật khẩu không đúng");
    }
  };

  const { user } = useAuthStore();
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [router, user]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-primary/10 to-primary/5">
      {/*Logo Bách Khoa*/}
      <div className="absolute top-4 left-4 flex items-center space-x-3">
        <Image
          src="./logobk.png"
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

      {/*Logo Khoa Điện tử Viễn thông*/}
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
          src="./logokhoa.jpeg"
          alt="Logo Khoa Điện tử Viễn thông"
          width={48}
          height={48}
          className="object-contain rounded-md border border-border"
        />
      </div>

      <div className="w-full max-w-md space-y-6 mt-12">
        {/* Tiêu đề */}
        <div className="text-center space-y-2">
          <h1
            className="text-3xl sm:text-3xl font-extrabold tracking-wide 
                       bg-linear-to-r from-blue-600 via-purple-600 to-pink-500 
                       bg-clip-text text-transparent drop-shadow-sm font-[Poppins]"
          >
            QUẢN LÝ ĐỒ ÁN TRƯỜNG BÁCH KHOA ĐÀ NẴNG
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg font-medium">
            Hệ thống Quản lý đồ án Sinh viên
          </p>
        </div>

        {/* Thẻ đăng nhập */}
        <Card>
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>Nhập email để tiếp tục</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={ handleSubmit } className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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

              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
