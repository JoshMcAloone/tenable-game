# Tenable-Style Quiz Game Requirements

## 1. Purpose
A lightweight multi-team quiz game inspired by the Tenable TV format. Players (teams) attempt to uncover all valid answers to a displayed question. The game tracks points and eliminations (lives). Designed for local play (shared screen) and optionally future online expansion.

## 2. Scope (MVP)
- Support 2–6 teams (configurable at game start).
- Fixed rounds using pre-authored question/answer sets (e.g., 10 answers per board).
- Manual host or automated reveal logic (MVP: automated on correct guess).
- One shared UI showing: current question, answer board state, team statuses (points, lives), turn indicator.

## 3. Core Concepts
- Question Board: Displays the question text (pre-round) and then switches to the 10-slot answer board (numbered 1–10).
- Answers Board: Each slot hides one correct answer until revealed.
- Teams: Each has a name, score, remaining lives (start at 3), active/out status.
- Turn: Cycles through remaining (non-eliminated) teams in order.
- Round: Ends when all answers have been revealed OR all teams eliminated.

## 4. Gameplay Flow (Single Round)
1. Initialize round with question + list of 10 correct answers (hidden).
2. Display Question View (brief intro state) -> transition to Answer Board View.
3. Team whose turn it is submits an answer (text input).
4. System checks case-insensitive match against remaining hidden answers.
   - If match: reveal answer in its slot; increment team score by 1; maintain lives.
   - If no match: decrement team lives by 1; if lives reach 0 mark team eliminated.
5. Advance turn to next non-eliminated team.
6. Repeat until: (a) all 10 answers revealed (round success) OR (b) all teams eliminated (premature end).
7. Tally round summary (answers found per team) and proceed to next round if available.

## 5. Input & Validation
- Answer input: free-text; trim whitespace; normalize (lowercase) before comparison.
- Reject empty submissions.
- **Enhanced Answer Acceptance System**: Flexible answer validation with multiple acceptance paths:
  - **Primary Text**: Standard answer text that players must match
  - **Alternative Text**: Optional alternative form of the answer that is also acceptable (e.g., "Harry" for "Harry Potter")
  - **Custom Clues**: Each answer can have a custom clue text displayed for unrevealed answers instead of hardcoded numbers 1-10
  - **Additional Information**: Optional extra text shown in parentheses next to revealed answers (e.g., years, scores, statistics)
- **Fuzzy Matching System**: Intelligent answer validation using similarity scoring applied to both primary and alternative text:
  - **Article Handling**: Automatically removes common articles ("the", "a", "an") for comparison
  - **Typo Tolerance**: Uses Levenshtein distance algorithm to detect and accept common typos
  - **Case Insensitive**: All comparisons ignore case differences
  - **Punctuation Normalization**: Handles punctuation differences gracefully
  - **Similarity Threshold**: Configurable threshold (default 80%) determines acceptable matches
  - **Word Order Flexibility**: Handles some word rearrangements and partial matches
  - **Dual Text Checking**: Answer is accepted if it fuzzy matches either the primary text OR the alternativeText
  - **Examples of Accepted Variations**:
    - "Winner Takes It All" matches "The Winner Takes It All" (missing article)
    - "Mama Mia" matches "Mamma Mia" (single character difference)
    - "winner takes it all" matches "The Winner Takes It All" (case insensitive)
    - "The Winner Take It All" matches "The Winner Takes It All" (typo tolerance)
    - "Harry" matches answer with text "Harry Potter" and alternativeText "Harry"

## 6. Data Model (MVP)
QuestionSet:
- id
- questionText
- answers: array[Answer]
Answer:
- text (primary answer text)
- alternativeText (optional - alternative accepted answer text for fuzzy matching)
- clue (custom placeholder text shown for unrevealed answers - replaces hardcoded numbers)
- additionalText (optional - extra information shown in parentheses next to revealed answers, e.g., years, scores)
- revealed (bool)
Team:
- id
- name
- score
- livesRemaining
- eliminated (bool)
GameState:
- currentRoundIndex
- currentTurnTeamId
- phase (question|board|ended)
- teams: array[Team]
- rounds: array[QuestionSet]

## 7. Turn Logic
- Maintain ordered list of active teams.
- After each submission, select next team with lives > 0.
- If only one team left but answers remain, that team continues until round ends or elimination.

## 8. Scoring
- +1 point per correct revealed answer for the submitting team.
- No bonus for completing board (future feature).
- Total score accumulates across rounds.

## 9. Lives & Elimination
- Each team starts with 3 lives per round.
- Incorrect answer => lose 1 life.
- At 0 lives: set eliminated for remainder of current round; skip in turn rotation.
- **Lives reset to 3 at the start of each new round** - all teams get a fresh start.
- **Elimination status resets at round end** - eliminated teams are reinstated with full lives for the next round.
- This ensures fair gameplay where poor performance in one round doesn't compound across multiple rounds.

## 10. User Interface (High-Level)
Views:
- Question View: Large question text + "Begin Round" control.
- Board View: Grid of answer slots with custom clues; revealed answers show primary text with optional additional text in parentheses; sidebar with team panels.
- Answers Reveal: Visual effect (simple highlight) on correct answer.
Elements:
- Answer Slots: Display custom clue text (instead of numbers) for unrevealed answers; primary answer text with optional additional info for revealed answers.
- Team Panel: name, score, lives (hearts or counters), highlight for active turn.
- Input Box: answer submission + submit button; disabled if team not active.
- Status Bar: remaining hidden answers count.

## 11. Persistence (MVP)
- In-memory only; reset on page refresh.
- Question sets loaded from a static JSON file.
- Future: Add save/load and per-session IDs.

## 12. Configuration (MVP)
- Number of teams and team names at game start.
- Predefined list of rounds (JSON) loaded once.

## 13. Error & Edge Cases
- Duplicate correct answer attempt (already revealed): warn, no score, no life loss, still consume turn (simple rule).
- Team submits after elimination: input disabled.
- All teams eliminated with answers remaining: round ends; unanswered answers can be revealed in summary.

## 14. Non-Functional Requirements
- Responsive layout for 16:9 display (primary use case: TV/projector or monitor).
- Fast feedback (<300ms) on answer validation.
- Accessible color contrast for team panels and revealed answers.

## 15. Technology Assumptions (Placeholder)
- Frontend: Any modern web framework (e.g., React) OR plain HTML/JS.
- Backend: Not required for MVP if static assets + in-browser state.

## 16. Future Enhancements (Out of Scope for MVP)
- Online multiplayer & lobby.
- Timer per turn / speed scoring.
- Partial credit via fuzzy matching.
- Admin interface to add questions.
- Sound effects & animations.
- Statistics dashboard.

## 17. Example Reference
Refer to `Example question with answers.md` for sample board content structure.

## 18. Acceptance Criteria (MVP)
- Can configure 2–6 teams and start a game.
- Can progress through at least one round revealing correct answers.
- Correct answers increment score and reveal associated slot.
- Incorrect answers decrement lives and eliminate teams at 0.
- Game rotates turns only among non-eliminated teams.
- Round ends automatically when all 10 answers revealed or all teams eliminated.
- Summary shows total scores after final round.

---
This document defines the minimum required behavior to begin implementation. Adjust sections as design choices firm up.