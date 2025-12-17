"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  KeyRound,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { resetPassword, verifyResetToken } from "@/service/auth-service";
import { useToast } from "@/hooks/use-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");

    console.log("Email from URL:", emailParam);
    console.log("Token from URL:", tokenParam);

    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);

    if (!emailParam || !tokenParam) {
      setIsVerifying(false);
      setIsTokenInvalid(true);
      return;
    }

    const verifyToken = async () => {
      try {
        await verifyResetToken(emailParam, tokenParam);
        setIsVerifying(false);
      } catch (error: any) {
        setIsVerifying(false);
        setIsTokenInvalid(true);
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submit clicked");
    console.log("Email:", email);
    console.log("Token:", token);
    console.log("Password length:", password.length);

    if (!email || !token) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description:
          "Thiếu thông tin xác thực. Vui lòng kiểm tra lại liên kết.",
      });
      return;
    }

    if (password !== confirmPassword) {
      setPasswordMatchError(true);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp với mật khẩu mới.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự.",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Calling resetPassword API...");
      await resetPassword(email, token, password);
      console.log("Reset password successful");

      setIsSuccess(true);
      toast({
        title: "Thành công",
        description: "Mật khẩu đã được đặt lại thành công.",
      });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      const errorMessage = error.response?.data?.message || "";

      if (
        errorMessage.includes("không hợp lệ") ||
        errorMessage.includes("hết hạn") ||
        errorMessage.includes("Token") ||
        errorMessage.includes("token")
      ) {
        setIsTokenInvalid(true);
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: errorMessage || "Đã có lỗi xảy ra. Vui lòng thử lại.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto animate-pulse">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Đang xác thực...
        </h3>
        <p className="text-[13px] text-gray-600">Vui lòng chờ trong giây lát</p>
      </div>
    );
  }

  if (isTokenInvalid) {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Liên kết không hợp lệ
          </h3>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            Liên kết đặt lại mật khẩu này đã hết hạn hoặc không còn hiệu lực.
          </p>
        </div>
        <div className="space-y-3 pt-2">
          <Button
            asChild
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
          >
            <Link href="/forgot-password">Gửi lại email đặt lại</Link>
          </Button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[13px] text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Đặt lại thành công!
          </h3>
          <p className="text-[13px] text-gray-600 leading-relaxed">
            Mật khẩu của bạn đã được cập nhật. Đang chuyển đến trang đăng
            nhập...
          </p>
        </div>
        <Button
          asChild
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
        >
          <Link href="/login">Đăng nhập ngay</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Password Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-[11px] text-blue-900 leading-relaxed">
          <span className="inline-flex items-center gap-1 font-semibold">
            <Shield className="w-3 h-3" />
            Yêu cầu mật khẩu: Tối thiểu 6 ký tự
          </span>
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[13px] font-semibold text-gray-700">
          Mật khẩu mới
        </label>
        <Input
          type="password"
          placeholder="Nhập mật khẩu mới..."
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordMatchError(false);
          }}
          minLength={6}
          required
          disabled={isLoading}
          className={`h-11 ${
            password && password.length < 6 ? "border-red-500" : ""
          }`}
        />
        {password && password.length < 6 && (
          <p className="text-[11px] text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Mật khẩu phải có ít nhất 6 ký tự
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[13px] font-semibold text-gray-700">
          Xác nhận mật khẩu
        </label>
        <Input
          type="password"
          placeholder="Nhập lại mật khẩu..."
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setPasswordMatchError(false);
          }}
          minLength={6}
          required
          disabled={isLoading}
          className={`h-11 ${passwordMatchError ? "border-red-500" : ""}`}
        />
        {confirmPassword && password !== confirmPassword && (
          <p className="text-[11px] text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Mật khẩu xác nhận không khớp
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
        disabled={isLoading || !email || !token}
      >
        {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Background Image - Consistent with Login/Forgot Password */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hello2.jpg"
          alt="Trường Đại học Bách Khoa Đà Nẵng"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/70 via-blue-900/60 to-blue-800/70 backdrop-blur-sm"></div>
      </div>

      {/* Logo Bách Khoa */}
      <div className="absolute top-4 left-4 flex items-center space-x-3 z-10">
        <Image
          src="/logobk.png"
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

      {/* Logo Khoa */}
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
          src="/logokhoa.jpeg"
          alt="Logo Khoa Điện tử Viễn thông"
          width={48}
          height={48}
          className="object-contain rounded-md border border-white/20 shadow-lg"
        />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md mt-12 relative z-10">
        {/* Header - Consistent with Login/Forgot Password */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-t-lg p-5 flex items-center gap-3 shadow-xl border-b-2 border-blue-500">
          <div className="bg-white/15 p-2.5 rounded-lg backdrop-blur-sm">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">
              Đặt lại mật khẩu
            </h1>
            <p className="text-white/90 text-sm font-medium leading-tight">
              Tạo mật khẩu mới cho tài khoản
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-b-lg shadow-2xl border-x-2 border-b-2 border-gray-200/50 p-6">
          <Suspense
            fallback={
              <div className="text-center py-8 text-[13px] text-gray-600">
                Đang tải...
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
