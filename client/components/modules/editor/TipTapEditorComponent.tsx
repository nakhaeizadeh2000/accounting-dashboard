'use client'; // Required for client-side rendering in Next.js App Router

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Documnet from '@tiptap/extension-document';

import { useEffect } from 'react';

const TiptapEditor = () => {
  // Initialize the Tiptap editor
  const editor = useEditor({
    extensions: [StarterKit, Documnet], // Add the StarterKit extension
    content: '<h1>Hello, Tiptap!</h1><p>This is a basic editor.</p>', // Initial content
    editable: true, // Make the editor editable
  });

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="rounded border p-4">
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
