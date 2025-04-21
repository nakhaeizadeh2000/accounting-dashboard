'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { ResponseArticleDto } from '@/store/features/article/article.model';
import { useArticleEditor } from '../hooks/useArticleEditor';
import AnimatedInputElement from '@/components/modules/input-elements/AnimatedInputElement';
import Editor from '@/components/modules/editor/TinyMceComponent';
import ArticleFileSelector from './ArticleFileSelector';
import {
  Paper,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  FormHelperText,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Collapse,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import UserSingleSelectWidget from '../../UserSingleSelectWidget';
import { ARTICLE_ROUTES } from '..';
import {
  FiCheck,
  FiSave,
  FiX,
  FiEdit3,
  FiUser,
  FiFileText,
  FiPaperclip,
  FiInfo,
  FiHelpCircle,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi';
import { GetIndex } from '@/store/features/user/users.model';
import { ItemType } from '@/components/modules/drop-downs/drop-down.type';

interface ArticleFormComponentProps {
  initialArticle?: ResponseArticleDto;
  isEditMode?: boolean;
}

const ArticleFormComponent: React.FC<ArticleFormComponentProps> = ({
  initialArticle,
  isEditMode = false,
}) => {
  const router = useRouter();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Track if we're in author selection mode to prevent form submission
  const selectingAuthor = useRef(false);

  const {
    formState,
    selectedAuthor,
    errors,
    isSubmitting,
    isSubmitSuccess,
    handleInputChange,
    handleAuthorSelect,
    handleSubmit: originalHandleSubmit,
    handleCancel,
    validateField,
  } = useArticleEditor({
    initialArticle,
    isEditMode,
  });

  // Custom author selection handler
  const safeHandleAuthorSelect = useCallback(
    (authors: ItemType[]) => {
      selectingAuthor.current = true;
      handleAuthorSelect(authors);
      setTimeout(() => {
        selectingAuthor.current = false;
      }, 100);
    },
    [handleAuthorSelect],
  );

  // Wrapper for handleSubmit to show dialog on success
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      // Don't submit if we're just selecting an author
      if (selectingAuthor.current) {
        return;
      }

      await originalHandleSubmit(e);

      // Check if submission was successful
      setTimeout(() => {
        if (!errors.formErrors && !errors.title && !errors.content) {
          setSuccessDialogOpen(true);
        }
      }, 300);
    },
    [originalHandleSubmit, errors],
  );

  const handleCloseSuccessDialog = useCallback(() => {
    setSuccessDialogOpen(false);
    // Navigate to the article list page
    router.push(ARTICLE_ROUTES.LIST);
  }, [router]);

  const handleFileIdsChange = useCallback(
    (fileIds: string[]) => {
      handleInputChange('fileIds', fileIds);
    },
    [handleInputChange],
  );

  // Handle direct input change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('title', e.target.value);
  };

  // Handle content change
  const handleContentChange = (content: string) => {
    handleInputChange('content', content);
  };

  // Next step in form
  const handleNextStep = () => {
    if (activeStep === 0) {
      validateField('title');
      if (!isEditMode && !selectedAuthor.length) {
        // Set an error for author selection
        return;
      }
      if (errors.title || errors.formErrors) return;
    } else if (activeStep === 1) {
      validateField('content');
      if (errors.content) return;
    }

    setActiveStep((prev) => Math.min(prev + 1, 2));
  };

  // Previous step in form
  const handlePrevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // Toggle help section
  const toggleHelp = () => {
    setHelpExpanded((prev) => !prev);
  };

  // Word and character count calculation
  const wordCount = formState.content ? formState.content.split(/\s+/).filter(Boolean).length : 0;
  const charCount = formState.content ? formState.content.replace(/<[^>]*>/g, '').length : 0;

  // Steps for the stepper
  const steps = [
    { label: 'اطلاعات اصلی', icon: <FiUser /> },
    { label: 'محتوای مقاله', icon: <FiFileText /> },
    { label: 'فایل‌های پیوست', icon: <FiPaperclip /> },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <Paper className="mb-8 overflow-hidden rounded-lg shadow-lg dark:bg-gray-800">
        {/* Header with title and help toggle */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <Typography
              variant="h5"
              component="h1"
              className="flex items-center text-xl font-bold md:text-2xl"
            >
              {isEditMode ? (
                <>
                  <FiEdit3 className="mr-2" />
                  ویرایش مقاله
                </>
              ) : (
                <>
                  <FiFileText className="mr-2" />
                  ایجاد مقاله جدید
                </>
              )}
            </Typography>

            <Tooltip title="راهنمای فرم">
              <IconButton onClick={toggleHelp} className="text-white">
                {helpExpanded ? <FiChevronUp /> : <FiChevronDown />}
              </IconButton>
            </Tooltip>
          </div>

          {/* Help section */}
          <Collapse in={helpExpanded}>
            <div className="mt-4 rounded-md bg-white/10 p-4 text-sm">
              <Typography variant="body2" className="mb-2 flex items-center font-bold">
                <FiHelpCircle className="mr-1" /> راهنمای ایجاد مقاله
              </Typography>
              <ul className="list-inside list-disc space-y-1">
                <li>عنوان مقاله باید حداقل 3 کاراکتر باشد.</li>
                <li>انتخاب نویسنده الزامی است.</li>
                <li>محتوای مقاله باید حداقل 10 کاراکتر باشد.</li>
                <li>می‌توانید فایل‌های پیوست را به مقاله اضافه کنید (اختیاری).</li>
                <li>برای هدایت بین بخش‌های فرم، می‌توانید از دکمه‌های بعدی و قبلی استفاده کنید.</li>
              </ul>
            </div>
          </Collapse>
        </div>

        {/* Stepper for form progress */}
        <Stepper activeStep={activeStep} className="border-b border-gray-200 px-6 py-4">
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel
                StepIconComponent={() => (
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      activeStep === index
                        ? 'bg-blue-600 text-white'
                        : activeStep > index
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {activeStep > index ? <FiCheck /> : step.icon}
                  </div>
                )}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit} ref={formRef} className="p-6">
          {/* Form errors */}
          {errors.formErrors && errors.formErrors.length > 0 && (
            <Alert severity="error" className="mb-6 text-sm">
              {errors.formErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}

          {/* Step 1: Basic Information */}
          <div className={activeStep === 0 ? 'block' : 'hidden'}>
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-6">
                <Typography variant="h6" className="mb-4 flex items-center font-bold">
                  <FiUser className="mr-2 text-blue-600" />
                  اطلاعات اصلی
                </Typography>

                {/* Title input */}
                <div className="mb-4">
                  <AnimatedInputElement
                    options={{
                      key: 'title',
                      type: 'text',
                      label: 'عنوان مقاله',
                      defaultValue: formState.title,
                      fieldError: errors.title,
                      containerClass: 'w-full',
                      onChange: handleTitleChange,
                    }}
                  />
                </div>

                {/* Author selection - only shown in create mode */}
                {!isEditMode && (
                  <div className="w-full" onClick={(e) => e.stopPropagation()}>
                    <FormControl
                      fullWidth
                      error={!!errors.formErrors?.find((error) => error.includes('نویسنده'))}
                    >
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        نویسنده <span className="text-red-500">*</span>
                      </label>
                      <div onClick={(e) => e.preventDefault()}>
                        <UserSingleSelectWidget
                          options={{
                            onChange: safeHandleAuthorSelect,
                            value: selectedAuthor,
                            containerClass: 'w-full',
                          }}
                        />
                      </div>
                      {errors.formErrors?.find((error) => error.includes('نویسنده')) && (
                        <FormHelperText className="text-red-500">
                          انتخاب نویسنده الزامی است
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                )}

                {/* Author display - only shown in edit mode */}
                {isEditMode && initialArticle && (
                  <div className="w-full">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      نویسنده (غیرقابل تغییر)
                    </label>
                    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                      <p className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <FiUser className="ml-2 text-blue-500" />
                        {initialArticle.authorId}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Step 2: Content */}
          <div className={activeStep === 1 ? 'block' : 'hidden'}>
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-6">
                <Typography variant="h6" className="mb-4 flex items-center font-bold">
                  <FiFileText className="mr-2 text-blue-600" />
                  محتوای مقاله
                </Typography>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    متن مقاله <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`overflow-hidden rounded-md border ${errors.content ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <Editor initialValue={formState.content} onChange={handleContentChange} />
                  </div>
                  {errors.content && (
                    <FormHelperText className="mt-1 text-red-500">
                      {errors.content[0]}
                    </FormHelperText>
                  )}

                  {/* Word and character count */}
                  <div className="mt-3 flex items-center justify-end text-sm text-gray-500 dark:text-gray-400">
                    <div className="mr-4 flex items-center">
                      <FiInfo className="mr-1" />
                      <span>{wordCount} کلمه</span>
                    </div>
                    <div className="flex items-center">
                      <FiInfo className="mr-1" />
                      <span>{charCount} کاراکتر</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 3: File Attachments */}
          <div className={activeStep === 2 ? 'block' : 'hidden'}>
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-6">
                <Typography variant="h6" className="mb-4 flex items-center font-bold">
                  <FiPaperclip className="mr-2 text-blue-600" />
                  فایل‌های پیوست
                </Typography>

                <ArticleFileSelector
                  selectedFileIds={formState.fileIds || []}
                  onSelectedFilesChange={handleFileIdsChange}
                  errors={errors.fileIds}
                />
              </CardContent>
            </Card>
          </div>

          {/* Navigation and submit buttons */}
          <div className="mt-8 flex justify-between">
            <div>
              {activeStep > 0 && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handlePrevStep}
                  className="ml-2"
                >
                  قبلی
                </Button>
              )}

              {activeStep < 2 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  بعدی
                </Button>
              )}
            </div>

            <div>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
                startIcon={<FiX />}
                className="ml-2"
              >
                انصراف
              </Button>

              {activeStep === 2 && (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <FiSave />}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'در حال ذخیره...' : isEditMode ? 'ذخیره تغییرات' : 'ایجاد مقاله'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Paper>

      {/* Success Dialog - Fixed structure to avoid nesting Typography issues */}
      <Dialog
        open={successDialogOpen}
        onClose={handleCloseSuccessDialog}
        aria-labelledby="success-dialog-title"
        aria-describedby="success-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <div className="rounded-t-lg bg-green-50 p-4 dark:bg-green-900">
          <div className="flex items-center">
            <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-700 dark:text-green-300">
              <FiCheck size={24} />
            </div>
            <DialogTitle className="p-0">عملیات موفق</DialogTitle>
          </div>
        </div>

        <DialogContent className="pt-4">
          <DialogContentText id="success-dialog-description" className="mt-2">
            {isEditMode
              ? 'مقاله با موفقیت ویرایش شد. می‌توانید از طریق دکمه زیر به لیست مقالات بازگردید.'
              : 'مقاله جدید با موفقیت ایجاد شد. می‌توانید از طریق دکمه زیر به لیست مقالات بازگردید.'}
          </DialogContentText>
        </DialogContent>

        <DialogActions className="p-4">
          <Button
            onClick={handleCloseSuccessDialog}
            variant="contained"
            color="primary"
            className="bg-blue-600 hover:bg-blue-700"
            autoFocus
          >
            بازگشت به لیست مقالات
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ArticleFormComponent;
