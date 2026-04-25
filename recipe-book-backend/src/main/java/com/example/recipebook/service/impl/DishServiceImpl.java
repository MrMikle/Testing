package com.example.recipebook.service.impl;

import com.example.recipebook.domain.Dish;
import com.example.recipebook.domain.DishIngredient;
import com.example.recipebook.domain.Nutrition;
import com.example.recipebook.domain.Product;
import com.example.recipebook.domain.enums.DietFlag;
import com.example.recipebook.domain.enums.DishCategory;
import com.example.recipebook.dto.DishIngredientRequest;
import com.example.recipebook.dto.DishNutritionCalculationRequest;
import com.example.recipebook.dto.DishRequest;
import com.example.recipebook.dto.DishResponse;
import com.example.recipebook.dto.NutritionDto;
import com.example.recipebook.exception.BusinessRuleException;
import com.example.recipebook.exception.InvalidDietFlagsException;
import com.example.recipebook.exception.ResourceNotFoundException;
import com.example.recipebook.repository.DishRepository;
import com.example.recipebook.repository.DishSpecifications;
import com.example.recipebook.repository.ProductRepository;
import com.example.recipebook.service.DishMapper;
import com.example.recipebook.service.DishService;
import com.example.recipebook.service.DishTitleMacroParser;
import com.example.recipebook.service.NutritionCalculator;
import com.example.recipebook.service.ProductMapper;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DishServiceImpl implements DishService {
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final DishRepository dishRepository;
    private final ProductRepository productRepository;
    private final NutritionCalculator nutritionCalculator;
    private final DishTitleMacroParser titleMacroParser;
    private final DishMapper dishMapper;
    private final ProductMapper productMapper;

    public DishServiceImpl(DishRepository dishRepository,
                           ProductRepository productRepository,
                           NutritionCalculator nutritionCalculator,
                           DishTitleMacroParser titleMacroParser,
                           DishMapper dishMapper,
                           ProductMapper productMapper) {
        this.dishRepository = dishRepository;
        this.productRepository = productRepository;
        this.nutritionCalculator = nutritionCalculator;
        this.titleMacroParser = titleMacroParser;
        this.dishMapper = dishMapper;
        this.productMapper = productMapper;
    }

    @Override
    public Page<DishResponse> findAll(DishCategory category,
                                      Boolean vegan,
                                      Boolean glutenFree,
                                      Boolean sugarFree,
                                      String search,
                                      Pageable pageable) {
        Specification<Dish> specification = (root, query, cb) -> cb.conjunction();
        specification = specification.and(DishSpecifications.category(category));
        specification = specification.and(DishSpecifications.nameContains(search));
        if (Boolean.TRUE.equals(vegan)) {
            specification = specification.and(DishSpecifications.hasFlag(DietFlag.VEGAN));
        }
        if (Boolean.TRUE.equals(glutenFree)) {
            specification = specification.and(DishSpecifications.hasFlag(DietFlag.GLUTEN_FREE));
        }
        if (Boolean.TRUE.equals(sugarFree)) {
            specification = specification.and(DishSpecifications.hasFlag(DietFlag.SUGAR_FREE));
        }
        return dishRepository.findAll(specification, pageable).map(dishMapper::toResponse);
    }

    @Override
    public DishResponse findById(Long id) {
        return dishMapper.toResponse(getDishOrThrow(id));
    }

    @Override
    public NutritionDto calculateNutrition(DishNutritionCalculationRequest request) {
        Map<Long, Product> productsById = loadProductsById(request.ingredients());
        return productMapper.toNutritionDto(nutritionCalculator.calculateForPortion(request.ingredients(), productsById));
    }

    @Override
    @Transactional
    public DishResponse create(DishRequest request) {
        DishTitleMacroParser.ParsedDishTitle title = titleMacroParser.parse(request.name());
        DishCategory category = resolveCategory(request.category(), title.macroCategory());
        validateCleanedName(title.cleanedName());

        Map<Long, Product> productsById = loadProductsById(request.ingredients());
        Nutrition calculatedNutrition = nutritionCalculator.calculateForPortion(request.ingredients(), productsById);
        Nutrition finalNutrition = resolveNutrition(request, calculatedNutrition);
        validateDishNutritionPer100(request.servingSizeGrams(), finalNutrition);

        Set<DietFlag> allowedFlags = determineAllowedFlags(productsById.values());
        Set<DietFlag> finalFlags = resolveDishFlags(Set.of(), request.flags(), allowedFlags);

        Dish dish = new Dish();
        dish.setName(title.cleanedName());
        dish.setPhotoUrls(request.photoUrls() == null ? List.of() : request.photoUrls());
        dish.setNutrition(finalNutrition);
        dish.setServingSizeGrams(request.servingSizeGrams());
        dish.setCategory(category);
        dish.setFlags(finalFlags);
        replaceIngredients(dish, request.ingredients(), productsById);

        return dishMapper.toResponse(dishRepository.save(dish));
    }

    @Override
    @Transactional
    public DishResponse update(Long id, DishRequest request) {
        Dish dish = getDishOrThrow(id);
        DishTitleMacroParser.ParsedDishTitle title = titleMacroParser.parse(request.name());
        DishCategory category = resolveCategory(request.category(), title.macroCategory());
        validateCleanedName(title.cleanedName());

        Map<Long, Product> productsById = loadProductsById(request.ingredients());
        Nutrition calculatedNutrition = nutritionCalculator.calculateForPortion(request.ingredients(), productsById);
        Nutrition finalNutrition = resolveNutrition(request, calculatedNutrition);
        validateDishNutritionPer100(request.servingSizeGrams(), finalNutrition);

        Set<DietFlag> allowedFlags = determineAllowedFlags(productsById.values());
        Set<DietFlag> finalFlags = resolveDishFlags(dish.getFlags(), request.flags(), allowedFlags);

        dish.setName(title.cleanedName());
        dish.setPhotoUrls(request.photoUrls() == null ? List.of() : request.photoUrls());
        dish.setNutrition(finalNutrition);
        dish.setServingSizeGrams(request.servingSizeGrams());
        dish.setCategory(category);
        dish.setFlags(finalFlags);
        replaceIngredients(dish, request.ingredients(), productsById);

        return dishMapper.toResponse(dish);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Dish dish = getDishOrThrow(id);
        dishRepository.delete(dish);
    }

    private Dish getDishOrThrow(Long id) {
        return dishRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dish with id " + id + " was not found"));
    }

    private Map<Long, Product> loadProductsById(List<DishIngredientRequest> ingredients) {
        List<Long> ids = ingredients.stream().map(DishIngredientRequest::productId).distinct().toList();
        Map<Long, Product> productsById = productRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
        List<Long> missingIds = ids.stream().filter(id -> !productsById.containsKey(id)).toList();
        if (!missingIds.isEmpty()) {
            throw new BusinessRuleException("Products do not exist: " + missingIds);
        }
        return productsById;
    }

    private Nutrition resolveNutrition(DishRequest request, Nutrition calculatedNutrition) {
        return new Nutrition(
                nutritionCalculator.round(request.calories() == null ? calculatedNutrition.getCalories() : request.calories()),
                nutritionCalculator.round(request.proteins() == null ? calculatedNutrition.getProteins() : request.proteins()),
                nutritionCalculator.round(request.fats() == null ? calculatedNutrition.getFats() : request.fats()),
                nutritionCalculator.round(request.carbohydrates() == null ? calculatedNutrition.getCarbohydrates() : request.carbohydrates())
        );
    }

    private DishCategory resolveCategory(DishCategory explicitCategory, DishCategory macroCategory) {
        if (explicitCategory != null) {
            return explicitCategory;
        }
        if (macroCategory != null) {
            return macroCategory;
        }
        throw new BusinessRuleException("Dish category is required when name does not contain a supported macro");
    }

    private void validateCleanedName(String cleanedName) {
        if (cleanedName == null || cleanedName.length() < 2) {
            throw new BusinessRuleException("Dish name must contain at least 2 characters after macro removal");
        }
    }

    private void validateDishNutritionPer100(BigDecimal servingSizeGrams, Nutrition nutrition) {
        BigDecimal macroSumPerPortion = nutrition.getProteins()
                .add(nutrition.getFats())
                .add(nutrition.getCarbohydrates());
        BigDecimal macroSumPer100Grams = macroSumPerPortion
                .multiply(ONE_HUNDRED)
                .divide(servingSizeGrams, 8, RoundingMode.HALF_UP);
        if (macroSumPer100Grams.compareTo(ONE_HUNDRED) > 0) {
            throw new BusinessRuleException("Sum of proteins, fats and carbohydrates per 100 g of dish cannot exceed 100");
        }
    }

    private Set<DietFlag> determineAllowedFlags(Collection<Product> products) {
        Set<DietFlag> allowed = new HashSet<>();
        for (DietFlag flag : DietFlag.values()) {
            boolean allProductsHaveFlag = products.stream().allMatch(product -> product.getFlags().contains(flag));
            if (allProductsHaveFlag) {
                allowed.add(flag);
            }
        }
        return allowed;
    }

    private Set<DietFlag> resolveDishFlags(Set<DietFlag> existingFlags, Set<DietFlag> requestedFlags, Set<DietFlag> allowedFlags) {
        if (requestedFlags != null && !allowedFlags.containsAll(requestedFlags)) {
            throw new InvalidDietFlagsException(requestedFlags, allowedFlags);
        }
        Set<DietFlag> baseFlags = requestedFlags == null ? existingFlags : requestedFlags;
        Set<DietFlag> resolvedFlags = new HashSet<>(baseFlags);
        resolvedFlags.retainAll(allowedFlags);
        return resolvedFlags;
    }

    private void replaceIngredients(Dish dish, List<DishIngredientRequest> ingredientRequests, Map<Long, Product> productsById) {
        dish.clearIngredients();
        for (DishIngredientRequest ingredientRequest : ingredientRequests) {
            Product product = productsById.get(ingredientRequest.productId());
            dish.addIngredient(new DishIngredient(product, ingredientRequest.quantityGrams()));
        }
    }
}
