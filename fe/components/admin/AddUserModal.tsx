"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface AddUserModalProps {
  onClose: () => void;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
  }) => void;
}

function AddUserModal({ onClose, onSubmit }: AddUserModalProps) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [error, setError] = useState("");

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.role) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    onSubmit(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-xl">
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Thêm người dùng</h2>
            <p className="text-muted-foreground text-sm">Thêm một người dùng mới vào hệ thống</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />
            <Input
              placeholder="Last Name"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
            />
          </div>

          <Input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <Input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />

          <Input
            placeholder="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
          />

          <Select onValueChange={(value) => handleChange("role", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="student">Student</SelectItem>
            </SelectContent>
          </Select>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>Create User</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddUserModal;