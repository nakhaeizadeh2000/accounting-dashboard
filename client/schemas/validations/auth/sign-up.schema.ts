import { z } from 'zod';

export const SignUpSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(8, 'رمزعبور باید حداقل 8 کاراکتر باشد'),
  firstName: z.string().min(1, 'نام نمی‌تواند خالی باشد'),
  lastName: z.string().min(1, 'نام خانوادگی نمی‌تواند خالی باشد'),
});

export type SignUpFormData = z.infer<typeof SignUpSchema>;
