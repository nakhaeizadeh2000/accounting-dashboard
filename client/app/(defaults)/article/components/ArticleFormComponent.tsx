'use client';

import React, { useCallback } from 'react';
import { ResponseArticleDto } from '@/store/features/article/article.model';
import { useArticleEditor } from '../hooks/useArticleEditor';
import AnimatedInputElement from '@/components/modules/input-elements/AnimatedInputElement';
import ArticleEditorComponent from './ArticleEditorComponent';
import ArticleFileSelector from './ArticleFileSelector';
import { Button, Paper, Divider, Alert, Fade } from '@mui/material';
import ButtonLoading from '@/components/modules/loadings/ButtonLoading';
import UserSingleSelectWidget from '../../UserSingleSelectWidget';

interface ArticleFormComponentProps {
  initialArticle?: ResponseArticleDto;
  isEditMode?: boolean;
}

const ArticleFormComponent: React.FC<ArticleFormComponentProps> = ({
  initialArticle,
  isEditMode = false,
}) => {
  const {
    formState,
    selectedAuthor,
    errors,
    isSubmitting,
    isSubmitSuccess,
    handleInputChange,
    handleAuthorSelect,
    handleSubmit,
    handleCancel,
  } = useArticleEditor({
    initialArticle,
    isEditMode,
  });

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

  return (
    <Paper className="p-6 dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
          {isEditMode ? 'ویرایش مقاله' : 'ایجاد مقاله جدید'}
        </h1>

        {/* Success message */}
        <Fade in={isSubmitSuccess} timeout={500}>
          <div className={isSubmitSuccess ? 'block' : 'hidden'}>
            <Alert severity="success" className="mb-4">
              {isEditMode ? 'مقاله با موفقیت ویرایش شد.' : 'مقاله با موفقیت ایجاد شد.'}
            </Alert>
          </div>
        </Fade>

        {/* Form errors */}
        {errors.formErrors && errors.formErrors.length > 0 && (
          <Alert severity="error" className="mb-4">
            {errors.formErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}

        {/* Title input */}
        <div>
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
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              نویسنده
            </label>
            {/* Use key to force remount when selectedAuthor changes */}
            <UserSingleSelectWidget
              key={selectedAuthor.map((a) => a.value).join(',')}
              options={{
                onChange: handleAuthorSelect,
                value: selectedAuthor,
                containerClass: 'w-full',
              }}
            />
          </div>
        )}

        {/* Author display - only shown in edit mode */}
        {isEditMode && initialArticle && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              نویسنده (غیرقابل تغییر)
            </label>
            <div className="rounded-md border border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">{initialArticle.authorId}</p>
            </div>
          </div>
        )}

        {/* Content editor */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            محتوای مقاله
          </label>
          <ArticleEditorComponent
            initialContent={formState.content}
            onChange={(content) => handleInputChange('content', content)}
            errors={errors.content}
          />
        </div>

        <Divider className="my-6" />

        {/* File selection */}
        <div>
          <ArticleFileSelector
            selectedFileIds={formState.fileIds || []}
            onSelectedFilesChange={handleFileIdsChange}
            errors={errors.fileIds}
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3 space-x-reverse pt-4">
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            انصراف
          </Button>

          <Button variant="contained" color="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <ButtonLoading colorClassName="bg-white" />
                <span className="mr-2">در حال ذخیره...</span>
              </>
            ) : isEditMode ? (
              'ذخیره تغییرات'
            ) : (
              'ذخیره مقاله'
            )}
          </Button>
        </div>
      </form>
    </Paper>
  );
};

export default ArticleFormComponent;
