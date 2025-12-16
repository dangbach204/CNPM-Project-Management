import api from "@/config/axios";
import { AUTH } from "@/constants/api-endpoint";
import { AuthResponse } from "@/types/auth";
import { isValid } from "date-fns";

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post<AuthResponse>(AUTH.LOGIN, {
      email,
      password,
    });

    return response;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post(AUTH.FORGOT_PASSWORD, {
      email,
    });
    return response;
  } catch (error) {
    console.error("Forgot password request failed", error);
    throw error;
  }
};

export const verifyResetToken = async (email: string, token: string) => {
  try {
    const response = await api.post(AUTH.VERIFY_RESET_TOKEN, {
      email,
      token,
    });

    return {
      isValid: true,
      message: response.data.message || "Token is valid",
    };
    // return response;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (
  email: string,
  token: string,
  newPassword: string
) => {
  try {
    const response = await api.post(AUTH.RESET_PASSWORD, {
      email,
      token,
      newPassword,
    });
    return response;
  } catch (error) {
    console.error("Reset password request failed", error);
    throw error;
  }
};

// const register = async (name: string, email: string, password: string, phone: string) => {
//     try {
//         const response = await api.post(AUTH.REGISTER, {
//             name,
//             email,
//             password,
//             phone,
//         });
//         console.log("Register response", response);
//         return response;
//     } catch (error) {
//         console.error("Register failed", error);
//         throw error;
//     }
// }
