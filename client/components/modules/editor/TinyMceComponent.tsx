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

  return (
    <TinyMCEEditor
      key={themeConfig.theme}
      apiKey="no api key" // Get this from https://www.tiny.cloud/
      onInit={(evt, editor) => (editorRef.current = editor)}
      initialValue={initialValue}
      init={{
        branding: false,
        statusbar: false,
        height: 500,
        menubar: true,
        plugins: ['lists', 'code', 'anchor'],
        skin: themeConfig.theme === 'dark' ? 'oxide-dark' : 'oxide',
        content_css: themeConfig.theme === 'dark' ? 'tinymce-5-dark' : 'tinymce-5',
        // toolbar_groups: {
        //   formatting: {
        //     icon: 'bold',
        //     tooltip: 'Formatting',
        //     items: 'bold italic underline | superscript subscript',
        //   },
        // },
        // toolbar:
        //   'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image | code| anchor',
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
