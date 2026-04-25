import { CookingRequirement, DietFlag, ProductCategory, ProductSortBy, SortDirection } from '@/entities/product/model/types';
import { SelectOption } from '@/shared/ui/SelectInput';

export const productCategoryLabels: Record<ProductCategory, string> = {
    FROZEN: 'Замороженный',
    MEAT: 'Мясной',
    VEGETABLES: 'Овощи',
    GREENS: 'Зелень',
    SPICES: 'Специи',
    CEREALS: 'Крупы',
    CANNED: 'Консервы',
    LIQUID: 'Жидкость',
    SWEETS: 'Сладости'
};

export const cookingRequirementLabels: Record<CookingRequirement, string> = {
    READY_TO_EAT: 'Готовый к употреблению',
    SEMI_FINISHED: 'Полуфабрикат',
    REQUIRES_COOKING: 'Требует приготовления'
};

export const dietFlagLabels: Record<DietFlag, string> = {
    VEGAN: 'Веган',
    GLUTEN_FREE: 'Без глютена',
    SUGAR_FREE: 'Без сахара'
};

export const productSortLabels: Record<ProductSortBy, string> = {
    name: 'Название',
    calories: 'Калорийность',
    proteins: 'Белки',
    fats: 'Жиры',
    carbohydrates: 'Углеводы'
};

export const sortDirectionLabels: Record<SortDirection, string> = {
    ASC: 'По возрастанию',
    DESC: 'По убыванию'
};

export const productCategoryOptions = Object.entries(productCategoryLabels).map(([value, label]) => ({ value, label })) as SelectOption[];

export const cookingRequirementOptions = Object.entries(cookingRequirementLabels).map(([value, label]) => ({ value, label })) as SelectOption[];

export const dietFlagOptions = Object.entries(dietFlagLabels).map(([value, label]) => ({ value, label })) as Array<{ value: DietFlag; label: string }>;

export const productSortOptions = Object.entries(productSortLabels).map(([value, label]) => ({ value, label })) as SelectOption[];

export const sortDirectionOptions = Object.entries(sortDirectionLabels).map(([value, label]) => ({ value, label })) as SelectOption[];
