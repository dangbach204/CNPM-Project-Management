"use client";

import type React from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bell,
  Lock,
  User,
  LogOut,
  CheckCircle2,
  XCircle,
  Camera,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/user";
import { updateProfile } from "@/service/user-service";
import { useToast } from "@/hooks/use-toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { user, setUser, logout } = useAuthStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setIsLoadingProfile(true);

    if (!user) {
      setIsLoadingProfile(false);
      return;
    }

    try {
      const submitData = new FormData();
      let hasChanges = false;

      if (formData.fullName !== user.fullName) {
        submitData.append("fullName", formData.fullName);
        hasChanges = true;
      }

      if (formData.email !== user.email) {
        submitData.append("email", formData.email);
        hasChanges = true;
      }

      if (avatarFile) {
        submitData.append("avatar", avatarFile);
        hasChanges = true;
      }

      if (!hasChanges) {
        toast({
          title: "Không có thay đổi",
          description: "Không có thông tin nào được thay đổi",
        });
        setIsLoadingProfile(false);
        return;
      }

      const response = await updateProfile(user.id, submitData);

      setUser({
        ...user,
        fullName: response.user.fullName,
        email: response.user.email,
        avatar: response.user.avatar,
      });

      setAvatarFile(null);
      setAvatarPreview(null);

      toast({
        title: "Thành công",
        description: "Cập nhật hồ sơ thành công!",
      });
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật hồ sơ";
      setProfileError(errorMsg);
      toast({
        title: "Lỗi",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!user) return;

    if (!passwordData.currentPassword) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoadingPassword(true);

    try {
      await updateProfile(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Thành công",
        description: "Đổi mật khẩu thành công!",
      });
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu";
      setPasswordError(errorMsg);
      toast({
        title: "Lỗi",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto flex justify-center items-start">
            <div className="p-8 max-w-2xl space-y-8">
              <div>
                <h1 className="text-3xl font-bold text-center">Cài đặt</h1>
                <p className="text-muted-foreground mt-2 text-center">
                  Quản lý tài khoản và cài đặt cá nhân
                </p>
              </div>

              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Hồ sơ Cá nhân
                  </CardTitle>
                  <CardDescription>
                    Cập nhật thông tin cá nhân của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profileError && (
                    <Alert variant="destructive" className="mb-4">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{profileError}</AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="flex flex-col items-center space-y-4 mb-6">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage
                            src={
                              avatarPreview ||
                              user?.avatar ||
                              "/placeholder.svg"
                            }
                            alt="Avatar"
                          />
                          <AvatarFallback>
                            {user?.fullName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <label
                          htmlFor="avatar-upload"
                          className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                            disabled={isLoadingProfile}
                          />
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Nhấn vào biểu tượng máy ảnh để thay đổi ảnh đại diện
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Họ và tên</label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        disabled={isLoadingProfile}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={isLoadingProfile}
                      />
                    </div>

                    <Button type="submit" disabled={isLoadingProfile}>
                      {isLoadingProfile ? "Đang lưu..." : "Lưu Thay đổi"}
                    </Button>
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
                  {passwordError && (
                    <Alert variant="destructive" className="mb-4">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Mật khẩu hiện tại
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        disabled={isLoadingPassword}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Mật khẩu mới
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        disabled={isLoadingPassword}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Xác nhận mật khẩu mới
                      </label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        disabled={isLoadingPassword}
                      />
                    </div>

                    <Button type="submit" disabled={isLoadingPassword}>
                      {isLoadingPassword
                        ? "Đang thay đổi..."
                        : "Thay đổi Mật khẩu"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Notifications
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
            </Card> */}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
