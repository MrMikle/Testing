package com.example.recipebook.dto;

import java.math.BigDecimal;

public record NutritionDto(
        BigDecimal calories,
        BigDecimal proteins,
        BigDecimal fats,
        BigDecimal carbohydrates
) {
}
