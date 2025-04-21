'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateArticleMutation } from '@/store/features/article/article.api';
import { isResponseCatchError } from '@/store/features/base-response.model';

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
  IconButton,
  Collapse,
} from '@mui/material';

// Custom Components
import ArticleEditorComponent from '../components/ArticleEditorComponent';
import ArticleFileSelector from '../components/ArticleFileSelector';
import UserSingleSelectWidget from '../../UserSingleSelectWidget';

// Icons
import {
  FiSave,
  FiX,
  FiFileText,
  FiUser,
  FiPaperclip,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi';

// Routes
import { ARTICLE_ROUTES } from '..';

// Types
import { ItemType } from '@/components/modules/drop-downs/drop-down.type';

const ArticleAddFormComponent: React.FC = () => {
  const router = useRouter();

  // Form state management
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<ItemType[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<{
    title?: string[];
    content?: string[];
    authorId?: string[];
    fileIds?: string[];
    formErrors?: string[];
  }>({});

  // UI state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [helpExpanded, setHelpExpanded] = useState(false);

  // RTK Query mutation
  const [createArticle, { isLoading: isSubmitting }] = useCreateArticleMutation();

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);

    // Clear error when user types
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
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

  // Handle author selection
  const handleAuthorSelect = (authors: ItemType[]) => {
    setSelectedAuthor(authors);

    // Clear error when user selects
    if (errors.authorId) {
      setErrors((prev) => ({ ...prev, authorId: undefined }));
    }
  };

  // Handle file selection
  const handleFileIdsChange = (selectedFileIds: string[]) => {
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

    // Validate author
    if (selectedAuthor.length === 0) {
      newErrors.authorId = ['انتخاب نویسنده الزامی است'];
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const createData = {
        title,
        content,
        authorId: selectedAuthor[0].value.toString(),
        fileIds,
      };

      const result = await createArticle(createData).unwrap();

      if (result.success) {
        setSuccessDialogOpen(true);
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
    router.push(ARTICLE_ROUTES.LIST);
  };

  // Handle success dialog close
  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    router.push(ARTICLE_ROUTES.LIST);
  };

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
              <FiFileText className="mr-2" />
              ایجاد مقاله جدید
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
                <span className="mr-1">💡</span> راهنمای ایجاد مقاله
              </Typography>
              <ul className="list-inside list-disc space-y-1">
                <li>عنوان مقاله باید حداقل 3 کاراکتر باشد.</li>
                <li>انتخاب نویسنده الزامی است.</li>
                <li>محتوای مقاله باید حداقل 10 کاراکتر باشد.</li>
                <li>می‌توانید فایل‌های پیوست را به مقاله اضافه کنید (اختیاری).</li>
                <li>تمامی فیلدهای ستاره‌دار الزامی هستند.</li>
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

            <div className="mb-4">
              <UserSingleSelectWidget
                options={{
                  title: 'نویسنده',
                  onChange: handleAuthorSelect,
                  value: selectedAuthor,
                  containerClass: 'w-full',
                }}
              />
              {errors.authorId && (
                <Typography color="error" variant="caption" className="mt-1 block">
                  {errors.authorId[0]}
                </Typography>
              )}
            </div>
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
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <FiSave />}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'در حال ذخیره...' : 'ایجاد مقاله'}
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
            مقاله با موفقیت ایجاد شد
          </DialogTitle>
        </div>
        <DialogContent>
          <DialogContentText>
            مقاله جدید با موفقیت ذخیره شد. می‌توانید از طریق دکمه زیر به لیست مقالات بازگردید.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} variant="contained" color="primary" autoFocus>
            بازگشت به لیست مقالات
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ArticleAddFormComponent;
