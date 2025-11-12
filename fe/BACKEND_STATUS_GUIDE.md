# Hướng dẫn: Truy vấn Status từ Backend

## Tổng quan

Backend API trả về dữ liệu với các status chuẩn. Dưới đây là hướng dẫn chi tiết về cách sử dụng status trong Frontend.

## 1. Project Status từ Backend

### Status Types

Backend trả về các giá trị status sau cho Projects:

```typescript
type ProjectStatus =
  | "available"
  | "pending"
  | "completed"
  | "approved"
  | "rejected"
  | "expired";
```

### Ví dụ Response từ BE:

```json
{
  "projects": [
    {
      "id": 1,
      "title": "Xây dựng hệ thống quản lý",
      "description": "Mô tả dự án...",
      "teacherId": 5,
      "studentId": 10,
      "status": "available",
      "createdAt": "2025-01-15T10:00:00Z",
      "studentCount": 3,
      "teacherInstructor": "Nguyễn Văn A"
    }
  ],
  "totalProjects": 50
}
```

## 🎨 2. Cách sử dụng Status trong Frontend

### Bước 1: Import types và utilities

```typescript
import { ProjectStatus } from "@/types/status";
import {
  getProjectStatusColor,
  getProjectStatusLabel,
  countProjectsByStatus,
} from "@/lib/project-utils";
```

### Bước 2: Sử dụng trong Component

```typescript
export default function ProjectsPage() {
  // Lấy dữ liệu từ API hook
  const { isLoading, projectsManagement } = useAdminProjectsManagement();
  const projects = projectsManagement?.projects || [];

  // Đếm số lượng theo status
  const availableCount = countProjectsByStatus(projects, "available");
  const pendingCount = countProjectsByStatus(projects, "pending");

  return (
    <div>
      {projects.map((project) => (
        <div key={project.id}>
          {/* Hiển thị label từ status */}
          <span className={getProjectStatusColor(project.status)}>
            {getProjectStatusLabel(project.status)}
          </span>
        </div>
      ))}
    </div>
  );
}
```

## 🛠️ 3. Utility Functions có sẵn

### `getProjectStatusLabel(status: ProjectStatus): string`

Chuyển đổi status code thành label tiếng Việt

```typescript
getProjectStatusLabel("available"); // → "Mở"
getProjectStatusLabel("pending"); // → "Đang thực hiện"
getProjectStatusLabel("completed"); // → "Hoàn thành"
```

### `getProjectStatusColor(status: ProjectStatus): string`

Trả về Tailwind CSS classes cho màu sắc

```typescript
getProjectStatusColor("available"); // → "bg-green-100 text-green-700"
getProjectStatusColor("rejected"); // → "bg-red-100 text-red-700"
```

### `countProjectsByStatus(projects, status)`

Đếm số lượng projects theo status

```typescript
const availableProjects = countProjectsByStatus(projects, "available");
```

## 📊 4. Ví dụ thực tế: Trang Admin Projects

```typescript
// File: app/admin/projects/page.tsx
import { useMemo } from "react";
import { useAdminProjectsManagement } from "@/hooks/useAdminProjectsManagement";
import {
  getProjectStatusColor,
  getProjectStatusLabel,
  countProjectsByStatus,
} from "@/lib/project-utils";

export default function AdminProjectsPage() {
  // 1. Lấy dữ liệu từ BE
  const { isLoading, projectsManagement } = useAdminProjectsManagement();
  const projects = projectsManagement?.projects || [];

  // 2. Tính toán statistics từ BE data
  const stats = useMemo(
    () => [
      {
        label: "Tổng đề tài",
        value: projects.length,
        icon: BookOpen,
        color: "bg-blue-100 text-blue-600",
      },
      {
        label: "Mở",
        value: countProjectsByStatus(projects, "available"),
        icon: BookOpen,
        color: "bg-green-100 text-green-600",
      },
      {
        label: "Đang thực hiện",
        value: countProjectsByStatus(projects, "pending"),
        icon: Clock,
        color: "bg-blue-100 text-blue-600",
      },
    ],
    [projects]
  );

  // 3. Hiển thị trong UI
  return (
    <div>
      {/* Stats Cards */}
      {stats.map((stat) => (
        <StatsCard key={stat.label} {...stat} />
      ))}

      {/* Project List */}
      {projects.map((project) => (
        <div key={project.id}>
          <h3>{project.title}</h3>

          {/* Badge hiển thị status */}
          <span className={getProjectStatusColor(project.status)}>
            {getProjectStatusLabel(project.status)}
          </span>

          <p>{project.description}</p>
          <p>Giáo viên: {project.teacherInstructor}</p>
          <p>Số SV: {project.studentCount}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔄 5. Submission Status (tương tự)

```typescript
type SubmissionStatus =
  | "submitted" // Đã nộp
  | "reviewed" // Đã xem xét
  | "approved" // Đã phê duyệt
  | "rejected"; // Đã từ chối
```

Sử dụng tương tự với Project Status:

- `SUBMISSION_STATUS_LABELS`
- `SUBMISSION_STATUS_COLORS`

## 📝 6. Các file liên quan

```
fe/
├── types/
│   └── status.ts                    # Định nghĩa các status types
├── lib/
│   └── project-utils.ts             # Utility functions cho projects
├── hooks/
│   └── useAdminProjectsManagement.ts # Hook lấy data từ BE
└── service/
    └── admin-service.ts             # API calls
```

## ✅ Best Practices

1. **Luôn sử dụng type-safe status**

   ```typescript
   // ✅ Good
   const status: ProjectStatus = "available";

   // ❌ Bad
   const status = "open"; // Wrong status value
   ```

2. **Sử dụng utility functions thay vì hardcode**

   ```typescript
   // ✅ Good
   getProjectStatusLabel(project.status);

   // ❌ Bad
   project.status === "available" ? "Mở" : "Khác";
   ```

3. **Đếm status từ BE data, không dùng mock**

   ```typescript
   // ✅ Good - Từ BE
   countProjectsByStatus(projects, "available");

   // ❌ Bad - Từ mock
   mockProjects.filter((p) => p.status === "open").length;
   ```

4. **Type-safe filtering**

   ```typescript
   // ✅ Good
   projects.filter((p) => p.status === "available");

   // ❌ Bad - typo in status
   projects.filter((p) => p.status === "open"); // Wrong!
   ```

## 🚨 Lỗi thường gặp

### Lỗi 1: Sử dụng sai status value

```typescript
// ❌ Wrong - "open" không có trong ProjectStatus
mockProjects.filter((p) => p.status === "open");

// ✅ Correct
projects.filter((p) => p.status === "available");
```

### Lỗi 2: Mix mock data và real data

```typescript
// ❌ Wrong
const mockCount = mockProjects.filter(...).length
const realProjects = projectsManagement?.projects

// ✅ Correct - chỉ dùng data từ BE
const projects = projectsManagement?.projects || [];
const count = countProjectsByStatus(projects, "available");
```

## 📚 Tham khảo

- **Types Definition**: `types/status.ts`
- **Utilities**: `lib/project-utils.ts`
- **Example Usage**: `app/admin/projects/page.tsx`
- **API Service**: `service/admin-service.ts`
