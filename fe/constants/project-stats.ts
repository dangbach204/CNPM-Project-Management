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
    statusKey: "open",
    icon: BookOpen,
    color: "bg-green-100 text-green-600",
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
    color: "bg-blue-100 text-blue-600",
  },
  {
    label: "Hết hạn",
    statusKey: "expired",
    icon: CheckCircle,
    color: "bg-red-100 text-red-600",
  },
] as const;
