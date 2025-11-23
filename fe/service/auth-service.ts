import api from "@/config/axios";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants";
import { AUTH } from "@/constants/api-endpoint";
import { AuthResponse } from "@/types/auth";

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
