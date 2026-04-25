package com.example.recipebook.web;

import com.example.recipebook.domain.enums.CookingRequirement;
import com.example.recipebook.domain.enums.ProductCategory;
import com.example.recipebook.dto.ProductRequest;
import com.example.recipebook.dto.ProductResponse;
import com.example.recipebook.exception.BusinessRuleException;
import com.example.recipebook.service.ProductService;
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
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public Page<ProductResponse> findAll(
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(required = false) CookingRequirement cookingRequirement,
            @RequestParam(required = false) Boolean vegan,
            @RequestParam(required = false) Boolean glutenFree,
            @RequestParam(required = false) Boolean sugarFree,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), clampSize(size), Sort.by(direction, toProductSortProperty(sortBy)));
        return productService.findAll(category, cookingRequirement, vegan, glutenFree, sugarFree, search, pageable);
    }

    @GetMapping("/{id}")
    public ProductResponse findById(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PostMapping
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse created = productService.create(request);
        return ResponseEntity.created(URI.create("/api/products/" + created.id())).body(created);
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return productService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private String toProductSortProperty(String sortBy) {
        return switch (sortBy == null ? "name" : sortBy.toLowerCase()) {
            case "name" -> "name";
            case "calories" -> "nutrition.calories";
            case "proteins" -> "nutrition.proteins";
            case "fats" -> "nutrition.fats";
            case "carbohydrates" -> "nutrition.carbohydrates";
            default -> throw new BusinessRuleException("Unsupported product sort field: " + sortBy);
        };
    }

    private int clampSize(int size) {
        if (size < 1) {
            return 20;
        }
        return Math.min(size, 100);
    }
}
