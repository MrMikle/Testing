package com.example.recipebook.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record DishIngredientRequest(
        @NotNull Long productId,
        @NotNull @DecimalMin(value = "0.00", inclusive = false) BigDecimal quantityGrams
) {
}
