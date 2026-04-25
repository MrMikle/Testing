package com.example.recipebook.web;

import com.example.recipebook.domain.enums.DishCategory;
import com.example.recipebook.dto.DishNutritionCalculationRequest;
import com.example.recipebook.dto.DishRequest;
import com.example.recipebook.dto.DishResponse;
import com.example.recipebook.dto.NutritionDto;
import com.example.recipebook.service.DishService;
import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dishes")
public class DishController {
    private final DishService dishService;

    public DishController(DishService dishService) {
        this.dishService = dishService;
    }

    @GetMapping
    public Page<DishResponse> findAll(
            @RequestParam(required = false) DishCategory category,
            @RequestParam(required = false) Boolean vegan,
            @RequestParam(required = false) Boolean glutenFree,
            @RequestParam(required = false) Boolean sugarFree,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), clampSize(size), Sort.by(direction, "name"));
        return dishService.findAll(category, vegan, glutenFree, sugarFree, search, pageable);
    }

    @GetMapping("/{id}")
    public DishResponse findById(@PathVariable Long id) {
        return dishService.findById(id);
    }

    @PostMapping("/calculate-nutrition")
    public NutritionDto calculateNutrition(@Valid @RequestBody DishNutritionCalculationRequest request) {
        return dishService.calculateNutrition(request);
    }

    @PostMapping
    public ResponseEntity<DishResponse> create(@Valid @RequestBody DishRequest request) {
        DishResponse created = dishService.create(request);
        return ResponseEntity.created(URI.create("/api/dishes/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public DishResponse update(@PathVariable Long id, @Valid @RequestBody DishRequest request) {
        return dishService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        dishService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private int clampSize(int size) {
        if (size < 1) {
            return 20;
        }
        return Math.min(size, 100);
    }
}
