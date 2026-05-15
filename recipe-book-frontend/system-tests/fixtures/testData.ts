/// <reference types="node" />

/**
 * Набор тестовых данных для системных UI-тестов.
 *
 * В файле хранятся готовые данные продуктов, блюд, пути к тестовым изображениям
 * и граничные значения, полученные методами эквивалентного разбиения
 * и анализа граничных значений.
 */

import path from 'path';

export function assetPath(fileName: string) {
    return path.resolve('system-tests', 'assets', fileName);
}

export type ProductFormData = {
    name: string;
    category: string;
    cookingRequirement: string;
    calories: string;
    proteins: string;
    fats: string;
    carbohydrates: string;
    composition?: string;
    flags?: string[];
    photos?: string[];
};

export type DishIngredientFormData = {
    productName: string;
    quantityGrams: string;
};

export type DishFormData = {
    name: string;
    category?: string;
    servingSizeGrams: string;
    ingredients: DishIngredientFormData[];
    calories?: string;
    proteins?: string;
    fats?: string;
    carbohydrates?: string;
    flags?: string[];
    photos?: string[];
};

export const products = {
    potato: {
        name: 'Картофель',
        category: 'Овощи',
        cookingRequirement: 'Требует приготовления',
        calories: '77',
        proteins: '2',
        fats: '0.4',
        carbohydrates: '16.3',
        composition: 'Картофель свежий',
        flags: ['Веган', 'Без глютена', 'Без сахара'],
        photos: [assetPath('kartoshqa.png')]
    },
    beet: {
        name: 'Свёкла',
        category: 'Овощи',
        cookingRequirement: 'Требует приготовления',
        calories: '43',
        proteins: '1.5',
        fats: '0.1',
        carbohydrates: '8.8',
        composition: 'Свёкла свежая',
        flags: ['Веган', 'Без глютена', 'Без сахара'],
        photos: [assetPath('svekla.png')]
    },
    water: {
        name: 'Вода',
        category: 'Жидкость',
        cookingRequirement: 'Готовый к употреблению',
        calories: '0',
        proteins: '0',
        fats: '0',
        carbohydrates: '0',
        composition: 'Питьевая вода',
        flags: ['Веган', 'Без глютена', 'Без сахара'],
        photos: [assetPath('water.png')]
    },
    meat: {
        name: 'Мясо',
        category: 'Мясной',
        cookingRequirement: 'Требует приготовления',
        calories: '187.2',
        proteins: '18.9',
        fats: '12.4',
        carbohydrates: '0',
        composition: 'Мясо говяжье',
        flags: ['Без глютена', 'Без сахара'],
        photos: [assetPath('meat.jpeg'), assetPath('meat2.jpeg')]
    }
} satisfies Record<string, ProductFormData>;

export const dishes = {
    borsch: {
        name: '!суп Борщ',
        category: 'Первое',
        servingSizeGrams: '350',
        ingredients: [
            { productName: 'Картофель', quantityGrams: '100' },
            { productName: 'Свёкла', quantityGrams: '150' },
            { productName: 'Вода', quantityGrams: '500' },
            { productName: 'Мясо', quantityGrams: '150' }
        ],
        flags: ['Без глютена', 'Без сахара'],
        photos: [assetPath('borsch.png')]
    },
    veganBorsch: {
        name: '!суп Борщ веганский',
        servingSizeGrams: '350',
        ingredients: [
            { productName: 'Картофель', quantityGrams: '150' },
            { productName: 'Свёкла', quantityGrams: '150' },
            { productName: 'Вода', quantityGrams: '500' }
        ],
        flags: ['Веган', 'Без глютена', 'Без сахара'],
        photos: [assetPath('borsch_vegan.png')]
    }
} satisfies Record<string, DishFormData>;

export const productBoundaryValues = {
    invalidNameEmpty: '',
    invalidNameOneChar: 'А',
    validNameTwoChars: 'Аб',
    invalidNegativeNutrition: '-0.01',
    zeroNutrition: '0',
    positiveNutritionNearBoundary: '0.01',
    maxNutrientValue: '100',
    invalidNutrientAboveMax: '100.01'
};

export const dishBoundaryValues = {
    invalidNameEmpty: '',
    invalidNameOneChar: 'А',
    validNameTwoChars: 'Аб',
    invalidZeroServingSize: '0',
    validServingSizeNearBoundary: '0.1',
    invalidZeroIngredientQuantity: '0',
    validIngredientQuantityNearBoundary: '0.1',
    invalidNegativeNutrition: '-0.01',
    zeroNutrition: '0'
};