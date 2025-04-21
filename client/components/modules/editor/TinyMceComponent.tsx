// components/Editor.tsx
'use client'; // Add this if using Next.js 13+ with App Router

import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react';
import { useEffect, useRef } from 'react';
import { darkTheme } from '../../../shared/configs/mui-config/theme-mui';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useDispatch } from 'react-redux';
import { toggleTheme } from '@/store/features/theme/themeConfigSlice';

interface EditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
}

export default function Editor({ initialValue = '', onChange }: EditorProps) {
  const editorRef = useRef<any>(null);

  const themeConfig = useSelector((state: IRootState) => state.themeConfig);

  const dispatch = useDispatch();

  useEffect(() => {
    const themeMode = dispatch(toggleTheme(localStorage.getItem('theme') || themeConfig.theme));
    console.log(themeMode, themeConfig.theme);
  }, [dispatch, themeConfig.theme]);

  // This effect ensures the editor content is updated when initialValue changes
  useEffect(() => {
    if (editorRef.current && initialValue !== editorRef.current.getContent()) {
      editorRef.current.setContent(initialValue);
    }
  }, [initialValue]);

  return (
    <TinyMCEEditor
      key={themeConfig.theme}
      apiKey="no api key" // Get this from https://www.tiny.cloud/
      onInit={(evt, editor) => {
        editorRef.current = editor;
        // Set initial content on init if available
        if (initialValue && initialValue !== editor.getContent()) {
          editor.setContent(initialValue);
        }
      }}
      initialValue={initialValue}
      init={{
        branding: false,
        statusbar: false,
        height: 500,
        menubar: true,
        plugins: ['lists', 'code', 'anchor'],
        skin: themeConfig.theme === 'dark' ? 'oxide-dark' : 'oxide',
        content_css: themeConfig.theme === 'dark' ? 'tinymce-5-dark' : 'tinymce-5',
        content_style: 'body { font-family:var(--font-yekan-bakh); font-size:14px }',
        language: 'fa',
        directionality: 'ltr',
      }}
      onEditorChange={(content) => {
        if (onChange) {
          onChange(content);
        }
      }}
    />
  );
}
