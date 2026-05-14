import { expect, Page } from '@playwright/test';

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