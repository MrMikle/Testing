import { expect, Page } from '@playwright/test';

export class DishDetailsPage {
    constructor(public readonly page: Page) {}

    async expectOpened() {
        await expect(this.page.getByRole('heading', { name: 'Карточка блюда' })).toBeVisible();
    }

    async expectName(name: string) {
        await expect(this.page.getByRole('heading', { name, exact: true })).toBeVisible();
    }

    async expectText(text: string | RegExp) {
        await expect(this.page.getByText(text)).toBeVisible();
    }

    async expectIngredient(productName: string, quantity: string | RegExp) {
        const row = this.page.locator('tr').filter({
            has: this.page.getByRole('link', { name: productName })
        });

        await expect(row).toBeVisible();
        await expect(row).toContainText(quantity);
    }

    async expectPhotoVisible(index = 1) {
        await expect(this.page.getByAltText(`Фото ${index}`)).toBeVisible();
    }

    async openEditPage() {
        await this.page.getByRole('link', { name: 'Изменить' }).click();
        await expect(this.page.getByRole('heading', { name: 'Редактирование блюда' })).toBeVisible();
    }

    async delete(confirm = true) {
        this.page.once('dialog', async (dialog) => {
            if (confirm) {
                await dialog.accept();
                return;
            }

            await dialog.dismiss();
        });

        await this.page.getByRole('button', { name: 'Удалить' }).click();
    }
}