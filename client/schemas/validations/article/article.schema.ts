// app/schemas/validations/article/article.schema.ts
import { z } from 'zod';

// Schema for creating an article
export const CreateArticleSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'عنوان مقاله باید حداقل ۳ کاراکتر باشد' })
    .max(255, { message: 'عنوان مقاله نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد' }),
  content: z.string().min(10, { message: 'محتوای مقاله باید حداقل ۱۰ کاراکتر باشد' }),
  authorId: z.string().uuid({ message: 'شناسه نویسنده باید یک UUID معتبر باشد' }),
  fileIds: z.array(z.string().uuid({ message: 'شناسه فایل باید یک UUID معتبر باشد' })).optional(),
});

// Schema for updating an article (all fields are optional)
export const UpdateArticleSchema = CreateArticleSchema.partial().omit({ authorId: true });

// Schema for article filtering and searching
export const ArticleFilterSchema = z.object({
  title: z.string().optional(),
  authorId: z.string().uuid().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

// Type definitions
export type CreateArticleFormData = z.infer<typeof CreateArticleSchema>;
export type UpdateArticleFormData = z.infer<typeof UpdateArticleSchema>;
export type ArticleFilterFormData = z.infer<typeof ArticleFilterSchema>;
