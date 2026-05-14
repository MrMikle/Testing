import { Page } from '@playwright/test';
import { DishFormData, ProductFormData } from '../fixtures/testData';
import { DishDetailsPage } from '../pages/DishDetailsPage';
import { DishFormPage } from '../pages/DishFormPage';
import { DishesPage } from '../pages/DishesPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { ProductFormPage } from '../pages/ProductFormPage';
import { ProductsPage } from '../pages/ProductsPage';

export function expectedDishName(name: string) {
    return name.replace(/^!\S+\s+/, '');
}

export async function createProductThroughUi(page: Page, data: ProductFormData) {
    const productsPage = new ProductsPage(page);

    await productsPage.open();
    await productsPage.openCreatePage();

    const form = new ProductFormPage(page);
    await form.fillProduct(data);
    await form.save();

    const detailsPage = new ProductDetailsPage(page);
    await detailsPage.expectOpened();
    await detailsPage.expectName(data.name);
}

export async function createDishThroughUi(page: Page, data: DishFormData, calculateNutrition = false) {
    const dishesPage = new DishesPage(page);

    await dishesPage.open();
    await dishesPage.openCreatePage();

    const form = new DishFormPage(page);
    await form.fillDish(data);

    if (calculateNutrition) {
        await form.calculateNutrition();
        await form.expectNutritionFilled();
    }

    await form.save();

    const detailsPage = new DishDetailsPage(page);
    await detailsPage.expectOpened();
    await detailsPage.expectName(expectedDishName(data.name));
}