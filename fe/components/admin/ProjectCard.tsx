import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Users, Calendar, User } from "lucide-react";
import {
  getProjectStatusColor,
  getProjectStatusLabel,
} from "@/lib/project-utils";
import {
  formatDate,
  getTeacherName,
  getFieldValue,
} from "@/lib/project-helpers";
import { ViewStudentsDialog } from "@/components/admin/ViewStudentsDialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: any;
  onEdit?: (project: any) => void;
  onDelete?: (project: any) => void;
  teachers?: Array<{
    id: number;
    fullName?: string;
    full_name?: string;
    email: string;
  }>;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  teachers,
}: ProjectCardProps) {
  const [viewStudentsOpen, setViewStudentsOpen] = useState(false);
  const studentCount =
    getFieldValue(project, "studentCount", "student_count") || 0;

  const canDelete = !["completed", "approved"].includes(project.status);

  return (
    <>
      <ViewStudentsDialog
        open={viewStudentsOpen}
        onClose={() => setViewStudentsOpen(false)}
        projectTitle={project.title}
        students={project.students}
      />

      <div className="border rounded-lg p-5 hover:shadow-lg transition-all bg-white group">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold truncate">{project.title}</h2>
              <span
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap",
                  getProjectStatusColor(project.status)
                )}
              >
                {getProjectStatusLabel(project.status)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description || "Không có mô tả."}
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => onEdit?.(project)}
            >
              <Edit2 className="w-3.5 h-3.5" /> Sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-1.5",
                canDelete
                  ? "text-destructive border-destructive hover:bg-destructive hover:text-white"
                  : "opacity-50 cursor-not-allowed"
              )}
              onClick={() => canDelete && onDelete?.(project)}
              disabled={!canDelete}
              title={
                !canDelete
                  ? "Không thể xóa đề tài đã hoàn thành hoặc đã phê duyệt"
                  : "Xóa đề tài"
              }
            >
              <Trash2 className="w-3.5 h-3.5" /> Xóa
            </Button>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
          <div className="border rounded-lg p-3 bg-muted/30">
            <p className="text-muted-foreground text-xs font-medium flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5" />
              Giảng viên
            </p>
            <p className="font-semibold text-foreground">
              {getTeacherName(project, teachers)}
            </p>
          </div>
          <div className="border rounded-lg p-3 bg-muted/30">
            <p className="text-muted-foreground text-xs font-medium flex items-center gap-1.5 mb-1.5">
              <Users className="w-3.5 h-3.5" />
              Sinh viên
            </p>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{studentCount}</p>
              {studentCount > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs font-semibold"
                  onClick={() => setViewStudentsOpen(true)}
                >
                  Xem
                </Button>
              )}
            </div>
          </div>
          <div className="border rounded-lg p-3 bg-muted/30">
            <p className="text-muted-foreground text-xs font-medium flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Ngày tạo
            </p>
            <p className="font-semibold text-foreground">
              {formatDate(getFieldValue(project, "createdAt", "created_at"))}
            </p>
          </div>
          <div className="border rounded-lg p-3 bg-amber-50/50 border-amber-200">
            <p className="text-amber-700 text-xs font-medium flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Hết hạn
            </p>
            <p className="font-semibold text-amber-900">
              {formatDate(
                getFieldValue(project, "expiredAt", "expired_at", "deadline")
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
