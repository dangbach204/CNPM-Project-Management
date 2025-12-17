"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
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
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Background Image - Consistent with Login */}
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

      {/* Logo Khoa Điện tử Viễn thông */}
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
        {/* Header - Consistent with Login */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-t-lg p-5 flex items-center gap-3 shadow-xl border-b-2 border-blue-500">
          <div className="bg-white/15 p-2.5 rounded-lg backdrop-blur-sm">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Quên mật khẩu</h1>
            <p className="text-white/90 text-sm font-medium leading-tight">
              {submitted ? "Kiểm tra email của bạn" : "Khôi phục tài khoản"}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-b-lg shadow-2xl border-x-2 border-b-2 border-gray-200/50 p-6 space-y-5">
          {!submitted ? (
            <>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Đặt lại mật khẩu
                </h2>
                <p className="text-[13px] text-gray-600 leading-relaxed">
                  Nhập email đăng ký của bạn. Chúng tôi sẽ gửi liên kết đặt lại
                  mật khẩu đến hòm thư của bạn.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Nhập địa chỉ email của bạn..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
                </Button>
              </form>

              {/* Reassurance */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  <span className="inline-flex items-center gap-1">
                    <svg
                      className="w-3 h-3 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Liên kết sẽ hết hạn sau 15 phút. Nếu không nhận được email,
                    vui lòng kiểm tra thư mục spam.
                  </span>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Email đã được gửi
                  </h3>
                  <p className="text-[13px] text-gray-600 leading-relaxed">
                    Chúng tôi đã gửi liên kết đặt lại mật khẩu đến
                  </p>
                  <p className="text-[14px] font-semibold text-gray-900">
                    {email}
                  </p>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-[12px] text-blue-900">
                  Vui lòng kiểm tra hòm thư của bạn (bao gồm cả thư mục spam) và
                  nhấp vào liên kết để đặt lại mật khẩu.
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Back to Login Link */}
          <div className="text-center text-sm pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
