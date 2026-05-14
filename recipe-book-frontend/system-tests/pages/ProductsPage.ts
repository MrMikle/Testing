import { expect, Locator, Page } from '@playwright/test';

export class ProductsPage {
    constructor(public readonly page: Page) {}

    async open() {
        await this.page.goto('/products');
        await expect(this.page.getByRole('heading', { name: 'Продукты' })).toBeVisible();
    }

    async openCreatePage() {
        await this.page.getByRole('link', { name: 'Создать продукт' }).click();
        await expect(this.page.getByRole('heading', { name: 'Создание продукта' })).toBeVisible();
    }

    cardByName(name: string): Locator {
        return this.page.locator('.card').filter({
            has: this.page.getByRole('heading', { name, exact: true })
        });
    }

    async expectProductVisible(name: string) {
        await expect(this.cardByName(name)).toBeVisible();
    }

    async expectProductHidden(name: string) {
        await expect(this.cardByName(name)).toHaveCount(0);
    }

    async openProduct(name: string) {
        await this.cardByName(name).getByRole('link', { name: 'Открыть' }).click();
    }

    async editProduct(name: string) {
        await this.cardByName(name).getByRole('link', { name: 'Изменить' }).click();
    }

    async deleteProduct(name: string, confirm = true) {
        this.page.once('dialog', async (dialog) => {
            if (confirm) {
                await dialog.accept();
                return;
            }

            await dialog.dismiss();
        });

        await this.cardByName(name).getByRole('button', { name: 'Удалить' }).click();
    }

    async expectProductDeletionRejected(name: string, expectedMessagePart: string | RegExp) {
        const dialogMessages: string[] = [];

        const dialogHandler = async (dialog: import('@playwright/test').Dialog) => {
            dialogMessages.push(dialog.message());
            await dialog.accept();
        };

        this.page.on('dialog', dialogHandler);

        await this.cardByName(name).getByRole('button', { name: 'Удалить' }).click();

        await expect
            .poll(() => dialogMessages.length, {
                timeout: 5_000
            })
            .toBeGreaterThanOrEqual(2);

        this.page.off('dialog', dialogHandler);

        expect(dialogMessages[0]).toContain('Удалить продукт?');

        if (typeof expectedMessagePart === 'string') {
            expect(dialogMessages[1]).toContain(expectedMessagePart);
        } else {
            expect(dialogMessages[1]).toMatch(expectedMessagePart);
        }
    }

    async search(value: string) {
        await this.page.getByLabel('Поиск по названию').fill(value);
    }

    async selectCategory(label: string) {
        await this.page.getByLabel('Категория').selectOption({ label });
    }

    async selectCookingRequirement(label: string) {
        await this.page.getByLabel('Готовность').selectOption({ label });
    }

    async checkFlagFilter(label: string) {
        await this.page.locator('.inline-checks label').filter({ hasText: label }).locator('input[type="checkbox"]').check();
    }

    async selectSort(label: string) {
        await this.page.getByLabel('Сортировка').selectOption({ label });
    }

    async selectDirection(label: string) {
        await this.page.getByLabel('Направление').selectOption({ label });
    }

    async resetFilters() {
        await this.page.getByRole('button', { name: 'Сбросить' }).click();
    }
}