"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";

interface UserFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleChange: (value: string) => void;
  onAddUser: () => void;
}

export default function UserFilterBar({
  searchValue,
  onSearchChange,
  roleFilter,
  onRoleChange,
  onAddUser,
}: UserFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-xl shadow-sm border">
      {/* Ô tìm kiếm */}
      <div className="relative w-full sm:w-1/2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Tìm kiếm người dùng..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Bộ lọc vai trò + nút thêm */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Select value={roleFilter} onValueChange={onRoleChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Lọc theo vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="teacher">Giảng viên</SelectItem>
            <SelectItem value="student">Sinh viên</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onAddUser} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm người dùng
        </Button>
      </div>
    </div>
  );
}
