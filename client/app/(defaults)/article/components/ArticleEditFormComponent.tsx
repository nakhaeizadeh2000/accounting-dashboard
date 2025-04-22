'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useGetArticleByIdQuery,
  useUpdateArticleMutation,
} from '@/store/features/article/article.api';
import { isResponseCatchError } from '@/store/features/base-response.model';
import { ResponseArticleDto } from '@/store/features/article/article.model';

// UI Components
import {
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Skeleton,
  IconButton,
  Collapse,
} from '@mui/material';

// Custom Components
import ArticleEditorComponent from '../components/ArticleEditorComponent';
import ArticleFileSelector from '../components/ArticleFileSelector';

// Icons
import {
  FiSave,
  FiX,
  FiFileText,
  FiUser,
  FiPaperclip,
  FiEdit3,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi';

// Routes
import { ARTICLE_ROUTES } from '..';

interface ArticleEditFormComponentProps {
  articleId: number;
}

const ArticleEditFormComponent: React.FC<ArticleEditFormComponentProps> = ({ articleId }) => {
  const router = useRouter();

  // Form state management
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileIds, setFileIds] = useState<string[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<{
    title?: string[];
    content?: string[];
    fileIds?: string[];
    formErrors?: string[];
  }>({});

  // UI state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [originalArticle, setOriginalArticle] = useState<ResponseArticleDto | null>(null);

  // Additional states for tracking changes
  const [contentChanged, setContentChanged] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  // RTK Query hooks
  const {
    data: articleResponse,
    isLoading: isLoadingArticle,
    error: loadError,
  } = useGetArticleByIdQuery({ id: articleId });

  const [updateArticle, { isLoading: isSubmitting }] = useUpdateArticleMutation();

  // Initialize form with article data
  useEffect(() => {
    if (articleResponse?.data) {
      const article = articleResponse.data;
      setTitle(article.title);
      setContent(article.content);
      setFileIds(article.files?.map((file) => file.id) || []);
      setOriginalArticle(article);
    }
  }, [articleResponse]);

  // Track title changes
  useEffect(() => {
    if (originalArticle) {
      setFormChanged(title !== originalArticle.title);
    }
  }, [title, originalArticle]);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);

    // Clear error when user types
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }

    // Check if title has changed from original
    if (originalArticle) {
      setFormChanged(e.target.value !== originalArticle.title);
    }
  };

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent);

    // Clear error when user types
    if (errors.content) {
      setErrors((prev) => ({ ...prev, content: undefined }));
    }
  };

  // Function to track content changes
  const handleContentChangeStatus = (hasChanged: boolean) => {
    setContentChanged(hasChanged);
  };

  // Handle file selection
  const handleFileIdsChange = (selectedFileIds: string[]) => {
    // Keep the IDs as strings since the state is defined as string[]
    setFileIds(selectedFileIds);

    // Clear error if needed
    if (errors.fileIds) {
      setErrors((prev) => ({ ...prev, fileIds: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: typeof errors = {};

    // Validate title
    if (!title.trim()) {
      newErrors.title = ['عنوان مقاله الزامی است'];
      isValid = false;
    } else if (title.trim().length < 3) {
      newErrors.title = ['عنوان مقاله باید حداقل 3 کاراکتر باشد'];
      isValid = false;
    }

    // Validate content
    if (!content.trim()) {
      newErrors.content = ['محتوای مقاله الزامی است'];
      isValid = false;
    } else if (content.trim().length < 10) {
      newErrors.content = ['محتوای مقاله باید حداقل 10 کاراکتر باشد'];
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Determine if anything has changed
  const hasAnyChanges = formChanged || contentChanged;

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    // Check if anything has changed
    if (!hasAnyChanges) {
      console.log('No changes detected, showing success dialog directly');
      setSuccessDialogOpen(true);
      return;
    }

    try {
      // Only include changed fields in the update payload
      const updateData: {
        title?: string;
        content?: string;
        fileIds?: string[];
      } = {};

      if (originalArticle) {
        if (title !== originalArticle.title) {
          updateData.title = title;
        }

        if (content !== originalArticle.content) {
          updateData.content = content;
        }

        // Always include fileIds to ensure proper relationships
        updateData.fileIds = fileIds;
      }

      const result = await updateArticle({
        id: articleId,
        article: updateData,
      }).unwrap();

      if (result.success) {
        setSuccessDialogOpen(true);
        // Automatically redirect to the article info page after a short delay
        setTimeout(() => {
          router.push(ARTICLE_ROUTES.VIEW(articleId));
        }, 1500);
      }
    } catch (err) {
      if (isResponseCatchError(err)) {
        // Handle validation errors from API
        if (err.data.validationErrors) {
          setErrors(err.data.validationErrors);
        } else {
          // Handle message as array or string
          const errorMessage = err.data.message;
          const errorMessages = Array.isArray(errorMessage)
            ? errorMessage
            : [errorMessage || 'خطا در ذخیره مقاله'];

          setErrors({
            formErrors: errorMessages,
          });
        }
      } else {
        console.error('Unknown error:', err);
        setErrors({
          formErrors: ['خطای ناشناخته در ارتباط با سرور'],
        });
      }
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    router.push(ARTICLE_ROUTES.VIEW(articleId));
  };

  // Handle success dialog close
  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    router.push(ARTICLE_ROUTES.VIEW(articleId));
  };

  // Show loading state while fetching the article
  if (isLoadingArticle) {
    return (
      <div className="mx-auto max-w-5xl">
        <Paper className="mb-8 overflow-hidden rounded-lg shadow-lg dark:bg-gray-800">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <Skeleton variant="text" width="60%" height={40} className="bg-white/20" />
          </div>
          <div className="p-6">
            <Skeleton variant="rectangular" height={50} className="mb-4" />
            <Skeleton variant="rectangular" height={300} className="mb-4" />
            <Skeleton variant="rectangular" height={150} />
          </div>
        </Paper>
      </div>
    );
  }

  // Show error state if there was a problem loading the article
  if (loadError) {
    return (
      <div className="mx-auto max-w-5xl">
        <Alert severity="error" className="mb-4">
          خطا در بارگذاری اطلاعات مقاله
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(ARTICLE_ROUTES.LIST)}
            className="mr-4 mt-2"
          >
            بازگشت به لیست مقالات
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Paper className="mb-8 overflow-hidden rounded-lg shadow-lg dark:bg-gray-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <Typography
              variant="h5"
              component="h1"
              className="flex items-center text-xl font-bold md:text-2xl"
            >
              <FiEdit3 className="mr-2" />
              ویرایش مقاله: {title}
            </Typography>

            {/* Help toggle button */}
            <IconButton className="text-white" onClick={() => setHelpExpanded(!helpExpanded)}>
              {helpExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </IconButton>
          </div>

          {/* Help section */}
          <Collapse in={helpExpanded}>
            <div className="mt-4 rounded-md bg-white/10 p-4 text-sm">
              <Typography variant="body2" className="mb-2 flex items-center font-bold">
                <span className="mr-1">💡</span> راهنمای ویرایش مقاله
              </Typography>
              <ul className="list-inside list-disc space-y-1">
                <li>عنوان مقاله باید حداقل 3 کاراکتر باشد.</li>
                <li>نویسنده مقاله قابل تغییر نیست.</li>
                <li>محتوای مقاله باید حداقل 10 کاراکتر باشد.</li>
                <li>می‌توانید فایل‌های پیوست را اضافه یا حذف کنید.</li>
                <li>تغییرات فقط در صورت تفاوت با نسخه قبلی ذخیره می‌شوند.</li>
                <li>دکمه ذخیره فقط زمانی که تغییری وجود داشته باشد فعال می‌شود.</li>
              </ul>
            </div>
          </Collapse>
        </div>

        {/* Form */}
        <div className="p-6">
          {/* Form errors */}
          {errors.formErrors && errors.formErrors.length > 0 && (
            <Alert severity="error" className="mb-6 text-sm">
              {errors.formErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}

          {/* Title section */}
          <Box className="mb-6">
            <Typography variant="h6" className="mb-4 flex items-center font-bold">
              <FiUser className="mr-2 text-blue-600" />
              اطلاعات اصلی
            </Typography>

            <div className="mb-4">
              <TextField
                label="عنوان مقاله"
                fullWidth
                value={title}
                onChange={handleTitleChange}
                error={!!errors.title}
                helperText={errors.title && errors.title[0]}
                variant="outlined"
                size="small"
              />
            </div>

            {originalArticle && (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                <Typography
                  variant="body2"
                  className="flex items-center text-gray-700 dark:text-gray-300"
                >
                  <FiUser className="mr-2 text-blue-500" />
                  نویسنده:{' '}
                  {originalArticle.author.firstName + ' ' + originalArticle.author.lastName}{' '}
                  (غیرقابل تغییر)
                </Typography>
              </div>
            )}
          </Box>

          <Divider className="mb-6" />

          {/* Content section */}
          <Box className="mb-6">
            <Typography variant="h6" className="mb-4 flex items-center font-bold">
              <FiFileText className="mr-2 text-blue-600" />
              محتوای مقاله
            </Typography>

            <ArticleEditorComponent
              initialContent={content}
              onChange={handleContentChange}
              errors={errors.content}
              onChangeStatus={handleContentChangeStatus}
            />
          </Box>

          <Divider className="mb-6" />

          {/* File attachments section */}
          <Box className="mb-8">
            <Typography variant="h6" className="mb-4 flex items-center font-bold">
              <FiPaperclip className="mr-2 text-blue-600" />
              فایل‌های پیوست
            </Typography>

            <ArticleFileSelector
              selectedFileIds={fileIds}
              onSelectedFilesChange={handleFileIdsChange}
              errors={errors.fileIds}
              isEditMode={true}
              existingFiles={originalArticle?.files || []}
            />
          </Box>

          {/* Action buttons */}
          <div className="mt-8 flex justify-end gap-4">
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              startIcon={<FiX />}
              disabled={isSubmitting}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleSubmit} // Add this line to call the handleSubmit function
              disabled={isSubmitting || !hasAnyChanges}
              className="mt-4"
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={20} />
                  <span className="mr-2">در حال ذخیره...</span>
                </>
              ) : (
                <>{hasAnyChanges ? 'ذخیره تغییرات' : 'بدون تغییرات'}</>
              )}
            </Button>
          </div>
        </div>
      </Paper>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleCloseSuccessDialog}
        aria-labelledby="success-dialog-title"
      >
        <div className="rounded-t-lg bg-green-50 p-4 dark:bg-green-900">
          <DialogTitle id="success-dialog-title" className="p-0">
            تغییرات با موفقیت ذخیره شد
          </DialogTitle>
        </div>
        <DialogContent>
          <DialogContentText>
            تغییرات مقاله با موفقیت ذخیره شد. در حال انتقال به صفحه نمایش مقاله...
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} variant="contained" color="primary" autoFocus>
            مشاهده مقاله
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ArticleEditFormComponent;
