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
import dynamic from 'next/dynamic';
import { yekanBakh } from '@/app/stuff/fonts';
import tinymce from 'tinymce';
import filePickerCallBack from './config/init-options/filePickerCallBack';
import { pluginOptions } from './config/init-options/pluginOptions';
import { toolBarOptions } from './config/init-options/toolBarOption';

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
  }, [dispatch, themeConfig.theme]);

  return (
    <>
      <Editor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        key={themeConfig.theme}
        licenseKey="gpl"
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue={initialValue}
        init={{
          base_url: '/tinymce',
          branding: false,
          statusbar: false,
          height: 500,
          min_height: 200,
          menubar: false,
          language: 'fa',
          directionality: 'ltr',
          promotion: false,
          file_picker_types: 'file image media',
          automatic_uploads: true,
          plugins: pluginOptions,
          toolbar: toolBarOptions,

          skin: themeConfig.theme === 'dark' ? 'oxide-dark' : 'oxide',
          content_css: themeConfig.theme === 'dark' ? 'tinymce-5-dark' : 'tinymce-5',
          content_style: `body { font-family:${yekanBakh.variable}; font-size:14px }`,

          mobile: {
            menubar: false,
            plugins: ['autosave', 'lists', 'autolink'],
            toolbar: 'undo redo | formatselect | bold italic | bullist numlist',
          },
          default_align: 'right',
          setup(editor) {
            editor.on('init', () => {
              editor.getDoc().body.style.fontSize = '14px';
              editor.getDoc().body.style.fontFamily = 'font-yekan-bakh';
              editor.execCommand('JustifyRight');
            });
            editor.on('keydown', (e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const newContent = editor.getContent({ format: 'text' }) + '\t';
                editor.setContent(newContent);
              }
            });
          },
          file_picker_callback: (cb, value, meta) => {
            return filePickerCallBack(cb, tinymce);
          },
          ...initOptionsTinyMce,
        }}
        onEditorChange={(content) => {
          if (onChange) {
            onChange(content);
          }
        }}
      />
    </>
  );
};

export default dynamic(() => Promise.resolve(TinyEditor), {
  ssr: false,
});
