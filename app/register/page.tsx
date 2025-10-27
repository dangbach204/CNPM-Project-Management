"use client"

import React, { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp")
      return
    }

    alert("Đăng ký thành công! Vui lòng đăng nhập.")
    router.push("/login")
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/10 to-primary/5">

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
          <p className="text-sm font-semibold text-blue-800 leading-tight">ĐẠI HỌC ĐÀ NẴNG</p>
          <p className="text-base font-extrabold text-blue-900 leading-tight">
            TRƯỜNG ĐẠI HỌC BÁCH KHOA
          </p>
        </div>
      </div>

      {/* 🔹 Logo Khoa Điện tử Viễn thông (phải trên) */}
      <div className="absolute top-4 right-4 flex items-center space-x-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-blue-800 leading-tight">KHOA</p>
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

      {/* 🔹 Form chính */}
      <div className="w-full max-w-md space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-1 tracking-tight">
            QUẢN LÝ ĐỒ ÁN
          </h1>
          <p className="text-blue-700 text-sm font-semibold">
            TRƯỜNG ĐẠI HỌC BÁCH KHOA - ĐẠI HỌC ĐÀ NẴNG
          </p>
        </div>

        <Card className="border-0 shadow-none">
          <CardHeader className="text-center">
            <CardTitle>Đăng ký</CardTitle>
            <CardDescription>Tạo tài khoản mới</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Họ và tên</label>
                <Input
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Xác nhận mật khẩu</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Đăng ký
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
