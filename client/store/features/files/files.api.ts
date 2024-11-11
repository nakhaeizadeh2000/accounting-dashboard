import { baseApi } from '@/store/api';

const filesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation({
      query: ({ bucket, file }) => {
        const formData = new FormData();
        formData.append('file', file); // Attach the file to form data

        return {
          url: `files/upload/${bucket}`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Files'], // Optionally invalidate cache for 'File' data
    }),
    downloadFileUrl: builder.query({
      query: ({ bucket, filename }) => ({
        url: `files/download/${bucket}/${filename}`,
        method: 'GET',
      }),
      providesTags: ['Files'], // Cache the download URL if needed
    }),
  }),
});

export const { useUploadFileMutation, useDownloadFileUrlQuery } = filesApi;
