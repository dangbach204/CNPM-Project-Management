/**
 * Environment variable validation
 * This module validates required environment variables at startup
 * and throws an error if any critical variables are missing.
 *
 * Performance Note:
 * For high-traffic deployments (100+ concurrent password operations),
 * increase the libuv thread pool by setting UV_THREADPOOL_SIZE=16 (or higher)
 * BEFORE requiring any modules:
 *   UV_THREADPOOL_SIZE=16 node dist/server.js
 */

interface EnvConfig {
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  PGDATABASE: string;
  PGUSER: string;
  PGPASSWORD: string;
  PGHOST: string;
  NODE_ENV: string;
}

const requiredEnvVars = [
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "PGDATABASE",
  "PGUSER",
  "PGPASSWORD",
  "PGHOST",
] as const;

function validateEnv(): EnvConfig {
  const missing: string[] = [];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `FATAL: Missing required environment variables: ${missing.join(", ")}\n` +
        `Please check your .env file or environment configuration.`,
    );
  }

  return {
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    PGDATABASE: process.env.PGDATABASE!,
    PGUSER: process.env.PGUSER!,
    PGPASSWORD: process.env.PGPASSWORD!,
    PGHOST: process.env.PGHOST!,
    NODE_ENV: process.env.NODE_ENV || "development",
  };
}

export const env = validateEnv();

export const isProduction = env.NODE_ENV === "production";
