import type { Editor as TinyMCEEditor } from 'tinymce';
import { TinyMCE } from 'tinymce';

const filePickerCallBack = (
  cb: (blobUri: string, meta: { title: string }) => void,
  tinymce: TinyMCE,
): void => {
  // Check if the editor is TinyMCE
  if (!tinymce || !tinymce.activeEditor) {
    console.error('TinyMCE editor is not available.');
    return;
  }

  // Create a file input element
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');

  // Handle file selection
  input.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') return;

      // Generate unique ID for blob
      const id = 'blobid' + new Date().getTime();
      const blobCache = (tinymce.activeEditor as TinyMCEEditor).editorUpload.blobCache;
      const base64 = reader.result.split(',')[1]; // Extract base64 data
      const blobInfo = blobCache.create(id, file, base64);
      blobCache.add(blobInfo);

      /* call the callback and populate the Title field with the file name */
      cb(blobInfo.blobUri(), { title: file.name });
    });
    reader.readAsDataURL(file);
  });

  // Trigger the file input click

  input.click();
};
export default filePickerCallBack;
// This function is used to handle file selection in TinyMCE editor.
// It creates a file input element, allows the user to select a file,
// and then reads the file as a data URL.
// Once the file is selected, it generates a unique ID for the blob,
// creates a blob info object, and calls the callback function with the blob URI and file name.
