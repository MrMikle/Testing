import { expect, Page } from '@playwright/test';

/**
 * Page Object для общей навигации приложения.
 *
 * Содержит действия, которые не относятся к конкретной сущности:
 * переход на главную страницу, в раздел продуктов и в раздел блюд.
 */

export class AppLayout {
    constructor(public readonly page: Page) {}

    async openHome() {
        await this.page.goto('/');
    }

    async openProducts() {
        await this.page.getByRole('link', { name: 'Продукты' }).click();
        await expect(this.page.getByRole('heading', { name: 'Продукты' })).toBeVisible();
    }

    async openDishes() {
        await this.page.getByRole('link', { name: 'Блюда' }).click();
        await expect(this.page.getByRole('heading', { name: 'Блюда' })).toBeVisible();
    }
}