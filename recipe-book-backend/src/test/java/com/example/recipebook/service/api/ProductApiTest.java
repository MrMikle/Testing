package com.example.recipebook.service.api;

import static java.util.Objects.requireNonNull;
import static org.assertj.core.api.Assertions.assertThat;

import com.example.recipebook.domain.enums.CookingRequirement;
import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.ProductCategory;
import com.example.recipebook.dto.DishResponse;
import com.example.recipebook.dto.ProductRequest;
import com.example.recipebook.dto.ProductResponse;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.http.HttpStatus;
import tools.jackson.databind.JsonNode;

/**
 * API-тесты для проверки работы продуктов через HTTP API.
 *
 * Тесты проверяют создание, валидацию, поиск, фильтрацию, сортировку,
 * редактирование и бизнес-правило запрета удаления используемого продукта.
 */
@DisplayName("Product API tests")
class ProductApiTest extends ApiTestBase {
    /**
     * Проверяет создание валидных продуктов из разных классов эквивалентности:
     * овощной продукт, продукт с нулевым КБЖУ и мясной продукт без флага Vegan.
     */
    @ParameterizedTest(name = "{0}")
    @MethodSource("validProductEquivalenceCases")
    @DisplayName("creates valid products from different equivalence classes")
    void createsValidProductsFromDifferentEquivalenceClasses(String caseName,
                                                             ProductRequest request,
                                                             ProductCategory expectedCategory,
                                                             Set<DietFlag> expectedFlags) {
        ProductResponse response = restTestClient.post()
                .uri("/api/products")
                .body(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ProductResponse.class)
                .returnResult()
                .getResponseBody();

        ProductResponse actual = requireNonNull(response);

        assertThat(caseName).isNotBlank();
        assertThat(actual.id()).isNotNull();
        assertThat(actual.name()).isEqualTo(request.name());
        assertThat(actual.category()).isEqualTo(expectedCategory);
        assertThat(actual.flags()).containsExactlyInAnyOrderElementsOf(expectedFlags);
        assertThat(actual.createdAt()).isNotNull();
    }

    /**
     * Проверяет валидные граничные значения продукта:
     * минимальная длина имени, калорийность 0 и 1, БЖУ на нижней и верхней границе,
     * сумма БЖУ ровно 100, а также 0 и 5 фотографий.
     */
    @ParameterizedTest(name = "{0}")
    @MethodSource("validProductBoundaryCases")
    @DisplayName("accepts valid product boundary values")
    void acceptsValidProductBoundaryValues(String caseName, ProductRequest request) {
        ProductResponse response = restTestClient.post()
                .uri("/api/products")
                .body(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ProductResponse.class)
                .returnResult()
                .getResponseBody();

        ProductResponse actual = requireNonNull(response);

        assertThat(caseName).isNotBlank();
        assertThat(actual.id()).isNotNull();
        assertThat(actual.createdAt()).isNotNull();
    }

    /**
     * Проверяет невалидные граничные значения продукта:
     * пустое имя, имя из одного символа, отрицательную калорийность,
     * БЖУ ниже 0 и выше 100, сумму БЖУ больше 100 и 6 фотографий.
     */
    @ParameterizedTest(name = "{0}")
    @MethodSource("invalidProductBoundaryCases")
    @DisplayName("rejects invalid product boundary values")
    void rejectsInvalidProductBoundaryValues(String caseName, ProductRequest request) {
        JsonNode response = restTestClient.post()
                .uri("/api/products")
                .body(request)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(JsonNode.class)
                .returnResult()
                .getResponseBody();

        JsonNode actual = requireNonNull(response);

        assertThat(caseName).isNotBlank();
        assertThat(actual.required("title").asString()).isNotBlank();
    }

    /**
     * Проверяет отдельное бизнес-правило продукта:
     * продукт категории Meat не может иметь флаг Vegan.
     */
    @Test
    @DisplayName("rejects vegan flag for meat product")
    void rejectsVeganFlagForMeatProduct() {
        restTestClient.post()
                .uri("/api/products")
                .body(TestDataFactory.meatWithVeganFlag())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody(JsonNode.class)
                .value((response) -> {
                    JsonNode actual = requireNonNull(response);

                    assertThat(actual.required("title").asString()).isEqualTo("Business rule violation");
                    assertThat(actual.required("detail").asString()).isEqualTo("Meat product cannot have Vegan flag");
                });
    }
    /**
     * Проверяет поиск, фильтрацию и сортировку продуктов через HTTP API.
     */
    @Test
    @DisplayName("filters, searches and sorts products")
    void filtersSearchesAndSortsProducts() {
        createProduct(TestDataFactory.beet());
        createProduct(TestDataFactory.potato());
        createProduct(TestDataFactory.water());
        createProduct(TestDataFactory.meat());

        JsonNode searchResponse = restTestClient.get()
                .uri("/api/products?search=то&size=10")
                .exchange()
                .expectStatus().isOk()
                .expectBody(JsonNode.class)
                .returnResult()
                .getResponseBody();

        assertThat(productNames(searchResponse)).contains("Картофель");

        JsonNode vegetablesResponse = restTestClient.get()
                .uri("/api/products?category=VEGETABLES&size=10")
                .exchange()
                .expectStatus().isOk()
                .expectBody(JsonNode.class)
                .returnResult()
                .getResponseBody();

        assertThat(productNames(vegetablesResponse))
                .contains("Свёкла", "Картофель")
                .doesNotContain("Мясо");

        JsonNode veganResponse = restTestClient.get()
                .uri("/api/products?vegan=true&size=10")
                .exchange()
                .expectStatus().isOk()
                .expectBody(JsonNode.class)
                .returnResult()
                .getResponseBody();

        assertThat(productNames(veganResponse))
                .contains("Свёкла", "Картофель", "Вода")
                .doesNotContain("Мясо");

        JsonNode cookingRequirementResponse = restTestClient.get()
                .uri("/api/products?cookingRequirement=REQUIRES_COOKING&size=10")
                .exchange()
                .expectStatus().isOk()
                .expectBody(JsonNode.class)
                .returnResult()
                .getResponseBody();

        assertThat(productNames(cookingRequirementResponse))
                .contains("Свёкла", "Картофель", "Мясо")
                .doesNotContain("Вода");

        JsonNode caloriesSortResponse = restTestClient.get()
                .uri("/api/products?sortBy=calories&direction=DESC&size=10")
                .exchange()
                .expectStatus().isOk()
                .expectBody(JsonNode.class)
                .returnResult()
                .getResponseBody();

        JsonNode actualCaloriesSortResponse = requireNonNull(caloriesSortResponse);

        assertThat(actualCaloriesSortResponse.required("content").required(0).required("name").asString())
                .isEqualTo("Мясо");
    }

    /**
     * Проверяет редактирование продукта и последующее чтение карточки по id.
     */
    @Test
    @DisplayName("updates product and reads updated product by id")
    void updatesProductAndReadsUpdatedProductById() {
        ProductResponse created = createProduct(TestDataFactory.potato());

        ProductRequest updateRequest = new ProductRequest(
                "Картофель очищенный",
                created.photoUrls(),
                TestDataFactory.bd("77"),
                TestDataFactory.bd("2"),
                TestDataFactory.bd("0.4"),
                TestDataFactory.bd("16.3"),
                "Картофель очищенный свежий",
                ProductCategory.VEGETABLES,
                CookingRequirement.REQUIRES_COOKING,
                Set.of(DietFlag.VEGAN, DietFlag.GLUTEN_FREE, DietFlag.SUGAR_FREE)
        );

        restTestClient.put()
                .uri("/api/products/{id}", created.id())
                .body(updateRequest)
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductResponse.class)
                .value((product) -> {
                    ProductResponse actual = requireNonNull(product);

                    assertThat(actual.name()).isEqualTo("Картофель очищенный");
                    assertThat(actual.composition()).isEqualTo("Картофель очищенный свежий");
                });

        restTestClient.get()
                .uri("/api/products/{id}", created.id())
                .exchange()
                .expectStatus().isOk()
                .expectBody(ProductResponse.class)
                .value((product) -> {
                    ProductResponse actual = requireNonNull(product);

                    assertThat(actual.name()).isEqualTo("Картофель очищенный");
                    assertThat(actual.composition()).isEqualTo("Картофель очищенный свежий");
                    assertThat(actual.updatedAt()).isNotNull();
                });
    }

    /**
     * Проверяет бизнес-правило удаления продукта:
     * продукт нельзя удалить, если он используется хотя бы в одном блюде.
     */
    @Test
    @DisplayName("does not delete product used in dish")
    void doesNotDeleteProductUsedInDish() {
        ProductResponse beet = createProduct(TestDataFactory.beet());
        ProductResponse potato = createProduct(TestDataFactory.potato());
        ProductResponse water = createProduct(TestDataFactory.water());
        ProductResponse meat = createProduct(TestDataFactory.meat());

        DishResponse borsch = createDish(TestDataFactory.borsch(potato.id(), beet.id(), water.id(), meat.id()));

        restTestClient.delete()
                .uri("/api/products/{id}", potato.id())
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.CONFLICT)
                .expectBody(JsonNode.class)
                .value((response) -> {
                    JsonNode actual = requireNonNull(response);

                    assertThat(actual.required("title").asString()).isEqualTo("Product is used in dishes");
                    assertThat(dishNamesFromConflict(actual)).contains(borsch.name());
                });

        restTestClient.delete()
                .uri("/api/dishes/{id}", borsch.id())
                .exchange()
                .expectStatus().isNoContent();

        restTestClient.delete()
                .uri("/api/products/{id}", potato.id())
                .exchange()
                .expectStatus().isNoContent();
    }

    static Stream<Arguments> validProductEquivalenceCases() {
        return Stream.of(
                Arguments.of(
                        "ordinary vegetable product",
                        TestDataFactory.potato(),
                        ProductCategory.VEGETABLES,
                        Set.of(DietFlag.VEGAN, DietFlag.GLUTEN_FREE, DietFlag.SUGAR_FREE)
                ),
                Arguments.of(
                        "zero-nutrition liquid product",
                        TestDataFactory.water(),
                        ProductCategory.LIQUID,
                        Set.of(DietFlag.VEGAN, DietFlag.GLUTEN_FREE, DietFlag.SUGAR_FREE)
                ),
                Arguments.of(
                        "meat product without vegan flag",
                        TestDataFactory.meat(),
                        ProductCategory.MEAT,
                        Set.of(DietFlag.GLUTEN_FREE, DietFlag.SUGAR_FREE)
                )
        );
    }

    static Stream<Arguments> validProductBoundaryCases() {
        return Stream.of(
                Arguments.of("minimum valid name length", TestDataFactory.productWithName("Аб")),
                Arguments.of("zero calories boundary", TestDataFactory.productWithCalories("0")),
                Arguments.of("positive calories near boundary", TestDataFactory.productWithCalories("0.01")),
                Arguments.of("zero proteins boundary", TestDataFactory.productWithProteins("0")),
                Arguments.of("positive proteins near boundary", TestDataFactory.productWithProteins("0.01")),
                Arguments.of("maximum proteins boundary", TestDataFactory.productWithProteins("100")),
                Arguments.of("zero fats boundary", TestDataFactory.productWithFats("0")),
                Arguments.of("positive fats near boundary", TestDataFactory.productWithFats("0.01")),
                Arguments.of("maximum fats boundary", TestDataFactory.productWithFats("100")),
                Arguments.of("zero carbohydrates boundary", TestDataFactory.productWithCarbohydrates("0")),
                Arguments.of("positive carbohydrates near boundary", TestDataFactory.productWithCarbohydrates("0.01")),
                Arguments.of("maximum carbohydrates boundary", TestDataFactory.productWithCarbohydrates("100")),
                Arguments.of("BJU sum exactly 100 boundary", TestDataFactory.productWithNutrition("60", "30", "10")),
                Arguments.of("zero photos boundary", TestDataFactory.productWithPhotoCount(0)),
                Arguments.of("photos near boundary", TestDataFactory.productWithPhotoCount(1)),
                Arguments.of("maximum photos boundary", TestDataFactory.productWithPhotoCount(5))
        );
    }

    static Stream<Arguments> invalidProductBoundaryCases() {
        return Stream.of(
                Arguments.of("blank product name", TestDataFactory.productWithName("")),
                Arguments.of("one-character product name below minimum", TestDataFactory.productWithName("А")),
                Arguments.of("negative calories below minimum", TestDataFactory.productWithCalories("-0.01")),
                Arguments.of("negative proteins below minimum", TestDataFactory.productWithProteins("-0.01")),
                Arguments.of("proteins above maximum", TestDataFactory.productWithProteins("100.01")),
                Arguments.of("negative fats below minimum", TestDataFactory.productWithFats("-0.01")),
                Arguments.of("fats above maximum", TestDataFactory.productWithFats("100.01")),
                Arguments.of("negative carbohydrates below minimum", TestDataFactory.productWithCarbohydrates("-0.01")),
                Arguments.of("carbohydrates above maximum", TestDataFactory.productWithCarbohydrates("100.1")),
                Arguments.of("BJU sum above 100 boundary", TestDataFactory.productWithNutrition("60", "30", "20.1")),
                Arguments.of("photo count above maximum", TestDataFactory.productWithPhotoCount(6))
        );
    }

    private static List<String> productNames(JsonNode response) {
        JsonNode actual = requireNonNull(response);

        return StreamSupport.stream(actual.required("content").spliterator(), false)
                .map((node) -> node.required("name").asString())
                .toList();
    }

    private static List<String> dishNamesFromConflict(JsonNode response) {
        JsonNode actual = requireNonNull(response);

        return StreamSupport.stream(actual.required("dishNames").spliterator(), false)
                .map(JsonNode::asString)
                .toList();
    }
}