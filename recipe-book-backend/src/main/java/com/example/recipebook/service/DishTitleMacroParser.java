package com.example.recipebook.service;

import com.example.recipebook.domain.enums.DishCategory;

public interface DishTitleMacroParser {
    ParsedDishTitle parse(String rawName);

    record ParsedDishTitle(String cleanedName, DishCategory macroCategory) {
    }
}
