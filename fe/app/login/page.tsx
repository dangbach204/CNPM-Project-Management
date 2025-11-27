"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, GraduationCap, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/stores/user";
import { useAuth } from "@/hooks/useAuth";
import Cookies from "js-cookie";
import { ACCESS_TOKEN_KEY } from "@/constants";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    if (user && Cookies.get(ACCESS_TOKEN_KEY)) {
      router.push("/dashboard");
    }
  }, [router, user]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hello2.jpg"
          alt="Trường Đại học Bách Khoa Đà Nẵng"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px]"></div>
      </div>
      {/*Logo Bách Khoa*/}
      <div className="absolute top-4 left-4 flex items-center space-x-3 z-10">
        <Image
          src="./logobk.png"
          alt="Logo Trường Đại học Bách Khoa Đà Nẵng"
          width={48}
          height={48}
          className="object-contain"
        />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-white leading-tight drop-shadow-md">
            ĐẠI HỌC ĐÀ NẴNG
          </p>
          <p className="text-base font-extrabold text-white leading-tight drop-shadow-md">
            TRƯỜNG ĐẠI HỌC BÁCH KHOA
          </p>
        </div>
      </div>

      {/*Logo Khoa Điện tử Viễn thông*/}
      <div className="absolute top-4 right-4 flex items-center space-x-3 z-10">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-white leading-tight drop-shadow-md">
            KHOA
          </p>
          <p className="text-base font-extrabold text-white leading-tight drop-shadow-md">
            ĐIỆN TỬ - VIỄN THÔNG
          </p>
        </div>
        <Image
          src="./logokhoa.jpeg"
          alt="Logo Khoa Điện tử Viễn thông"
          width={48}
          height={48}
          className="object-contain rounded-md border border-white/20 shadow-lg"
        />
      </div>

      <div className="w-full max-w-md mt-12 relative z-10">
        {/* Header with Icon and Title */}
        <div className="bg-blue-600 text-white rounded-t-lg p-6 flex items-center gap-3 shadow-xl">
          <div className="bg-white/20 p-3 rounded-lg">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">Hệ thống Quản lý Đồ án</h1>
            <p className="text-white text-2xl font-bold leading-tight">Sinh viên</p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-b-lg shadow-xl p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Đăng nhập vào tài khoản của bạn
            </h2>
            <p className="text-sm text-gray-600">
              Email học hoặc Tên người dùng
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Nhập email hoặc tên đăng nhập..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium" 
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-sm">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}