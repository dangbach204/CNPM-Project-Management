import { useState, useMemo } from "react";
import { User } from "@/types/auth";
import { UserRole } from "@/lib/user-utils";

export function useUserFilters(users: User[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterRole === "all") return matchesSearch;
      return matchesSearch && user.role === filterRole;
    });
  }, [users, searchTerm, filterRole]);

  return {
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    filteredUsers,
  };
}
