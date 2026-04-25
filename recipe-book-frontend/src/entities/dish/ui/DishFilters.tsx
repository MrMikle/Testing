import { DishCategory } from '@/entities/dish/model/types';
import { dishCategoryOptions } from '@/entities/dish/model/constants';
import { sortDirectionOptions } from '@/entities/product/model/constants';
import { SortDirection } from '@/entities/product/model/types';
import { Button } from '@/shared/ui/Button';
import { FormField } from '@/shared/ui/FormField';
import { SelectInput } from '@/shared/ui/SelectInput';
import { TextInput } from '@/shared/ui/TextInput';

export type DishFiltersValue = {
    search: string;
    category: DishCategory | '';
    vegan: boolean;
    glutenFree: boolean;
    sugarFree: boolean;
    direction: SortDirection;
};

type DishFiltersProps = {
    value: DishFiltersValue;
    onChange: (value: DishFiltersValue) => void;
    onReset: () => void;
};

export function DishFilters({ value, onChange, onReset }: DishFiltersProps) {
    const patch = (patchValue: Partial<DishFiltersValue>) => onChange({ ...value, ...patchValue });

    return (
        <section className="filters">
            <FormField label="Поиск по названию">
                <TextInput value={value.search} onChange={(event) => patch({ search: event.target.value })} placeholder="Например, борщ" />
            </FormField>
            <FormField label="Категория">
                <SelectInput
                    value={value.category}
                    emptyLabel="Все категории"
                    options={dishCategoryOptions}
                    onChange={(event) => patch({ category: event.target.value as DishCategory | '' })}
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
