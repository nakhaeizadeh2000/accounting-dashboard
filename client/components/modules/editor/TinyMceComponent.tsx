// components/Editor.tsx
'use client'; // Add this if using Next.js 13+ with App Router

import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from 'tinymce';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { useDispatch } from 'react-redux';
import { toggleTheme } from '@/store/features/theme/themeConfigSlice';
import { InitOptions } from '@tinymce/tinymce-react/lib/cjs/main/ts/components/Editor';

interface EditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
  initOptionsTinyMce?: Omit<InitOptions, 'plugins' | 'toolbar' | 'skin' | 'content_css'>;
}

const TinyEditor = ({ initialValue = '', onChange, initOptionsTinyMce }: EditorProps) => {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  const themeConfig = useSelector((state: IRootState) => state.themeConfig);

  const dispatch = useDispatch();

  useEffect(() => {
    const themeMode = dispatch(toggleTheme(localStorage.getItem('theme') || themeConfig.theme));
    console.log(themeMode, themeConfig.theme);
  }, [dispatch, themeConfig.theme]);

  return (
    <Editor
      key={themeConfig.theme}
      apiKey="no api key" // Get this from https://www.tiny.cloud/
      onInit={(evt, editor) => (editorRef.current = editor)}
      initialValue={initialValue}
      init={{
        branding: false,
        statusbar: false,
        height: 500,
        menubar: true,
        plugins: [
          'advlist',
          'autolink',
          'lists',
          'link',
          'image',
          'charmap',
          'preview',
          'anchor',
          'searchreplace',
          'visualblocks',
          'code',
          'fullscreen',
          'insertdatetime',
          'media',
          'table',
          'code',
          'help',
          'wordcount',
          'emoticons',
          'save',
          'autosave',
          'codesample',
          'directionality',
          'visualchars',
          'nonbreaking',
          'template',
          'pagebreak',
          'textpattern',
          'quickbars',
          'print',
          'importcss',
          'toc',
        ],
        skin: themeConfig.theme === 'dark' ? 'oxide-dark' : 'oxide',
        content_css: themeConfig.theme === 'dark' ? 'tinymce-5-dark' : 'tinymce-5',
        // toolbar_groups: {
        //   formatting: {
        //     icon: 'bold',
        //     tooltip: 'Formatting',
        //     items: 'bold italic underline | superscript subscript',
        //   },
        // },
        toolbar:
          'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help | image media link table codesample | ' +
          'fullscreen preview | emoticons | save | print',
        content_style: 'body { font-family:var(--font-yekan-bakh); font-size:14px }',
        language: 'fa',
        directionality: 'ltr',
        mobile: {
          menubar: true,
          plugins: ['autosave', 'lists', 'autolink'],
          toolbar: 'undo redo | formatselect | bold italic | bullist numlist',
        },
        table_toolbar:
          'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
        setup(editor) {
          editor.on('init', () => {
            editor.getDoc().body.style.fontSize = '14px';
            editor.getDoc().body.style.fontFamily = 'var(--font-yekan-bakh)';
          });
          editor.on('keydown', (e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const newContent = editor.getContent({ format: 'text' }) + '\t';
              editor.setContent(newContent);
            }
          });
        },
        ...initOptionsTinyMce,
      }}
      onEditorChange={(content) => {
        if (onChange) {
          onChange(content);
        }
      }}
    />
  );
};

export default TinyEditor;
