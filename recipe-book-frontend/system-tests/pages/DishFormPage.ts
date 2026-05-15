import { expect, Locator, Page } from '@playwright/test';
import { DishFormData } from '../fixtures/testData';

/**
 * Page Object для формы создания и редактирования блюда.
 *
 * Содержит методы заполнения названия, категории, размера порции,
 * состава блюда, ручного КБЖУ, фотографий и дополнительных флагов.
 */

export class DishFormPage {
    constructor(public readonly page: Page) {}

    async fillDish(data: DishFormData) {
        await this.fillName(data.name);

        if (data.category) {
            await this.selectCategory(data.category);
        }

        await this.fillServingSize(data.servingSizeGrams);

        for (let index = 0; index < data.ingredients.length; index += 1) {
            if (index > 0) {
                await this.addIngredient();
            }

            await this.selectIngredient(index, data.ingredients[index].productName);
            await this.fillIngredientQuantity(index, data.ingredients[index].quantityGrams);
        }

        if (data.photos?.length) {
            await this.uploadPhotos(data.photos);
        }

        if (data.flags?.length) {
            await this.checkFlags(data.flags);
        }
    }

    ingredientRow(index: number): Locator {
        return this.page.locator('.ingredient-row').nth(index);
    }

    async fillName(value: string) {
        await this.page.getByLabel('Название').fill(value);
    }

    async selectCategory(label: string) {
        await this.page.getByLabel('Категория').selectOption({ label });
    }

    async fillServingSize(value: string) {
        await this.page.getByLabel('Размер порции, г').fill(value);
    }

    async addIngredient() {
        await this.page.getByRole('button', { name: 'Добавить продукт' }).click();
    }

    async selectIngredient(index: number, productName: string) {
        await this.ingredientRow(index).locator('select').selectOption({ label: productName });
    }

    async fillIngredientQuantity(index: number, quantityGrams: string) {
        await this.ingredientRow(index).getByPlaceholder('Граммы').fill(quantityGrams);
    }

    async calculateNutrition() {
        await this.page.getByRole('button', { name: 'Рассчитать по составу' }).click();
    }

    async fillManualNutrition(calories: string, proteins: string, fats: string, carbohydrates: string) {
        await this.page.getByLabel('Калорийность', { exact: true }).fill(calories);
        await this.page.getByLabel('Белки', { exact: true }).fill(proteins);
        await this.page.getByLabel('Жиры', { exact: true }).fill(fats);
        await this.page.getByLabel('Углеводы', { exact: true }).fill(carbohydrates);
    }

    async expectNutritionFilled() {
        await expect(this.page.getByLabel('Калорийность', { exact: true })).not.toHaveValue('');
        await expect(this.page.getByLabel('Белки', { exact: true })).not.toHaveValue('');
        await expect(this.page.getByLabel('Жиры', { exact: true })).not.toHaveValue('');
        await expect(this.page.getByLabel('Углеводы', { exact: true })).not.toHaveValue('');
    }

    async uploadPhotos(paths: string[]) {
        await this.page.locator('input[type="file"]').setInputFiles(paths);
        await expect(this.page.locator('.uploaded-photo-row')).toHaveCount(paths.length, {
            timeout: 10_000
        });
    }

    async expectCannotUploadMoreThanFivePhotos(extraPhotoPath: string) {
        await expect(this.page.locator('.uploaded-photo-row')).toHaveCount(5);

        await this.page.locator('input[type="file"]').setInputFiles(extraPhotoPath);

        await expect(this.page.locator('.uploaded-photo-row')).toHaveCount(5);
    }

    flagCheckbox(flag: string) {
        return this.page.locator('label.checkbox-item').filter({ hasText: flag }).locator('input[type="checkbox"]');
    }

    async checkFlags(flags: string[]) {
        for (const flag of flags) {
            await this.flagCheckbox(flag).check();
        }
    }

    async expectFlagDisabled(flag: string) {
        await expect(this.flagCheckbox(flag)).toBeDisabled();
    }

    async save() {
        await this.page.getByRole('button', { name: 'Сохранить' }).click();
    }

    async expectServerErrorVisible() {
        await expect(this.page.locator('.state-error')).toBeVisible();
    }
}