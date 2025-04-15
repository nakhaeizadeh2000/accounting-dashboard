'use client';

import React, { useState, useEffect } from 'react';
import {
  useGetArticleByIdQuery,
  useUpdateArticleMutation,
} from '@/store/features/article/article.api';
import {
  ArticleFormData,
  ArticleFormErrors,
  UpdateArticleDto,
} from '@/store/features/article/article.model';
import { isResponseCatchError } from '@/store/features/base-response.model';
import { useRouter } from 'next/navigation';
import { ItemType } from '@/components/modules/drop-downs/drop-down.type';
import { FileData } from '@/components/modules/files-manager/types';
import AnimatedInputElement from '@/components/modules/input-elements/AnimatedInputElement';
import FileManager from '@/components/modules/files-manager/FileManager';
import { Button } from '@mui/material';
import ButtonLoading from '@/components/modules/loadings/ButtonLoading';
import Editor from '@/components/modules/editor/TinyMceComponent';
import { ARTICLE_ROUTES } from '..';

interface ArticleUpdateComponentProps {
  articleId: number;
}

const ArticleUpdateComponent: React.FC<ArticleUpdateComponentProps> = ({ articleId }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    fileIds: [],
  });
  const [errors, setErrors] = useState<ArticleFormErrors>({});
  const [selectedUser, setSelectedUser] = useState<ItemType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch article data
  const {
    data: articleData,
    isLoading: isLoadingArticle,
    error: articleError,
  } = useGetArticleByIdQuery({ id: articleId });

  // Update article mutation
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();

  // Initialize form data when article data is loaded
  useEffect(() => {
    if (articleData?.data && initialLoad) {
      const article = articleData.data;

      setFormData({
        title: article.title,
        content: article.content,
        fileIds: article.files?.map((file) => file.id) || [],
      });

      // Set author
      setSelectedUser([
        {
          value: article.authorId,
          label: article.authorId, // Ideally, you'd fetch author details to show a proper name
        },
      ]);

      // Note: We can't set selectedFiles here because they're from FileManager
      // and will be set when FileManager loads

      setInitialLoad(false);
    }
  }, [articleData, initialLoad]);

  // Handle file selection in FileManager
  const handleFileSelect = (files: FileData[]) => {
    setSelectedFiles(files);
    setFormData((prev) => ({
      ...prev,
      fileIds: files.map((file) => file.id),
    }));
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user types
    if (errors[name as keyof ArticleFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle content change from TinyMCE
  const handleContentChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));

    // Clear content error when user edits
    if (errors.content) {
      setErrors((prev) => ({
        ...prev,
        content: undefined,
      }));
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: ArticleFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = ['عنوان مقاله الزامی است'];
    } else if (formData.title.length < 3) {
      newErrors.title = ['عنوان مقاله باید حداقل 3 کاراکتر باشد'];
    }

    if (!formData.content.trim()) {
      newErrors.content = ['محتوای مقاله الزامی است'];
    } else if (formData.content.length < 10) {
      newErrors.content = ['محتوای مقاله باید حداقل 10 کاراکتر باشد'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // For updates, we only include fields that have changed
      const updateData: UpdateArticleDto = {};

      // Only include changed fields
      if (formData.title !== articleData?.data?.title) {
        updateData.title = formData.title;
      }

      if (formData.content !== articleData?.data?.content) {
        updateData.content = formData.content;
      }

      // Always include fileIds to ensure proper updates
      updateData.fileIds = formData.fileIds;

      const result = await updateArticle({
        id: articleId,
        article: updateData,
      }).unwrap();

      if (result.success) {
        router.push(ARTICLE_ROUTES.VIEW(articleId));
      }
    } catch (err) {
      if (isResponseCatchError(err)) {
        // Handle validation errors from API
        if (err.data.validationErrors) {
          setErrors(err.data.validationErrors);
        } else {
          setErrors({
            formErrors: err.data.message || ['خطا در بروزرسانی مقاله'],
          });
        }
      } else {
        setErrors({
          formErrors: ['خطای ناشناخته در ارتباط با سرور'],
        });
      }
    }
  };

  // Handle cancellation
  const handleCancel = () => {
    router.push(ARTICLE_ROUTES.VIEW(articleId));
  };

  if (isLoadingArticle) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="text-center">
          <ButtonLoading colorClassName="bg-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">در حال بارگذاری اطلاعات مقاله...</p>
        </div>
      </div>
    );
  }

  if (articleError) {
    return (
      <div className="w-full rounded-md bg-red-50 p-6 text-red-800 dark:bg-red-900 dark:text-red-200">
        <p>خطا در بارگیری اطلاعات مقاله</p>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/article/main/list')}
          className="mt-4"
        >
          بازگشت به لیست مقالات
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-6 shadow-md dark:bg-gray-800">
      <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">ویرایش مقاله</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title input */}
        <div>
          <AnimatedInputElement
            options={{
              key: 'title',
              type: 'text',
              label: 'عنوان مقاله',
              defaultValue: formData.title,
              fieldError: errors.title,
              containerClass: 'w-full',
            }}
          />
        </div>

        {/* Author info - read-only in update mode */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            نویسنده (غیرقابل تغییر)
          </label>
          {selectedUser.length > 0 && (
            <div className="rounded-md border border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">{selectedUser[0].label}</p>
            </div>
          )}
        </div>

        {/* Content editor */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            محتوای مقاله
          </label>
          <Editor initialValue={formData.content} onChange={handleContentChange} />
          {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content[0]}</p>}
        </div>

        {/* File selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            فایل‌های پیوست
          </label>
          <div className="h-96">
            <FileManager
              ownerId="article-update-filemanager"
              bucket="default"
              allowMultiSelect={true}
              onFileSelect={handleFileSelect}
              defaultView="grid"
              maxHeight="300px"
              title="انتخاب فایل‌ها"
              emptyText="هیچ فایلی موجود نیست. لطفا ابتدا فایل‌های خود را آپلود کنید."
            />
          </div>
        </div>

        {/* Form errors */}
        {errors.formErrors && (
          <div className="rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-900 dark:text-red-100">
            <ul className="list-inside list-disc">
              {errors.formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 space-x-reverse">
          <Button variant="outlined" color="secondary" onClick={handleCancel} disabled={isUpdating}>
            انصراف
          </Button>

          <Button variant="contained" color="primary" type="submit" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <ButtonLoading colorClassName="bg-white" />
                <span className="mr-2">در حال ذخیره...</span>
              </>
            ) : (
              'ذخیره تغییرات'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArticleUpdateComponent;
