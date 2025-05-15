// app/schemas/validations/article/article.schema.ts
import { z } from 'zod';
import { ArticleFormData, ArticleFormErrors } from '@/store/features/article/article.model';

// Zod schema for validating article form data
export const articleFormSchema = z.object({
  title: z
    .string()
    .min(3, 'عنوان مقاله باید حداقل 3 کاراکتر باشد')
    .max(100, 'عنوان مقاله نمی‌تواند بیشتر از 100 کاراکتر باشد'),
  content: z
    .string()
    .min(10, 'محتوای مقاله باید حداقل 10 کاراکتر باشد')
    .max(50000, 'محتوای مقاله بیش از حد طولانی است'),
  fileIds: z.array(z.string()).optional(),
});

// Type for the article form data based on the schema
export type ArticleFormSchemaType = z.infer<typeof articleFormSchema>;

// Helper function to validate the entire form
export function validateArticleForm(formData: ArticleFormData): {
  isValid: boolean;
  errors: ArticleFormErrors
} {
  try {
    // Validate against the schema
    articleFormSchema.parse(formData);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format errors for each field
      const newErrors: ArticleFormErrors = {};

      error.errors.forEach((err) => {
        const field = err.path[0] as keyof ArticleFormData;
        if (!newErrors[field]) {
          newErrors[field] = [];
        }
        (newErrors[field] as string[]).push(err.message);
      });

      return { isValid: false, errors: newErrors };
    }
    return { isValid: true, errors: {} };
  }
}

// Helper function to validate a single field
export function validateArticleField(
  name: keyof ArticleFormData,
  value: any
): string[] | undefined {
  try {
    // Create a partial schema for just this field
    const fieldSchema = z.object({ [name]: articleFormSchema.shape[name] });

    // Validate only this field
    fieldSchema.parse({ [name]: value });
    return undefined;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Extract field errors
      return error.errors
        .filter((err) => err.path[0] === name)
        .map((err) => err.message);
    }
    return undefined;
  }
}
