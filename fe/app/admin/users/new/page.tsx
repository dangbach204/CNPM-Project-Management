"use client";

import type React from "react";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createUser } from "@/service/admin-service";
import {
  ArrowLeft,
  Upload,
  X,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  avatar?: string;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Quản trị viên" },
  { value: "teacher", label: "Giảng viên" },
  { value: "student", label: "Sinh viên" },
];

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const UserForm = () => {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));

    if (errors.role) {
      setErrors((prev) => ({
        ...prev,
        role: undefined,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    setErrors((prev) => ({ ...prev, avatar: undefined }));

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Kích thước ảnh không được vượt quá 2MB",
      }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Vui lòng chọn file ảnh hợp lệ",
      }));
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setErrors((prev) => ({ ...prev, avatar: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Vui lòng nhập địa chỉ email hợp lệ";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (!formData.role) {
      newErrors.role = "Vui lòng chọn vai trò";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = useMemo(() => {
    return (
      formData.fullName.trim().length > 0 &&
      formData.email.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.password.length >= 8 &&
      formData.confirmPassword.length >= 8 &&
      formData.password === formData.confirmPassword &&
      formData.role !== "" &&
      !errors.avatar
    );
  }, [formData, errors.avatar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const submitData: any = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      if (avatarFile) {
        submitData.avatar = avatarFile;
      }

      await createUser(submitData);

      toast({
        title: "Thành công",
        description: "Người dùng đã được tạo thành công!",
      });

      setTimeout(() => {
        router.push("/admin/users");
      }, 500);
    } catch (error: any) {
      console.error("Error creating user:", error);

      const errorMessage =
        error?.response?.data?.message ||
        "Có lỗi xảy ra khi tạo người dùng. Vui lòng thử lại.";

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-lg border-gray-200 shadow-lg">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/users")}
              className="gap-2 text-gray-600 hover:text-gray-900"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Tạo người dùng
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Thêm người dùng mới vào hệ thống
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            autoComplete="off"
          >
            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center space-y-3 pb-5 border-b border-gray-100">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={avatarPreview || undefined} alt="Avatar" />
                <AvatarFallback className="text-xl font-semibold bg-blue-500 text-white">
                  {formData.fullName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex gap-2">
                <label htmlFor="avatar-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2 cursor-pointer"
                    disabled={isLoading}
                    asChild
                  >
                    <span>
                      <Upload className="w-4 h-4" />
                      Chọn ảnh
                    </span>
                  </Button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>

                {avatarFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={isLoading}
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                    Xóa
                  </Button>
                )}
              </div>

              {errors.avatar && (
                <p className="text-xs text-red-600">{errors.avatar}</p>
              )}
              <p className="text-xs text-gray-500 text-center">
                Tuỳ chọn. Chấp nhận: JPG, PNG, GIF. Tối đa 2MB
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="fullName"
                className="text-sm font-medium text-gray-700"
              >
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Nhập họ và tên đầy đủ"
                value={formData.fullName}
                onChange={handleChange}
                className={`h-10 ${
                  errors.fullName ? "border-red-500" : "border-gray-200"
                }`}
                disabled={isLoading}
                autoComplete="off"
              />
              {errors.fullName && (
                <p className="text-xs text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@domain.com"
                value={formData.email}
                onChange={handleChange}
                className={`h-10 ${
                  errors.email ? "border-red-500" : "border-gray-200"
                }`}
                disabled={isLoading}
                autoComplete="off"
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  className={`h-10 pr-10 ${
                    errors.password ? "border-red-500" : "border-gray-200"
                  }`}
                  disabled={isLoading}
                  autoComplete="new-password"
                  style={
                    {
                      WebkitTextSecurity: showPassword ? "none" : undefined,
                    } as React.CSSProperties & { WebkitTextSecurity?: string }
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-red-600">{errors.password}</p>
              ) : (
                <p className="text-xs text-gray-500">Tối thiểu 8 ký tự</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`h-10 pr-10 ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-200"
                  }`}
                  disabled={isLoading}
                  autoComplete="new-password"
                  style={
                    {
                      WebkitTextSecurity: showConfirmPassword
                        ? "none"
                        : undefined,
                    } as React.CSSProperties & { WebkitTextSecurity?: string }
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
              {/* Show warning if passwords don't match while typing */}
              {!errors.confirmPassword &&
                formData.confirmPassword.length > 0 &&
                formData.password !== formData.confirmPassword && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Mật khẩu không khớp</span>
                  </div>
                )}
              {/* Show success if passwords match */}
              {formData.confirmPassword.length > 0 &&
                formData.password === formData.confirmPassword &&
                formData.password.length >= 8 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Mật khẩu khớp
                  </p>
                )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label
                htmlFor="role"
                className="text-sm font-medium text-gray-700"
              >
                Vai trò <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={handleRoleChange}
                disabled={isLoading}
              >
                <SelectTrigger
                  id="role"
                  className={`h-10 ${
                    errors.role ? "border-red-500" : "border-gray-200"
                  }`}
                >
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Tạo người dùng
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserForm;
