import { AxiosError } from "axios";

export interface ErrorDetails {
  type: "server" | "network" | "client" | "unknown";
  status?: number;
  message: string;
  details?: any;
}

/**
 * Parse Axios errors and provide detailed information
 */
export function parseApiError(error: unknown): ErrorDetails {
  if (!error) {
    return {
      type: "unknown",
      message: "Đã xảy ra lỗi không xác định",
    };
  }

  const axiosError = error as AxiosError;

  // Server responded with error status (4xx, 5xx)
  if (axiosError.response) {
    const responseData = axiosError.response.data as any;
    return {
      type: "server",
      status: axiosError.response.status,
      message: responseData?.message || "Lỗi từ máy chủ",
      details: responseData,
    };
  }

  // Request made but no response received (network error)
  if (axiosError.request) {
    return {
      type: "network",
      message: "Không thể kết nối đến máy chủ",
      details: {
        message: axiosError.message,
        code: (axiosError as any).code,
      },
    };
  }

  // Error setting up the request
  return {
    type: "client",
    message: axiosError.message || "Lỗi khi thiết lập yêu cầu",
  };
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(errorDetails: ErrorDetails): string {
  if (errorDetails.type === "network") {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.";
  }

  if (errorDetails.type === "server") {
    switch (errorDetails.status) {
      case 400:
        return errorDetails.details?.message || "Yêu cầu không hợp lệ";
      case 401:
        return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      case 403:
        return "Bạn không có quyền thực hiện thao tác này";
      case 404:
        return "Tài nguyên không tồn tại hoặc đã bị xóa";
      case 409:
        return errorDetails.details?.message || "Dữ liệu đã tồn tại";
      case 500:
        return "Lỗi máy chủ. Vui lòng thử lại sau.";
      default:
        return errorDetails.message;
    }
  }

  return errorDetails.message;
}

/**
 * Log error with detailed information for debugging
 */
export function logDetailedError(
  context: string,
  error: unknown,
  additionalInfo?: any
) {
  const errorDetails = parseApiError(error);

  console.group(`❌ Error in ${context}`);
  console.log("Type:", errorDetails.type);
  console.log("Status:", errorDetails.status);
  console.log("Message:", errorDetails.message);

  if (errorDetails.details) {
    console.log("Details:", errorDetails.details);
  }

  if (additionalInfo) {
    console.log("Additional Info:", additionalInfo);
  }

  console.log("Full Error:", error);
  console.groupEnd();
}
