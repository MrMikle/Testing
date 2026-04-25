package com.example.recipebook.service.impl;

import com.example.recipebook.domain.Dish;
import com.example.recipebook.dto.DishIngredientResponse;
import com.example.recipebook.dto.DishResponse;
import com.example.recipebook.service.DishMapper;
import com.example.recipebook.service.ProductMapper;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class DishMapperImpl implements DishMapper {
    private final ProductMapper productMapper;

    public DishMapperImpl(ProductMapper productMapper) {
        this.productMapper = productMapper;
    }

    @Override
    public DishResponse toResponse(Dish dish) {
        List<DishIngredientResponse> ingredients = dish.getIngredients().stream()
                .map(ingredient -> new DishIngredientResponse(
                        ingredient.getProduct().getId(),
                        ingredient.getProduct().getName(),
                        ingredient.getQuantityGrams()
                ))
                .toList();

        return new DishResponse(
                dish.getId(),
                dish.getName(),
                List.copyOf(dish.getPhotoUrls()),
                productMapper.toNutritionDto(dish.getNutrition()),
                ingredients,
                dish.getServingSizeGrams(),
                dish.getCategory(),
                Set.copyOf(dish.getFlags()),
                dish.getCreatedAt(),
                dish.getUpdatedAt()
        );
    }
}
