"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Lock, User, LogOut } from "lucide-react"
import { useState } from "react"
import { redirect } from "next/navigation"

export default function SettingsPage() {
  const { user, isLoading, logout } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  if (isLoading) return null
  if (!user) redirect("/login")

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Hồ sơ đã được cập nhật!")
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Mật khẩu đã được thay đổi!")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-2xl space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Cài đặt</h1>
              <p className="text-muted-foreground mt-2">Quản lý tài khoản và cài đặt cá nhân</p>
            </div>

            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Hồ sơ Cá nhân
                </CardTitle>
                <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Họ và tên</label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <Button type="submit">Lưu Thay đổi</Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Thay đổi Mật khẩu
                </CardTitle>
                <CardDescription>Cập nhật mật khẩu của bạn</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mật khẩu hiện tại</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mật khẩu mới</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>

                  <Button type="submit">Thay đổi Mật khẩu</Button>
                </form>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Thông báo
                </CardTitle>
                <CardDescription>Quản lý cài đặt thông báo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Thông báo Email</p>
                    <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Thông báo Bài nộp</p>
                    <p className="text-sm text-muted-foreground">Thông báo khi có bài nộp mới</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Thông báo Điểm số</p>
                    <p className="text-sm text-muted-foreground">Thông báo khi có điểm mới</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
            
          </div>
        </main>
      </div>
    </div>
  )
}
