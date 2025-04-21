'use client';

import React, { useState, useEffect } from 'react';
import { Button, Tabs, Tab, Box, Typography, IconButton, Tooltip } from '@mui/material';
import { FiEye, FiCode, FiMaximize, FiMinimize } from 'react-icons/fi';
import { htmlToPlainText, countWords, calculateReadingTime } from '../utils';
import Editor from '@/components/modules/editor/TinyMceComponent';

interface ArticleEditorComponentProps {
  initialContent: string;
  onChange: (content: string) => void;
  errors?: string[];
}

const ArticleEditorComponent: React.FC<ArticleEditorComponentProps> = ({
  initialContent,
  onChange,
  errors,
}) => {
  const [content, setContent] = useState(initialContent || '');
  const [tabValue, setTabValue] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  // Update content statistics when content changes
  useEffect(() => {
    const words = countWords(content);
    setWordCount(words);
    setReadingTime(calculateReadingTime(content));
  }, [content]);

  // Handle content change from TinyMCE
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onChange(newContent);
  };

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div
      className={`relative rounded-md border dark:border-gray-700 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4 dark:bg-gray-800' : ''}`}
    >
      {/* Editor header with tabs and controls */}
      <div className="flex items-center justify-between border-b dark:border-gray-700">
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="editor-tabs">
          <Tab icon={<FiEye className="ml-1" />} label="ویرایشگر" iconPosition="start" />
          <Tab icon={<FiCode className="ml-1" />} label="کد HTML" iconPosition="start" />
        </Tabs>

        <div className="flex items-center">
          <Typography variant="body2" className="mx-2 text-sm text-gray-600 dark:text-gray-400">
            {wordCount} کلمه • {readingTime} دقیقه مطالعه
          </Typography>

          <Tooltip title={isFullscreen ? 'خروج از حالت تمام صفحه' : 'حالت تمام صفحه'}>
            <IconButton onClick={toggleFullscreen} size="small">
              {isFullscreen ? <FiMinimize /> : <FiMaximize />}
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Editor content */}
      <div className={`${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[400px]'}`}>
        {/* Visual editor tab */}
        <div role="tabpanel" hidden={tabValue !== 0}>
          {tabValue === 0 && <Editor initialValue={content} onChange={handleContentChange} />}
        </div>

        {/* HTML code tab */}
        <div role="tabpanel" hidden={tabValue !== 1}>
          {tabValue === 1 && (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="h-full w-full resize-none rounded border p-4 font-mono text-sm dark:bg-gray-900 dark:text-gray-300"
              spellCheck="false"
            />
          )}
        </div>
      </div>

      {/* Error display */}
      {errors && errors.length > 0 && (
        <div className="mt-2 text-sm text-red-600">
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticleEditorComponent;
