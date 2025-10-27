// Mock data for the student project management system

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
  status: "open" | "in-progress" | "completed" | "archived"
  startDate: string
  endDate: string
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
  status: "submitted" | "reviewed" | "approved" | "rejected"
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

// Mock Users
export const mockUsers: User[] = [
  {
    id: "admin-1",
    email: "admin@university.edu",
    name: "Nguyễn Văn Admin",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    department: "Administration",
  },
  {
    id: "teacher-1",
    email: "teacher1@university.edu",
    name: "Trần Thị Giáo Viên",
    role: "teacher",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1",
    department: "Computer Science",
  },
  {
    id: "teacher-2",
    email: "teacher2@university.edu",
    name: "Lê Văn Thầy",
    role: "teacher",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2",
    department: "Information Technology",
  },
  {
    id: "student-1",
    email: "student1@university.edu",
    name: "Phạm Minh Học Sinh",
    role: "student",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student1",
    department: "Computer Science",
  },
  {
    id: "student-2",
    email: "student2@university.edu",
    name: "Võ Thị Sinh Viên",
    role: "student",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student2",
    department: "Computer Science",
  },
  {
    id: "student-3",
    email: "student3@university.edu",
    name: "Đặng Văn Tài Năng",
    role: "student",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=student3",
    department: "Information Technology",
  },
]

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: "proj-1",
    title: "Xây dựng Website E-commerce",
    description:
      "Phát triển một nền tảng thương mại điện tử hoàn chỉnh với các tính năng thanh toán, quản lý sản phẩm và đơn hàng.",
    teacherId: "teacher-1",
    status: "in-progress",
    startDate: "2025-01-15",
    endDate: "2025-04-30",
    maxStudents: 3,
    enrolledStudents: ["student-1", "student-2"],
    createdAt: "2025-01-10",
  },
  {
    id: "proj-2",
    title: "Ứng dụng Quản lý Nhiệm vụ",
    description: "Tạo một ứng dụng web để quản lý các nhiệm vụ hàng ngày với tính năng cộng tác nhóm.",
    teacherId: "teacher-1",
    status: "open",
    startDate: "2025-02-01",
    endDate: "2025-05-31",
    maxStudents: 4,
    enrolledStudents: ["student-3"],
    createdAt: "2025-01-20",
  },
  {
    id: "proj-3",
    title: "Hệ thống Quản lý Thư viện",
    description: "Phát triển hệ thống quản lý thư viện với chức năng mượn sách, trả sách và tìm kiếm.",
    teacherId: "teacher-2",
    status: "open",
    startDate: "2025-02-15",
    endDate: "2025-06-15",
    maxStudents: 3,
    enrolledStudents: [],
    createdAt: "2025-01-25",
  },
  {
    id: "proj-4",
    title: "Ứng dụng Chat Realtime",
    description: "Xây dựng ứng dụng chat với tính năng tin nhắn realtime, chia sẻ file và video call.",
    teacherId: "teacher-2",
    status: "completed",
    startDate: "2024-11-01",
    endDate: "2025-01-31",
    maxStudents: 2,
    enrolledStudents: ["student-1"],
    createdAt: "2024-10-20",
  },
]

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
