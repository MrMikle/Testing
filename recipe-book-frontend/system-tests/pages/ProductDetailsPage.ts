import { expect, Page } from '@playwright/test';

/**
 * Page Object для карточки продукта.
 *
 * Содержит проверки отображения данных продукта и действия
 * перехода к редактированию или удалению.
 */

export class ProductDetailsPage {
    constructor(public readonly page: Page) {}

    async expectOpened() {
        await expect(this.page.getByRole('heading', { name: 'Карточка продукта' })).toBeVisible();
    }

    async expectName(name: string) {
        await expect(this.page.getByRole('heading', { name, exact: true })).toBeVisible();
    }

    async expectText(text: string | RegExp) {
        await expect(this.page.getByText(text)).toBeVisible();
    }

    async expectPhotoVisible(index = 1) {
        await expect(this.page.getByAltText(`Фото ${index}`)).toBeVisible();
    }

    async openEditPage() {
        await this.page.getByRole('link', { name: 'Изменить' }).click();
        await expect(this.page.getByRole('heading', { name: 'Редактирование продукта' })).toBeVisible();
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

    async expectAlertAfterDelete(expectedText: string | RegExp) {
        this.page.once('dialog', async (dialog) => {
            expect(dialog.message()).toMatch(expectedText);
            await dialog.accept();
        });

        await this.page.getByRole('button', { name: 'Удалить' }).click();
    }
}