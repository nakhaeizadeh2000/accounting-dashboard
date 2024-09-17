import { z } from 'zod';

export const SignInSchema = z.object({
  email: z.string().min(1).email('آدرس ایمیل صحیح نمی باشد!'),
  password: z.string().min(8, 'رمزعبور باید حداقل شامل ۸ کاراکتر باشد!'),
});

export type SignInFormData = z.infer<typeof SignInSchema>;
