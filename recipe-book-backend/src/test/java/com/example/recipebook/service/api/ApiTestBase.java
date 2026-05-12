package com.example.recipebook.service.api;

import static java.util.Objects.requireNonNull;

import com.example.recipebook.dto.DishRequest;
import com.example.recipebook.dto.DishResponse;
import com.example.recipebook.dto.ProductRequest;
import com.example.recipebook.dto.ProductResponse;
import com.example.recipebook.repository.DishRepository;
import com.example.recipebook.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.client.RestTestClient;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
abstract class ApiTestBase {
    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @LocalServerPort
    private int port;

    protected RestTestClient restTestClient;

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private ProductRepository productRepository;

    @DynamicPropertySource
    static void configureTestDatabase(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.datasource.driver-class-name", POSTGRES::getDriverClassName);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("spring.docker.compose.enabled", () -> "false");
    }

    @BeforeEach
    void setUpApiTest() {
        dishRepository.deleteAll();
        dishRepository.flush();
        productRepository.deleteAll();
        productRepository.flush();

        restTestClient = RestTestClient.bindToServer()
                .baseUrl("http://localhost:" + port)
                .build();
    }

    protected ProductResponse createProduct(ProductRequest request) {
        ProductResponse response = restTestClient.post()
                .uri("/api/products")
                .body(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(ProductResponse.class)
                .returnResult()
                .getResponseBody();

        return requireNonNull(response);
    }

    protected DishResponse createDish(DishRequest request) {
        DishResponse response = restTestClient.post()
                .uri("/api/dishes")
                .body(request)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(DishResponse.class)
                .returnResult()
                .getResponseBody();

        return requireNonNull(response);
    }
}