export const getFieldValue = (obj: any, ...fields: string[]) => {
  for (const f of fields) {
    if (obj?.[f] !== undefined && obj?.[f] !== null) return obj[f];
  }
  return null;
};

const getNameFromObject = (obj: any): string => {
  return getFieldValue(obj, "fullName", "full_name") || obj?.email || "";
};

// Format date
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Không có";
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Không có"
      : date.toLocaleDateString("vi-VN");
  } catch {
    return "Không có";
  }
};

export const getTeacherName = (
  project: any,
  teachers?: Array<{
    id: number;
    fullName?: string;
    full_name?: string;
    email: string;
  }>
): string => {
  if (project.teacher && typeof project.teacher === "object") {
    return getNameFromObject(project.teacher) || "Không có tên";
  }

  const directName = getFieldValue(
    project,
    "teacherInstructor",
    "teacher_instructor",
    "teacherName",
    "teacher_name",
    "instructor"
  );
  if (directName) return directName;

  if (teachers && project.teacherId) {
    const teacher = teachers.find((t) => t.id === project.teacherId);
    if (teacher) return getNameFromObject(teacher) || "Không có tên";
  }

  return "Không có";
};
