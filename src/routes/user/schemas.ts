import { z } from "zod";

export const registerUserBodySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  avatarUrl: z.string().url(),
});

export const getStatsUserParamsSchema = z.object({
  userId: z.string().uuid(),
});
