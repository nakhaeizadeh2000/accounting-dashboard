'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ArticleFormData,
  ArticleFormErrors,
  CreateArticleDto,
  UpdateArticleDto,
} from '@/store/features/article/article.model';
import { z } from 'zod';

// Zod schema for validating article form data
const articleFormSchema = z.object({
  title: z
    .string()
    .min(3, 'عنوان مقاله باید حداقل ۳ کاراکتر باشد')
    .max(255, 'عنوان مقاله نمی‌تواند بیشتر از ۲۵۵ کاراکتر باشد'),
  content: z.string().min(10, 'محتوای مقاله باید حداقل ۱۰ کاراکتر باشد'),
  fileIds: z.array(z.string().uuid()).optional(),
});

// Hook for handling article form state and validation
export function useArticleForm(initialData?: ArticleFormData) {
  // Form state
  const [formData, setFormData] = useState<ArticleFormData>(
    initialData || {
      title: '',
      content: '',
      fileIds: [],
    },
  );

  // Validation errors state
  const [errors, setErrors] = useState<ArticleFormErrors>({});

  // Form touched state to track if a field has been modified
  const [touched, setTouched] = useState<Record<keyof ArticleFormData, boolean>>({
    title: false,
    content: false,
    fileIds: false,
  });

  // Set initial data when it becomes available (useful for edit forms)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Handle input changes
  const handleChange = useCallback(
    (name: keyof ArticleFormData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Mark field as touched
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Clear error for this field when user types
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors],
  );

  // Validate a single field
  const validateField = useCallback(
    (name: keyof ArticleFormData) => {
      try {
        // Create a partial schema for just this field
        const fieldSchema = z.object({ [name]: articleFormSchema.shape[name] });

        // Validate only this field
        fieldSchema.parse({ [name]: formData[name] });

        // Clear error if validation passes
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));

        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Extract field errors
          const fieldErrors = error.errors
            .filter((err) => err.path[0] === name)
            .map((err) => err.message);

          // Set field error
          setErrors((prev) => ({
            ...prev,
            [name]: fieldErrors.length > 0 ? fieldErrors : undefined,
          }));

          return false;
        }
        return true; // If it's not a Zod error, validation didn't fail
      }
    },
    [formData],
  );

  // Validate the whole form
  const validateForm = useCallback((): boolean => {
    try {
      // Validate against the schema
      articleFormSchema.parse(formData);

      // Clear all errors if validation passes
      setErrors({});

      return true;
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

        setErrors(newErrors);

        return false;
      }

      return true; // If it's not a Zod error, validation didn't fail
    }
  }, [formData]);

  // Format for API (create)
  const formatForCreate = useCallback(
    (authorId: string): CreateArticleDto => ({
      title: formData.title,
      content: formData.content,
      authorId,
      fileIds: formData.fileIds,
    }),
    [formData],
  );

  // Format for API (update) - only include changed fields
  const formatForUpdate = useCallback(
    (originalData: ArticleFormData): UpdateArticleDto => {
      const updateData: UpdateArticleDto = {};

      if (formData.title !== originalData.title) {
        updateData.title = formData.title;
      }

      if (formData.content !== originalData.content) {
        updateData.content = formData.content;
      }

      // Always include fileIds to ensure proper file relationships
      updateData.fileIds = formData.fileIds;

      return updateData;
    },
    [formData],
  );

  // Reset the form
  const resetForm = useCallback(() => {
    setFormData(
      initialData || {
        title: '',
        content: '',
        fileIds: [],
      },
    );
    setErrors({});
    setTouched({
      title: false,
      content: false,
      fileIds: false,
    });
  }, [initialData]);

  return {
    formData,
    errors,
    touched,
    handleChange,
    validateField,
    validateForm,
    formatForCreate,
    formatForUpdate,
    resetForm,
  };
}
