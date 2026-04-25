package com.example.recipebook.service;

import com.example.recipebook.domain.enums.DishCategory;
import com.example.recipebook.dto.DishNutritionCalculationRequest;
import com.example.recipebook.dto.DishRequest;
import com.example.recipebook.dto.DishResponse;
import com.example.recipebook.dto.NutritionDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DishService {
    Page<DishResponse> findAll(DishCategory category,
                               Boolean vegan,
                               Boolean glutenFree,
                               Boolean sugarFree,
                               String search,
                               Pageable pageable);

    DishResponse findById(Long id);

    NutritionDto calculateNutrition(DishNutritionCalculationRequest request);

    DishResponse create(DishRequest request);

    DishResponse update(Long id, DishRequest request);

    void delete(Long id);
}
