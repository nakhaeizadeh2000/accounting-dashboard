import { z } from 'zod';

export const userSchema = z.object({
  createdAt: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  roles: z.string(),
  updatedAt: z.string(),
});

export type UserFormData = z.infer<typeof userSchema>;
