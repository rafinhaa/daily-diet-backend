import { config } from "dotenv";
import { z } from "zod";

const dotEnvPathMapping = {
  app: ".env",
  test: ".env.test",
}[process.env.NODE_ENV || "app"];

config({ path: dotEnvPathMapping });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  PORT: z.coerce.number().default(3000),
  DATABASE_CLIENT: z.enum(["better-sqlite3"]).default("better-sqlite3"),
  DATABASE_URL: z.string().default("/database/db.sqlite"),
  COOKIE_SECRET: z.string().default("secret"),
  COOKIE_EXPIRES_IN_MINUTES: z.coerce.number().default(60 * 24 * 7),
  SENTRY_DSN: z.string().default(""),
});

const envParser = envSchema.safeParse(process.env);

if (!envParser.success) {
  const errorMessage = "Invalid environment variables";
  console.error(errorMessage, envParser.error.format());
  throw new Error(errorMessage);
}

export type Env = z.infer<typeof envSchema>;
export const env = envParser.data;
