import { BookOpen, CheckCircle, Clock, FolderOpen } from "lucide-react";

export const PROJECT_STATS_CONFIG = [
  {
    label: "Tổng đề tài",
    statusKey: null,
    icon: FolderOpen,
    color: "bg-blue-100 text-blue-600",
  },
  {
    label: "Mở",
    statusKey: "available",
    icon: BookOpen,
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    label: "Đang thực hiện",
    statusKey: "pending",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    label: "Hoàn thành",
    statusKey: "completed",
    icon: CheckCircle,
    color: "bg-green-100 text-green-600",
  },
  {
    label: "Đã phê duyệt",
    statusKey: "approved",
    icon: CheckCircle,
    color: "bg-purple-100 text-purple-600",
  },
] as const;
