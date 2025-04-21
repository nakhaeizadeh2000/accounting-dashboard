'use client';

import React from 'react';
import {
  useGetArticleByIdQuery,
  useDeleteArticleMutation,
} from '@/store/features/article/article.api';
import { isResponseCatchError } from '@/store/features/base-response.model';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button, Chip, Divider } from '@mui/material';
import Image from 'next/image';
import { FiEdit3, FiTrash2 } from 'react-icons/fi';
import ButtonLoading from '@/components/modules/loadings/ButtonLoading';
import { ARTICLE_ROUTES } from '..';

interface ArticleDetailComponentProps {
  articleId: number;
}

const ArticleDetailComponent: React.FC<ArticleDetailComponentProps> = ({ articleId }) => {
  const router = useRouter();

  // Fetch article details
  const { data, isLoading, error } = useGetArticleByIdQuery({ id: articleId });

  // Delete mutation
  const [deleteArticle, { isLoading: isDeleting }] = useDeleteArticleMutation();

  // Handle article deletion
  const handleDelete = async () => {
    if (window.confirm('آیا از حذف این مقاله اطمینان دارید؟')) {
      try {
        await deleteArticle({ id: articleId }).unwrap();
        router.push(ARTICLE_ROUTES.LIST);
      } catch (err) {
        if (isResponseCatchError(err)) {
          console.error('Error deleting article:', err.data.message);
          alert(`خطا در حذف مقاله: ${err.data.message}`);
        } else {
          console.error('Unknown error:', err);
          alert('خطای ناشناخته در حذف مقاله');
        }
      }
    }
  };

  // Handle edit navigation
  const handleEdit = () => {
    router.push(ARTICLE_ROUTES.EDIT(articleId));
  };

  // Format date for display
  const formatDate = (dateString: string | Date): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy/MM/dd HH:mm');
    } catch (err) {
      return 'تاریخ نامعتبر';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="text-center">
          <ButtonLoading colorClassName="bg-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">در حال بارگذاری مقاله...</p>
        </div>
      </div>
    );
  }

  if (error) {
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

  const article = data?.data;

  if (!article) {
    return (
      <div className="w-full rounded-md bg-yellow-50 p-6 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <p>مقاله یافت نشد</p>
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
      {/* Article header with title and actions */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{article.title}</h1>

        <div className="flex space-x-2 space-x-reverse">
          <Button variant="contained" color="primary" onClick={handleEdit} startIcon={<FiEdit3 />}>
            ویرایش
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={isDeleting}
            startIcon={isDeleting ? <ButtonLoading colorClassName="bg-white" /> : <FiTrash2 />}
          >
            {isDeleting ? 'در حال حذف...' : 'حذف'}
          </Button>
        </div>
      </div>

      {/* Article metadata */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Chip label={`نویسنده: ${article.authorId}`} variant="outlined" color="primary" />
        <Chip label={`تاریخ ایجاد: ${formatDate(article.createdAt)}`} variant="outlined" />
        <Chip label={`آخرین بروزرسانی: ${formatDate(article.updatedAt)}`} variant="outlined" />
      </div>

      <Divider className="mb-6" />

      {/* Article content */}
      <div
        className="prose max-w-none dark:prose-invert lg:prose-lg"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Attached files section */}
      {article.files && article.files.length > 0 && (
        <>
          <Divider className="my-6" />

          <div>
            <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
              فایل‌های پیوست
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {article.files.map((file) => (
                <div
                  key={file.id}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
                >
                  {file.thumbnailUrl ? (
                    <div className="mb-2 h-32 w-full overflow-hidden rounded bg-white">
                      <Image
                        src={file.thumbnailUrl}
                        alt={file.originalName || 'File thumbnail'}
                        width={150}
                        height={150}
                        className="h-full w-full object-contain"
                        unoptimized // Use this for dynamic images from API
                      />
                    </div>
                  ) : (
                    <div className="mb-2 flex h-32 w-full items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                      <span className="text-4xl">📄</span>
                    </div>
                  )}

                  <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                    {file.originalName || file.uniqueName}
                  </p>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>

                  <Button
                    variant="outlined"
                    size="small"
                    className="mt-2 w-full"
                    href={file.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    دانلود
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ArticleDetailComponent;
