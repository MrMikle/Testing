import { expect, test } from '@playwright/test';
import { DishFormData, ProductFormData, dishes, products } from '../fixtures/testData';
import { DishDetailsPage } from '../pages/DishDetailsPage';
import { DishesPage } from '../pages/DishesPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { ProductsPage } from '../pages/ProductsPage';
import { createDishThroughUi, createProductThroughUi } from '../helpers/createEntities';

/**
 * Сквозной системный UI-сценарий для книги рецептов.
 *
 * Проверяет основной пользовательский путь: создание продуктов,
 * создание обычного и веганского борща, просмотр карточек,
 * поиск, фильтрацию, запрет удаления используемого продукта
 * и последующее удаление связанных сущностей.
 */

function withProductName(product: ProductFormData, name: string): ProductFormData {
    return {
        ...product,
        name
    };
}

function withDishName(dish: DishFormData, name: string): DishFormData {
    return {
        ...dish,
        name
    };
}

function replaceIngredientNames(dish: DishFormData, productNames: Record<string, string>): DishFormData {
    return {
        ...dish,
        ingredients: dish.ingredients.map((ingredient) => ({
            ...ingredient,
            productName: productNames[ingredient.productName] ?? ingredient.productName
        }))
    };
}

test.describe('Recipe book UI system scenario', () => {
    /**
     * Проверяет полный пользовательский сценарий работы с продуктами и блюдами.
     */
    test('creates borsch and vegan borsch, checks filters and deletion rules', async ({ page }) => {
        const suffix = Date.now().toString();

        const potato = withProductName(products.potato, `Картофель scenario ${suffix}`);
        const beet = withProductName(products.beet, `Свёкла scenario ${suffix}`);
        const water = withProductName(products.water, `Вода scenario ${suffix}`);
        const meat = withProductName(products.meat, `Мясо scenario ${suffix}`);

        await createProductThroughUi(page, beet);
        await createProductThroughUi(page, potato);
        await createProductThroughUi(page, water);
        await createProductThroughUi(page, meat);

        const productNames = {
            Картофель: potato.name,
            Свёкла: beet.name,
            Вода: water.name,
            Мясо: meat.name
        };

        const borsch = withDishName(
            replaceIngredientNames(dishes.borsch, productNames),
            `!суп Борщ scenario ${suffix}`
        );

        const veganBorsch = withDishName(
            replaceIngredientNames(dishes.veganBorsch, productNames),
            `!суп Борщ веганский scenario ${suffix}`
        );

        await createDishThroughUi(page, borsch);
        await createDishThroughUi(page, veganBorsch);

        const productsPage = new ProductsPage(page);
        await productsPage.open();
        await productsPage.search(suffix);
        await productsPage.openProduct(potato.name);

        const productDetailsPage = new ProductDetailsPage(page);
        await productDetailsPage.expectOpened();
        await productDetailsPage.expectName(potato.name);
        await productDetailsPage.expectPhotoVisible();
        await productDetailsPage.expectText('Овощи');
        await productDetailsPage.expectText('Требует приготовления');

        const dishesPage = new DishesPage(page);
        await dishesPage.open();
        await dishesPage.search(suffix);
        await dishesPage.openDish(`Борщ scenario ${suffix}`);

        const dishDetailsPage = new DishDetailsPage(page);
        await dishDetailsPage.expectOpened();
        await dishDetailsPage.expectName(`Борщ scenario ${suffix}`);
        await dishDetailsPage.expectPhotoVisible();
        await dishDetailsPage.expectIngredient(potato.name, /100/);
        await dishDetailsPage.expectIngredient(beet.name, /150/);
        await dishDetailsPage.expectIngredient(water.name, /500/);
        await dishDetailsPage.expectIngredient(meat.name, /150/);

        await dishesPage.open();
        await dishesPage.search(suffix);
        await dishesPage.expectDishVisible(`Борщ scenario ${suffix}`);
        await dishesPage.expectDishVisible(`Борщ веганский scenario ${suffix}`);

        await dishesPage.checkFlagFilter('Веган');
        await dishesPage.expectDishHidden(`Борщ scenario ${suffix}`);
        await dishesPage.expectDishVisible(`Борщ веганский scenario ${suffix}`);

        await productsPage.open();
        await productsPage.search(potato.name);

        await productsPage.expectProductDeletionRejected(potato.name, 'Борщ');

        await dishesPage.open();
        await dishesPage.search(suffix);
        await dishesPage.deleteDish(`Борщ scenario ${suffix}`);
        await dishesPage.expectDishHidden(`Борщ scenario ${suffix}`);

        await dishesPage.deleteDish(`Борщ веганский scenario ${suffix}`);
        await dishesPage.expectDishHidden(`Борщ веганский scenario ${suffix}`);

        await productsPage.open();
        await productsPage.search(suffix);

        await productsPage.deleteProduct(potato.name);
        await productsPage.expectProductHidden(potato.name);

        await productsPage.deleteProduct(beet.name);
        await productsPage.expectProductHidden(beet.name);

        await productsPage.deleteProduct(water.name);
        await productsPage.expectProductHidden(water.name);

        await productsPage.deleteProduct(meat.name);
        await productsPage.expectProductHidden(meat.name);
    });
});