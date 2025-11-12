import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Users } from "lucide-react";
import { getProjectStatusColor, getProjectStatusLabel } from "@/lib/project-utils";
import { formatDate, getTeacherName, getFieldValue } from "@/lib/project-helpers";

interface ProjectCardProps {
  project: any;
  onEdit?: (project: any) => void;
  onDelete?: (project: any) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${getProjectStatusColor(
              project.status
            )}`}
          >
            {getProjectStatusLabel(project.status)}
          </span>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          {project.description}
        </p>

        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Giảng viên hướng dẫn</p>
            <p className="font-medium">{getTeacherName(project)}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              Sinh viên
            </p>
            <p className="font-medium">
              {getFieldValue(project, "studentCount", "student_count") || 0}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Ngày tạo</p>
            <p className="font-medium">
              {formatDate(getFieldValue(project, "createdAt", "created_at"))}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Ngày hết hạn</p>
            <p className="font-medium">
              {formatDate(
                getFieldValue(project, "expiredAt", "expired_at", "deadline")
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => onEdit?.(project)}
        >
          <Edit2 className="w-4 h-4" />
          Sửa
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-destructive hover:text-destructive"
          onClick={() => onDelete?.(project)}
        >
          <Trash2 className="w-4 h-4" />
          Xóa
        </Button>
      </div>
    </div>
  );
}