# Developer Guide

## Architecture Overview
React + Context + Reducer for deterministic game state updates.

Layers:
- `context/gameReducer.ts`: Pure state transitions.
- `GameContext.tsx`: Persistence + public API.
- Components: Presentation only.
- Utilities: Validation & data loading.

## State Phases
- `setup` -> `question` -> `board` -> `summary` -> `question` (next) -> `ended`.

## Key Actions
- INIT_GAME: Build teams, set first round.
- START_ROUND: Enter board phase.
- SUBMIT_ANSWER: Mutates answers, scoring, elimination (uses fuzzy matching for validation).
- ADVANCE_TURN: Rotates among non-eliminated teams.
- END_ROUND: Progress or end game.
- RESTORE_STATE: Resume from saved game state.

### Answer Validation System
The game uses intelligent fuzzy matching implemented in `src/utils/fuzzyMatch.ts`:

### Core Functions
- `fuzzyMatchAnswer(userAnswer, correctAnswer)`: Returns similarity score (0-1)
- `isAnswerAcceptable(userAnswer, correctAnswer, threshold)`: Boolean acceptance check
- `normalizeForMatching(text)`: Text preprocessing for comparison

### Audio Progression System
Progressive pitch scanning creates dramatic tension:
- **Frequency Calculation**: Linear progression from 600Hz to 1200Hz
- **Step Inversion**: Since visual scanning goes bottom→top (index 9→0), audio uses `invertedStep = totalSteps - 1 - currentHighlightRow`
- **Harmonic Layers**: Root note + perfect fifth (1.5x frequency) for richness
- **Volume Scaling**: Progressive increase up to 30% for building intensity

### Matching Features
- **Levenshtein Distance**: Calculates character-level edit distance for typo detection
- **Text Normalization**: Removes articles, punctuation, normalizes whitespace/case
- **Similarity Scoring**: Combines character similarity with word overlap bonuses
- **Configurable Threshold**: Default 80% similarity required for acceptance

### Integration
The `submitAnswer` function in `GameContext.tsx`:
1. First checks for exact matches (for already revealed answers)
2. Uses fuzzy matching against unrevealed answers
3. Submits the canonical answer text when fuzzy match succeeds
4. Maintains backward compatibility with exact matching logic

## Game Persistence
The game automatically saves state to localStorage on every change. Players can:
- Resume interrupted games after page refresh or browser restart
- Switch between "Resume Game" and "New Game" as needed
- Automatic cleanup of saved state when starting new games

Resume functionality works by:
1. Detecting valid saved state on GameSetup mount
2. Showing appropriate buttons (Resume vs Start)
3. RESTORE_STATE action rebuilds complete game state
4. Automatic validation and fallbacks for corrupted data

## Data Flow
`rounds.example.json` -> loader -> reducer state -> components render.

## Adding a Feature (Example: Timer)
1. Extend state with `turnDeadline`.
2. Add action `TIMER_TICK`.
3. Hook `setInterval` in context, dispatch on expiry.
4. Visual indicator in BoardView.

## Testing Strategy
- Unit: reducer actions & edge cases.
- Component: critical interaction flows.
- Accessibility: axe checks for roles and labels.

## Persistence
LocalStorage snapshot per state change. Future: version keys & migration.

## Stretch Goals
See `action_plan_checklist.md` Phase 10.