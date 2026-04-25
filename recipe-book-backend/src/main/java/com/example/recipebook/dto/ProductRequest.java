package com.example.recipebook.dto;

import com.example.recipebook.domain.enums.CookingRequirement;
import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.ProductCategory;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public record ProductRequest(
        @NotBlank @Size(min = 2, max = 255) String name,
        @Size(max = 5) List<@NotBlank String> photoUrls,
        @NotNull @DecimalMin("0.00") BigDecimal calories,
        @NotNull @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal proteins,
        @NotNull @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal fats,
        @NotNull @DecimalMin("0.00") @DecimalMax("100.00") BigDecimal carbohydrates,
        String composition,
        @NotNull ProductCategory category,
        @NotNull CookingRequirement cookingRequirement,
        Set<DietFlag> flags
) {
}
