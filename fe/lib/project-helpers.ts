export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Không có";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Không có";
    return date.toLocaleDateString("vi-VN");
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Không có";
  }
};

export const getTeacherName = (project: any): string => {
  return (
    project.teacherInstructor ||
    project.teacher_instructor ||
    project.teacherName ||
    project.teacher_name ||
    project.instructor ||
    "Không có"
  );
};

export const getFieldValue = (obj: any, ...fields: string[]) => {
  for (const f of fields) {
    if (obj?.[f] !== undefined && obj?.[f] !== null) return obj[f];
  }
  return null;
};