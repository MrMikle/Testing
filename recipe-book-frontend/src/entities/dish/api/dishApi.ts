import { baseApi } from '@/shared/api/baseApi';
import { cleanParams } from '@/shared/api/cleanParams';
import { Page } from '@/shared/api/page';
import { Nutrition } from '@/entities/nutrition/model/types';
import { Dish, DishNutritionCalculationRequest, DishQueryParams, DishRequest } from '@/entities/dish/model/types';

export const dishApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDishes: builder.query<Page<Dish>, DishQueryParams | void>({
            query: (params) => ({
                url: '/dishes',
                params: cleanParams(params ?? {})
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.content.map((dish) => ({ type: 'Dish' as const, id: dish.id })),
                        { type: 'Dishes', id: 'LIST' }
                    ]
                    : [{ type: 'Dishes', id: 'LIST' }]
        }),
        getDish: builder.query<Dish, number>({
            query: (id) => `/dishes/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Dish', id }]
        }),
        calculateDishNutrition: builder.mutation<Nutrition, DishNutritionCalculationRequest>({
            query: (body) => ({
                url: '/dishes/calculate-nutrition',
                method: 'POST',
                body
            })
        }),
        createDish: builder.mutation<Dish, DishRequest>({
            query: (body) => ({
                url: '/dishes',
                method: 'POST',
                body
            }),
            invalidatesTags: [{ type: 'Dishes', id: 'LIST' }]
        }),
        updateDish: builder.mutation<Dish, { id: number; body: DishRequest }>({
            query: ({ id, body }) => ({
                url: `/dishes/${id}`,
                method: 'PUT',
                body
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Dish', id },
                { type: 'Dishes', id: 'LIST' }
            ]
        }),
        deleteDish: builder.mutation<void, number>({
            query: (id) => ({
                url: `/dishes/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: [{ type: 'Dishes', id: 'LIST' }, { type: 'Products', id: 'LIST' }]
        })
    })
});

export const {
    useGetDishesQuery,
    useGetDishQuery,
    useCalculateDishNutritionMutation,
    useCreateDishMutation,
    useUpdateDishMutation,
    useDeleteDishMutation
} = dishApi;
