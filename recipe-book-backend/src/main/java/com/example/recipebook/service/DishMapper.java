package com.example.recipebook.service;

import com.example.recipebook.domain.Dish;
import com.example.recipebook.dto.DishResponse;

public interface DishMapper {
    DishResponse toResponse(Dish dish);
}
