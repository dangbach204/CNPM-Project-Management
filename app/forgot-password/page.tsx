"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">UniProject</h1>
          <p className="text-muted-foreground">Hệ thống Quản lý Đề tài Sinh viên</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quên mật khẩu</CardTitle>
            <CardDescription>{submitted ? "Kiểm tra email của bạn" : "Nhập email để đặt lại mật khẩu"}</CardDescription>
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

                <Button type="submit" className="w-full">
                  Gửi liên kết đặt lại
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-5xl">📧</div>
                <p className="text-sm text-muted-foreground">Chúng tôi đã gửi liên kết đặt lại mật khẩu đến {email}</p>
                <p className="text-xs text-muted-foreground">Vui lòng kiểm tra email của bạn (bao gồm thư mục spam)</p>
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
  )
}
