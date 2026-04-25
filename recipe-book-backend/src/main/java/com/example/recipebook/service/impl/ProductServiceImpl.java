package com.example.recipebook.service.impl;

import com.example.recipebook.domain.Dish;
import com.example.recipebook.domain.Nutrition;
import com.example.recipebook.domain.Product;
import com.example.recipebook.domain.enums.CookingRequirement;
import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.ProductCategory;
import com.example.recipebook.dto.ProductRequest;
import com.example.recipebook.dto.ProductResponse;
import com.example.recipebook.exception.BusinessRuleException;
import com.example.recipebook.exception.ProductInUseException;
import com.example.recipebook.exception.ResourceNotFoundException;
import com.example.recipebook.repository.DishRepository;
import com.example.recipebook.repository.ProductRepository;
import com.example.recipebook.repository.ProductSpecifications;
import com.example.recipebook.service.ProductMapper;
import com.example.recipebook.service.ProductService;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final ProductRepository productRepository;
    private final DishRepository dishRepository;
    private final ProductMapper productMapper;

    public ProductServiceImpl(ProductRepository productRepository,
                              DishRepository dishRepository,
                              ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.dishRepository = dishRepository;
        this.productMapper = productMapper;
    }

    @Override
    public Page<ProductResponse> findAll(ProductCategory category,
                                         CookingRequirement cookingRequirement,
                                         Boolean vegan,
                                         Boolean glutenFree,
                                         Boolean sugarFree,
                                         String search,
                                         Pageable pageable) {
        Specification<Product> specification = (root, query, cb) -> cb.conjunction();
        specification = specification.and(ProductSpecifications.category(category));
        specification = specification.and(ProductSpecifications.cookingRequirement(cookingRequirement));
        specification = specification.and(ProductSpecifications.nameContains(search));
        if (Boolean.TRUE.equals(vegan)) {
            specification = specification.and(ProductSpecifications.hasFlag(DietFlag.VEGAN));
        }
        if (Boolean.TRUE.equals(glutenFree)) {
            specification = specification.and(ProductSpecifications.hasFlag(DietFlag.GLUTEN_FREE));
        }
        if (Boolean.TRUE.equals(sugarFree)) {
            specification = specification.and(ProductSpecifications.hasFlag(DietFlag.SUGAR_FREE));
        }
        return productRepository.findAll(specification, pageable).map(productMapper::toResponse);
    }

    @Override
    public ProductResponse findById(Long id) {
        return productMapper.toResponse(getProductOrThrow(id));
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        validateProductNutrition(request.proteins(), request.fats(), request.carbohydrates());
        Set<DietFlag> flags = validateAndNormalizeProductFlags(request.category(), request.flags());

        Product product = new Product(
                request.name().trim(),
                request.photoUrls() == null ? List.of() : request.photoUrls(),
                new Nutrition(request.calories(), request.proteins(), request.fats(), request.carbohydrates()),
                normalizeNullableText(request.composition()),
                request.category(),
                request.cookingRequirement(),
                flags
        );

        return productMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        validateProductNutrition(request.proteins(), request.fats(), request.carbohydrates());
        Set<DietFlag> flags = validateAndNormalizeProductFlags(request.category(), request.flags());

        Product product = getProductOrThrow(id);
        product.setName(request.name().trim());
        product.setPhotoUrls(request.photoUrls() == null ? List.of() : request.photoUrls());
        product.setNutrition(new Nutrition(request.calories(), request.proteins(), request.fats(), request.carbohydrates()));
        product.setComposition(normalizeNullableText(request.composition()));
        product.setCategory(request.category());
        product.setCookingRequirement(request.cookingRequirement());
        product.setFlags(flags);

        return productMapper.toResponse(product);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Product product = getProductOrThrow(id);
        List<Dish> dishes = dishRepository.findDishesUsingProduct(id);
        if (!dishes.isEmpty()) {
            List<String> dishNames = dishes.stream().map(Dish::getName).toList();
            throw new ProductInUseException(id, dishNames);
        }
        productRepository.delete(product);
    }

    private Product getProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " was not found"));
    }

    private void validateProductNutrition(BigDecimal proteins, BigDecimal fats, BigDecimal carbohydrates) {
        BigDecimal sum = proteins.add(fats).add(carbohydrates);
        if (sum.compareTo(ONE_HUNDRED) > 0) {
            throw new BusinessRuleException("Sum of proteins, fats and carbohydrates per 100 g cannot exceed 100");
        }
    }

    private String normalizeNullableText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private Set<DietFlag> validateAndNormalizeProductFlags(ProductCategory category, Set<DietFlag> requestedFlags) {
        Set<DietFlag> flags = new HashSet<>(requestedFlags == null ? Set.of() : requestedFlags);

        if (category == ProductCategory.MEAT && flags.contains(DietFlag.VEGAN)) {
            throw new BusinessRuleException("Meat product cannot have Vegan flag");
        }

        return flags;
    }
}
