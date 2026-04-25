package com.example.recipebook.service.impl;

import com.example.recipebook.domain.enums.DishCategory;
import com.example.recipebook.service.DishTitleMacroParser;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class DishTitleMacroParserImpl implements DishTitleMacroParser {
    private static final List<Macro> MACROS = List.of(
            new Macro("!десерт", DishCategory.DESSERT),
            new Macro("!первое", DishCategory.FIRST_COURSE),
            new Macro("!второе", DishCategory.SECOND_COURSE),
            new Macro("!напиток", DishCategory.DRINK),
            new Macro("!салат", DishCategory.SALAD),
            new Macro("!суп", DishCategory.SOUP),
            new Macro("!перекус", DishCategory.SNACK)
    );

    @Override
    public ParsedDishTitle parse(String rawName) {
        String safeName = rawName == null ? "" : rawName;
        String lowerName = safeName.toLowerCase(Locale.ROOT);

        List<MacroMatch> matches = MACROS.stream()
                .map((macro) -> new MacroMatch(macro, lowerName.indexOf(macro.token())))
                .filter((match) -> match.index() >= 0)
                .toList();

        if (matches.isEmpty()) {
            return new ParsedDishTitle(normalizeSpaces(safeName), null);
        }

        Optional<MacroMatch> firstMatch = matches.stream()
                .min(Comparator.comparingInt(MacroMatch::index));

        String cleaned = safeName;

        List<MacroMatch> matchesFromEnd = matches.stream()
                .sorted(Comparator.comparingInt(MacroMatch::index).reversed())
                .toList();

        for (MacroMatch match : matchesFromEnd) {
            String token = match.macro().token();
            cleaned = cleaned.substring(0, match.index()) + cleaned.substring(match.index() + token.length());
        }

        return new ParsedDishTitle(normalizeSpaces(cleaned), firstMatch.map((match) -> match.macro().category()).orElse(null));
    }

    private String normalizeSpaces(String value) {
        return value == null ? "" : value.trim().replaceAll("\\s+", " ");
    }

    private record Macro(String token, DishCategory category) {
    }

    private record MacroMatch(Macro macro, int index) {
    }
}