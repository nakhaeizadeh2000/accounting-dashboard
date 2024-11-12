import { baseApi } from '@/store/api';

const filesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation({
      query: ({ bucket, files }: { bucket: string; files: File[] }) => {
        const formData = new FormData();
        for (let file of files) {
          formData.append(file.name, file); // Attach the file to form data
        }

        return {
          url: `files/upload/${bucket}`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Files'], // Optionally invalidate cache for 'File' data
    }),
    downloadFileUrl: builder.query<a, { bucket: string, filename: string }>({
      query: ({ bucket, filename }) => ({
        url: `files/download/${bucket}/${filename}`,
        method: 'GET',
      }),
      providesTags: ['Files'], // Cache the download URL if needed
    }),
  }),
});

export const { useUploadFileMutation, useDownloadFileUrlQuery } = filesApi;

type a = { url: string }
