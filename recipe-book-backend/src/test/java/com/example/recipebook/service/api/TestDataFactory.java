package com.example.recipebook.service.api;

import com.example.recipebook.domain.enums.CookingRequirement;
import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.DishCategory;
import com.example.recipebook.domain.enums.ProductCategory;
import com.example.recipebook.dto.DishIngredientRequest;
import com.example.recipebook.dto.DishNutritionCalculationRequest;
import com.example.recipebook.dto.DishRequest;
import com.example.recipebook.dto.ProductRequest;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.IntStream;

final class TestDataFactory {
    private TestDataFactory() {
    }

    static ProductRequest potato() {
        return product(
                "Картофель",
                List.of("http://localhost/test-potato.png"),
                "77",
                "2",
                "0.4",
                "16.3",
                "Картофель свежий",
                ProductCategory.VEGETABLES,
                CookingRequirement.REQUIRES_COOKING,
                Set.of(DietFlag.VEGAN, DietFlag.GLUTEN_FREE, DietFlag.SUGAR_FREE)
        );
    }

    static ProductRequest beet() {
        return product(
                "Свёкла",
                List.of("http://localhost/test-beet.png"),
                "43",
                "1.6",
                "0.2",
                "9.6",
                "Свёкла свежая",
                ProductCategory.VEGETABLES,
                CookingRequirement.REQUIRES_COOKING,
                Set.of(DietFlag.VEGAN, DietFlag.GLUTEN_FREE, DietFlag.SUGAR_FREE)
        );
    }

    static ProductRequest water() {
        return product(
                "Вода",
                List.of("http://localhost/test-water.png"),
                "0",
                "0",
                "0",
                "0",
                "Питьевая вода",
                ProductCategory.LIQUID,
                CookingRequirement.READY_TO_EAT,
                Set.of(DietFlag.VEGAN, DietFlag.GLUTEN_FREE, DietFlag.SUGAR_FREE)
        );
    }

    static ProductRequest meat() {
        return product(
                "Мясо",
                List.of("http://localhost/test-meat-1.png", "http://localhost/test-meat-2.png"),
                "187.2",
                "18.9",
                "12.4",
                "0",
                "Мясо говяжье",
                ProductCategory.MEAT,
                CookingRequirement.REQUIRES_COOKING,
                Set.of(DietFlag.GLUTEN_FREE, DietFlag.SUGAR_FREE)
        );
    }

    static ProductRequest productWithName(String name) {
        return product(
                name,
                List.of(),
                "10",
                "1",
                "1",
                "1",
                null,
                ProductCategory.VEGETABLES,
                CookingRequirement.READY_TO_EAT,
                Set.of()
        );
    }

    static ProductRequest productWithCalories(String calories) {
        return product(
                "Продукт с калориями",
                List.of(),
                calories,
                "1",
                "1",
                "1",
                null,
                ProductCategory.VEGETABLES,
                CookingRequirement.READY_TO_EAT,
                Set.of()
        );
    }

    static ProductRequest productWithProteins(String proteins) {
        return product(
                "Продукт с белками",
                List.of(),
                "10",
                proteins,
                "0",
                "0",
                null,
                ProductCategory.VEGETABLES,
                CookingRequirement.READY_TO_EAT,
                Set.of()
        );
    }

    static ProductRequest productWithFats(String fats) {
        return product(
                "Продукт с жирами",
                List.of(),
                "10",
                "0",
                fats,
                "0",
                null,
                ProductCategory.VEGETABLES,
                CookingRequirement.READY_TO_EAT,
                Set.of()
        );
    }

    static ProductRequest productWithCarbohydrates(String carbohydrates) {
        return product(
                "Продукт с углеводами",
                List.of(),
                "10",
                "0",
                "0",
                carbohydrates,
                null,
                ProductCategory.VEGETABLES,
                CookingRequirement.READY_TO_EAT,
                Set.of()
        );
    }

    static ProductRequest productWithNutrition(String proteins, String fats, String carbohydrates) {
        return product(
                "Продукт с БЖУ",
                List.of(),
                "10",
                proteins,
                fats,
                carbohydrates,
                null,
                ProductCategory.VEGETABLES,
                CookingRequirement.READY_TO_EAT,
                Set.of()
        );
    }

    static ProductRequest productWithPhotoCount(int photoCount) {
        return product(
                "Продукт с фото",
                photos(photoCount),
                "10",
                "1",
                "1",
                "1",
                null,
                ProductCategory.VEGETABLES,
                CookingRequirement.READY_TO_EAT,
                Set.of()
        );
    }

    static ProductRequest meatWithVeganFlag() {
        return product(
                "Мясо веганское",
                List.of(),
                "187.2",
                "18.9",
                "12.4",
                "0",
                null,
                ProductCategory.MEAT,
                CookingRequirement.REQUIRES_COOKING,
                Set.of(DietFlag.VEGAN, DietFlag.GLUTEN_FREE, DietFlag.SUGAR_FREE)
        );
    }

    static DishIngredientRequest ingredient(Long productId, String quantityGrams) {
        return new DishIngredientRequest(productId, bd(quantityGrams));
    }

    static DishNutritionCalculationRequest calculationRequest(List<DishIngredientRequest> ingredients) {
        return new DishNutritionCalculationRequest(ingredients);
    }

    static DishRequest borsch(Long potatoId, Long beetId, Long waterId, Long meatId) {
        return dish(
                "!суп Борщ",
                List.of("http://localhost/test-borsch.png"),
                null,
                null,
                null,
                null,
                List.of(
                        ingredient(potatoId, "100"),
                        ingredient(beetId, "150"),
                        ingredient(waterId, "500"),
                        ingredient(meatId, "150")
                ),
                "350",
                DishCategory.FIRST_COURSE,
                Set.of(DietFlag.GLUTEN_FREE, DietFlag.SUGAR_FREE)
        );
    }

    static DishRequest veganBorsch(Long potatoId, Long beetId, Long waterId) {
        return dish(
                "!суп Борщ веганский",
                List.of("http://localhost/test-vegan-borsch.png"),
                null,
                null,
                null,
                null,
                List.of(
                        ingredient(potatoId, "150"),
                        ingredient(beetId, "150"),
                        ingredient(waterId, "500")
                ),
                "350",
                null,
                Set.of(DietFlag.VEGAN, DietFlag.GLUTEN_FREE, DietFlag.SUGAR_FREE)
        );
    }

    static DishRequest dishWithName(Long productId, String name) {
        return dish(
                name,
                List.of(),
                null,
                null,
                null,
                null,
                List.of(ingredient(productId, "100")),
                "100",
                DishCategory.SNACK,
                Set.of()
        );
    }

    static DishRequest dishWithPhotoCount(Long productId, int photoCount) {
        return dish(
                "Блюдо с фото",
                photos(photoCount),
                null,
                null,
                null,
                null,
                List.of(ingredient(productId, "100")),
                "100",
                DishCategory.SNACK,
                Set.of()
        );
    }

    static DishRequest dishWithoutIngredients() {
        return dish(
                "Блюдо без состава",
                List.of(),
                null,
                null,
                null,
                null,
                List.of(),
                "100",
                DishCategory.SNACK,
                Set.of()
        );
    }

    static DishRequest dishWithServingSize(Long productId, String servingSizeGrams) {
        return dish(
                "Блюдо с порцией",
                List.of(),
                null,
                null,
                null,
                null,
                List.of(ingredient(productId, "100")),
                servingSizeGrams,
                DishCategory.SNACK,
                Set.of()
        );
    }

    static DishRequest dishWithIngredientQuantity(Long productId, String quantityGrams) {
        return dish(
                "Блюдо с количеством",
                List.of(),
                null,
                null,
                null,
                null,
                List.of(ingredient(productId, quantityGrams)),
                "100",
                DishCategory.SNACK,
                Set.of()
        );
    }

    static DishRequest dishWithManualNutrition(Long productId,
                                               String calories,
                                               String proteins,
                                               String fats,
                                               String carbohydrates) {
        return dish(
                "Блюдо с ручным КБЖУ",
                List.of(),
                calories,
                proteins,
                fats,
                carbohydrates,
                List.of(ingredient(productId, "100")),
                "100",
                DishCategory.SNACK,
                Set.of()
        );
    }

    static DishRequest veganDishWithMeat(Long meatId) {
        return dish(
                "Блюдо с мясом",
                List.of(),
                null,
                null,
                null,
                null,
                List.of(ingredient(meatId, "100")),
                "100",
                DishCategory.SECOND_COURSE,
                Set.of(DietFlag.VEGAN)
        );
    }

    static List<String> photos(int count) {
        return IntStream.rangeClosed(1, count)
                .mapToObj(index -> "http://localhost/photo-" + index + ".png")
                .toList();
    }

    static BigDecimal bd(String value) {
        return new BigDecimal(value);
    }

    private static ProductRequest product(String name,
                                          List<String> photoUrls,
                                          String calories,
                                          String proteins,
                                          String fats,
                                          String carbohydrates,
                                          String composition,
                                          ProductCategory category,
                                          CookingRequirement cookingRequirement,
                                          Set<DietFlag> flags) {
        return new ProductRequest(
                name,
                photoUrls,
                bd(calories),
                bd(proteins),
                bd(fats),
                bd(carbohydrates),
                composition,
                category,
                cookingRequirement,
                flags
        );
    }

    private static DishRequest dish(String name,
                                    List<String> photoUrls,
                                    String calories,
                                    String proteins,
                                    String fats,
                                    String carbohydrates,
                                    List<DishIngredientRequest> ingredients,
                                    String servingSizeGrams,
                                    DishCategory category,
                                    Set<DietFlag> flags) {
        return new DishRequest(
                name,
                photoUrls,
                calories == null ? null : bd(calories),
                proteins == null ? null : bd(proteins),
                fats == null ? null : bd(fats),
                carbohydrates == null ? null : bd(carbohydrates),
                ingredients,
                bd(servingSizeGrams),
                category,
                flags
        );
    }
}