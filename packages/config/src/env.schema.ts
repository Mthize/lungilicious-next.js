import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),

  PEACH_ENTITY_ID: z.string().optional(),
  PEACH_SECRET_TOKEN: z.string().optional(),
  PEACH_WEBHOOK_SECRET: z.string().optional(),
  PEACH_API_URL: z.string().url().optional(),

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),
});

export type AppConfig = z.infer<typeof envSchema>;
