import { DishCategory } from '@/entities/dish/model/types';
import { SelectOption } from '@/shared/ui/SelectInput';

export const dishCategoryLabels: Record<DishCategory, string> = {
    DESSERT: 'Десерт',
    FIRST_COURSE: 'Первое',
    SECOND_COURSE: 'Второе',
    DRINK: 'Напиток',
    SALAD: 'Салат',
    SOUP: 'Суп',
    SNACK: 'Перекус'
};

export const dishCategoryOptions = Object.entries(dishCategoryLabels).map(([value, label]) => ({ value, label })) as SelectOption[];
