"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại")
    }
  }

  const demoAccounts = [
    { email: "admin@university.edu", role: "Admin" },
    { email: "teacher1@university.edu", role: "Giáo viên" },
    { email: "student1@university.edu", role: "Sinh viên" },
  ]

  return (
    <div className="min-h-screen from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Quản lý đồ án</h1>
          <p className="text-muted-foreground">Hệ thống Quản lý đồ án Sinh viên</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>Nhập email để tiếp tục</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="mt-6 pt-6 border-t space-y-3">
              <p className="text-sm text-muted-foreground text-center font-medium">Tài khoản Demo</p>
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => {
                    setEmail(account.email)
                    setPassword("demo")
                  }}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                >
                  <div className="font-medium">{account.role}</div>
                  <div className="text-xs text-muted-foreground">{account.email}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>
            <Link href="/forgot-password" className="text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          </p>
          <p>
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
