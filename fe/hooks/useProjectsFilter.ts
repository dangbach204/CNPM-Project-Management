import { useMemo, useState } from "react";
import { getTeacherName } from "@/lib/project-helpers";

export function useProjectsFilter(projects: any[]) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return projects.filter((p: any) => {
      const teacherName = getTeacherName(p).toLowerCase();
      const matchesSearch =
        !term ||
        p.title?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        teacherName.includes(term);

      if (filterStatus === "all") return matchesSearch;
      return matchesSearch && p.status === filterStatus;
    });
  }, [projects, searchTerm, filterStatus]);

  return {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filteredProjects,
  };
}