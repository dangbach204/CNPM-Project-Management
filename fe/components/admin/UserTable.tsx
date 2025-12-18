"use client";

import UserRow from "./UserRow";
import { User } from "@/types/auth";

interface UserTableProps {
  users: User[];
  currentUserId?: number;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  deleteLoading?: boolean;
}

export default function UserTable({
  users,
  currentUserId,
  onEdit,
  onDelete,
  deleteLoading = false,
}: UserTableProps) {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">
          Không tìm thấy người dùng nào
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-linear-to-r from-gray-50 to-slate-50 border-b border-gray-200">
            <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">
              Người dùng
            </th>
            <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">
              Email
            </th>
            <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">
              Vai trò
            </th>
            <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm">
              Hành động
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              deleteLoading={deleteLoading}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
