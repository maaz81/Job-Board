import dotenv from 'dotenv';
dotenv.config();
console.log("Resend key loaded:", {
  exists: !!process.env.RESEND_API_KEY,
  prefix: process.env.RESEND_API_KEY?.slice(0, 3),
  length: process.env.RESEND_API_KEY?.length,
});
const required = [
  "DATABASE_URL",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "Missing required environment variable: RESEND_API_KEY"
    );
  }

  if (!process.env.EMAIL_FROM) {
    throw new Error(
      "Missing required environment variable: EMAIL_FROM"
    );
  }

  if (!process.env.CLIENT_URL) {
    throw new Error(
      "Missing required environment variable: CLIENT_URL"
    );
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",

  PORT: Number(process.env.PORT ?? 3000),

  CLIENT_URL:
    process.env.CLIENT_URL ?? "http://localhost:5173",

  DATABASE_URL: process.env.DATABASE_URL!,

  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET!,

  ACCESS_TOKEN_EXPIRES_IN:
    process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",

  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET!,

  REFRESH_TOKEN_EXPIRES_IN:
    process.env.REFRESH_TOKEN_EXPIRES_IN ?? "30d",

  COOKIE_SECURE:
    process.env.COOKIE_SECURE === "true",

  COOKIE_SAME_SITE:
    (process.env.COOKIE_SAME_SITE as
      | "lax"
      | "strict"
      | "none") ?? "lax",

  OPENROUTER_API_KEY:
    process.env.OPENROUTER_API_KEY ?? "",

  MAX_FILE_SIZE:
    parseInt(
      process.env.MAX_FILE_SIZE ?? "5242880",
      10
    ),

  UPLOAD_DIR:
    process.env.UPLOAD_DIR ?? "uploads",

  RESEND_API_KEY:
    process.env.RESEND_API_KEY ?? "",

  EMAIL_FROM:
    process.env.EMAIL_FROM ?? "",
} as const;

export type Env = typeof env;
