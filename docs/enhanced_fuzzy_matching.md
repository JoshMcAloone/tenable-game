# Enhanced Fuzzy Matching Documentation

## Overview

The enhanced fuzzy matching system now supports dual-text validation, allowing answers to be accepted if they match either the primary text OR an alternative text, providing greater flexibility for answer acceptance.

## Key Features

### Dual Text Validation
- **Primary Text**: Standard answer text stored in the `text` field
- **Alternative Text**: Optional alternative form stored in the `alternativeText` field
- **Acceptance**: Answer is accepted if it fuzzy matches either text

### Example Scenarios

#### 1. Full Name vs Common Name
```json
{
  "text": "Harry Potter",
  "alternativeText": "Harry"
}
```
- **Accepted inputs**: "Harry Potter", "Harry", "harry potter", "HARRY", etc.
- **Benefit**: Players can use either full names or commonly known short names

#### 2. Formal vs Informal Names
```json
{
  "text": "Albus Dumbledore", 
"alternativeText": "Dumbledore"
}
```
- **Accepted inputs**: "Albus Dumbledore", "Dumbledore", "dumbledore", etc.
- **Benefit**: Flexible acceptance of formal and informal name formats

#### 3. Original vs Translated Names
```json
{
  "text": "Lord Voldemort",
  "alternativeText": "Voldemort" 
}
```
- **Accepted inputs**: "Lord Voldemort", "Voldemort", "lord voldemort", etc.
- **Benefit**: Handles titles and variations in character names

## Technical Implementation

### Function Signature
```typescript
function isAnswerAcceptable(
  userAnswer: string, 
  correctAnswer: string, 
  threshold: number = 0.8, 
  alternativeText?: string
): boolean
```

### Validation Process
1. **Primary Text Check**: Calculate fuzzy match score against `text` field
2. **Threshold Test**: If score ≥ threshold (default 80%), accept answer
3. **Alternative Check**: If primary fails and `alternativeText` exists, calculate score against alternative
4. **Final Decision**: Accept if either primary OR alternative score meets threshold

### Fuzzy Matching Features (Applied to Both Texts)
- **Case Insensitive**: "HARRY" matches "Harry"
- **Article Removal**: "Winner Takes It All" matches "The Winner Takes It All"  
- **Typo Tolerance**: "Mama Mia" matches "Mamma Mia"
- **Punctuation Normalization**: Handles differences in punctuation gracefully
- **Whitespace Handling**: Extra spaces are normalized
- **Word Order Flexibility**: Some rearrangements are accepted

## Configuration

### Default Threshold
- **Value**: 80% similarity required
- **Adjustable**: Can be modified per game or answer if needed
- **Balance**: Provides good typo tolerance without being too permissive

### Validation Rules
- Both primary and alternative text undergo the same fuzzy matching process
- No preference given to either text - first successful match wins
- All existing fuzzy matching algorithms apply to both texts

## Best Practices

### When to Use Alternative Text
- **Character Names**: Full name vs common name ("Robert Pattinson" / "Pattinson")
- **Titles**: With and without titles ("Lord Voldemort" / "Voldemort")
- **Abbreviations**: Full form vs abbreviated ("Federal Bureau of Investigation" / "FBI")
- **Common Variations**: Different ways players might refer to the same thing

### When NOT to Use Alternative Text  
- **Synonyms**: Different words meaning the same thing
- **Very Different Names**: Completely different terms for the same concept
- **Spelling Variations**: Simple typos are already handled by fuzzy matching

### Example Implementation
```json
{
  "clue": "Natasha Romanoff i Marvel-filmerna",
  "text": "Scarlett Johansson", 
  "alternativeText": "Johansson",
  "additionalText": "",
  "revealed": false
}
```

This allows players to answer with either "Scarlett Johansson" or just "Johansson" while maintaining the full context in the displayed answer.

## Migration Impact

- **Backwards Compatible**: Existing answers without `alternativeText` continue to work normally
- **Enhanced Flexibility**: New answers can optionally include alternative text for better UX
- **No Performance Impact**: Minimal computational overhead for alternative text checking
- **Validation Enhanced**: New validation prevents conflicts between primary and alternative texts