import { baseApi } from '@/shared/api/baseApi';

export const uploadApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        uploadPhotos: builder.mutation<string[], File[]>({
            query: (files) => {
                const formData = new FormData();

                files.forEach((file) => {
                    formData.append('files', file);
                });

                return {
                    url: '/files/photos',
                    method: 'POST',
                    body: formData
                };
            }
        })
    })
});

export const { useUploadPhotosMutation } = uploadApi;