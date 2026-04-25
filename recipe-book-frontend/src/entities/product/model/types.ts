import { Nutrition } from '@/entities/nutrition/model/types';

export type ProductCategory =
  | 'FROZEN'
  | 'MEAT'
  | 'VEGETABLES'
  | 'GREENS'
  | 'SPICES'
  | 'CEREALS'
  | 'CANNED'
  | 'LIQUID'
  | 'SWEETS';

export type CookingRequirement = 'READY_TO_EAT' | 'SEMI_FINISHED' | 'REQUIRES_COOKING';

export type DietFlag = 'VEGAN' | 'GLUTEN_FREE' | 'SUGAR_FREE';

export type ProductSortBy = 'name' | 'calories' | 'proteins' | 'fats' | 'carbohydrates';

export type SortDirection = 'ASC' | 'DESC';

export type Product = {
    id: number;
    name: string;
    photoUrls: string[];
    nutrition: Nutrition;
    composition: string | null;
    category: ProductCategory;
    cookingRequirement: CookingRequirement;
    flags: DietFlag[];
    createdAt: string;
    updatedAt: string | null;
};

export type ProductRequest = {
    name: string;
    photoUrls: string[];
    calories: number;
    proteins: number;
    fats: number;
    carbohydrates: number;
    composition: string | null;
    category: ProductCategory;
    cookingRequirement: CookingRequirement;
    flags: DietFlag[];
};

export type ProductQueryParams = {
    category?: ProductCategory | '';
    cookingRequirement?: CookingRequirement | '';
    vegan?: boolean;
    glutenFree?: boolean;
    sugarFree?: boolean;
    search?: string;
    sortBy?: ProductSortBy;
    direction?: SortDirection;
    page?: number;
    size?: number;
};
