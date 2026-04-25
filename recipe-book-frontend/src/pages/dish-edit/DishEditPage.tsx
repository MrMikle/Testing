import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCalculateDishNutritionMutation, useGetDishQuery, useUpdateDishMutation } from '@/entities/dish/api/dishApi';
import { DishIngredientRequest, DishRequest } from '@/entities/dish/model/types';
import { useGetProductsQuery } from '@/entities/product/api/productApi';
import { DishForm } from '@/features/dish-form/ui/DishForm';
import { getErrorMessage } from '@/shared/lib/apiError';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PageState } from '@/shared/ui/PageState';
import { useUploadPhotosMutation } from '@/shared/api/uploadApi';

export function DishEditPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const dishId = Number(id);
    const { data: dish, isLoading: isDishLoading, error: dishError } = useGetDishQuery(dishId, { skip: !dishId });
    const { data: productsData, isLoading: isProductsLoading, error: productsError } = useGetProductsQuery({ size: 100, sortBy: 'name', direction: 'ASC' });
    const [updateDish, { isLoading: isSaving }] = useUpdateDishMutation();
    const [calculateNutrition, { isLoading: isCalculating }] = useCalculateDishNutritionMutation();
    const [uploadPhotos, { isLoading: isUploadingPhotos }] = useUploadPhotosMutation();
    const [errorText, setErrorText] = useState<string | null>(null);

    const submit = async (request: DishRequest) => {
        setErrorText(null);
        try {
            const updated = await updateDish({ id: dishId, body: request }).unwrap();
            navigate(`/dishes/${updated.id}`);
        } catch (error) {
            setErrorText(getErrorMessage(error));
        }
    };

    const calculate = async (ingredients: DishIngredientRequest[]) => {
        setErrorText(null);
        try {
            return await calculateNutrition({ ingredients }).unwrap();
        } catch (error) {
            const message = getErrorMessage(error);
            setErrorText(message);
            throw new Error(message);
        }
    };

    const upload = async (files: File[]) => {
        setErrorText(null);

        try {
            return await uploadPhotos(files).unwrap();
        } catch (error) {
            const message = getErrorMessage(error);
            setErrorText(message);
            throw new Error(message);
        }
    };

    const loading = isDishLoading || isProductsLoading;
    const error = dishError || productsError || (!dishId ? true : undefined);

    return (
        <>
            <PageHeader title="Редактирование блюда" />
            <PageState loading={loading} error={error} />
            {dish && productsData ? (
                <DishForm
                    initialDish={dish}
                    products={productsData.content}
                    submitting={isSaving}
                    calculating={isCalculating}
                    uploadingPhotos={isUploadingPhotos}
                    errorText={errorText}
                    onSubmit={submit}
                    onCalculate={calculate}
                    onUploadPhotos={upload}
                />
            ) : null}
        </>
    );
}
