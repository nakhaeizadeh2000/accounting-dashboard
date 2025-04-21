/**
 * Translations for static text in the file upload components
 */

// Translations for single file upload component
export const singleFileUploadTranslations = {
  fa: {
    clickOrDrop: 'برای آپلود کلیک کنید یا فایل را بکشید',
    startUpload: 'شروع آپلود',
    uploading: 'در حال آپلود',
    uploadComplete: 'آپلود تکمیل شد',
    uploadFailed: '!آپلود ناموفق',
    removeFile: 'حذف فایل',
    tryAgain: 'تلاش مجدد',
    cancel: 'لغو',
  },
  en: {
    clickOrDrop: 'click or drop file to upload',
    startUpload: 'start upload',
    uploading: 'Uploading',
    uploadComplete: 'Upload Complete',
    uploadFailed: 'Upload Failed!',
    removeFile: 'remove file',
    tryAgain: 'Try Again',
    cancel: 'cancel',
  },
};

// Translations for multiple file upload component
export const multiFileUploadTranslations = {
  fa: {
    clickOrDrop: 'برای آپلود کلیک کنید یا فایل‌ها را بکشید',
    startUpload: 'شروع آپلود',
    uploadingFiles: 'در حال آپلود فایل‌ها...',
    ofFilesCompleted: 'فایل‌ها تکمیل شده است',
    cancelAllUploads: 'لغو همه آپلودها',
    allFilesUploaded: 'همه فایل‌ها با موفقیت آپلود شدند!',
    selectMoreFiles: 'انتخاب فایل‌های بیشتر برای آپلود',
    someFilesFailed: 'برخی از فایل‌ها آپلود نشدند',
    someFilesCancelled: 'برخی از آپلودها لغو شدند',
    retryFailedFiles: 'تلاش مجدد برای فایل‌های ناموفق',
    selectMoreFilesButton: 'انتخاب فایل‌های بیشتر',
    noFilesSelected: 'فایلی انتخاب نشده است',
    remove: 'حذف',
    retry: 'تلاش مجدد',
    uploading: 'در حال آپلود',
    queued: 'در صف',
    completed: 'تکمیل شده',
    failed: 'ناموفق',
    cancelled: 'لغو شده',
    ready: 'آماده',
  },
  en: {
    clickOrDrop: 'click or drop files to upload',
    startUpload: 'Start Upload',
    uploadingFiles: 'Uploading Files...',
    ofFilesCompleted: 'of files completed',
    cancelAllUploads: 'Cancel All Uploads',
    allFilesUploaded: 'All files uploaded successfully!',
    selectMoreFiles: 'Select More Files to Upload',
    someFilesFailed: 'Some files failed to upload',
    someFilesCancelled: 'Some uploads were cancelled',
    retryFailedFiles: 'Retry Failed Files',
    selectMoreFilesButton: 'Select More Files',
    noFilesSelected: 'No files selected',
    remove: 'Remove',
    retry: 'Retry',
    uploading: 'uploading',
    queued: 'queued',
    completed: 'completed',
    failed: 'failed',
    cancelled: 'cancelled',
    ready: 'ready',
  },
};

// All translations combined for convenience
export const translations = {
  singleFileUpload: singleFileUploadTranslations,
  multiFileUpload: multiFileUploadTranslations,
};

export default translations;
