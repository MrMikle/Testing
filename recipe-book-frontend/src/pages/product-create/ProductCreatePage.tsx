import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProductMutation } from '@/entities/product/api/productApi';
import { ProductRequest } from '@/entities/product/model/types';
import { ProductForm } from '@/features/product-form/ui/ProductForm';
import { getErrorMessage } from '@/shared/lib/apiError';
import { PageHeader } from '@/shared/ui/PageHeader';
import { useUploadPhotosMutation } from '@/shared/api/uploadApi';

export function ProductCreatePage() {
    const navigate = useNavigate();
    const [createProduct, { isLoading }] = useCreateProductMutation();
    const [uploadPhotos, { isLoading: isUploadingPhotos }] = useUploadPhotosMutation();
    const [errorText, setErrorText] = useState<string | null>(null);

    const submit = async (request: ProductRequest) => {
        setErrorText(null);
        try {
            const product = await createProduct(request).unwrap();
            navigate(`/products/${product.id}`);
        } catch (error) {
            setErrorText(getErrorMessage(error));
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
            <PageHeader title="Создание продукта" subtitle="Заполните обязательные поля и сохраните продукт" />
            <ProductForm
                submitting={isLoading}
                uploadingPhotos={isUploadingPhotos}
                errorText={errorText}
                onSubmit={submit}
                onUploadPhotos={upload}
            />
        </>
    );
}
