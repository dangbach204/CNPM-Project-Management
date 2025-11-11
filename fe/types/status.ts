export type ProjectStatus =
  | "available"
  | "pending"
  | "completed"
  | "approved"
  | "rejected"
  | "expired";

// Submission Status từ Backend
export type SubmissionStatus =
  | "submitted"
  | "reviewed"
  | "approved"
  | "rejected";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  available: "Mở",
  pending: "Đang thực hiện",
  completed: "Hoàn thành",
  approved: "Đã phê duyệt",
  rejected: "Đã từ chối",
  expired: "Hết hạn",
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  available: "bg-green-100 text-green-700",
  pending: "bg-blue-100 text-blue-700",
  completed: "bg-gray-100 text-gray-700",
  approved: "bg-purple-100 text-purple-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-orange-100 text-orange-700",
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
