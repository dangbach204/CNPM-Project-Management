import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { getProjectStatusLabel } from "@/lib/project-utils";
import { cn } from "@/lib/utils";

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
    <div className="space-y-4 bg-white/95 backdrop-blur-sm p-6 rounded-lg shadow-sm border">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo tên, mô tả hoặc giảng viên..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-11"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Buttons */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2.5">
          Lọc theo trạng thái
        </p>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((status) => {
            const isActive = filterStatus === status;
            return (
              <Button
                key={status}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange(status)}
                className={cn("transition-all", isActive && "shadow-md")}
              >
                {status === "all"
                  ? "Tất cả"
                  : getProjectStatusLabel(status as any)}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
