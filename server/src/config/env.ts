import dotenv from 'dotenv';
dotenv.config();

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ?? '',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE ?? '5242880', 10),
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? 'uploads',
} as const;

export type Env = typeof env;
