"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

      // Kiểm tra nếu token không hợp lệ hoặc đã hết hạn
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
      <div className="text-center space-y-4">
        <div className="text-5xl">⏳</div>
        <h3 className="text-xl font-semibold">Đang kiểm tra liên kết...</h3>
        <p className="text-muted-foreground">Vui lòng chờ trong giây lát</p>
      </div>
    );
  }

  if (isTokenInvalid) {
    return (
      <div className="text-center space-y-4">
        <div className="text-5xl">⚠️</div>
        <h3 className="text-xl font-semibold">
          Liên kết không hợp lệ hoặc đã hết hạn
        </h3>
        <p className="text-muted-foreground">
          Liên kết đặt lại mật khẩu này không còn hiệu lực.
        </p>
        <p className="text-muted-foreground">
          Có thể bạn đã sử dụng liên kết này trước đó hoặc nó đã hết hạn.
        </p>
        <p className="text-sm text-muted-foreground mt-4">
          Nhấn vào nút bên dưới để nhận liên kết mới.
        </p>
        <Button asChild className="mt-4 w-full">
          <Link href="/forgot-password">Gửi lại email đặt lại mật khẩu</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">Quay lại đăng nhập</Link>
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h3 className="text-xl font-semibold">Đặt lại mật khẩu thành công!</h3>
        <p className="text-muted-foreground">
          Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát...
        </p>
        <Button asChild className="mt-4">
          <Link href="/login">Đăng nhập ngay</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Debug info - xóa sau khi test xong */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Email: {email || "Chưa có"}</p>
        <p>Token: {token ? "Có" : "Chưa có"}</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Mật khẩu mới</label>
        <Input
          type="password"
          placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordMatchError(false);
          }}
          minLength={6}
          required
          disabled={isLoading}
          className={password && password.length < 6 ? "border-red-500" : ""}
        />
        {password && password.length < 6 && (
          <p className="text-sm text-red-500">
            Mật khẩu phải có ít nhất 6 ký tự
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Xác nhận mật khẩu</label>
        <Input
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setPasswordMatchError(false);
          }}
          minLength={6}
          required
          disabled={isLoading}
          className={passwordMatchError ? "border-red-500" : ""}
        />
        {confirmPassword && password !== confirmPassword && (
          <p className="text-sm text-red-500">
            Mật khẩu xác nhận không khớp với mật khẩu mới
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !email || !token}
        onClick={() => console.log("Button clicked")}
      >
        {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-linear-to-b from-primary/10 to-primary/5">
      {/* Logo Bách Khoa */}
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

      {/* Logo Khoa */}
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
          <h1 className="text-4xl font-bold text-primary mb-2">
            Quản lý đồ án
          </h1>
          <p className="text-muted-foreground">
            Hệ thống Quản lý Đồ án Sinh viên
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đặt lại mật khẩu</CardTitle>
            <CardDescription>
              Nhập mật khẩu mới cho tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Đang tải...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
