'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { ResponseArticleDto } from '@/store/features/article/article.model';
import { useArticleEditor } from '../hooks/useArticleEditor';
import AnimatedInputElement from '@/components/modules/input-elements/AnimatedInputElement';
import Editor from '@/components/modules/editor/TinyMceComponent';
import ArticleFileSelector from './ArticleFileSelector';
import {
  Paper,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  FormHelperText,
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
  FiAlertCircle,
} from 'react-icons/fi';
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
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [stepsValidation, setStepsValidation] = useState({
    0: false, // Basic Information step
    1: false, // Content step
    2: true, // Files step (optional, so default to true)
  });

  // Track if a step has been visited/attempted
  const [stepsVisited, setStepsVisited] = useState({
    0: true, // First step is always visited
    1: false,
    2: false,
  });

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

  // Validate current step
  const validateStep = useCallback(
    (step: number): boolean => {
      let isValid = true;

      if (step === 0) {
        // Validate title
        const isTitleValid = validateField('title');

        // Validate author (only for new articles)
        const isAuthorValid = isEditMode || selectedAuthor.length > 0;

        isValid = isTitleValid && isAuthorValid;

        // Update the steps validation state
        setStepsValidation((prev) => ({
          ...prev,
          0: isValid,
        }));
      } else if (step === 1) {
        // Validate content
        isValid = validateField('content');

        // Update the steps validation state
        setStepsValidation((prev) => ({
          ...prev,
          1: isValid,
        }));
      }

      return isValid;
    },
    [validateField, isEditMode, selectedAuthor.length],
  );

  // Validate all previous steps
  const validatePreviousSteps = useCallback((): boolean => {
    let allValid = true;

    for (let i = 0; i <= activeStep; i++) {
      if (!stepsValidation[i as keyof typeof stepsValidation]) {
        allValid = false;
        break;
      }
    }

    return allValid;
  }, [activeStep, stepsValidation]);

  // Mark a step as visited
  const markStepVisited = useCallback((step: number) => {
    setStepsVisited((prev) => ({
      ...prev,
      [step]: true,
    }));
  }, []);

  // Check if we should show errors for a step
  const shouldShowErrorsForStep = useCallback(
    (step: number): boolean => {
      return stepsVisited[step as keyof typeof stepsVisited];
    },
    [stepsVisited],
  );

  // Display success dialog when isSubmitSuccess changes to true
  useEffect(() => {
    if (isSubmitSuccess) {
      setSuccessDialogOpen(true);
    }
  }, [isSubmitSuccess]);

  // Mark a step as visited when it becomes active
  useEffect(() => {
    markStepVisited(activeStep);

    // If editing an existing article, validate all steps immediately
    if (isEditMode && initialArticle) {
      validateStep(activeStep);
    }
  }, [activeStep, isEditMode, initialArticle]);

  // Validate steps when form data changes
  useEffect(() => {
    // Validate any steps that have been visited
    if (stepsVisited[0]) validateStep(0);
    if (stepsVisited[1]) validateStep(1);
  }, [formState, selectedAuthor, validateStep, stepsVisited]);

  // Handle file changes
  const handleFileIdsChange = useCallback(
    (fileIds: string[]) => {
      handleInputChange('fileIds', fileIds);
    },
    [handleInputChange],
  );

  // Submit handler with validation
  const handleSubmit = useCallback(async () => {
    // Mark all steps as visited to show all errors
    setStepsVisited({
      0: true,
      1: true,
      2: true,
    });

    // Validate all required steps
    const isStep0Valid = validateStep(0);
    const isStep1Valid = validateStep(1);

    // If any step is invalid, show error dialog
    if (!isStep0Valid || !isStep1Valid) {
      setErrorDialogOpen(true);
      return;
    }

    // All validation passed, submit the form
    await originalHandleSubmit();
  }, [validateStep, originalHandleSubmit]);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange('title', e.target.value);
  };

  // Handle content change
  const handleContentChange = (content: string) => {
    handleInputChange('content', content);
  };

  // Handle author selection
  const handleSelectAuthor = (authors: ItemType[]) => {
    handleAuthorSelect(authors);

    // Mark step as visited and validate it
    if (activeStep === 0) {
      markStepVisited(0);
      validateStep(0);
    }
  };

  // Next step in form
  const handleNextStep = () => {
    // Mark current step as visited
    markStepVisited(activeStep);

    // Validate current step before proceeding
    const isValid = validateStep(activeStep);

    if (isValid) {
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      // Mark the next step as visited when entering it
      markStepVisited(nextStep);
    }
  };

  // Previous step in form
  const handlePrevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // Toggle help section
  const toggleHelp = () => {
    setHelpExpanded((prev) => !prev);
  };

  const handleCloseSuccessDialog = useCallback(() => {
    setSuccessDialogOpen(false);
    // Navigate to the article list page
    router.push(ARTICLE_ROUTES.LIST);
  }, [router]);

  const handleCloseErrorDialog = useCallback(() => {
    setErrorDialogOpen(false);
  }, []);

  // Word and character count calculation
  const wordCount = formState.content ? formState.content.split(/\s+/).filter(Boolean).length : 0;
  const charCount = formState.content ? formState.content.replace(/<[^>]*>/g, '').length : 0;

  // Steps for the stepper
  const steps = [
    { label: 'اطلاعات اصلی', icon: <FiUser /> },
    { label: 'محتوای مقاله', icon: <FiFileText /> },
    { label: 'فایل‌های پیوست', icon: <FiPaperclip /> },
  ];

  // Determine if the next button should be disabled
  const isNextButtonDisabled = useCallback(() => {
    // Check the current step validation
    if (activeStep === 0) {
      // For first step, check if title is valid and author is selected (if required)
      const isTitleValid = !!(formState.title && formState.title.length >= 3);
      const isAuthorValid = isEditMode || selectedAuthor.length > 0;
      return !(isTitleValid && isAuthorValid);
    } else if (activeStep === 1) {
      // For second step, check if content is valid
      return !(formState.content && formState.content.length >= 10);
    }

    return false;
  }, [activeStep, formState, selectedAuthor, isEditMode]);

  // Disable submit button if any required step is invalid
  const isSubmitButtonDisabled = !stepsValidation[0] || !stepsValidation[1];

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
                error={
                  stepsVisited[index as keyof typeof stepsVisited] &&
                  !stepsValidation[index as keyof typeof stepsValidation]
                }
                StepIconComponent={() => (
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      activeStep === index
                        ? 'bg-blue-600 text-white'
                        : activeStep > index &&
                            stepsValidation[index as keyof typeof stepsValidation]
                          ? 'bg-green-500 text-white'
                          : stepsVisited[index as keyof typeof stepsVisited] &&
                              !stepsValidation[index as keyof typeof stepsValidation]
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {activeStep > index &&
                    stepsValidation[index as keyof typeof stepsValidation] ? (
                      <FiCheck />
                    ) : stepsVisited[index as keyof typeof stepsVisited] &&
                      !stepsValidation[index as keyof typeof stepsValidation] ? (
                      <FiAlertCircle />
                    ) : (
                      step.icon
                    )}
                  </div>
                )}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* IMPORTANT: No form element to prevent accidental submissions */}
        <div className="p-6">
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
                      fieldError: shouldShowErrorsForStep(0) ? errors.title : undefined,
                      containerClass: 'w-full',
                      onChange: (e) => {
                        handleTitleChange(e);
                        // Check validation when title changes
                        if (stepsVisited[0]) {
                          validateStep(0);
                        }
                      },
                    }}
                  />
                </div>

                {/* Author selection - only shown in create mode */}
                {!isEditMode && (
                  <div className="w-full">
                    <FormControl
                      fullWidth
                      error={shouldShowErrorsForStep(0) && selectedAuthor.length === 0}
                    >
                      <div>
                        <UserSingleSelectWidget
                          options={{
                            title: 'نویسنده',
                            onChange: handleSelectAuthor,
                            value: selectedAuthor,
                            containerClass: 'w-full',
                          }}
                        />
                      </div>
                      {shouldShowErrorsForStep(0) && selectedAuthor.length === 0 && (
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
                  <div
                    className={`overflow-hidden rounded-md border ${
                      shouldShowErrorsForStep(1) && errors.content
                        ? 'border-red-500'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Editor
                      initialValue={formState.content}
                      onChange={(content) => {
                        handleContentChange(content);
                        // Check validation when content changes
                        if (stepsVisited[1]) {
                          validateStep(1);
                        }
                      }}
                    />
                  </div>
                  {shouldShowErrorsForStep(1) && errors.content && (
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
                  isEditMode={isEditMode}
                />
              </CardContent>
            </Card>
          </div>

          {/* Navigation and submit buttons */}
          <div className="mt-8 flex justify-between">
            <div>
              {activeStep > 0 && (
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={handlePrevStep}
                  className="[&&]:ml-2 [&&]:bg-gray-300 [&&]:text-gray-700 [&&]:hover:bg-gray-400 [&&]:hover:text-white"
                >
                  قبلی
                </Button>
              )}

              {activeStep < 2 && (
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={handleNextStep}
                  disabled={isNextButtonDisabled()}
                  className={`[&&]:bg-blue-600 [&&]:text-white [&&]:hover:bg-blue-700 ${
                    isNextButtonDisabled() ? '[&&]:cursor-not-allowed [&&]:opacity-50' : ''
                  }`}
                >
                  بعدی
                </Button>
              )}
            </div>

            <div>
              <Button
                type="button"
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
                  type="button"
                  disabled={isSubmitting || isSubmitButtonDisabled}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : <FiSave />}
                  className={`[&&]:mr-2 [&&]:bg-green-600 [&&]:text-white [&&]:hover:bg-green-700 ${
                    isSubmitButtonDisabled ? '[&&]:cursor-not-allowed [&&]:opacity-50' : ''
                  }`}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? 'در حال ذخیره...' : isEditMode ? 'ذخیره تغییرات' : 'ایجاد مقاله'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Paper>

      {/* Success Dialog */}
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
            className="[&&]:bg-blue-600 [&&]:text-white [&&]:hover:bg-blue-700"
            autoFocus
          >
            بازگشت به لیست مقالات
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={errorDialogOpen}
        onClose={handleCloseErrorDialog}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <div className="rounded-t-lg bg-red-50 p-4 dark:bg-red-900">
          <div className="flex items-center">
            <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-700 dark:text-red-300">
              <FiAlertCircle size={24} />
            </div>
            <DialogTitle className="p-0">خطا در ذخیره اطلاعات</DialogTitle>
          </div>
        </div>

        <DialogContent className="pt-4">
          <DialogContentText id="error-dialog-description" className="mt-2">
            لطفاً تمامی فیلدهای ضروری را به درستی تکمیل نمایید. موارد زیر نیاز به بررسی دارند:
          </DialogContentText>
          <ul className="mt-3 list-inside list-disc text-red-600 dark:text-red-400">
            {!stepsValidation[0] && (
              <li>
                اطلاعات اصلی:{' '}
                {errors.title ? errors.title[0] : 'عنوان و نویسنده مقاله را بررسی کنید'}
              </li>
            )}
            {!stepsValidation[1] && (
              <li>
                محتوای مقاله: {errors.content ? errors.content[0] : 'محتوای مقاله نامعتبر است'}
              </li>
            )}
          </ul>
        </DialogContent>

        <DialogActions className="p-4">
          <Button
            onClick={handleCloseErrorDialog}
            variant="contained"
            color="primary"
            className="[&&]:bg-blue-600 [&&]:text-white [&&]:hover:bg-blue-700"
            autoFocus
          >
            متوجه شدم
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ArticleFormComponent;
