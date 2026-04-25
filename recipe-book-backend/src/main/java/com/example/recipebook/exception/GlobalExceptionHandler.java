package com.example.recipebook.exception;

import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    ProblemDetail handleNotFound(ResourceNotFoundException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
        problem.setTitle("Resource not found");
        problem.setType(URI.create("https://errors.recipe-book.local/not-found"));
        return problem;
    }

    @ExceptionHandler(ProductInUseException.class)
    ProblemDetail handleProductInUse(ProductInUseException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage());
        problem.setTitle("Product is used in dishes");
        problem.setType(URI.create("https://errors.recipe-book.local/product-in-use"));
        problem.setProperty("productId", exception.getProductId());
        problem.setProperty("dishNames", exception.getDishNames());
        return problem;
    }

    @ExceptionHandler(InvalidDietFlagsException.class)
    ProblemDetail handleInvalidDishFlags(InvalidDietFlagsException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
        problem.setTitle("Invalid dish flags");
        problem.setType(URI.create("https://errors.recipe-book.local/invalid-dish-flags"));
        problem.setProperty("requestedFlags", exception.getRequestedFlags());
        problem.setProperty("allowedFlags", exception.getAllowedFlags());
        return problem;
    }

    @ExceptionHandler(BusinessRuleException.class)
    ProblemDetail handleBusinessRule(BusinessRuleException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
        problem.setTitle("Business rule violation");
        problem.setType(URI.create("https://errors.recipe-book.local/business-rule"));
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail handleValidation(MethodArgumentNotValidException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Request validation failed");
        problem.setTitle("Validation error");
        problem.setType(URI.create("https://errors.recipe-book.local/validation"));
        List<Map<String, String>> violations = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> {
                    Map<String, String> violation = new LinkedHashMap<>();
                    violation.put("field", error.getField());
                    violation.put("message", error.getDefaultMessage());
                    return violation;
                })
                .toList();
        problem.setProperty("violations", violations);
        return problem;
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ProblemDetail handleConstraintViolation(ConstraintViolationException exception) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
        problem.setTitle("Constraint violation");
        problem.setType(URI.create("https://errors.recipe-book.local/constraint-violation"));
        return problem;
    }
}
