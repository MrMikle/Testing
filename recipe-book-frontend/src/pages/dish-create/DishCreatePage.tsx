import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCalculateDishNutritionMutation, useCreateDishMutation } from '@/entities/dish/api/dishApi';
import { DishIngredientRequest, DishRequest } from '@/entities/dish/model/types';
import { useGetProductsQuery } from '@/entities/product/api/productApi';
import { DishForm } from '@/features/dish-form/ui/DishForm';
import { getErrorMessage } from '@/shared/lib/apiError';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PageState } from '@/shared/ui/PageState';
import { useUploadPhotosMutation } from '@/shared/api/uploadApi';

export function DishCreatePage() {
    const navigate = useNavigate();
    const { data: productsData, isLoading: isProductsLoading, error: productsError } = useGetProductsQuery({ size: 1000, sortBy: 'name', direction: 'ASC' });
    const [createDish, { isLoading: isSaving }] = useCreateDishMutation();
    const [calculateNutrition, { isLoading: isCalculating }] = useCalculateDishNutritionMutation();
    const [uploadPhotos, { isLoading: isUploadingPhotos }] = useUploadPhotosMutation();
    const [errorText, setErrorText] = useState<string | null>(null);

    const submit = async (request: DishRequest) => {
        setErrorText(null);
        try {
            const dish = await createDish(request).unwrap();
            navigate(`/dishes/${dish.id}`);
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

    return (
        <>
            <PageHeader title="Создание блюда" subtitle="Выберите продукты, рассчитайте КБЖУ и сохраните блюдо" />
            <PageState loading={isProductsLoading} error={productsError} />
            {productsData ? (
                <DishForm
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
