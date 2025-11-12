import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { getProjectStatusLabel } from "@/lib/project-utils";

interface ProjectsSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterChange: (status: string) => void;
}

const STATUS_OPTIONS = [
  "all",
  "available",
  "pending",
  "completed",
  "approved",
  "rejected",
  "expired",
] as const;

export function ProjectsSearchFilter({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
}: ProjectsSearchFilterProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo tên, mô tả hoặc giảng viên..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            onClick={() => onFilterChange(status)}
          >
            {status === "all" ? "Tất cả" : getProjectStatusLabel(status as any)}
          </Button>
        ))}
      </div>
    </div>
  );
}