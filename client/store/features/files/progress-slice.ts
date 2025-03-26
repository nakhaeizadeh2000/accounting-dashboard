import { createSlice } from '@reduxjs/toolkit';

export type UploadStatus = 'idle' | 'selected' | 'uploading' | 'completed' | 'failed';

const uploadSlice = createSlice({
  name: 'upload',
  initialState: {
    progress: 0,
    status: 'idle' as UploadStatus,
    errorMessage: '',
  },
  reducers: {
    setUploadProgress: (state, action) => {
      state.progress = action.payload;
    },
    setUploadStatus: (state, action) => {
      state.status = action.payload;
    },
    setUploadError: (state, action) => {
      state.errorMessage = action.payload;
    },
    resetUploadState: (state) => {
      state.progress = 0;
      state.status = 'idle';
      state.errorMessage = '';
    },
  },
});

export const { setUploadProgress, setUploadStatus, setUploadError, resetUploadState } =
  uploadSlice.actions;

export default uploadSlice.reducer;
