# Recipe Book Backend

Java 17 + Spring Boot 4.0.6 + PostgreSQL backend for a recipe book lab.

## Run in IntelliJ IDEA

1. Open this folder as a Maven project.
2. Make sure Project SDK is Java 17.
3. Run Docker Desktop or a local Docker-compatible runtime.
4. Run `RecipeBookApplication`.
5. Spring Boot Docker Compose support starts PostgreSQL from `docker-compose.yml`.

Manual DB run:

```bash
docker compose up -d
mvn spring-boot:run
```

Base URL: `http://localhost:8080/api`

## API overview

Products:
- `POST /api/products`
- `GET /api/products`
- `GET /api/products/{id}`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

Dishes:
- `POST /api/dishes/calculate-nutrition`
- `POST /api/dishes`
- `GET /api/dishes`
- `GET /api/dishes/{id}`
- `PUT /api/dishes/{id}`
- `DELETE /api/dishes/{id}`

Photo fields are stored as URL/path strings. A file upload module can be added later without changing the core domain model.
