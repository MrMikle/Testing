import { expect, Page } from '@playwright/test';
import { ProductFormData } from '../fixtures/testData';

/**
 * Page Object для формы создания и редактирования продукта.
 *
 * Содержит методы заполнения полей продукта, загрузки фотографий,
 * выбора флагов и сохранения формы.
 */

export class ProductFormPage {
    constructor(public readonly page: Page) {}

    async fillProduct(data: ProductFormData) {
        await this.fillName(data.name);
        await this.selectCategory(data.category);
        await this.selectCookingRequirement(data.cookingRequirement);
        await this.fillNutrition(data.calories, data.proteins, data.fats, data.carbohydrates);

        if (data.composition !== undefined) {
            await this.page.getByLabel('Состав').fill(data.composition);
        }

        if (data.photos?.length) {
            await this.uploadPhotos(data.photos);
        }

        if (data.flags?.length) {
            await this.checkFlags(data.flags);
        }
    }

    async fillName(value: string) {
        await this.page.getByLabel('Название').fill(value);
    }

    async selectCategory(label: string) {
        await this.page.getByLabel('Категория').selectOption({ label });
    }

    async selectCookingRequirement(label: string) {
        await this.page.getByLabel('Необходимость готовки').selectOption({ label });
    }

    async fillNutrition(calories: string, proteins: string, fats: string, carbohydrates: string) {
        await this.page.getByLabel('Калорийность на 100 г').fill(calories);
        await this.page.getByLabel('Белки на 100 г').fill(proteins);
        await this.page.getByLabel('Жиры на 100 г').fill(fats);
        await this.page.getByLabel('Углеводы на 100 г').fill(carbohydrates);
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