# Answer Format Examples

This document provides examples of the enhanced answer format with the new functionality: custom clues, alternative text, and additional information.

## Answer Object Structure

```json
{
  "clue": "Custom placeholder text for unrevealed answers",
  "text": "Primary answer text that players must match",
  "alternativeText": "Optional alternative form that is also acceptable", 
  "additionalText": "Optional extra info shown in parentheses",
  "revealed": false
}
```

## Field Descriptions

### `clue` (optional)
- **Purpose**: Custom placeholder text shown for unrevealed answers
- **Default**: If not provided, defaults to numeric position (1, 2, 3, etc.)
- **Examples**: "En av The Beatles", "Vampyr i en bokfilmserie", "Sveriges första kvinnliga statsminister"

### `text` (required)
- **Purpose**: Primary answer text that players must match
- **Examples**: "George Harrison", "Robert Pattinson", "Magdalena Andersson"

### `alternativeText` (optional)  
- **Purpose**: Alternative acceptable answer form
- **Behavior**: If provided, answers matching either `text` OR `alternativeText` will be accepted
- **Examples**: "Harry" for "Harry Potter", "Dumbledore" for "Albus Dumbledore"

### `additionalText` (optional)
- **Purpose**: Extra information displayed in parentheses next to revealed answers
- **Examples**: "2024" for years, "18 956" for statistics, "920" for scores

## Example Formats

### 1. Standard Format with Numbers (Current Example)
```json
{
  "clue": "1",
  "text": "Harry Potter", 
  "alternativeText": "Harry",
  "additionalText": "18 956",
  "revealed": false
}
```
**Display**: Unrevealed shows "1", revealed shows "Harry Potter (18 956)"

### 2. Custom Clue Format (New Example)
```json
{
  "clue": "En av The Beatles",
  "text": "George Harrison",
  "alternativeText": "Harrison", 
  "additionalText": "",
  "revealed": false
}
```
**Display**: Unrevealed shows "En av The Beatles", revealed shows "George Harrison"

### 3. Year-based Format
```json
{
  "clue": "1",
  "text": "KAJ",
  "additionalText": "2025",
  "revealed": false  
}
```
**Display**: Unrevealed shows "1", revealed shows "KAJ (2025)"

### 4. Minimal Format
```json
{
  "text": "Simple Answer",
  "revealed": false
}
```
**Display**: Unrevealed shows position number, revealed shows "Simple Answer"

## Answer Validation Rules

The fuzzy matching system will accept an answer if it matches either the `text` OR `alternativeText` fields:

- **"Harry"** → Matches answer with `text: "Harry Potter"` and `alternativeText: "Harry"`
- **"harrison"** → Matches answer with `text: "George Harrison"` and `alternativeText: "Harrison"`  
- **"Dumbledore"** → Matches answer with `text: "Albus Dumbledore"` and `alternativeText: "Dumbledore"`

## Migration Guide

### From Old Format
```json
{
  "text": "Harry Potter",
  "revealed": false
}
```

### To New Format (Optional Enhancements)
```json
{
  "clue": "1", 
  "text": "Harry Potter",
  "alternativeText": "Harry",
  "additionalText": "18 956", 
  "revealed": false
}
```

## Validation Considerations

- **Duplicate Detection**: The system now checks for duplicates in both `text` and `alternativeText` fields
- **Conflict Prevention**: Alternative text cannot match another answer's primary text
- **Cross-Round Consistency**: All answers within a round must follow the same general format style