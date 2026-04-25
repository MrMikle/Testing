package com.example.recipebook.dto;

import java.math.BigDecimal;

public record DishIngredientResponse(
        Long productId,
        String productName,
        BigDecimal quantityGrams
) {
}
