"use client";

import UserRow from "./UserRow";
import { User } from "@/types/auth";
import { Card, CardContent } from "@/components/ui/card";

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
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Không tìm thấy người dùng nào
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-muted/50 text-sm text-muted-foreground">
                <th className="text-left py-3 px-5 font-semibold rounded-tl-lg">
                  Tên
                </th>
                <th className="text-left py-3 px-5 font-semibold">Email</th>
                <th className="text-center py-3 px-5 font-semibold">Vai trò</th>
                <th className="text-center py-3 px-5 font-semibold rounded-tr-lg">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
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
      </CardContent>
    </Card>
  );
}
