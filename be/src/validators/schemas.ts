import { z } from "zod";

/**
 * Common validation patterns
 */
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .max(100, "Email must be less than 100 characters")
  .email("Invalid email format");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be less than 128 characters");

const fullNameSchema = z
  .string()
  .min(2, "Full name must be at least 2 characters")
  .max(100, "Full name must be less than 100 characters")
  .trim();

const roleSchema = z.enum(["admin", "teacher", "student"], {
  message: "Role must be admin, teacher, or student",
});

/**
 * Auth Schemas
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refresh: z.string().min(1, "Refresh token is required"),
});

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export const verifyResetTokenSchema = z.object({
  email: emailSchema,
  token: z.string().min(1, "Token is required"),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  token: z.string().min(1, "Token is required"),
  newPassword: passwordSchema,
});

/**
 * Admin User Schemas
 */
export const createUserSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  role: roleSchema,
  password: passwordSchema,
});

export const updateUserSchema = z
  .object({
    fullName: fullNameSchema.optional(),
    email: emailSchema.optional(),
    role: roleSchema.optional(),
  })
  .refine(
    (data: { fullName?: string; email?: string; role?: string }) =>
      data.fullName || data.email || data.role,
    { message: "At least one field must be provided" },
  );

export const userIdParamSchema = z.object({
  userId: z
    .string()
    .regex(/^\d+$/, "userId must be a valid number")
    .transform(Number),
});

/**
 * Student Schemas
 */
export const projectIdParamSchema = z.object({
  projectId: z
    .string()
    .regex(/^\d+$/, "projectId must be a valid number")
    .transform(Number),
});

export const submitProjectSchema = z.object({
  reportLink: z
    .string()
    .min(1, "Report link is required")
    .url("Report link must be a valid URL"),
});

/**
 * Type exports for use in controllers
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type RequestPasswordResetInput = z.infer<
  typeof requestPasswordResetSchema
>;
export type VerifyResetTokenInput = z.infer<typeof verifyResetTokenSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>;
export type SubmitProjectInput = z.infer<typeof submitProjectSchema>;
