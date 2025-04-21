'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Typography, IconButton, Tooltip } from '@mui/material';
import { FiMaximize, FiMinimize, FiAlertCircle } from 'react-icons/fi';
import { countWords, calculateReadingTime } from '../utils';
import Editor from '@/components/modules/editor/TinyMceComponent';

interface ArticleEditorComponentProps {
  initialContent: string;
  onChange: (content: string) => void;
  errors?: string[];
  onChangeStatus?: (hasChanged: boolean) => void;
}

const ArticleEditorComponent: React.FC<ArticleEditorComponentProps> = ({
  initialContent,
  onChange,
  errors,
  onChangeStatus,
}) => {
  const [content, setContent] = useState(initialContent || '');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const originalContent = useRef(initialContent || '');
  const editorKey = useRef(Date.now()); // Add a key ref to force re-render when needed

  // Update local content state when initialContent prop changes
  useEffect(() => {
    if (initialContent !== content) {
      setContent(initialContent || '');
      originalContent.current = initialContent || '';
      // Force editor re-render with new content
      editorKey.current = Date.now();
      // Reset change status
      if (onChangeStatus) {
        onChangeStatus(false);
      }
    }
  }, [initialContent, onChangeStatus, content]);

  // Update content statistics when content changes
  useEffect(() => {
    const words = countWords(content);
    setWordCount(words);
    setReadingTime(calculateReadingTime(content));

    // Check if content has changed from original
    const contentChanged = content !== originalContent.current;
    if (onChangeStatus) {
      onChangeStatus(contentChanged);
    }
  }, [content, onChangeStatus]);

  // Handle content change from TinyMCE
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onChange(newContent);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Determine if there are validation errors
  const hasErrors = errors && errors.length > 0;

  return (
    <div
      className={`relative rounded-md border ${
        hasErrors ? 'border-red-500' : 'dark:border-gray-700'
      } ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4 dark:bg-gray-800' : ''}`}
    >
      {/* Editor header with stats and controls */}
      <div
        className={`flex items-center justify-between border-b p-2 ${
          hasErrors ? 'border-red-500' : 'dark:border-gray-700'
        }`}
      >
        <Typography variant="body2" className="text-sm text-gray-600 dark:text-gray-400">
          {wordCount} کلمه • {readingTime} دقیقه مطالعه
        </Typography>

        <div className="flex items-center">
          {hasErrors && (
            <Tooltip title={errors[0]}>
              <IconButton size="small" color="error">
                <FiAlertCircle />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={isFullscreen ? 'خروج از حالت تمام صفحه' : 'حالت تمام صفحه'}>
            <IconButton onClick={toggleFullscreen} size="small">
              {isFullscreen ? <FiMinimize /> : <FiMaximize />}
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Error banner */}
      {hasErrors && (
        <div className="bg-red-50 px-3 py-2 dark:bg-red-900/30">
          <Typography variant="body2" className="flex items-center text-red-600 dark:text-red-400">
            <FiAlertCircle className="mr-1" />
            {errors[0]}
          </Typography>
        </div>
      )}

      {/* Editor content */}
      <Editor
        key={editorKey.current} // Add key to force re-render when content changes
        initialValue={content}
        onChange={handleContentChange}
      />

      {/* Minimum content requirement hint */}
      <div className="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {wordCount < 3 ? (
            <span className={`${hasErrors ? 'text-red-500' : ''}`}>
              محتوای مقاله باید حداقل 10 کاراکتر باشد
            </span>
          ) : (
            <span>محتوا کافی است</span>
          )}
        </span>
        <span>{content.length} کاراکتر</span>
      </div>
    </div>
  );
};

export default ArticleEditorComponent;
