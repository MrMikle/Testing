import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetProductQuery, useUpdateProductMutation } from '@/entities/product/api/productApi';
import { ProductRequest } from '@/entities/product/model/types';
import { ProductForm } from '@/features/product-form/ui/ProductForm';
import { getErrorMessage } from '@/shared/lib/apiError';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PageState } from '@/shared/ui/PageState';
import { useUploadPhotosMutation } from '@/shared/api/uploadApi';

export function ProductEditPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const productId = Number(id);
    const { data: product, isLoading, error } = useGetProductQuery(productId, { skip: !productId });
    const [updateProduct, { isLoading: isSaving }] = useUpdateProductMutation();
    const [uploadPhotos, { isLoading: isUploadingPhotos }] = useUploadPhotosMutation();
    const [errorText, setErrorText] = useState<string | null>(null);

    const submit = async (request: ProductRequest) => {
        setErrorText(null);
        try {
            const updated = await updateProduct({ id: productId, body: request }).unwrap();
            navigate(`/products/${updated.id}`);
        } catch (submitError) {
            setErrorText(getErrorMessage(submitError));
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
            <PageHeader title="Редактирование продукта" />
            <PageState loading={isLoading} error={error || (!productId ? true : undefined)} />
            {product ? (
                <ProductForm
                    initialProduct={product}
                    submitting={isSaving}
                    uploadingPhotos={isUploadingPhotos}
                    errorText={errorText}
                    onSubmit={submit}
                    onUploadPhotos={upload}
                />
            ) : null}
        </>
    );
}
