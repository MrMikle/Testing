package com.example.recipebook.exception;

import java.util.List;

public class ProductInUseException extends BusinessRuleException {
    private final Long productId;
    private final List<String> dishNames;

    public ProductInUseException(Long productId, List<String> dishNames) {
        super("Product cannot be deleted because it is used in dishes");
        this.productId = productId;
        this.dishNames = List.copyOf(dishNames);
    }

    public Long getProductId() {
        return productId;
    }

    public List<String> getDishNames() {
        return dishNames;
    }
}
