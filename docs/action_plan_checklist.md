# Tenable-Style Quiz Game React Implementation Action Plan

A phased checklist for collaboratively building the MVP using React + Vite + TypeScript + Tailwind.

## Phase 0: Project Bootstrap
- [x] Confirm tooling (Node version, package manager)
- [x] Initialize Vite React+TS project (`npm create vite@latest`)
- [x] Add Tailwind CSS v4 via `@tailwindcss/vite` plugin per `doc/installation_tailwind.md`
- [x] Configure ESLint + Prettier (TypeScript + React rules)
- [x] Add basic PWA files (manifest.json, icons placeholder, service worker scaffold)
- [x] Verify dev server runs and Tailwind styles load

## Phase 1: Domain & Data Structures
- [x] Create TypeScript interfaces: `QuestionSet`, `Answer`, `Team`, `GameState`
- [x] Draft sample rounds JSON (`data/rounds.example.json`)
- [x] Implement data loader utility for static JSON
- [x] Define constants (initial lives, max teams, phases enum)
- [x] Add lightweight validation for imported rounds

## Phase 2: Global State Management
- [x] Choose state approach (simple React Context + reducer for MVP)
- [x] Implement `GameProvider` with reducer actions: INIT_GAME, START_ROUND, SUBMIT_ANSWER, ADVANCE_TURN, ELIMINATE_TEAM, END_ROUND, END_GAME
- [ ] Write pure reducer tests (Vitest) for core transitions
- [x] Ensure immutable updates & predictable turn rotation logic

## Phase 3: UI Component Skeletons
- [x] Layout shell (header, main board, sidebar)
- [x] `QuestionView` component
- [x] `BoardView` component (10 slot grid)
- [x] `TeamPanel` component (name, score, lives, active highlight)
- [x] `AnswerInput` component (controlled input + submit button)
- [x] `RoundSummary` component (revealed answers + per-team stats)
- [x] `GameSetup` screen (enter team names, count)

## Phase 4: Interaction & Game Flow
- [x] Implement game setup form (2–6 teams) -> INIT_GAME
- [x] Transition: Question phase -> board phase (`START_ROUND`)
- [x] Submit answer path: normalize input, check duplicates, correct vs incorrect branching
- [x] Reveal answer animation (simple Tailwind transition)
- [x] Life decrement & elimination handling
- [x] Turn advancement skipping eliminated teams
- [x] Round end detection (all answers revealed OR all eliminated)
- [x] Game end detection (no more rounds or no active teams)

## Phase 5: Styling & UX Polish
- [x] Responsive grid (16:9 focus) with Tailwind
- [x] High contrast color palette & accessible text sizes
- [x] Visual states: active team highlight, eliminated dimming
- [x] Simple animations: answer reveal pulse
- [ ] Life loss shake animation
- [x] Keyboard accessibility (Enter to submit answer)
- [x] Focus management (auto-focus input on active team turn)

## Phase 6: PWA Enhancements (MVP Light)
- [x] Add manifest real icons (placeholders)
- [x] Cache static assets via service worker (basic strategy)
- [ ] Test offline availability for static game assets

## Phase 7: Testing & Quality
- [ ] Set up test framework (Vitest) and add test script to package.json
- [ ] Unit tests for reducer logic (edge cases: duplicate answer, last life, last answer)
- [ ] Component tests (rendering states) with Testing Library
- [ ] Accessibility checks (axe or similar tooling)
- [ ] Manual playthrough of a full game with multiple rounds

## Phase 8: Content Management
- [ ] Finalize rounds JSON format & naming convention
- [ ] Add basic question set curation guidelines
- [ ] Optionally script to validate 10 answers per question before bundling

## Phase 9: Documentation
- [x] Update `README.md` with setup/run instructions
- [x] Add developer guide: state transitions & data flow diagram
- [ ] Add contribution guidelines (coding style, test expectations)

## Phase 10: Refinement & Stretch (Optional Post-MVP)
- [x] Fuzzy matching (Levenshtein or synonyms list) - ✅ Implemented with abbreviation handling
- [x] Undo functionality - ✅ Implemented with 30-second time limit and UI integration
- [x] Persist game state in localStorage - ✅ Automatic save/restore with RESTORE_STATE action
- [ ] Admin interface to add questions in-app
- [x] Sound/FX layer - ✅ Comprehensive audio system with progressive pitch scanning, dramatic failure sounds, and Web Audio API

## Cross-Cutting Practices
- [ ] Frequent small commits per phase milestone
- [ ] Run lint & test suites before pushing
- [ ] Regularly prune dead code/components
- [ ] Track TODO comments for stretch goals

## Collaborative Workflow Suggestions
- [ ] Create GitHub issues mapping to each phase section
- [ ] Use labels: `phase0`, `state`, `ui`, `testing`, `enhancement`
- [ ] Open draft PR early for Phase 2 (state) for review
- [ ] Peer review UI accessibility before Phase 5 completion
- [ ] Maintain CHANGELOG after MVP stabilization

## Phase 11: Custom Rounds Creation System (v2 Feature)
**Note**: This phase implements the requirements in `requirements_v2_custom_rounds.md`

### 11.1 Data Model Extensions
- [ ] Extend TypeScript interfaces for CustomRound with metadata
- [ ] Create RoundCollection interface for import/export
- [ ] Add version compatibility handling in data structures
- [ ] Implement round validation schema with detailed error messages

### 11.2 Local Storage Management
- [ ] Design localStorage strategy for custom rounds
- [ ] Implement round CRUD operations (Create, Read, Update, Delete)
- [ ] Add auto-save functionality for draft rounds
- [ ] Create backup/restore utilities for user data

### 11.3 Round Creator Interface
- [ ] Build RoundCreator component with form validation
- [ ] Implement AnswerEditor with drag-and-drop reordering
- [ ] Add real-time preview panel showing game view
- [ ] Create rich text editing for question and answer inputs
- [ ] Add metadata form (title, description, category, difficulty)

### 11.4 Round Library Management
- [ ] Build RoundLibrary component with grid and list views
- [ ] Implement search and filtering functionality
- [ ] Add sorting options (name, date, play count)
- [ ] Create bulk selection and actions interface
- [ ] Add round duplication and deletion with confirmations

### 11.5 Import/Export System
- [ ] Define .tenable file format specification
- [ ] Implement JSON export functionality with metadata
- [ ] Create file import with drag-and-drop interface
- [ ] Add format validation and error reporting
- [ ] Support legacy rounds.json import format
- [ ] Add CSV import option for bulk answer data

### 11.6 Game Setup Integration
- [ ] Extend GameSetup with round source selection
- [ ] Create round picker with preview functionality
- [ ] Add mixed mode (default + custom rounds)
- [ ] Implement round ordering with drag-and-drop
- [ ] Update game state to handle custom round metadata

### 11.7 UI/UX Polish
- [ ] Design consistent interface patterns across creator/library
- [ ] Add responsive layouts for mobile round creation
- [ ] Implement accessibility features (keyboard nav, screen readers)
- [ ] Create loading states and progress indicators
- [ ] Add confirmation dialogs for destructive actions

### 11.8 Validation & Error Handling
- [ ] Implement comprehensive input validation with live feedback
- [ ] Create detailed error messages for import failures
- [ ] Add duplicate detection and conflict resolution
- [ ] Handle file size limits and format compatibility
- [ ] Test edge cases (corrupted files, version mismatches)

### 11.9 Testing Custom Rounds
- [ ] Unit tests for round CRUD operations
- [ ] Integration tests for import/export functionality
- [ ] Component tests for creator interface
- [ ] End-to-end tests for complete round creation workflow
- [ ] Performance tests for large round libraries

### 11.10 Documentation
- [ ] Update user guide with round creation instructions
- [ ] Document .tenable file format specification
- [ ] Add migration guide for existing users
- [ ] Create sharing and collaboration guidelines

## Acceptance Gate Checklist (Before Calling MVP Complete)
- [x] Full round playable end-to-end with correct scoring
- [x] Multiple teams elimination scenario tested
- [x] All 10 answers reveal scenario verified
- [x] Duplicate answer handling works (warn, no penalty)
- [x] Lives decrement & elimination visual feedback
- [x] No console errors in production build
- [ ] Basic offline load works (PWA assets served)

## Acceptance Gate Checklist v2 (Custom Rounds Feature Complete)
- [ ] Can create new round with full metadata and validation
- [ ] Can edit existing rounds with auto-save and change tracking
- [ ] Can export individual rounds and collections to .tenable files
- [ ] Can import .tenable files with comprehensive error handling
- [ ] Round library provides search, filter, and management capabilities
- [ ] Game setup supports mixing default and custom rounds
- [ ] All accessibility requirements met (keyboard nav, screen readers)
- [ ] Data integrity maintained across all import/export operations
- [ ] Performance acceptable with 100+ custom rounds in library
- [ ] No data loss during browser storage operations

---
Use this checklist to open issues & track progress. We can refine phases as implementation proceeds.