import { Suspense } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import TeacherSubmissionsContent from "./TeacherSubmissionsContent";

export default function TeacherSubmissionsPage() {
  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <Suspense fallback={<div className="p-8">Đang tải...</div>}>
        <TeacherSubmissionsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
