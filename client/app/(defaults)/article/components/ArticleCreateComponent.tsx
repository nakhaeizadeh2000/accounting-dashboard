'use client';

import React, { useState } from 'react';
import { useCreateArticleMutation } from '@/store/features/article/article.api';
import { ArticleFormData, ArticleFormErrors } from '@/store/features/article/article.model';
import { isResponseCatchError } from '@/store/features/base-response.model';
import { useRouter } from 'next/navigation';
import { useGetUsersQuery } from '@/store/features/user/users.api';
import { ItemType } from '@/components/modules/drop-downs/drop-down.type';
import AnimatedInputElement from '@/components/modules/input-elements/AnimatedInputElement';
import FileManager from '@/components/modules/files-manager/FileManager';
import { FileData } from '@/components/modules/files-manager/types';
import { Button } from '@mui/material';
import ButtonLoading from '@/components/modules/loadings/ButtonLoading';
import Editor from '@/components/modules/editor/TinyMceComponent';
import UserSingleSelectWidget from '../../UserSingleSelectWidget';
import { ARTICLE_ROUTES } from '..';

const ArticleCreateComponent: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    content: '',
    fileIds: [],
  });
  const [errors, setErrors] = useState<ArticleFormErrors>({});
  const [selectedUser, setSelectedUser] = useState<ItemType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([]);

  // Get current user for article creation
  const { data: users, isLoading: isLoadingUsers } = useGetUsersQuery({ page: 1, limit: 10 });

  // Create article mutation
  const [createArticle, { isLoading }] = useCreateArticleMutation();

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

  // Handle user selection
  const handleUserSelect = (users: ItemType[]) => {
    setSelectedUser(users);
  };

  // Handle file selection
  const handleFileSelect = (files: FileData[]) => {
    setSelectedFiles(files);
    setFormData((prev) => ({
      ...prev,
      fileIds: files.map((file) => file.id),
    }));
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

    if (!selectedUser.length) {
      newErrors.formErrors = ['انتخاب نویسنده الزامی است'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const articleData = {
        ...formData,
        authorId: selectedUser[0].value.toString(),
      };

      const result = await createArticle(articleData).unwrap();

      if (result.success) {
        router.push(ARTICLE_ROUTES.LIST);
      }
    } catch (err) {
      if (isResponseCatchError(err)) {
        // Handle validation errors from API
        if (err.data.validationErrors) {
          setErrors(err.data.validationErrors);
        } else {
          setErrors({
            formErrors: err.data.message || ['خطا در ایجاد مقاله'],
          });
        }
      } else {
        setErrors({
          formErrors: ['خطای ناشناخته در ارتباط با سرور'],
        });
      }
    }
  };

  return (
    <div className="w-full bg-white p-6 shadow-md dark:bg-gray-800">
      <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">ایجاد مقاله جدید</h1>

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

        {/* User selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            نویسنده
          </label>
          <UserSingleSelectWidget
            options={{
              onChange: handleUserSelect,
              value: selectedUser,
              containerClass: 'w-full',
            }}
          />
          {errors.formErrors && <p className="mt-1 text-sm text-red-600">{errors.formErrors[0]}</p>}
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
              ownerId="article-create-filemanager"
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

        {/* Submit button */}
        <div className="flex justify-end">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isLoading}
            className="px-6 py-2"
          >
            {isLoading ? (
              <>
                <ButtonLoading colorClassName="bg-white" />
                <span className="mr-2">در حال ذخیره...</span>
              </>
            ) : (
              'ذخیره مقاله'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArticleCreateComponent;
