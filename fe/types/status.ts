export type ProjectStatus =
  | "open"
  | "pending"
  | "completed"
  | "expired";

export type SubmissionStatus =
  | "submitted"
  | "reviewed"
  | "approved"
  | "rejected";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  open: "Mở",
  pending: "Đang thực hiện",
  completed: "Hoàn thành",
  expired: "Hết hạn",
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  open: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-blue-100 text-blue-700",
  expired: "bg-red-100 text-red-700",
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  submitted: "Đã nộp",
  reviewed: "Đã xem xét",
  approved: "Đã phê duyệt",
  rejected: "Đã từ chối",
};

export const SUBMISSION_STATUS_COLORS: Record<SubmissionStatus, string> = {
  submitted: "bg-blue-100 text-blue-700",
  reviewed: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export const PROJECT_STATUS_OPTIONS = [
  { value: "open", label: "Mở" },
  { value: "pending", label: "Đang thực hiện" },
  { value: "completed", label: "Hoàn thành" },
  { value: "expired", label: "Hết hạn" },
] as const;
