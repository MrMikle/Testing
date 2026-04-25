import { baseApi } from '@/shared/api/baseApi';
import { cleanParams } from '@/shared/api/cleanParams';
import { Page } from '@/shared/api/page';
import { Product, ProductQueryParams, ProductRequest } from '@/entities/product/model/types';

export const productApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query<Page<Product>, ProductQueryParams | void>({
            query: (params) => ({
                url: '/products',
                params: cleanParams(params ?? {})
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.content.map((product) => ({ type: 'Product' as const, id: product.id })),
                        { type: 'Products', id: 'LIST' }
                    ]
                    : [{ type: 'Products', id: 'LIST' }]
        }),
        getProduct: builder.query<Product, number>({
            query: (id) => `/products/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Product', id }]
        }),
        createProduct: builder.mutation<Product, ProductRequest>({
            query: (body) => ({
                url: '/products',
                method: 'POST',
                body
            }),
            invalidatesTags: [{ type: 'Products', id: 'LIST' }]
        }),
        updateProduct: builder.mutation<Product, { id: number; body: ProductRequest }>({
            query: ({ id, body }) => ({
                url: `/products/${id}`,
                method: 'PUT',
                body
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Product', id },
                { type: 'Products', id: 'LIST' },
                { type: 'Dishes', id: 'LIST' }
            ]
        }),
        deleteProduct: builder.mutation<void, number>({
            query: (id) => ({
                url: `/products/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: [{ type: 'Products', id: 'LIST' }]
        })
    })
});

export const {
    useGetProductsQuery,
    useGetProductQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation
} = productApi;
