import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Users } from "lucide-react";
import {
  getProjectStatusColor,
  getProjectStatusLabel,
} from "@/lib/project-utils";
import { formatDate, getFieldValue } from "@/lib/project-helpers";
import { ViewStudentsDialog } from "@/components/admin/ViewStudentsDialog";
import { useState } from "react";

interface ProjectCardProps {
  project: any;
  onEdit?: (project: any) => void;
  onDelete?: (project: any) => void;
}

export function TeacherProjectCard({
  project,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const [viewStudentsOpen, setViewStudentsOpen] = useState(false);
  const studentCount =
    getFieldValue(project, "studentCount", "student_count") || 0;

  return (
    <>
      <ViewStudentsDialog
        open={viewStudentsOpen}
        onClose={() => setViewStudentsOpen(false)}
        projectTitle={project.title}
        students={project.students}
      />

      <div className="border rounded-2xl p-6 shadow-sm hover:shadow-md transition bg-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              {project.title}
              <span
                className={`text-xs px-2 py-1 rounded-full ${getProjectStatusColor(
                  project.status
                )}`}
              >
                {getProjectStatusLabel(project.status)}
              </span>
            </h2>
            <p className="text-muted-foreground">
              {project.description || "Không có mô tả."}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => onEdit?.(project)}
            >
              <Edit2 className="w-4 h-4" /> Sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-destructive border-destructive hover:bg-destructive/10"
              onClick={() => onDelete?.(project)}
            >
              <Trash2 className="w-4 h-4" /> Xóa
            </Button>
          </div>
        </div>

        {/* Info grid - Without teacher info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-sm">
          <div className="border rounded-xl p-3 bg-muted/30">
            <p className="text-muted-foreground font-medium flex items-center gap-1">
              <Users className="w-3 h-3" /> SINH VIÊN
            </p>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-semibold">{studentCount}</p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs font-semibold"
                onClick={() => setViewStudentsOpen(true)}
              >
                Xem
              </Button>
            </div>
          </div>
          <div className="border rounded-xl p-3 bg-muted/30">
            <p className="text-muted-foreground font-medium">NGÀY TẠO</p>
            <p className="font-semibold mt-1">
              {formatDate(getFieldValue(project, "createdAt", "created_at"))}
            </p>
          </div>
          <div className="border rounded-xl p-3 bg-muted/30">
            <p className="text-muted-foreground font-medium">NGÀY HẾT HẠN</p>
            <p className="font-semibold mt-1">
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
