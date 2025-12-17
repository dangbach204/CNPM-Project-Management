import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Users, Calendar, Clock } from "lucide-react";
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

  const getStatusBadge = () => {
    const status = project.status;
    if (status === "open" || status === "Mở") {
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    } else if (status === "approved" || status === "Đã phê duyệt") {
      return "bg-green-100 text-green-700 hover:bg-green-100";
    } else if (status === "expired" || status === "Hết hạn") {
      return "bg-gray-100 text-gray-600 hover:bg-gray-100";
    }
    return "bg-gray-100 text-gray-600 hover:bg-gray-100";
  };

  return (
    <>
      <ViewStudentsDialog
        open={viewStudentsOpen}
        onClose={() => setViewStudentsOpen(false)}
        projectTitle={project.title}
        students={project.students}
      />

      {/* Compact card with single-row layout */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
        {/* Top row: Title + Badge + Actions */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[15px] font-semibold text-gray-900 truncate">
                {project.title}
              </h3>
              <Badge className={`text-[10px] px-2 py-0.5 ${getStatusBadge()}`}>
                {getProjectStatusLabel(project.status)}
              </Badge>
            </div>
            {/* Description - single line */}
            <p className="text-[13px] text-gray-600 line-clamp-1">
              {project.description || "Không có mô tả"}
            </p>
          </div>

          {/* Action buttons - compact */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-[12px] text-gray-700 border-gray-300"
              onClick={() => onEdit?.(project)}
            >
              <Edit2 className="w-3.5 h-3.5 mr-1" /> Sửa
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[12px] text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onDelete?.(project)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa
            </Button>
          </div>
        </div>

        {/* Bottom row: Metadata inline */}
        <div className="flex items-center gap-4 text-[11px] text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span className="font-medium">{studentCount}</span>
            {studentCount > 0 && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-[11px] text-blue-600 hover:text-blue-700 font-medium underline"
                onClick={() => setViewStudentsOpen(true)}
              >
                Xem
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Tạo:{" "}
              {formatDate(getFieldValue(project, "createdAt", "created_at"))}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Hạn:{" "}
              {formatDate(
                getFieldValue(project, "expiredAt", "expired_at", "deadline")
              )}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
