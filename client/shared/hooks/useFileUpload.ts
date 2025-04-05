// hooks/useFileUpload.ts
import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Create a simple slice for progress tracking
export const uploadProgressSlice = createSlice({
  name: 'uploadProgress',
  initialState: {
    progress: 0,
  },
  reducers: {
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    resetProgress: (state) => {
      state.progress = 0;
    },
  },
});

export const { setProgress, resetProgress } = uploadProgressSlice.actions;
export default uploadProgressSlice.reducer;

// The custom hook
export const useFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'selected' | 'uploading' | 'completed' | 'failed'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedData, setUploadedData] = useState<any>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const dispatch = useDispatch();

  // Handle file selection
  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      setUploadStatus('selected');
    } else {
      setUploadStatus('idle');
    }
    setErrorMessage('');
    dispatch(resetProgress());
    setUploadedData(null);
  };

  // Handle file rejection
  const handleFileReject = (reason: string) => {
    setErrorMessage(reason);
    setUploadStatus('failed');
  };

  // Handle upload with progress tracking
  const handleUpload = (bucket: string) => {
    if (!file) return Promise.reject(new Error('No file selected'));

    setUploadStatus('uploading');
    dispatch(resetProgress());

    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          dispatch(setProgress(progress));
        }
      });

      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            setUploadStatus('completed');
            dispatch(setProgress(100));
            setUploadedData(response);
            resolve(response);
          } catch (e) {
            const errorMsg = 'Error processing response';
            setUploadStatus('failed');
            setErrorMessage(errorMsg);
            dispatch(resetProgress());
            reject(new Error(errorMsg));
          }
        } else {
          const errorMsg = xhr.statusText || 'Upload failed';
          setUploadStatus('failed');
          setErrorMessage(errorMsg);
          dispatch(resetProgress());
          reject(new Error(errorMsg));
        }
      };

      // Prepare the request
      const formData = new FormData();
      formData.append(file.name, file);

      xhr.open('POST', `/api/files/upload/${bucket}`, true);
      xhr.send(formData);
    });
  };

  // Cancel an in-progress upload
  const cancelUpload = () => {
    if (xhrRef.current && uploadStatus === 'uploading') {
      xhrRef.current.abort();
      setUploadStatus('failed');
      setErrorMessage('Upload cancelled');
      dispatch(resetProgress());
    }
  };

  // Reset everything
  const reset = () => {
    setFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
    dispatch(resetProgress());
    setUploadedData(null);
  };

  return {
    file,
    uploadStatus,
    errorMessage,
    uploadedData,
    handleFileSelect,
    handleFileReject,
    handleUpload,
    cancelUpload,
    reset,
  };
};
