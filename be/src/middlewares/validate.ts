import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Validation error response format
 */
interface ValidationErrorResponse {
  message: string;
  errors: {
    field: string;
    message: string;
  }[];
}

/**
 * Format Zod errors into a consistent response format
 */
const formatZodError = (error: ZodError): ValidationErrorResponse => {
  return {
    message: "Validation failed",
    errors: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  };
};

/**
 * Middleware factory to validate request body
 */
export const validateBody = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json(formatZodError(result.error));
    }

    // Replace body with validated and transformed data
    req.body = result.data;
    next();
  };
};

/**
 * Middleware factory to validate request params
 */
export const validateParams = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json(formatZodError(result.error));
    }

    // Replace params with validated and transformed data
    req.params = result.data as any;
    next();
  };
};

/**
 * Middleware factory to validate request query
 */
export const validateQuery = <T>(schema: ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json(formatZodError(result.error));
    }

    // Replace query with validated and transformed data
    req.query = result.data as any;
    next();
  };
};

/**
 * Combined validation for body and params
 */
export const validate = <TBody, TParams>(
  bodySchema?: ZodSchema<TBody>,
  paramsSchema?: ZodSchema<TParams>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { field: string; message: string }[] = [];

    if (paramsSchema) {
      const paramsResult = paramsSchema.safeParse(req.params);
      if (!paramsResult.success) {
        errors.push(
          ...paramsResult.error.issues.map((issue) => ({
            field: `params.${issue.path.join(".")}`,
            message: issue.message,
          })),
        );
      } else {
        req.params = paramsResult.data as any;
      }
    }

    if (bodySchema) {
      const bodyResult = bodySchema.safeParse(req.body);
      if (!bodyResult.success) {
        errors.push(
          ...bodyResult.error.issues.map((issue) => ({
            field: `body.${issue.path.join(".")}`,
            message: issue.message,
          })),
        );
      } else {
        req.body = bodyResult.data;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }

    next();
  };
};
