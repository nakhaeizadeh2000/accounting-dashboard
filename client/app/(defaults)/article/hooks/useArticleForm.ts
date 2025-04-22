'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ArticleFormData,
  ArticleFormErrors,
  CreateArticleDto,
  UpdateArticleDto,
} from '@/store/features/article/article.model';
import {
  articleFormSchema,
  validateArticleForm,
  validateArticleField
} from '@/schemas/validations/article/article.schema';
import { z } from 'zod';

// Hook for handling article form state and validation
export function useArticleForm(initialData?: ArticleFormData, validateOnInit: boolean = false) {
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

  // Form validity state
  const [isFormValid, setIsFormValid] = useState(false);

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

  // Validate on initialization if requested
  useEffect(() => {
    if (validateOnInit) {
      const result = validateArticleForm(formData);
      setErrors(result.errors);

      // Mark all fields as touched
      setTouched({
        title: true,
        content: true,
        fileIds: true,
      });
    }
  }, [validateOnInit]);

  // Update form validity whenever form data or errors change
  useEffect(() => {
    const checkFormValidity = () => {
      try {
        // Validate with Zod
        articleFormSchema.parse(formData);

        // If we get here, the form is valid according to Zod
        // But we also need to check if there are any errors in our errors state
        const hasNoErrors = !Object.values(errors).some(
          error => error && error.length > 0
        );

        setIsFormValid(hasNoErrors);
      } catch (error) {
        setIsFormValid(false);
      }
    };

    // Only check validity if fields have been touched
    if (touched.title || touched.content) {
      checkFormValidity();
    }
  }, [formData, errors, touched]);

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
      const fieldErrors = validateArticleField(name, formData[name]);

      if (fieldErrors) {
        setErrors((prev) => ({
          ...prev,
          [name]: fieldErrors,
        }));
        return false;
      } else {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
        return true;
      }
    },
    [formData],
  );

  // Validate the whole form
  const validateForm = useCallback((): boolean => {
    // Mark all fields as touched
    setTouched({
      title: true,
      content: true,
      fileIds: true,
    });

    const result = validateArticleForm(formData);
    setErrors(result.errors);
    return result.isValid;
  }, [formData]);

  // Format for API (create)
  const formatForCreate = useCallback(
    (authorId: string): CreateArticleDto => ({
      title: formData.title.trim(),
      content: formData.content,
      authorId,
      fileIds: formData.fileIds || [],
    }),
    [formData],
  );

  // Format for API (update) - only include changed fields
  const formatForUpdate = useCallback(
    (authorId: string): UpdateArticleDto => {
      return {
        title: formData.title,
        content: formData.content,
        authorId,
        fileIds: formData.fileIds || [], // Include fileIds in the update DTO
      };
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
    isFormValid,
    touched,
    handleChange,
    validateField,
    validateForm,
    formatForCreate,
    formatForUpdate,
    resetForm,
  };
}
