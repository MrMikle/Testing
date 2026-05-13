package com.example.recipebook.service.api;

import static java.util.Objects.requireNonNull;
import static org.assertj.core.api.Assertions.assertThat;

import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.DishCategory;
import com.example.recipebook.dto.DishRequest;
import com.example.recipebook.dto.DishResponse;
import com.example.recipebook.dto.NutritionDto;
import com.example.recipebook.dto.ProductResponse;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import tools.jackson.databind.JsonNode;

/**
 * API-тесты для проверки работы блюд через HTTP API.
 *
 * Тесты проверяют автоматический расчёт КБЖУ, создание, валидацию,
 * макросы категорий, ручную корректировку КБЖУ и правила дополнительных флагов.
 */
@DisplayName("Dish API tests")
class DishApiTest extends ApiTestBase {
    /**
     * Проверяет endpoint расчёта КБЖУ через API.
     * Запрос проходит через controller, service, repository и тестовую БД.
     */
    @Test
    @DisplayName("calculates borsch nutrition through API")
    void calculatesBorschNutritionThroughApi() {
        ProductResponse beet = createProduct(TestDataFactory.beet());
        ProductResponse potato = createProduct(TestDataFactory.potato());
        ProductResponse water = createProduct(TestDataFactory.water());
        ProductResponse meat = createProduct(TestDataFactory.meat());

        restTestClient.post()
                .uri("/api/dishes/calculate-nutrition")
                .body(TestDataFactory.calculationRequest(List.of(
                        TestDataFactory.ingredient(potato.id(), "100"),
                        TestDataFactory.ingredient(beet.id(), "150"),
                        TestDataFactory.ingredient(water.id(), "500"),
                        TestDataFactory.ingredient(meat.id(), "150")
                )))
                .exchange()
                .expectStatus().isOk()
                .expectBody(NutritionDto.class)
                .value((nutrition) -> {
                    NutritionDto actual = requireNonNull(nutrition);

                    assertThat(actual.calories()).isEqualByComparingTo("422.30");
                    assertThat(actual.proteins()).isEqualByComparingTo("32.75");
                    assertThat(actual.fats()).isEqualByComparingTo("19.30");
                    assertThat(actual.carbohydrates()).isEqualByComparingTo("30.70");
                });
    }

    /**
     * Проверяет валидные граничные значения блюда:
     * минимальную длину имени, 0 и 5 фото, размер порции около нижней границы,
     * количество ингредиента около нижней границы и ручное КБЖУ с нулевыми значениями.
     */
    @ParameterizedTest(name = "{0}")
    @MethodSource("validDishBoundaryCases")
    @DisplayName("accepts valid dish boundary values")
    void acceptsValidDishBoundaryValues(String caseName, Function<Long, DishRequest> requestFactory) {
        ProductResponse product = createProduct(TestDataFactory.water());

        DishResponse response = restTestClient.post()
                .uri("/api/dishes")
                .body(requestFactory.apply(product.id()))
                .exchange()
                .expectStatus().isCreated()
                .expectBody(DishResponse.class)
                .returnResult()
                .getResponseBody();

        DishResponse actual = requireNonNull(response);

        assertThat(caseName).isNotBlank();
        assertThat(actual.id()).isNotNull();
        assertThat(actual.createdAt()).isNotNull();
    }

    /**
     * Проверяет невалидные граничные значения блюда:
     * пустое имя, имя из одного символа, 6 фото, пустой состав,
     * нулевой размер порции, нулевое количество ингредиента и отрицательное ручное КБЖУ.
     */
    @ParameterizedTest(name = "{0}")
    @MethodSource("invalidDishBoundaryCases")
    @DisplayName("rejects invalid dish boundary values")
    void rejectsInvalidDishBoundaryValues(String caseName, Function<Long, DishRequest> requestFactory) {
        ProductResponse potato = createProduct(TestDataFactory.potato());

        restTestClient.post()
                .uri("/api/dishes")
                .body(requestFactory.apply(potato.id()))
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(JsonNode.class)
                .value((response) -> {
                    JsonNode actual = requireNonNull(response);

                    assertThat(caseName).isNotBlank();
                    assertThat(actual.required("title").asString()).isNotBlank();
                });
    }

    /**
     * Проверяет макрос категории: если категория в поле формы не задана,
     * категория берётся из первого макроса в названии, а макрос удаляется из названия.
     */
    @Test
    @DisplayName("creates dish with category from macro when category is not provided")
    void createsDishWithCategoryFromMacroWhenCategoryIsNotProvided() {
        ProductResponse potato = createProduct(TestDataFactory.potato());
        ProductResponse beet = createProduct(TestDataFactory.beet());
        ProductResponse water = createProduct(TestDataFactory.water());

        restTestClient.post()
                .uri("/api/dishes")
                .body(TestDataFactory.veganBorsch(potato.id(), beet.id(), water.id()))
                .exchange()
                .expectStatus().isCreated()
                .expectBody(DishResponse.class)
                .value((dish) -> {
                    DishResponse actual = requireNonNull(dish);

                    assertThat(actual.name()).isEqualTo("Борщ веганский");
                    assertThat(actual.category()).isEqualTo(DishCategory.SOUP);
                    assertThat(actual.flags()).containsExactlyInAnyOrder(
                            DietFlag.VEGAN,
                            DietFlag.GLUTEN_FREE,
                            DietFlag.SUGAR_FREE
                    );
                });
    }

    /**
     * Проверяет приоритет категории из поля формы над категорией из макроса.
     */
    @Test
    @DisplayName("uses form category instead of macro category")
    void usesFormCategoryInsteadOfMacroCategory() {
        ProductResponse beet = createProduct(TestDataFactory.beet());
        ProductResponse potato = createProduct(TestDataFactory.potato());
        ProductResponse water = createProduct(TestDataFactory.water());
        ProductResponse meat = createProduct(TestDataFactory.meat());

        restTestClient.post()
                .uri("/api/dishes")
                .body(TestDataFactory.borsch(potato.id(), beet.id(), water.id(), meat.id()))
                .exchange()
                .expectStatus().isCreated()
                .expectBody(DishResponse.class)
                .value((dish) -> {
                    DishResponse actual = requireNonNull(dish);

                    assertThat(actual.name()).isEqualTo("Борщ");
                    assertThat(actual.category()).isEqualTo(DishCategory.FIRST_COURSE);
                });
    }

    /**
     * Проверяет ручную корректировку КБЖУ на порцию.
     * Если пользователь передал calories/proteins/fats/carbohydrates,
     * backend должен сохранить эти значения вместо автоматически рассчитанных.
     */
    @Test
    @DisplayName("creates dish with manually corrected nutrition per portion")
    void createsDishWithManuallyCorrectedNutritionPerPortion() {
        ProductResponse potato = createProduct(TestDataFactory.potato());

        restTestClient.post()
                .uri("/api/dishes")
                .body(TestDataFactory.dishWithManualNutrition(
                        potato.id(),
                        "80",
                        "10",
                        "5",
                        "20"
                ))
                .exchange()
                .expectStatus().isCreated()
                .expectBody(DishResponse.class)
                .value((dish) -> {
                    DishResponse actual = requireNonNull(dish);

                    assertThat(actual.nutrition().calories()).isEqualByComparingTo("80.00");
                    assertThat(actual.nutrition().proteins()).isEqualByComparingTo("10.00");
                    assertThat(actual.nutrition().fats()).isEqualByComparingTo("5.00");
                    assertThat(actual.nutrition().carbohydrates()).isEqualByComparingTo("20.00");
                });
    }

    /**
     * Проверяет невалидный класс эквивалентности:
     * флаг Vegan нельзя установить блюду, если хотя бы один продукт в составе не Vegan.
     */
    @Test
    @DisplayName("rejects vegan flag when dish contains non-vegan product")
    void rejectsVeganFlagWhenDishContainsNonVeganProduct() {
        ProductResponse meat = createProduct(TestDataFactory.meat());

        restTestClient.post()
                .uri("/api/dishes")
                .body(TestDataFactory.veganDishWithMeat(meat.id()))
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(JsonNode.class)
                .value((response) -> {
                    JsonNode actual = requireNonNull(response);

                    assertThat(actual.required("title").asString()).isEqualTo("Invalid dish flags");
                });
    }

    /**
     * Проверяет пересчёт доступных флагов при редактировании состава блюда.
     * Если в веганское блюдо добавить мясо и не передать flags, старый Vegan должен сняться.
     */
    @Test
    @DisplayName("removes unavailable flags after dish composition update")
    void removesUnavailableFlagsAfterDishCompositionUpdate() {
        ProductResponse potato = createProduct(TestDataFactory.potato());
        ProductResponse beet = createProduct(TestDataFactory.beet());
        ProductResponse water = createProduct(TestDataFactory.water());
        ProductResponse meat = createProduct(TestDataFactory.meat());

        DishResponse veganBorsch = createDish(TestDataFactory.veganBorsch(potato.id(), beet.id(), water.id()));

        DishRequest updateRequest = new DishRequest(
                "Борщ веганский теперь с мясом",
                veganBorsch.photoUrls(),
                null,
                null,
                null,
                null,
                List.of(
                        TestDataFactory.ingredient(potato.id(), "150"),
                        TestDataFactory.ingredient(beet.id(), "150"),
                        TestDataFactory.ingredient(water.id(), "500"),
                        TestDataFactory.ingredient(meat.id(), "100")
                ),
                TestDataFactory.bd("350"),
                DishCategory.SOUP,
                null
        );

        restTestClient.put()
                .uri("/api/dishes/{id}", veganBorsch.id())
                .body(updateRequest)
                .exchange()
                .expectStatus().isOk()
                .expectBody(DishResponse.class)
                .value((dish) -> {
                    DishResponse actual = requireNonNull(dish);

                    assertThat(actual.flags()).doesNotContain(DietFlag.VEGAN);
                    assertThat(actual.flags()).contains(DietFlag.GLUTEN_FREE, DietFlag.SUGAR_FREE);
                });
    }

    static Stream<Arguments> validDishBoundaryCases() {
        return Stream.of(
                Arguments.of(
                        "minimum valid dish name length",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithName(productId, "Аб")
                ),
                Arguments.of(
                        "zero dish photos boundary",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithPhotoCount(productId, 0)
                ),
                Arguments.of(
                        "maximum dish photos boundary",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithPhotoCount(productId, 5)
                ),
                Arguments.of(
                        "positive serving size near lower boundary",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithServingSize(productId, "0.1")
                ),
                Arguments.of(
                        "positive ingredient quantity near lower boundary",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithIngredientQuantity(productId, "0.1")
                ),
                Arguments.of(
                        "zero manual nutrition values",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithManualNutrition(
                                productId,
                                "0",
                                "0",
                                "0",
                                "0"
                        )
                )
        );
    }

    static Stream<Arguments> invalidDishBoundaryCases() {
        return Stream.of(
                Arguments.of(
                        "blank dish name",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithName(productId, "")
                ),
                Arguments.of(
                        "one-character dish name below minimum",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithName(productId, "А")
                ),
                Arguments.of(
                        "dish photo count above maximum",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithPhotoCount(productId, 6)
                ),
                Arguments.of(
                        "ingredient count below minimum",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithoutIngredients()
                ),
                Arguments.of(
                        "zero serving size boundary",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithServingSize(productId, "0")
                ),
                Arguments.of(
                        "negative serving size near boundary",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithServingSize(productId, "-0.1")
                ),
                Arguments.of(
                        "zero ingredient quantity boundary",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithIngredientQuantity(productId, "0")
                ),
                Arguments.of(
                        "negative manual calories",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithManualNutrition(
                                productId,
                                "-1",
                                "0",
                                "0",
                                "0"
                        )
                ),
                Arguments.of(
                        "negative manual proteins",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithManualNutrition(
                                productId,
                                "0",
                                "-1",
                                "0",
                                "0"
                        )
                ),
                Arguments.of(
                        "negative manual fats",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithManualNutrition(
                                productId,
                                "0",
                                "0",
                                "-1",
                                "0"
                        )
                ),
                Arguments.of(
                        "negative manual carbohydrates",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithManualNutrition(
                                productId,
                                "0",
                                "0",
                                "0",
                                "-1"
                        )
                ),
                Arguments.of(
                        "manual BJU sum above 100 per 100 grams",
                        (Function<Long, DishRequest>) productId -> TestDataFactory.dishWithManualNutrition(
                                productId,
                                "100",
                                "60",
                                "30",
                                "20.1"
                        )
                )
        );
    }
}