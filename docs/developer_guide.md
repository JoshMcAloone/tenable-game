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

## Enhanced Answer Display
The game supports rich answer formatting with optional clue fields:

### Answer Data Structure
```typescript
interface Answer {
  text: string;           // Primary answer text
  clue?: string;          // Optional clue for display (e.g., "Mr. Bean" or "1")
  alternativeText?: string; // Alternative acceptable answers
  additionalText?: string;  // Extra information (points, context)
  revealed: boolean;       // Current state
}
```

### Clue Display Features
- **Board View**: Shows clue when answer unrevealed (falls back to position number)
- **Round Summary**: Displays clues instead of hard-coded numbers for better context
- **Flexible Format**: Supports both descriptive clues and simple numbering
- **Responsive Design**: Clue circles expand to accommodate longer text

## Key Actions
- INIT_GAME: Build teams, set first round.
- START_ROUND: Enter board phase.
- SUBMIT_ANSWER: Mutates answers, scoring, elimination (uses fuzzy matching for validation).
- ADVANCE_TURN: Rotates among non-eliminated teams.
- END_ROUND: Progress or end game, **rotates starting team for next round**.
- RESTORE_STATE: Resume from saved game state.
- UNDO_LAST_ACTION: Restores team life and removes last incorrect answer submission (30-second time limit).

### Team Starting Rotation
Each round begins with a different team to ensure fair gameplay:
- **State Field**: `firstTeamRotationIndex` tracks which team starts next round
- **Rotation Logic**: `(currentIndex + 1) % totalTeams` in END_ROUND action
- **Backwards Compatibility**: Missing field defaults to 0 for saved games

### Team Setup Validation
The game includes comprehensive validation during team setup in `src/components/GameSetup.tsx`:

#### Validation Rules
- **Empty Names**: Prevents starting with empty or whitespace-only team names
- **Duplicate Names**: Ensures all team names are unique
- **Name Trimming**: Automatically trims whitespace from team names
- **User Feedback**: Shows Swedish error messages for validation failures

#### Implementation
```typescript
function newGame() {
  const trimmedNames = names.map(name => name.trim());
  const emptyNames = trimmedNames.filter(name => name.length === 0);
  
  if (emptyNames.length > 0) {
    alert('Alla lag måste ha namn innan spelet kan startas.');
    return;
  }
  
  const uniqueNames = new Set(trimmedNames);
  if (uniqueNames.size !== trimmedNames.length) {
    alert('Alla lag måste ha unika namn.');
    return;
  }
  // ... proceed with game start
}
```

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

### Critical State Audio-Visual System
When teams reach critical state (1 life remaining), the game activates an immersive heartbeat effect:

#### Components
- **Sound**: Realistic "lub-dub" heartbeat pattern using Web Audio API with triangle waves and sub-bass
- **Visual**: Synchronized shake animations on team panels with red glow effects
- **Timing**: 2-second cycle with precise synchronization (lub at 15ms, dub at 175ms)

#### Implementation
- `src/utils/soundEffects.ts`: `playHeartbeat()` method with reverb and filtering
- `src/styles/team-panel.css`: `criticalShake` keyframes animation
- `src/hooks/useProgressiveReveal.ts`: Heartbeat interval management
- `src/components/TeamPanel.tsx`: Critical state detection and CSS class application

#### Features
- **Audio Timing**: Slightly precedes visual for natural perception
- **Synchronized Pause/Resume**: Both audio and visual effects pause during animations  
- **Zero Drift**: Perfect synchronization maintained across pause/resume cycles
- **Reverb Processing**: Subtle spatial audio using convolver nodes
- **Volume Control**: Balanced for tension without overwhelming other sounds
- **Performance**: Efficient cleanup and memory management

### Matching Features
- **Levenshtein Distance**: Calculates character-level edit distance for typo detection
- **Text Normalization**: Removes articles, punctuation, normalizes whitespace/case
- **Similarity Scoring**: Combines character similarity with word overlap bonuses
- **Configurable Threshold**: Default 85% similarity required for acceptance

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