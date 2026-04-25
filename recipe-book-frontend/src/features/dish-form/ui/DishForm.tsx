import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Dish, DishCategory, DishIngredientRequest, DishRequest } from '@/entities/dish/model/types';
import { dishCategoryOptions } from '@/entities/dish/model/constants';
import { Nutrition } from '@/entities/nutrition/model/types';
import { DietFlag, Product } from '@/entities/product/model/types';
import { dietFlagLabels } from '@/entities/product/model/constants';
import { toNumberOrNull, toNumberOrZero } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { CheckboxGroup, CheckboxOption } from '@/shared/ui/CheckboxGroup';
import { FormField } from '@/shared/ui/FormField';
import { SelectInput } from '@/shared/ui/SelectInput';
import { TextInput } from '@/shared/ui/TextInput';

type IngredientRow = {
    productId: string;
    quantityGrams: string;
};

type DishFormState = {
    name: string;
    photoUrls: string[];
    calories: string;
    proteins: string;
    fats: string;
    carbohydrates: string;
    ingredients: IngredientRow[];
    servingSizeGrams: string;
    category: DishCategory | '';
    flags: DietFlag[];
};

type DishFormProps = {
    initialDish?: Dish;
    products: Product[];
    submitting?: boolean;
    calculating?: boolean;
    uploadingPhotos?: boolean;
    errorText?: string | null;
    onSubmit: (request: DishRequest) => Promise<void> | void;
    onCalculate: (ingredients: DishIngredientRequest[]) => Promise<Nutrition>;
    onUploadPhotos: (files: File[]) => Promise<string[]>;
};

const allDietFlags: DietFlag[] = ['VEGAN', 'GLUTEN_FREE', 'SUGAR_FREE'];

function createInitialState(dish?: Dish): DishFormState {
    return {
        name: dish?.name ?? '',
        photoUrls: dish?.photoUrls ?? [],
        calories: dish?.nutrition.calories?.toString() ?? '',
        proteins: dish?.nutrition.proteins?.toString() ?? '',
        fats: dish?.nutrition.fats?.toString() ?? '',
        carbohydrates: dish?.nutrition.carbohydrates?.toString() ?? '',
        ingredients: dish?.ingredients?.length
            ? dish.ingredients.map((ingredient) => ({
                productId: ingredient.productId.toString(),
                quantityGrams: ingredient.quantityGrams.toString()
            }))
            : [{ productId: '', quantityGrams: '' }],
        servingSizeGrams: dish?.servingSizeGrams?.toString() ?? '',
        category: dish?.category ?? '',
        flags: dish?.flags ?? []
    };
}

function toIngredients(rows: IngredientRow[]) {
    return rows
        .filter((row) => row.productId && row.quantityGrams)
        .map((row) => ({
            productId: Number(row.productId),
            quantityGrams: toNumberOrZero(row.quantityGrams)
        }));
}

export function DishForm({ initialDish, products, submitting, calculating, uploadingPhotos, errorText, onSubmit, onCalculate, onUploadPhotos }: DishFormProps) {
    const [state, setState] = useState(() => createInitialState(initialDish));

    const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);

    const availableFlags = useMemo(() => {
        const ingredients = toIngredients(state.ingredients);
        if (!ingredients.length) {
            return new Set<DietFlag>();
        }
        return new Set(
            allDietFlags.filter((flag) =>
                ingredients.every((ingredient) => productsById.get(ingredient.productId)?.flags.includes(flag))
            )
        );
    }, [productsById, state.ingredients]);

    useEffect(() => {
        setState((current) => ({
            ...current,
            flags: current.flags.filter((flag) => availableFlags.has(flag))
        }));
    }, [availableFlags]);

    const flagOptions: CheckboxOption<DietFlag>[] = allDietFlags.map((flag) => ({
        value: flag,
        label: dietFlagLabels[flag],
        disabled: !availableFlags.has(flag)
    }));

    const patch = (patchValue: Partial<DishFormState>) => setState((current) => ({ ...current, ...patchValue }));

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

    const setIngredient = (index: number, patchValue: Partial<IngredientRow>) => {
        patch({
            ingredients: state.ingredients.map((row, currentIndex) => currentIndex === index ? { ...row, ...patchValue } : row)
        });
    };

    const addIngredient = () => {
        patch({ ingredients: [...state.ingredients, { productId: '', quantityGrams: '' }] });
    };

    const removeIngredient = (index: number) => {
        const next = state.ingredients.filter((_, currentIndex) => currentIndex !== index);
        patch({ ingredients: next.length ? next : [{ productId: '', quantityGrams: '' }] });
    };

    const handleCalculate = async () => {
        try {
            const nutrition = await onCalculate(toIngredients(state.ingredients));
            patch({
                calories: nutrition.calories.toString(),
                proteins: nutrition.proteins.toString(),
                fats: nutrition.fats.toString(),
                carbohydrates: nutrition.carbohydrates.toString()
            });
        } catch {
            return;
        }
    };

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        await onSubmit({
            name: state.name.trim(),
            photoUrls: state.photoUrls.map((url) => url.trim()).filter(Boolean),
            calories: toNumberOrNull(state.calories),
            proteins: toNumberOrNull(state.proteins),
            fats: toNumberOrNull(state.fats),
            carbohydrates: toNumberOrNull(state.carbohydrates),
            ingredients: toIngredients(state.ingredients),
            servingSizeGrams: toNumberOrZero(state.servingSizeGrams),
            category: state.category || null,
            flags: state.flags.filter((flag) => availableFlags.has(flag))
        });
    };

    return (
        <form className="form" onSubmit={submit}>
            {errorText ? <div className="state state-error">{errorText}</div> : null}
            <div className="form-grid">
                <FormField label="Название">
                    <TextInput value={state.name} minLength={2} required placeholder="Например, !суп Борщ" onChange={(event) => patch({ name: event.target.value })} />
                </FormField>
                <FormField label="Категория">
                    <SelectInput value={state.category} emptyLabel="Определить по макросу или выбрать" options={dishCategoryOptions} onChange={(event) => patch({ category: event.target.value as DishCategory | '' })} />
                </FormField>
                <FormField label="Размер порции, г">
                    <TextInput type="number" min={0.1} step="0.1" value={state.servingSizeGrams} required onChange={(event) => patch({ servingSizeGrams: event.target.value })} />
                </FormField>
            </div>
            <div className="form-section">
                <div className="section-title">
                    <h3>Состав блюда</h3>
                    <Button type="button" variant="secondary" onClick={addIngredient}>
                        Добавить продукт
                    </Button>
                </div>
                <div className="ingredient-list">
                    {state.ingredients.map((ingredient, index) => (
                        <div key={index} className="ingredient-row">
                            <SelectInput
                                value={ingredient.productId}
                                emptyLabel="Выберите продукт"
                                options={products.map((product) => ({ value: product.id.toString(), label: product.name }))}
                                required
                                onChange={(event) => setIngredient(index, { productId: event.target.value })}
                            />
                            <TextInput
                                type="number"
                                min={0.1}
                                step="0.1"
                                value={ingredient.quantityGrams}
                                placeholder="Граммы"
                                required
                                onChange={(event) => setIngredient(index, { quantityGrams: event.target.value })}
                            />
                            <Button type="button" variant="ghost" onClick={() => removeIngredient(index)}>
                                Убрать
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="form-section">
                <div className="section-title">
                    <h3>КБЖУ на порцию</h3>
                    <Button type="button" variant="secondary" disabled={calculating || toIngredients(state.ingredients).length === 0} onClick={handleCalculate}>
                        {calculating ? 'Расчёт...' : 'Рассчитать по составу'}
                    </Button>
                </div>
                <div className="form-grid">
                    <FormField label="Калорийность">
                        <TextInput type="number" min={0} step="0.01" value={state.calories} onChange={(event) => patch({ calories: event.target.value })} />
                    </FormField>
                    <FormField label="Белки">
                        <TextInput type="number" min={0} step="0.01" value={state.proteins} onChange={(event) => patch({ proteins: event.target.value })} />
                    </FormField>
                    <FormField label="Жиры">
                        <TextInput type="number" min={0} step="0.01" value={state.fats} onChange={(event) => patch({ fats: event.target.value })} />
                    </FormField>
                    <FormField label="Углеводы">
                        <TextInput type="number" min={0} step="0.01" value={state.carbohydrates} onChange={(event) => patch({ carbohydrates: event.target.value })} />
                    </FormField>
                </div>
            </div>
            <div className="form-section">
                <div className="section-title">
                    <h3>Фото блюда</h3>
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
            <p className="hint">Недоступные флаги отключаются автоматически на основе выбранных продуктов.</p>
            <div className="form-actions">
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </div>
        </form>
    );
}
