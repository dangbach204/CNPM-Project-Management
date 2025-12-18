export const getFieldValue = (obj: any, ...fields: string[]) => {
  for (const f of fields) {
    if (obj?.[f] !== undefined && obj?.[f] !== null) return obj[f];
  }
  return null;
};

const getNameFromObject = (obj: any): string => {
  return getFieldValue(obj, "fullName", "full_name") || obj?.email || "";
};

/**
 * ============================================================================
 * DATE FORMATTING UTILITIES
 * ============================================================================
 *
 * IMPORTANT: All datetime values from the API are ISO-8601 strings.
 *
 * These formatting functions are for DISPLAY ONLY at render time.
 * NEVER use formatted date strings in:
 * - State management
 * - API request payloads
 * - Form submissions
 *
 * Always keep ISO strings in state and format only when rendering.
 * ============================================================================
 */

/**
 * Format an ISO-8601 date string for display in Vietnamese locale.
 * Uses Asia/Ho_Chi_Minh timezone for consistent display.
 * Use this ONLY at render time, never in state or API calls.
 *
 * @param dateString - ISO-8601 date string from API
 * @param fallback - Fallback text for invalid/null dates (default: "Không có")
 * @returns Formatted date string for display (e.g., "18/12/2025")
 */
export const formatDate = (
  dateString: string | null | undefined,
  fallback: string = "Không có"
): string => {
  if (!dateString) return fallback;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return fallback;
  }
};

/**
 * Format an ISO-8601 datetime string for display in Vietnamese locale with time.
 * Uses Asia/Ho_Chi_Minh timezone for consistent display.
 * Use this ONLY at render time, never in state or API calls.
 *
 * @param dateString - ISO-8601 date string from API
 * @param fallback - Fallback text for invalid/null dates (default: "Không có")
 * @returns Formatted datetime string for display (e.g., "18/12/2025 12:43")
 */
export const formatDateTime = (
  dateString: string | null | undefined,
  fallback: string = "Không có"
): string => {
  if (!dateString) return fallback;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return fallback;

    const day = date.toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const time = date.toLocaleTimeString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return `${day} lúc ${time}`;
  } catch {
    return fallback;
  }
};

/**
 * Convert a date value to ISO-8601 string for API calls.
 * Use this before sending dates to the backend.
 *
 * @param date - Date object, timestamp, or date string
 * @returns ISO-8601 string or null
 */
export const toISOString = (
  date: Date | string | number | null | undefined
): string | null => {
  if (!date) return null;
  try {
    const parsed =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;
    return isNaN(parsed.getTime()) ? null : parsed.toISOString();
  } catch {
    return null;
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
