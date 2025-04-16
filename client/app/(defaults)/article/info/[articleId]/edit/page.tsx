// app/article/info/[articleId]/page.tsx
'use client';

import React, { useState } from 'react';
import {
  useGetArticleByIdQuery,
  useDeleteArticleMutation,
} from '@/store/features/article/article.api';
import { isResponseCatchError } from '@/store/features/base-response.model';
import { useRouter } from 'next/navigation';
import {
  Paper,
  Typography,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
} from '@mui/material';
import { FiEdit3, FiTrash2, FiCalendar, FiUser, FiClock, FiPaperclip } from 'react-icons/fi';
import Image from 'next/image';
import ButtonLoading from '@/components/modules/loadings/ButtonLoading';
import { formatArticleDate, calculateReadingTime } from '../../../utils';
import { ARTICLE_ROUTES } from '../../../index';

interface ArticleDetailPageProps {
  params: {
    articleId: string;
  };
}

const ArticleDetailPage = ({ params }: ArticleDetailPageProps) => {
  const router = useRouter();
  const articleId = parseInt(params.articleId, 10);

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch article data
  const { data, isLoading, error } = useGetArticleByIdQuery({ id: articleId });

  // Delete mutation
  const [deleteArticle, { isLoading: isDeleting }] = useDeleteArticleMutation();

  // Calculate reading time
  const readingTime = data?.data ? calculateReadingTime(data.data.content) : 0;

  // Handle navigation to edit page
  const handleEdit = () => {
    router.push(ARTICLE_ROUTES.EDIT(articleId));
  };

  // Handle delete confirmation dialog
  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // Handle article deletion
  const handleDelete = async () => {
    try {
      await deleteArticle({ id: articleId }).unwrap();
      closeDeleteDialog();
      // Navigate back to article list
      router.push(ARTICLE_ROUTES.LIST);
    } catch (err) {
      if (isResponseCatchError(err)) {
        console.error('Error deleting article:', err.data.message);
        // You could show a toast or alert here
      } else {
        console.error('Unknown error:', err);
      }
      closeDeleteDialog();
    }
  };

  // Handle navigation back to article list
  const handleBackToList = () => {
    router.push(ARTICLE_ROUTES.LIST);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <ButtonLoading colorClassName="bg-blue-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">در حال بارگذاری اطلاعات مقاله...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert severity="error" className="mb-4">
          خطا در بارگذاری اطلاعات مقاله
        </Alert>
        <Button variant="contained" color="primary" onClick={handleBackToList}>
          بازگشت به لیست مقالات
        </Button>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="p-6">
        <Alert severity="warning" className="mb-4">
          مقاله مورد نظر یافت نشد
        </Alert>
        <Button variant="contained" color="primary" onClick={handleBackToList}>
          بازگشت به لیست مقالات
        </Button>
      </div>
    );
  }

  const article = data.data;

  // Get thumbnail from first image file if available
  const thumbnail = article.files?.find(
    (file) => file.mimetype.startsWith('image/') && file.thumbnailUrl,
  )?.thumbnailUrl;

  return (
    <Paper className="overflow-hidden bg-white p-0 shadow-md dark:bg-gray-800">
      {/* Article header with banner image */}
      {thumbnail ? (
        <div className="relative h-64 w-full overflow-hidden lg:h-80">
          <Image
            src={thumbnail}
            alt={article.title}
            layout="fill"
            objectFit="cover"
            unoptimized // Using unoptimized for dynamic images from API
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 w-full p-6 text-white">
            <Typography variant="h4" component="h1" className="mb-2 text-2xl font-bold lg:text-3xl">
              {article.title}
            </Typography>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center text-sm text-gray-200">
                <FiUser className="ml-1" />
                {article.authorId}
              </div>

              <div className="flex items-center text-sm text-gray-200">
                <FiCalendar className="ml-1" />
                {formatArticleDate(article.createdAt, 'yyyy/MM/dd')}
              </div>

              <div className="flex items-center text-sm text-gray-200">
                <FiClock className="ml-1" />
                {readingTime} دقیقه مطالعه
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <Typography
            variant="h4"
            component="h1"
            className="mb-4 text-2xl font-bold dark:text-white lg:text-3xl"
          >
            {article.title}
          </Typography>

          <div className="mb-4 flex flex-wrap gap-3">
            <Chip
              icon={<FiUser size={14} />}
              label={article.authorId}
              variant="outlined"
              size="small"
            />

            <Chip
              icon={<FiCalendar size={14} />}
              label={formatArticleDate(article.createdAt, 'yyyy/MM/dd')}
              variant="outlined"
              size="small"
            />

            <Chip
              icon={<FiClock size={14} />}
              label={`${readingTime} دقیقه مطالعه`}
              variant="outlined"
              size="small"
            />
          </div>
        </div>
      )}

      {/* Article content */}
      <div className="p-6">
        {/* Action buttons */}
        <div className="mb-6 flex justify-end space-x-2 space-x-reverse">
          <Button variant="contained" color="primary" startIcon={<FiEdit3 />} onClick={handleEdit}>
            ویرایش
          </Button>

          <Button
            variant="contained"
            color="error"
            startIcon={<FiTrash2 />}
            onClick={openDeleteDialog}
          >
            حذف
          </Button>
        </div>

        <Divider className="mb-6" />

        {/* Main content */}
        <div
          className="prose max-w-none dark:prose-invert lg:prose-lg"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Attached files section */}
        {article.files && article.files.length > 0 && (
          <>
            <Divider className="my-6" />

            <div>
              <Typography
                variant="h6"
                className="mb-4 flex items-center text-lg font-semibold text-gray-800 dark:text-white"
              >
                <FiPaperclip className="ml-2" />
                فایل‌های پیوست ({article.files.length})
              </Typography>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {article.files.map((file) => (
                  <div
                    key={file.id}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900"
                  >
                    {file.thumbnailUrl && file.mimetype.startsWith('image/') ? (
                      <div className="mb-2 h-32 w-full overflow-hidden rounded bg-white">
                        <Image
                          src={file.thumbnailUrl}
                          alt={file.originalName || 'File thumbnail'}
                          width={150}
                          height={150}
                          className="h-full w-full object-contain"
                          unoptimized // Using unoptimized for dynamic images from API
                        />
                      </div>
                    ) : (
                      <div className="mb-2 flex h-32 w-full items-center justify-center rounded bg-gray-100 dark:bg-gray-800">
                        <span className="text-4xl">
                          {file.mimetype.startsWith('image/')
                            ? '🖼️'
                            : file.mimetype.startsWith('video/')
                              ? '🎬'
                              : file.mimetype.startsWith('audio/')
                                ? '🎵'
                                : file.mimetype.includes('pdf')
                                  ? '📄'
                                  : file.mimetype.includes('zip') ||
                                      file.mimetype.includes('compressed')
                                    ? '�️'
                                    : '📁'}
                        </span>
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

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">تایید حذف مقاله</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            آیا از حذف این مقاله اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            انصراف
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus disabled={isDeleting}>
            {isDeleting ? (
              <>
                <ButtonLoading colorClassName="bg-red-400" />
                <span className="mr-2">در حال حذف...</span>
              </>
            ) : (
              'حذف'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ArticleDetailPage;
