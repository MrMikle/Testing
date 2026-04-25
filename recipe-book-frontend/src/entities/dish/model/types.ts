import { DietFlag } from '@/entities/product/model/types';
import { Nutrition } from '@/entities/nutrition/model/types';

export type DishCategory = 'DESSERT' | 'FIRST_COURSE' | 'SECOND_COURSE' | 'DRINK' | 'SALAD' | 'SOUP' | 'SNACK';

export type DishIngredient = {
    productId: number;
    productName: string;
    quantityGrams: number;
};

export type DishIngredientRequest = {
    productId: number;
    quantityGrams: number;
};

export type Dish = {
    id: number;
    name: string;
    photoUrls: string[];
    nutrition: Nutrition;
    ingredients: DishIngredient[];
    servingSizeGrams: number;
    category: DishCategory;
    flags: DietFlag[];
    createdAt: string;
    updatedAt: string | null;
};

export type DishRequest = {
    name: string;
    photoUrls: string[];
    calories: number | null;
    proteins: number | null;
    fats: number | null;
    carbohydrates: number | null;
    ingredients: DishIngredientRequest[];
    servingSizeGrams: number;
    category: DishCategory | null;
    flags: DietFlag[];
};

export type DishQueryParams = {
    category?: DishCategory | '';
    vegan?: boolean;
    glutenFree?: boolean;
    sugarFree?: boolean;
    search?: string;
    direction?: 'ASC' | 'DESC';
    page?: number;
    size?: number;
};

export type DishNutritionCalculationRequest = {
    ingredients: DishIngredientRequest[];
};
