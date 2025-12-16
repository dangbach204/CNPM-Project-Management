# BÁO CÁO HỆ THỐNG QUẢN LÝ ĐỒ ÁN

## THÔNG TIN CHUNG

**Tên dự án:** Hệ thống Quản lý Đồ án (Project Management System)

**Công nghệ sử dụng:**
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL với Sequelize ORM
- **Authentication:** JWT (JSON Web Token)
- **File Storage:** Cloudinary
- **State Management:** Zustand
- **UI Library:** shadcn/ui, Radix UI

---

## MỤC LỤC

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Chức năng hệ thống](#2-chức-năng-hệ-thống)
3. [Yêu cầu phi chức năng](#3-yêu-cầu-phi-chức-năng)
4. [Kiến trúc hệ thống](#4-kiến-trúc-hệ-thống)
5. [Cơ sở dữ liệu](#5-cơ-sở-dữ-liệu)
6. [API Endpoints](#6-api-endpoints)
7. [Giao diện người dùng](#7-giao-diện-người-dùng)
8. [Bảo mật](#8-bảo-mật)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Giới thiệu

Hệ thống Quản lý Đồ án là một ứng dụng web toàn diện được thiết kế để hỗ trợ quản lý quy trình thực hiện đồ án trong môi trường giáo dục đại học. Hệ thống cung cấp các công cụ để quản lý người dùng, đồ án, bài nộp và đánh giá.

### 1.2. Mục tiêu

- Tự động hóa quy trình quản lý đồ án
- Tăng cường sự minh bạch trong việc phân công và theo dõi đồ án
- Cải thiện hiệu quả giao tiếp giữa sinh viên, giáo viên và quản trị viên
- Cung cấp công cụ đánh giá và theo dõi tiến độ
- Lưu trữ và quản lý tài liệu đồ án một cách có hệ thống

### 1.3. Người dùng hệ thống

Hệ thống phục vụ 3 nhóm người dùng chính:

1. **Quản trị viên (Admin)**
   - Quản lý toàn bộ hệ thống
   - Quản lý người dùng (giáo viên, sinh viên)
   - Quản lý đồ án
   - Xem báo cáo và logs hệ thống

2. **Giáo viên (Teacher)**
   - Quản lý đồ án được phân công
   - Xem danh sách sinh viên trong đồ án
   - Nhận và đánh giá bài nộp
   - Chấm điểm và đưa ra phản hồi

3. **Sinh viên (Student)**
   - Xem đồ án được phân công
   - Nộp báo cáo đồ án
   - Xem điểm và phản hồi
   - Cập nhật thông tin cá nhân

---

## 2. CHỨC NĂNG HỆ THỐNG

### 2.1. Chức năng chung (Tất cả người dùng)

#### 2.1.1. Xác thực và Phân quyền
- **Đăng nhập**
  - Đăng nhập bằng email và mật khẩu
  - Xác thực JWT với access token và refresh token
  - Tự động chuyển hướng dựa trên vai trò người dùng
  
- **Quên mật khẩu** (Giao diện sẵn sàng, chưa kết nối backend)
  - Reset mật khẩu qua email
  
- **Quản lý profile**
  - Cập nhật thông tin cá nhân (họ tên, email)
  - Thay đổi mật khẩu
  - Upload/cập nhật ảnh đại diện (avatar)

#### 2.1.2. Dashboard
- Hiển thị thông tin tổng quan theo vai trò
- Thống kê nhanh về đồ án, bài nộp
- Hiển thị hoạt động gần đây

### 2.2. Chức năng Quản trị viên (Admin)

#### 2.2.1. Quản lý Người dùng
- **Xem danh sách người dùng**
  - Hiển thị tất cả người dùng (admin, giáo viên, sinh viên)
  - Lọc theo vai trò
  - Tìm kiếm theo tên, email
  
- **Thêm người dùng mới**
  - Tạo tài khoản admin, giáo viên, sinh viên
  - Upload avatar khi tạo tài khoản
  - Tự động gửi thông tin đăng nhập (tùy chọn)
  
- **Chỉnh sửa thông tin người dùng**
  - Cập nhật họ tên, email
  - Thay đổi vai trò
  - Cập nhật avatar
  - Kích hoạt/vô hiệu hóa tài khoản
  
- **Xóa người dùng**
  - Xóa mềm (soft delete) với xác nhận
  - Xóa kèm các dữ liệu liên quan

#### 2.2.2. Quản lý Đồ án
- **Xem danh sách đồ án**
  - Hiển thị tất cả đồ án trong hệ thống
  - Thống kê theo trạng thái (pending, in_progress, completed)
  - Lọc và tìm kiếm đồ án
  - Hiển thị số lượng sinh viên tham gia
  
- **Tạo đồ án mới**
  - Nhập tiêu đề và mô tả
  - Phân công giáo viên hướng dẫn
  - Thêm sinh viên vào đồ án
  - Đặt deadline
  - Thiết lập trạng thái ban đầu
  
- **Chỉnh sửa đồ án**
  - Cập nhật thông tin đồ án
  - Thay đổi giáo viên hướng dẫn
  - Thêm/xóa sinh viên
  - Cập nhật trạng thái
  - Thay đổi deadline
  
- **Xóa đồ án**
  - Xóa đồ án với xác nhận
  - Cascade delete: xóa các bài nộp, điểm liên quan
  
#### 2.2.3. Quản lý Bài nộp
- Xem tất cả bài nộp trong hệ thống
- Theo dõi trạng thái bài nộp
- Xem chi tiết sinh viên và đồ án

#### 2.2.4. Báo cáo và Logs
- **Dashboard tổng quan**
  - Tổng số giáo viên, sinh viên
  - Tổng số đồ án (theo trạng thái)
  - Tổng số bài nộp
  - Đồ án và bài nộp mới nhất
  
- **Xem logs hệ thống**
  - Theo dõi các hoạt động: tạo, sửa, xóa
  - Lọc theo loại hoạt động
  - Lọc theo người thực hiện
  - Lọc theo thời gian

### 2.3. Chức năng Giáo viên (Teacher)

#### 2.3.1. Quản lý Đồ án của mình
- **Xem danh sách đồ án được phân công**
  - Hiển thị các đồ án đang hướng dẫn
  - Xem trạng thái từng đồ án
  - Xem danh sách sinh viên trong đồ án
  - Xem thời gian tạo và deadline
  
- **Xem chi tiết đồ án**
  - Thông tin đầy đủ về đồ án
  - Danh sách sinh viên tham gia
  - Lịch sử bài nộp
  - Tiến độ thực hiện

#### 2.3.2. Quản lý Bài nộp
- **Xem danh sách bài nộp**
  - Hiển thị tất cả bài nộp của sinh viên
  - Lọc theo đồ án
  - Lọc theo trạng thái (chờ duyệt, đã chấm)
  - Sắp xếp theo thời gian nộp
  
- **Xem chi tiết bài nộp**
  - Thông tin sinh viên
  - Thông tin đồ án
  - Link báo cáo
  - Thời gian nộp
  
- **Chấm điểm**
  - Nhập điểm số (0-10)
  - Viết nhận xét, phản hồi
  - Lưu lịch sử chấm điểm

#### 2.3.3. Dashboard Giáo viên
- Tổng số đồ án đang hướng dẫn
- Số lượng bài nộp chờ chấm
- Danh sách đồ án gần deadline
- Bài nộp mới nhất

### 2.4. Chức năng Sinh viên (Student)

#### 2.4.1. Xem Đồ án
- **Xem đồ án được phân công**
  - Thông tin chi tiết đồ án
  - Tên giáo viên hướng dẫn
  - Thông tin các thành viên khác (nếu là nhóm)
  - Deadline và trạng thái
  - Yêu cầu và mô tả đồ án

#### 2.4.2. Quản lý Bài nộp
- **Nộp báo cáo**
  - Upload file báo cáo (PDF, DOC)
  - Hoặc đính kèm link Google Drive, OneDrive
  - Xem lại bài nộp trước đó
  - Nộp lại (nếu được phép)
  
- **Xem điểm và phản hồi**
  - Xem điểm đã được chấm
  - Đọc nhận xét của giáo viên
  - Xem lịch sử chấm điểm

#### 2.4.3. Dashboard Sinh viên
- Số lượng đồ án đang thực hiện
- Số lượng bài đã nộp
- Danh sách đồ án gần deadline
- Điểm trung bình
- Thông báo mới

---

## 3. YÊU CẦU PHI CHỨC NĂNG

### 3.1. Hiệu năng
- **Thời gian phản hồi:**
  - Trang web tải trong vòng 2-3 giây
  - API response time < 500ms cho các truy vấn đơn giản
  - API response time < 2s cho các truy vấn phức tạp
  
- **Khả năng mở rộng:**
  - Hỗ trợ ít nhất 500 người dùng đồng thời
  - Database có thể chứa hàng nghìn đồ án và bài nộp

### 3.2. Bảo mật

- **Xác thực và Phân quyền:**
  - Xác thực JWT với access token và refresh token
  - Middleware kiểm tra vai trò người dùng
  - Protected routes cho từng vai trò
  
- **Bảo vệ dữ liệu:**
  - Mật khẩu được hash bằng bcrypt
  - HTTPS cho tất cả các kết nối
  - Ngăn chặn SQL Injection thông qua Sequelize ORM
  - Sanitize input để tránh XSS
  
- **Phân quyền API:**
  - Mỗi endpoint kiểm tra quyền truy cập
  - Role-based access control (RBAC)

### 3.3. Khả dụng
- **Uptime:** 99% availability
- **Backup:** Database backup hàng ngày
- **Recovery:** Khôi phục dữ liệu trong vòng 4 giờ

### 3.4. Khả năng sử dụng
- **Giao diện thân thiện:**
  - Responsive design cho mobile, tablet, desktop
  - Dark mode / Light mode
  - Hover effects và transitions mượt mà
  
- **Trải nghiệm người dùng:**
  - Thông báo rõ ràng cho các hành động
  - Loading states cho các tác vụ bất đồng bộ
  - Form validation với thông báo lỗi cụ thể
  - Xác nhận trước khi xóa dữ liệu quan trọng

### 3.5. Khả năng bảo trì
- **Code quality:**
  - TypeScript cho type safety
  - ESLint và Prettier cho code formatting
  - Component-based architecture
  - Separation of concerns (MVC pattern)
  
- **Logging:**
  - Log tất cả các hành động quan trọng
  - Log errors với stack trace
  - Audit trail cho admin actions

### 3.6. Tương thích
- **Trình duyệt:** Chrome, Firefox, Safari, Edge (phiên bản mới nhất)
- **Thiết bị:** Desktop, Tablet, Mobile
- **Hệ điều hành:** Windows, macOS, Linux, iOS, Android

---

## 4. KIẾN TRÚC HỆ THỐNG

### 4.1. Mô hình tổng quan

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│   Port: 3000    │
└────────┬────────┘
         │ HTTP/HTTPS
         │ REST API
         │
┌────────▼────────┐
│   Backend       │
│   (Express.js)  │
│   Port: 5000    │
└────────┬────────┘
         │
    ┌────┴────┬──────────┐
    │         │          │
┌───▼──┐  ┌──▼───┐  ┌───▼──────┐
│ DB   │  │ JWT  │  │Cloudinary│
│(PG)  │  │Auth  │  │(Storage) │
└──────┘  └──────┘  └──────────┘
```

### 4.2. Frontend Architecture

- **Framework:** Next.js 14 với App Router
- **Styling:** Tailwind CSS với shadcn/ui components
- **State Management:** Zustand cho global state
- **API Communication:** Axios với interceptors
- **Routing:** File-based routing của Next.js

**Cấu trúc thư mục Frontend:**
```
fe/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin pages
│   ├── teacher/           # Teacher pages
│   ├── student/           # Student pages
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   └── settings/          # Settings page
├── components/            # React components
│   ├── admin/             # Admin-specific components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components (Sidebar, Header)
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── service/               # API service layer
├── stores/                # Zustand stores
├── types/                 # TypeScript types
└── lib/                   # Utility functions
```

### 4.3. Backend Architecture

- **Framework:** Express.js với TypeScript
- **ORM:** Sequelize
- **Database:** PostgreSQL
- **Authentication:** JWT
- **File Upload:** Multer + Cloudinary

**Cấu trúc thư mục Backend:**
```
be/
├── src/
│   ├── config/           # Configuration files
│   │   ├── db.ts        # Database connection
│   │   └── cloudinary.ts # Cloudinary config
│   ├── controllers/      # Request handlers
│   │   ├── adminController.ts
│   │   ├── teacherController.ts
│   │   ├── userController.ts
│   │   └── authController.ts
│   ├── models/           # Sequelize models
│   │   ├── user.ts
│   │   ├── project.ts
│   │   ├── submission.ts
│   │   ├── grade.ts
│   │   └── projectStudents.ts
│   ├── routes/           # API routes
│   │   ├── adminRoutes.ts
│   │   ├── teacherRoutes.ts
│   │   └── authRoutes.ts
│   ├── middlewares/      # Express middlewares
│   │   ├── authMiddleware.ts
│   │   └── snakeToCamel.ts
│   ├── lib/              # Utilities
│   │   └── logService.ts
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
└── package.json
```

### 4.4. Design Patterns

- **MVC Pattern:** Tách biệt Models, Views (Frontend), Controllers
- **Repository Pattern:** Service layer cho API calls
- **Middleware Pattern:** Authentication, Authorization, Error handling
- **Observer Pattern:** React hooks và state management
- **Singleton Pattern:** Database connection, Axios instance

---

## 5. CƠ SỞ DỮ LIỆU

### 5.1. Sơ đồ quan hệ (ERD)

```
┌──────────────┐
│    users     │
├──────────────┤
│ id (PK)      │
│ full_name    │
│ email        │
│ password_hash│
│ role         │
│ avatar       │
│ is_active    │
│ created_at   │
└───────┬──────┘
        │
    ┌───┴────────────────────────┐
    │                            │
┌───▼──────────┐          ┌─────▼──────────┐
│   projects   │          │  submissions   │
├──────────────┤          ├────────────────┤
│ id (PK)      │          │ id (PK)        │
│ title        │◄─────────┤ project_id (FK)│
│ description  │          │ student_id (FK)│
│ teacher_id   │          │ report_link    │
│ status       │          │ submitted_at   │
│ created_at   │          └────────┬───────┘
│ expire_at    │                   │
└───────┬──────┘                   │
        │                          │
        │                    ┌─────▼─────┐
        │                    │   grades  │
        │                    ├───────────┤
        │                    │ id (PK)   │
        │                    │ submission│
        │                    │   _id (FK)│
        │                    │ teacher_id│
        │                    │ score     │
        │                    │ feedback  │
        │                    │created_at │
        │                    └───────────┘
        │
┌───────▼──────────┐
│project_students  │
├──────────────────┤
│ id (PK)          │
│ project_id (FK)  │
│ student_id (FK)  │
│ joined_at        │
└──────────────────┘
```

### 5.2. Bảng Users

**Mục đích:** Lưu trữ thông tin người dùng (admin, teacher, student)

| Cột           | Kiểu dữ liệu | Ràng buộc          | Mô tả                           |
|---------------|--------------|--------------------|---------------------------------|
| id            | INTEGER      | PRIMARY KEY        | ID người dùng                   |
| full_name     | VARCHAR(100) | NOT NULL           | Họ và tên                       |
| email         | VARCHAR(100) | NOT NULL, UNIQUE   | Email đăng nhập                 |
| password_hash | TEXT         | NOT NULL           | Mật khẩu đã hash (bcrypt)       |
| role          | ENUM         | NOT NULL           | 'admin', 'teacher', 'student'   |
| avatar        | TEXT         | NULL               | URL ảnh đại diện (Cloudinary)   |
| is_active     | BOOLEAN      | DEFAULT TRUE       | Trạng thái kích hoạt            |
| created_at    | TIMESTAMP    | DEFAULT NOW()      | Thời gian tạo tài khoản         |

### 5.3. Bảng Projects

**Mục đích:** Lưu trữ thông tin đồ án

| Cột         | Kiểu dữ liệu | Ràng buộc          | Mô tả                           |
|-------------|--------------|--------------------|---------------------------------|
| id          | INTEGER      | PRIMARY KEY        | ID đồ án                        |
| title       | VARCHAR(255) | NOT NULL           | Tiêu đề đồ án                   |
| description | TEXT         | NULL               | Mô tả chi tiết                  |
| teacher_id  | INTEGER      | FOREIGN KEY, NULL  | ID giáo viên hướng dẫn          |
| status      | VARCHAR(50)  | DEFAULT 'pending'  | 'pending', 'in_progress', 'completed' |
| created_at  | TIMESTAMP    | DEFAULT NOW()      | Thời gian tạo                   |
| expire_at   | TIMESTAMP    | NULL               | Deadline nộp bài                |

**Foreign Keys:**
- `teacher_id` → `users.id` ON DELETE SET NULL

### 5.4. Bảng Project_Students

**Mục đích:** Quan hệ nhiều-nhiều giữa Projects và Students

| Cột        | Kiểu dữ liệu | Ràng buộc               | Mô tả                      |
|------------|--------------|-------------------------|----------------------------|
| id         | INTEGER      | PRIMARY KEY             | ID bản ghi                 |
| project_id | INTEGER      | FOREIGN KEY, NOT NULL   | ID đồ án                   |
| student_id | INTEGER      | FOREIGN KEY, NOT NULL, UNIQUE | ID sinh viên        |
| joined_at  | TIMESTAMP    | DEFAULT NOW()           | Thời gian tham gia         |

**Foreign Keys:**
- `project_id` → `projects.id` ON DELETE CASCADE
- `student_id` → `users.id` ON DELETE CASCADE

**Business Logic:**
- Một sinh viên chỉ có thể tham gia 1 đồ án tại một thời điểm (UNIQUE constraint)

### 5.5. Bảng Submissions

**Mục đích:** Lưu trữ bài nộp của sinh viên

| Cột         | Kiểu dữ liệu | Ràng buộc             | Mô tả                      |
|-------------|--------------|------------------------|----------------------------|
| id          | INTEGER      | PRIMARY KEY            | ID bài nộp                 |
| project_id  | INTEGER      | FOREIGN KEY, NOT NULL  | ID đồ án                   |
| student_id  | INTEGER      | FOREIGN KEY, NOT NULL  | ID sinh viên               |
| report_link | TEXT         | NULL                   | Link báo cáo (file/URL)    |
| submitted_at| TIMESTAMP    | DEFAULT NOW()          | Thời gian nộp              |

**Foreign Keys:**
- `project_id` → `projects.id` ON DELETE CASCADE
- `student_id` → `users.id` ON DELETE CASCADE

### 5.6. Bảng Grades

**Mục đích:** Lưu trữ điểm và phản hồi của giáo viên

| Cột           | Kiểu dữ liệu  | Ràng buộc             | Mô tả                      |
|---------------|---------------|------------------------|----------------------------|
| id            | INTEGER       | PRIMARY KEY            | ID điểm                    |
| submission_id | INTEGER       | FOREIGN KEY, NOT NULL  | ID bài nộp                 |
| teacher_id    | INTEGER       | FOREIGN KEY, NULL      | ID giáo viên chấm          |
| score         | DECIMAL(5,2)  | NULL                   | Điểm số (0.00 - 10.00)     |
| feedback      | TEXT          | NULL                   | Nhận xét của giáo viên     |
| created_at    | TIMESTAMP     | DEFAULT NOW()          | Thời gian chấm             |

**Foreign Keys:**
- `submission_id` → `submissions.id` ON DELETE CASCADE
- `teacher_id` → `users.id` ON DELETE SET NULL

### 5.7. Bảng Logs

**Mục đích:** Audit trail cho các hành động quan trọng

| Cột         | Kiểu dữ liệu | Ràng buộc             | Mô tả                      |
|-------------|--------------|------------------------|----------------------------|
| id          | INTEGER      | PRIMARY KEY            | ID log                     |
| action      | VARCHAR(100) | NOT NULL               | Loại hành động             |
| user_id     | INTEGER      | FOREIGN KEY, NULL      | ID người thực hiện         |
| entity_type | VARCHAR(50)  | NULL                   | Loại entity (project, user)|
| entity_id   | INTEGER      | NULL                   | ID của entity              |
| details     | TEXT         | NULL                   | Chi tiết hành động (JSON)  |
| created_at  | TIMESTAMP    | DEFAULT NOW()          | Thời gian                  |

**Các action types:**
- CREATE_USER, UPDATE_USER, DELETE_USER
- CREATE_PROJECT, UPDATE_PROJECT, DELETE_PROJECT
- ADD_STUDENT, REMOVE_STUDENT
- SUBMIT_REPORT, GRADE_SUBMISSION

---

## 6. API ENDPOINTS

### 6.1. Authentication APIs

#### POST /auth/login
**Mô tả:** Đăng nhập vào hệ thống

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "fullName": "Nguyễn Văn A",
    "email": "user@example.com",
    "role": "student",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg"
  }
}
```

**Response (Error - 401):**
```json
{
  "message": "Email hoặc mật khẩu không đúng"
}
```

### 6.2. Admin APIs

**Base URL:** `/admin`

**Authentication:** Required (Bearer Token)

**Authorization:** Role = 'admin'

#### GET /admin/overview
**Mô tả:** Lấy thông tin tổng quan cho admin dashboard

**Response (200):**
```json
{
  "teachers": [...],
  "students": [...],
  "totalProjects": 45,
  "totalSubmissions": 120,
  "latestProjects": [...],
  "latestSubmissions": [...],
  "projects": [...],
  "submissions": [...]
}
```

#### GET /admin/users-management
**Mô tả:** Lấy danh sách tất cả người dùng

**Response (200):**
```json
{
  "users": [...],
  "admins": [...],
  "teachers": [...],
  "students": [...]
}
```

#### POST /admin/create-user
**Mô tả:** Tạo người dùng mới

**Content-Type:** multipart/form-data

**Request Body:**
```
fullName: "Nguyễn Văn B"
email: "nguyenvanb@example.com"
password: "password123"
role: "student"
avatar: [File]
```

**Response (201):**
```json
{
  "message": "Tạo người dùng thành công",
  "user": {
    "id": 15,
    "fullName": "Nguyễn Văn B",
    "email": "nguyenvanb@example.com",
    "role": "student",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg"
  }
}
```

#### PATCH /admin/update-user-info/:userId
**Mô tả:** Cập nhật thông tin người dùng

**Content-Type:** multipart/form-data

**Request Body:**
```
fullName: "Nguyễn Văn B Updated"
email: "newemail@example.com"
avatar: [File] (optional)
```

**Response (200):**
```json
{
  "message": "Cập nhật người dùng thành công",
  "user": {...}
}
```

#### DELETE /admin/delete-user/:userId
**Mô tả:** Xóa người dùng

**Response (200):**
```json
{
  "message": "Xóa người dùng thành công"
}
```

#### GET /admin/projects-management
**Mô tả:** Lấy danh sách tất cả đồ án

**Response (200):**
```json
{
  "projects": [
    {
      "id": 1,
      "title": "Hệ thống quản lý thư viện",
      "description": "Xây dựng hệ thống quản lý thư viện",
      "teacherId": 5,
      "status": "in_progress",
      "createdAt": "2024-01-15T10:00:00Z",
      "expiredAt": "2024-06-30T23:59:59Z",
      "teacher": {
        "id": 5,
        "fullName": "TS. Nguyễn Văn C",
        "email": "teacher@example.com",
        "avatar": "..."
      },
      "studentCount": 2,
      "students": [
        {
          "id": 10,
          "fullName": "Sinh viên A",
          "email": "studentA@example.com",
          "avatar": "..."
        }
      ]
    }
  ]
}
```

#### PATCH /admin/update-project/:projectId
**Mô tả:** Cập nhật thông tin đồ án

**Request Body:**
```json
{
  "title": "Hệ thống quản lý thư viện (Updated)",
  "description": "Mô tả mới",
  "teacherId": 5,
  "status": "completed",
  "expiredAt": "2024-07-30T23:59:59Z",
  "addStudents": [12, 13],
  "removeStudents": [10]
}
```

**Response (200):**
```json
{
  "message": "Cập nhật project thành công",
  "project": {...}
}
```

#### DELETE /admin/delete-project/:projectId
**Mô tả:** Xóa đồ án

**Response (200):**
```json
{
  "message": "Xóa project thành công"
}
```

#### GET /admin/logs-overview
**Mô tả:** Lấy danh sách logs hệ thống

**Response (200):**
```json
{
  "logs": [
    {
      "id": 1,
      "action": "CREATE_PROJECT",
      "userId": 1,
      "entityType": "PROJECT",
      "entityId": 5,
      "details": {...},
      "createdAt": "2024-12-16T10:00:00Z"
    }
  ]
}
```

### 6.3. Teacher APIs

**Base URL:** `/teacher`

**Authentication:** Required

**Authorization:** Role = 'teacher'

#### GET /teacher/overview
**Mô tả:** Lấy thông tin tổng quan cho giáo viên

**Response (200):**
```json
{
  "totalProjects": 10,
  "projects": [
    {
      "id": 1,
      "title": "Đồ án 1",
      "description": "Mô tả",
      "teacherId": 5,
      "status": "in_progress",
      "createdAt": "2024-01-15T10:00:00Z",
      "expiredAt": "2024-06-30T23:59:59Z",
      "studentCount": 2,
      "students": [...]
    }
  ],
  "submissions": [
    {
      "id": 1,
      "projectId": 1,
      "projectTitle": "Đồ án 1",
      "studentId": 10,
      "studentName": "Sinh viên A",
      "studentEmail": "studentA@example.com",
      "studentAvatar": "...",
      "reportLink": "https://drive.google.com/...",
      "submittedAt": "2024-06-20T14:30:00Z"
    }
  ],
  "totalSubmissions": 15
}
```

### 6.4. User APIs

**Base URL:** `/user`

**Authentication:** Required

#### PATCH /user/profile
**Mô tả:** Cập nhật thông tin cá nhân

**Content-Type:** multipart/form-data

**Request Body:**
```
fullName: "Nguyễn Văn D"
password: "newpassword" (optional)
avatar: [File] (optional)
```

**Response (200):**
```json
{
  "message": "Cập nhật profile thành công",
  "user": {
    "id": 1,
    "fullName": "Nguyễn Văn D",
    "email": "user@example.com",
    "role": "student",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg"
  }
}
```

---

## 7. GIAO DIỆN NGƯỜI DÙNG

### 7.1. Thiết kế UI/UX

#### 7.1.1. Design System
- **Colors:**
  - Primary: Blue shades
  - Secondary: Gray shades
  - Success: Green
  - Warning: Yellow
  - Error: Red
  
- **Typography:**
  - Font family: System fonts (sans-serif)
  - Headings: Bold, various sizes
  - Body: Regular weight
  
- **Components:**
  - shadcn/ui component library
  - Consistent spacing and sizing
  - Rounded corners (border-radius)
  - Shadows for depth

#### 7.1.2. Layout Structure
```
┌─────────────────────────────────────┐
│           Header                    │
├──────────┬──────────────────────────┤
│          │                          │
│ Sidebar  │   Main Content Area      │
│          │                          │
│  - Logo  │   - Dashboard Stats      │
│  - Menu  │   - Tables               │
│  - User  │   - Forms                │
│          │   - Cards                │
└──────────┴──────────────────────────┘
```

#### 7.1.3. Key Features
- **Responsive Design:** Hoạt động tốt trên mọi kích thước màn hình
- **Dark/Light Mode:** Hỗ trợ theme switching (planned)
- **Loading States:** Skeleton loaders và spinners
- **Error States:** Toast notifications và error messages
- **Empty States:** Hiển thị khi không có dữ liệu

### 7.2. Các trang chính

#### 7.2.1. Login Page (`/login`)
- Form đăng nhập với email và password
- Link quên mật khẩu
- Background image với overlay
- Validation và error handling

#### 7.2.2. Admin Dashboard (`/dashboard`)
- Overview stats cards:
  - Tổng số giáo viên
  - Tổng số sinh viên
  - Tổng số đồ án
  - Tổng số bài nộp
- Recent projects table
- Recent submissions table
- Background image với blur effect

#### 7.2.3. Admin Users Page (`/admin/users`)
- Users table với columns:
  - Avatar
  - Full name
  - Email
  - Role (với color badges)
  - Actions (Edit, Delete)
- Add user button
- Search và filter functionality
- Background image

#### 7.2.4. Admin Projects Page (`/admin/projects`)
- Project stats cards
- Projects grid/list view
- Project cards với:
  - Title và description
  - Status badge
  - Teacher info
  - Student count
  - Created date và deadline
  - Actions (Edit, Delete, View Students)
- Search và filter by status

#### 7.2.5. Teacher Dashboard (`/dashboard`)
- Overview stats:
  - Tổng số đồ án
  - Tổng số bài nộp chờ chấm
- Projects list
- Submissions list với:
  - Student info
  - Project title
  - Submitted date
  - Actions (View, Grade)

#### 7.2.6. Student Dashboard (`/dashboard`)
- My projects cards
- Submission status
- Grades và feedback
- Upcoming deadlines

#### 7.2.7. Settings Page (`/settings`)
- Profile section:
  - Avatar upload
  - Full name
  - Email
  - Update button
- Password section:
  - Current password
  - New password
  - Confirm password
  - Change password button

### 7.3. Interactive Elements

#### 7.3.1. Hover Effects
- **Menu items:** Scale up + shadow khi hover
- **Cards:** Scale up + shadow khi hover
- **Buttons:** Color change + shadow

#### 7.3.2. Transitions
- Smooth transitions cho tất cả các tương tác
- Duration: 200-300ms
- Easing: ease-in-out

#### 7.3.3. Modals/Dialogs
- Add/Edit User Dialog
- Edit Project Dialog
- Delete Confirmation Dialog
- View Students Dialog

---

## 8. BẢO MẬT

### 8.1. Authentication Flow

```
1. User enters credentials
   ↓
2. Frontend sends POST /auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend generates JWT tokens
   - Access token (15 min expiry)
   - Refresh token (7 days expiry)
   ↓
5. Frontend stores tokens
   - Access token in memory/state
   - Refresh token in httpOnly cookie (recommended)
   ↓
6. Frontend includes access token in API requests
   - Authorization: Bearer {access_token}
   ↓
7. Backend validates token via authMiddleware
   ↓
8. Backend checks user role via authorize middleware
   ↓
9. Request processed or rejected
```

### 8.2. Authorization Levels

| Endpoint            | Admin | Teacher | Student |
|---------------------|-------|---------|---------|
| /admin/*            | ✅     | ❌       | ❌       |
| /teacher/*          | ❌     | ✅       | ❌       |
| /user/profile       | ✅     | ✅       | ✅       |
| Dashboard access    | ✅     | ✅       | ✅       |

### 8.3. Security Measures

#### 8.3.1. Password Security
- **Hashing:** bcrypt với salt rounds = 10
- **Minimum length:** 6 characters (recommended: 8+)
- **No plaintext storage:** Chỉ lưu hash

#### 8.3.2. Token Security
- **JWT Secret:** Stored in environment variables
- **Token expiry:** Access token 15 min, Refresh token 7 days
- **Token verification:** Middleware kiểm tra mọi protected route

#### 8.3.3. API Security
- **CORS:** Configured để chỉ cho phép frontend domain
- **Rate limiting:** (Recommended - chưa implement)
- **Input validation:** Sequelize ORM ngăn SQL injection
- **Output sanitization:** Tránh XSS attacks

#### 8.3.4. File Upload Security
- **Cloudinary:** Lưu file trên cloud, không lưu local
- **File validation:** Check file type và size
- **Secure URLs:** Cloudinary URLs với signatures

### 8.4. Logging và Monitoring

#### 8.4.1. Activity Logs
- Mọi hành động quan trọng được log:
  - User creation/update/deletion
  - Project creation/update/deletion
  - Student assignment/removal
  - Grade submission
- Log bao gồm:
  - Action type
  - User ID
  - Entity type và ID
  - Timestamp
  - Details (JSON)

#### 8.4.2. Error Logging
- Console.error cho tất cả errors
- Stack trace được log ở server side
- Frontend errors được catch và display user-friendly messages

---

## 9. TRIỂN KHAI (DEPLOYMENT)

### 9.1. Môi trường Development

**Backend:**
```bash
cd be
npm install
npm run dev  # Port 5000
```

**Frontend:**
```bash
cd fe
npm install
npm run dev  # Port 3000
```

**Database:**
- PostgreSQL phải được cài đặt và chạy
- Tạo database và cấu hình trong `.env`

### 9.2. Môi trường Production

**Backend:**
```bash
cd be
npm run build
npm start
```

**Frontend:**
```bash
cd fe
npm run build
npm start
```

**Environment Variables cần thiết:**

Backend (`.env`):
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=project_management
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PORT=5000
```

Frontend (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 9.3. Deployment Options

#### 9.3.1. Backend Deployment
- **Recommended:** Railway, Render, Heroku
- **VPS:** DigitalOcean, AWS EC2, Linode

#### 9.3.2. Frontend Deployment
- **Recommended:** Vercel (optimized for Next.js)
- **Alternatives:** Netlify, AWS Amplify

#### 9.3.3. Database Deployment
- **Managed PostgreSQL:** Supabase, Neon, Railway
- **Self-hosted:** PostgreSQL trên VPS

---

## 10. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 10.1. Kết luận

Hệ thống Quản lý Đồ án là một giải pháp toàn diện cho việc quản lý quy trình đồ án trong môi trường giáo dục. Với kiến trúc hiện đại, giao diện thân thiện và các tính năng đầy đủ, hệ thống đáp ứng nhu cầu của cả admin, giáo viên và sinh viên.

**Điểm mạnh:**
- ✅ Kiến trúc rõ ràng, dễ bảo trì
- ✅ Type-safe với TypeScript
- ✅ Giao diện hiện đại, responsive
- ✅ Bảo mật tốt với JWT
- ✅ API RESTful chuẩn
- ✅ Logging và audit trail
- ✅ Phân quyền rõ ràng

**Hạn chế hiện tại:**
- ⚠️ Forgot password chưa có backend
- ⚠️ Chưa có real-time notifications
- ⚠️ Chưa có email service
- ⚠️ Chưa có rate limiting
- ⚠️ Chưa có unit tests

### 10.2. Hướng phát triển tương lai

#### Phase 1: Hoàn thiện chức năng cơ bản
- [ ] Implement forgot password backend
- [ ] Email service (SendGrid/Nodemailer)
- [ ] Rate limiting cho APIs
- [ ] Input validation với Joi/Zod
- [ ] Error boundary trong React

#### Phase 2: Nâng cao trải nghiệm người dùng
- [ ] Real-time notifications với WebSocket
- [ ] Dark mode implementation
- [ ] Advanced search và filters
- [ ] Bulk operations
- [ ] Export data (Excel, PDF)

#### Phase 3: Tính năng mở rộng
- [ ] Comments/Feedback system
- [ ] File version control
- [ ] Deadline reminders (email/SMS)
- [ ] Student progress tracking
- [ ] Teacher workload management
- [ ] Analytics dashboard

#### Phase 4: Tối ưu hóa
- [ ] Performance optimization
- [ ] Caching với Redis
- [ ] CDN cho static assets
- [ ] Database indexing
- [ ] API pagination
- [ ] Lazy loading components

#### Phase 5: Testing và CI/CD
- [ ] Unit tests (Jest, React Testing Library)
- [ ] Integration tests
- [ ] E2E tests (Playwright/Cypress)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated deployment

### 10.3. Tài liệu tham khảo

**Documentation:**
- Next.js: https://nextjs.org/docs
- Express.js: https://expressjs.com/
- Sequelize: https://sequelize.org/
- shadcn/ui: https://ui.shadcn.com/

**Tutorials:**
- JWT Authentication: https://jwt.io/introduction
- PostgreSQL: https://www.postgresql.org/docs/
- TypeScript: https://www.typescriptlang.org/docs/

---

## PHỤ LỤC

### A. Glossary (Thuật ngữ)

- **Admin:** Quản trị viên hệ thống
- **Teacher:** Giáo viên hướng dẫn
- **Student:** Sinh viên thực hiện đồ án
- **Project:** Đồ án
- **Submission:** Bài nộp
- **Grade:** Điểm số
- **JWT:** JSON Web Token
- **ORM:** Object-Relational Mapping
- **API:** Application Programming Interface
- **CRUD:** Create, Read, Update, Delete

### B. Công thức tính toán

**Student workload:**
```
Total workload = Number of active projects
```

**Teacher workload:**
```
Total workload = Number of supervised projects + Number of pending submissions
```

**Project completion rate:**
```
Completion rate = (Completed projects / Total projects) × 100%
```

**Average grade:**
```
Average grade = Σ(grades) / Number of graded submissions
```

### C. Code Examples

**Example: API call từ Frontend**
```typescript
// fe/service/admin-service.ts
import api from "@/config/axios";
import { ADMIN } from "@/constants/api-endpoint";

export const getAdminOverview = async () => {
  try {
    const response = await api.get<AdminOverView>(ADMIN.OVERVIEW);
    return response.data;
  } catch (error) {
    console.error("Get admin overview failed", error);
    return null;
  }
};
```

**Example: Authentication Middleware**
```typescript
// be/src/middlewares/authMiddleware.ts
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Không tìm thấy token xác thực" });
  
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ACCESS_SECRET") as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
```

---

**Ngày tạo:** 16/12/2024

**Phiên bản:** 1.0

**Người thực hiện:** Development Team

**Liên hệ:** admin@example.com

---

*Báo cáo này được tạo tự động dựa trên phân tích source code và tài liệu dự án.*
