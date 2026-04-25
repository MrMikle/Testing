import { CookingRequirement, ProductCategory, ProductSortBy, SortDirection } from '@/entities/product/model/types';
import {
    cookingRequirementOptions,
    productCategoryOptions,
    productSortOptions,
    sortDirectionOptions
} from '@/entities/product/model/constants';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { SelectInput } from '@/shared/ui/SelectInput';
import { TextInput } from '@/shared/ui/TextInput';

export type ProductFiltersValue = {
    search: string;
    category: ProductCategory | '';
    cookingRequirement: CookingRequirement | '';
    vegan: boolean;
    glutenFree: boolean;
    sugarFree: boolean;
    sortBy: ProductSortBy;
    direction: SortDirection;
};

type ProductFiltersProps = {
    value: ProductFiltersValue;
    onChange: (value: ProductFiltersValue) => void;
    onReset: () => void;
};

export function ProductFilters({ value, onChange, onReset }: ProductFiltersProps) {
    const patch = (patchValue: Partial<ProductFiltersValue>) => onChange({ ...value, ...patchValue });

    return (
        <section className="filters">
            <FormField label="Поиск по названию">
                <TextInput value={value.search} onChange={(event) => patch({ search: event.target.value })} placeholder="Например, картофель" />
            </FormField>
            <FormField label="Категория">
                <SelectInput
                    value={value.category}
                    emptyLabel="Все категории"
                    options={productCategoryOptions}
                    onChange={(event) => patch({ category: event.target.value as ProductCategory | '' })}
                />
            </FormField>
            <FormField label="Готовность">
                <SelectInput
                    value={value.cookingRequirement}
                    emptyLabel="Любая готовность"
                    options={cookingRequirementOptions}
                    onChange={(event) => patch({ cookingRequirement: event.target.value as CookingRequirement | '' })}
                />
            </FormField>
            <FormField label="Сортировка">
                <SelectInput
                    value={value.sortBy}
                    options={productSortOptions}
                    onChange={(event) => patch({ sortBy: event.target.value as ProductSortBy })}
                />
            </FormField>
            <FormField label="Направление">
                <SelectInput
                    value={value.direction}
                    options={sortDirectionOptions}
                    onChange={(event) => patch({ direction: event.target.value as SortDirection })}
                />
            </FormField>
            <div className="inline-checks">
                <label><input type="checkbox" checked={value.vegan} onChange={(event) => patch({ vegan: event.target.checked })} /> Веган</label>
                <label><input type="checkbox" checked={value.glutenFree} onChange={(event) => patch({ glutenFree: event.target.checked })} /> Без глютена</label>
                <label><input type="checkbox" checked={value.sugarFree} onChange={(event) => patch({ sugarFree: event.target.checked })} /> Без сахара</label>
            </div>
            <Button variant="secondary" onClick={onReset}>
                Сбросить
            </Button>
        </section>
    );
}
