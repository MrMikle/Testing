package com.example.recipebook.exception;

import com.example.recipebook.domain.enums.DietFlag;
import java.util.Set;

public class InvalidDietFlagsException extends BusinessRuleException {
    private final Set<DietFlag> requestedFlags;
    private final Set<DietFlag> allowedFlags;

    public InvalidDietFlagsException(Set<DietFlag> requestedFlags, Set<DietFlag> allowedFlags) {
        super("Requested dish flags are not allowed by ingredient product flags");
        this.requestedFlags = Set.copyOf(requestedFlags);
        this.allowedFlags = Set.copyOf(allowedFlags);
    }

    public Set<DietFlag> getRequestedFlags() {
        return requestedFlags;
    }

    public Set<DietFlag> getAllowedFlags() {
        return allowedFlags;
    }
}
