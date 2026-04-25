import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { CookingRequirement, DietFlag, Product, ProductCategory, ProductRequest } from '@/entities/product/model/types';
import {
    cookingRequirementOptions,
    dietFlagOptions,
    productCategoryOptions
} from '@/entities/product/model/constants';
import { toNumberOrZero } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { CheckboxGroup } from '@/shared/ui/CheckboxGroup';
import { FormField } from '@/shared/ui/FormField';
import { SelectInput } from '@/shared/ui/SelectInput';
import { TextArea } from '@/shared/ui/TextArea';
import { TextInput } from '@/shared/ui/TextInput';

type ProductFormState = {
    name: string;
    photoUrls: string[];
    calories: string;
    proteins: string;
    fats: string;
    carbohydrates: string;
    composition: string;
    category: ProductCategory;
    cookingRequirement: CookingRequirement;
    flags: DietFlag[];
};

type ProductFormProps = {
    initialProduct?: Product;
    submitting?: boolean;
    uploadingPhotos?: boolean;
    errorText?: string | null;
    onSubmit: (request: ProductRequest) => Promise<void> | void;
    onUploadPhotos: (files: File[]) => Promise<string[]>;
};

function createInitialState(product?: Product): ProductFormState {
    return {
        name: product?.name ?? '',
        photoUrls: product?.photoUrls ?? [],
        calories: product?.nutrition.calories?.toString() ?? '',
        proteins: product?.nutrition.proteins?.toString() ?? '',
        fats: product?.nutrition.fats?.toString() ?? '',
        carbohydrates: product?.nutrition.carbohydrates?.toString() ?? '',
        composition: product?.composition ?? '',
        category: product?.category ?? 'VEGETABLES',
        cookingRequirement: product?.cookingRequirement ?? 'REQUIRES_COOKING',
        flags: product?.flags ?? []
    };
}

export function ProductForm({ initialProduct, submitting, uploadingPhotos, errorText, onSubmit, onUploadPhotos }: ProductFormProps) {
    const [state, setState] = useState(() => createInitialState(initialProduct));

    const patch = (patchValue: Partial<ProductFormState>) => setState((current) => ({ ...current, ...patchValue }));

    const removePhoto = (index: number) => {
        patch({ photoUrls: state.photoUrls.filter((_, currentIndex) => currentIndex !== index) });
    };

    const uploadPhotoFiles = async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files ?? []);
        const remainingCount = 5 - state.photoUrls.length;
        const filesToUpload = selectedFiles.slice(0, remainingCount);

        event.target.value = '';

        if (!filesToUpload.length) {
            return;
        }

        const uploadedUrls = await onUploadPhotos(filesToUpload);

        patch({
            photoUrls: [...state.photoUrls, ...uploadedUrls].slice(0, 5)
        });
    };

    useEffect(() => {
        setState((current) => {
            if (current.category !== 'MEAT' || !current.flags.includes('VEGAN')) {
                return current;
            }

            return {
                ...current,
                flags: current.flags.filter((flag) => flag !== 'VEGAN')
            };
        });
    }, [state.category]);

    const flagOptions = dietFlagOptions.map((option) => ({
        ...option,
        disabled: option.value === 'VEGAN' && state.category === 'MEAT'
    }));

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        await onSubmit({
            name: state.name.trim(),
            photoUrls: state.photoUrls.map((url) => url.trim()).filter(Boolean),
            calories: toNumberOrZero(state.calories),
            proteins: toNumberOrZero(state.proteins),
            fats: toNumberOrZero(state.fats),
            carbohydrates: toNumberOrZero(state.carbohydrates),
            composition: state.composition.trim() || null,
            category: state.category,
            cookingRequirement: state.cookingRequirement,
            flags: state.category === 'MEAT'
                ? state.flags.filter((flag) => flag !== 'VEGAN')
                : state.flags
        });
    };

    return (
        <form className="form" onSubmit={submit}>
            {errorText ? <div className="state state-error">{errorText}</div> : null}
            <div className="form-grid">
                <FormField label="Название">
                    <TextInput value={state.name} minLength={2} required onChange={(event) => patch({ name: event.target.value })} />
                </FormField>
                <FormField label="Категория">
                    <SelectInput value={state.category} required options={productCategoryOptions} onChange={(event) => patch({ category: event.target.value as ProductCategory })} />
                </FormField>
                <FormField label="Необходимость готовки">
                    <SelectInput value={state.cookingRequirement} required options={cookingRequirementOptions} onChange={(event) => patch({ cookingRequirement: event.target.value as CookingRequirement })} />
                </FormField>
                <FormField label="Калорийность на 100 г">
                    <TextInput type="number" min={0} step="0.01" value={state.calories} required onChange={(event) => patch({ calories: event.target.value })} />
                </FormField>
                <FormField label="Белки на 100 г">
                    <TextInput type="number" min={0} max={100} step="0.01" value={state.proteins} required onChange={(event) => patch({ proteins: event.target.value })} />
                </FormField>
                <FormField label="Жиры на 100 г">
                    <TextInput type="number" min={0} max={100} step="0.01" value={state.fats} required onChange={(event) => patch({ fats: event.target.value })} />
                </FormField>
                <FormField label="Углеводы на 100 г">
                    <TextInput type="number" min={0} max={100} step="0.01" value={state.carbohydrates} required onChange={(event) => patch({ carbohydrates: event.target.value })} />
                </FormField>
            </div>
            <FormField label="Состав">
                <TextArea value={state.composition} rows={4} onChange={(event) => patch({ composition: event.target.value })} />
            </FormField>
            <div className="form-section">
                <div className="section-title">
                    <h3>Фото продукта</h3>
                    <span className="hint">До 5 изображений</span>
                </div>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingPhotos || state.photoUrls.length >= 5}
                    onChange={uploadPhotoFiles}
                />
                {state.photoUrls.length ? (
                    <div className="uploaded-photo-list">
                        {state.photoUrls.map((url, index) => (
                            <div key={`${url}-${index}`} className="uploaded-photo-row">
                                <img src={url} alt={`Фото ${index + 1}`} />
                                <span>Фото {index + 1}</span>
                                <Button type="button" variant="ghost" onClick={() => removePhoto(index)}>
                                    Убрать
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="hint">Фото пока не загружены.</p>
                )}
            </div>
            <FormField label="Дополнительные флаги">
                <CheckboxGroup options={flagOptions} value={state.flags} onChange={(flags) => patch({ flags })} />
            </FormField>
            <div className="form-actions">
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </div>
        </form>
    );
}
