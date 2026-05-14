import { expect, Locator, Page } from '@playwright/test';

export class DishesPage {
    constructor(public readonly page: Page) {}

    async open() {
        await this.page.goto('/dishes');
        await expect(this.page.getByRole('heading', { name: 'Блюда' })).toBeVisible();
    }

    async openCreatePage() {
        await this.page.getByRole('link', { name: 'Создать блюдо' }).click();
        await expect(this.page.getByRole('heading', { name: 'Создание блюда' })).toBeVisible();
    }

    cardByName(name: string): Locator {
        return this.page.locator('.card').filter({
            has: this.page.getByRole('heading', { name, exact: true })
        });
    }

    async expectDishVisible(name: string) {
        await expect(this.cardByName(name)).toBeVisible();
    }

    async expectDishHidden(name: string) {
        await expect(this.cardByName(name)).toHaveCount(0);
    }

    async openDish(name: string) {
        await this.cardByName(name).getByRole('link', { name: 'Открыть' }).click();
    }

    async editDish(name: string) {
        await this.cardByName(name).getByRole('link', { name: 'Изменить' }).click();
    }

    async deleteDish(name: string, confirm = true) {
        this.page.once('dialog', async (dialog) => {
            if (confirm) {
                await dialog.accept();
                return;
            }

            await dialog.dismiss();
        });

        await this.cardByName(name).getByRole('button', { name: 'Удалить' }).click();
    }

    async search(value: string) {
        await this.page.getByLabel('Поиск по названию').fill(value);
    }

    async selectCategory(label: string) {
        await this.page.getByLabel('Категория').selectOption({ label });
    }

    async checkFlagFilter(label: string) {
        await this.page.locator('.inline-checks label').filter({ hasText: label }).locator('input[type="checkbox"]').check();
    }

    async selectDirection(label: string) {
        await this.page.getByLabel('Направление').selectOption({ label });
    }

    async resetFilters() {
        await this.page.getByRole('button', { name: 'Сбросить' }).click();
    }
}