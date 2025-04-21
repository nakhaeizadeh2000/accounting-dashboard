'use client';

import React, { useState, useEffect } from 'react';
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
import { useArticleForm } from '../hooks/useArticleForm';

const ArticleAddFormComponent: React.FC = () => {
  const router = useRouter();

  // Use our custom form hook with validation on initialization
  const {
    formData,
    errors,
    isFormValid,
    handleChange,
    validateForm,
    validateField,
    formatForCreate,
  } = useArticleForm(undefined, true); // Pass true to validate on initialization

  // Author selection state
  const [selectedAuthor, setSelectedAuthor] = useState<ItemType[]>([]);
  const [authorError, setAuthorError] = useState<string[]>(['انتخاب نویسنده الزامی است']);

  // UI state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [apiErrors, setApiErrors] = useState<string[]>([]);

  // RTK Query mutation
  const [createArticle, { isLoading: isSubmitting }] = useCreateArticleMutation();

  // Check if the form can be submitted
  const canSubmit = isFormValid && selectedAuthor.length > 0 && !isSubmitting;

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('title', e.target.value);
    validateField('title');
  };

  // Handle content change
  const handleContentChange = (newContent: string) => {
    handleChange('content', newContent);
    validateField('content');
  };

  // Handle author selection
  const handleAuthorSelect = (authors: ItemType[]) => {
    setSelectedAuthor(authors);

    // Clear error when user selects
    if (authorError.length > 0) {
      setAuthorError([]);
    }
  };

  // Handle file selection
  const handleFileIdsChange = (selectedFileIds: string[]) => {
    handleChange('fileIds', selectedFileIds);
  };

  // Validate author field
  const validateAuthor = (): boolean => {
    if (selectedAuthor.length === 0) {
      setAuthorError(['انتخاب نویسنده الزامی است']);
      return false;
    }
    setAuthorError([]);
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate all fields
    const isAuthorValid = validateAuthor();

    if (!isFormValid || !isAuthorValid) {
      return;
    }

    try {
      // Format data for API
      const createData = formatForCreate(selectedAuthor[0].value.toString());

      const result = await createArticle(createData).unwrap();

      if (result.success) {
        setSuccessDialogOpen(true);
      }
    } catch (err) {
      if (isResponseCatchError(err)) {
        // Handle validation errors from API
        if (err.data.validationErrors) {
          // Map API validation errors to our form errors structure
          const apiValidationErrors = err.data.validationErrors;

          // Handle specific field errors
          if (apiValidationErrors.title) {
            handleChange('title', formData.title); // Trigger error display
            validateField('title');
          }

          if (apiValidationErrors.content) {
            handleChange('content', formData.content); // Trigger error display
            validateField('content');
          }

          if (apiValidationErrors.authorId) {
            setAuthorError(apiValidationErrors.authorId);
          }

          if (apiValidationErrors.fileIds) {
            handleChange('fileIds', formData.fileIds); // Trigger error display
          }

          // Handle general form errors
          if (apiValidationErrors.formErrors) {
            setApiErrors(apiValidationErrors.formErrors);
          }
        } else {
          // Handle message as array or string
          const errorMessage = err.data.message;
          const errorMessages = Array.isArray(errorMessage)
            ? errorMessage
            : [errorMessage || 'خطا در ذخیره مقاله'];

          setApiErrors(errorMessages);
        }
      } else {
        console.error('Unknown error:', err);
        setApiErrors(['خطای ناشناخته در ارتباط با سرور']);
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

  // Validate all fields on component mount
  useEffect(() => {
    // Validate all fields immediately when the component mounts
    validateField('title');
    validateField('content');

    // No need to validate fileIds as they're optional
  }, []);

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
          {apiErrors.length > 0 && (
            <Alert severity="error" className="mb-6 text-sm">
              {apiErrors.map((error, index) => (
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
                label="عنوان مقاله *"
                fullWidth
                value={formData.title}
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
                  title: 'نویسنده *',
                  onChange: handleAuthorSelect,
                  value: selectedAuthor,
                  containerClass: 'w-full',
                }}
              />
              {authorError.length > 0 && (
                <Typography color="error" variant="caption" className="mt-1 block">
                  {authorError[0]}
                </Typography>
              )}
            </div>
          </Box>

          <Divider className="mb-6" />

          {/* Content section */}
          <Box className="mb-6">
            <Typography variant="h6" className="mb-4 flex items-center font-bold">
              <FiFileText className="mr-2 text-blue-600" />
              محتوای مقاله *
            </Typography>

            <ArticleEditorComponent
              initialContent={formData.content}
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
              selectedFileIds={formData.fileIds || []}
              onSelectedFilesChange={handleFileIdsChange}
              errors={errors.fileIds}
            />
          </Box>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col gap-2">
            <div className="flex justify-end gap-4">
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
                onClick={handleSubmit}
                disabled={isSubmitting || !isFormValid}
                className="mt-4"
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={20} />
                    <span className="mr-2">در حال ذخیره...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="ml-2" />
                    ذخیره مقاله
                  </>
                )}
              </Button>
            </div>

            {/* Helper text to explain why the button might be disabled */}
            {!isFormValid && !Object.keys(errors).length && (
              <Typography variant="caption" color="text.secondary" className="text-right">
                برای فعال شدن دکمه ذخیره، لطفاً عنوان و محتوای مقاله را وارد کنید.
              </Typography>
            )}

            {/* Show specific validation errors if they exist */}
            {Object.keys(errors).length > 0 && (
              <Typography variant="caption" color="warning" className="text-right">
                لطفاً خطاهای فرم را برطرف کنید تا دکمه ذخیره فعال شود.
              </Typography>
            )}
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
