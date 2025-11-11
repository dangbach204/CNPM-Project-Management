export type UserRole = "admin" | "teacher" | "student"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  department?: string
}

export interface Project {
  id: string
  title: string
  description: string
  teacherId: string
  status: string
  startDate: string
  expiredAt: string
  maxStudents: number
  enrolledStudents: string[]
  createdAt: string
}

export interface Submission {
  id: string
  projectId: string
  studentId: string
  title: string
  description: string
  fileUrl: string
  submittedAt: string
  status: string
}

export interface Grade {
  id: string
  submissionId: string
  score: number
  maxScore: number
  feedback: string
  gradedAt: string
  gradedBy: string
}

export interface Comment {
  id: string
  submissionId: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

// Mock Submissions
export const mockSubmissions: Submission[] = [
  {
    id: "sub-1",
    projectId: "proj-1",
    studentId: "student-1",
    title: "Phiên bản 1.0 - Frontend hoàn thành",
    description: "Hoàn thành giao diện người dùng cho trang chủ, danh sách sản phẩm và giỏ hàng.",
    fileUrl: "/submissions/ecommerce-v1.zip",
    submittedAt: "2025-02-20",
    status: "reviewed",
  },
  {
    id: "sub-2",
    projectId: "proj-1",
    studentId: "student-2",
    title: "Phiên bản 1.0 - Backend API",
    description: "Xây dựng API cho quản lý sản phẩm, đơn hàng và thanh toán.",
    fileUrl: "/submissions/ecommerce-api-v1.zip",
    submittedAt: "2025-02-25",
    status: "submitted",
  },
  {
    id: "sub-3",
    projectId: "proj-4",
    studentId: "student-1",
    title: "Chat App - Final Submission",
    description: "Ứng dụng chat hoàn chỉnh với tất cả các tính năng yêu cầu.",
    fileUrl: "/submissions/chat-app-final.zip",
    submittedAt: "2025-01-28",
    status: "approved",
  },
]

// Mock Grades
export const mockGrades: Grade[] = [
  {
    id: "grade-1",
    submissionId: "sub-1",
    score: 85,
    maxScore: 100,
    feedback: "Giao diện đẹp, nhưng cần cải thiện responsive design trên mobile.",
    gradedAt: "2025-02-22",
    gradedBy: "teacher-1",
  },
  {
    id: "grade-2",
    submissionId: "sub-3",
    score: 95,
    maxScore: 100,
    feedback: "Xuất sắc! Tất cả các tính năng đều hoạt động tốt. Mã nguồn sạch và dễ bảo trì.",
    gradedAt: "2025-01-30",
    gradedBy: "teacher-2",
  },
]

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: "comment-1",
    submissionId: "sub-1",
    userId: "teacher-1",
    userName: "Trần Thị Giáo Viên",
    content: "Bạn cần thêm validation cho form đăng nhập. Hãy kiểm tra lại yêu cầu.",
    createdAt: "2025-02-21",
  },
  {
    id: "comment-2",
    submissionId: "sub-1",
    userId: "student-1",
    userName: "Phạm Minh Học Sinh",
    content: "Cảm ơn thầy! Tôi sẽ sửa ngay.",
    createdAt: "2025-02-21",
  },
]
