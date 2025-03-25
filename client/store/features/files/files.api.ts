import { baseApi, baseUrl } from '@/store/api';
import { setUploadProgress } from './progress-slice';

const filesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation({
      queryFn: ({ bucket, files }: { bucket: string; files: File[] }, { signal, dispatch }) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${baseUrl}files/upload/${bucket}`, true);

          // Track upload progress
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.floor((event.loaded / event.total) * 100);
              dispatch(setUploadProgress(percentComplete));
            }
          };

          // Handle successful upload
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              resolve({ data: response });
            } else {
              reject({ status: xhr.status, data: xhr.responseText });
            }
          };

          // Handle network errors
          xhr.onerror = () => {
            reject({ status: xhr.status, data: 'Network error' });
          };

          // Handle abort
          xhr.onabort = () => {
            reject({ status: 'aborted', data: 'Upload cancelled' });
          };

          // Tie the AbortSignal to xhr.abort()
          signal.addEventListener('abort', () => {
            xhr.abort();
          });

          // Prepare and send FormData
          const formData = new FormData();
          for (const file of files) {
            formData.append(file.name, file);
          }
          xhr.send(formData);
        });
      },
      invalidatesTags: ['Files'],
    }),
    downloadFileUrl: builder.query<ResultType, { bucket: string; filename: string }>({
      query: ({ bucket, filename }) => ({
        url: `files/download/${bucket}/${filename}`,
        method: 'GET',
      }),
      providesTags: ['Files'],
    }),
  }),
});

export const { useUploadFileMutation, useDownloadFileUrlQuery } = filesApi;

type ResultType = {
  url: string;
};
