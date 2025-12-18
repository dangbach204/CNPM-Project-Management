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
      <div className="flex h-screen">
        {/* Sidebar and Header remain unchanged */}
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          {/* Main content with subtle blurred background */}
          <main className="flex-1 overflow-y-auto relative">
            {/* Background wrapper - decorative only */}
            <div className="absolute top-0 left-0 w-full h-full min-h-full overflow-hidden z-0 pointer-events-none">
              {/* Blurred background image */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: "url(/bkhoa2.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "top center",
                  backgroundRepeat: "no-repeat",
                  filter: "blur(10px)",
                  opacity: 0.6,
                  transform: "scale(1.1)",
                }}
              />
              {/* Gradient overlay (fade to white) */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0.95) 55%)",
                }}
              />
            </div>

            {/* Content layer */}
            <div className="relative z-10 min-h-full py-8 px-6 sm:px-8">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Cài đặt
                  </h1>
                  <p className="text-[20px] text-gray-600 mt-1.5">
                    Quản lý tài khoản và cài đặt cá nhân
                  </p>
                </div>

                {/* Profile Settings - Primary */}
                <Card className="bg-white border-gray-300/80 shadow-lg">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <CardTitle className="text-xl">Hồ sơ Cá nhân</CardTitle>
                    </div>
                    <CardDescription className="text-[13px]">
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
                    <form onSubmit={handleSaveProfile} className="space-y-5">
                      <div className="flex flex-col items-center space-y-3 mb-6 pb-6 border-b border-gray-200">
                        <div className="relative group">
                          <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
                            <AvatarImage
                              src={
                                avatarPreview ||
                                user?.avatar ||
                                "/placeholder.svg"
                              }
                              alt="Avatar"
                            />
                            <AvatarFallback className="text-2xl font-semibold bg-linear-to-br from-blue-500 to-blue-600 text-white">
                              {user?.fullName?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <label
                            htmlFor="avatar-upload"
                            className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-all shadow-lg group-hover:scale-110"
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
                        <p className="text-[12px] text-gray-500 text-center">
                          Nhấp vào biểu tượng để thay đổi ảnh đại diện
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-gray-700">
                          Họ và tên
                        </label>
                        <Input
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fullName: e.target.value,
                            })
                          }
                          disabled={isLoadingProfile}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-gray-700">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          disabled={isLoadingProfile}
                          className="h-11"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoadingProfile}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoadingProfile ? "Đang lưu..." : "Lưu Thay đổi"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Change Password - Secondary */}
                <Card className="bg-white border-gray-300/80 shadow-md">
                  <CardHeader className="pb-5">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                        <Lock className="w-4 h-4 text-gray-600" />
                      </div>
                      <CardTitle className="text-lg">
                        Thay đổi Mật khẩu
                      </CardTitle>
                    </div>
                    <CardDescription className="text-[13px]">
                      Cập nhật mật khẩu của bạn
                    </CardDescription>
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
                        <label className="text-[13px] font-semibold text-gray-700">
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
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-gray-700">
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
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[13px] font-semibold text-gray-700">
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
                          className="h-11"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoadingPassword}
                        className="w-full sm:w-auto"
                        variant="outline"
                      >
                        {isLoadingPassword
                          ? "Đang thay đổi..."
                          : "Thay đổi Mật khẩu"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
