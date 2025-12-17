export interface Answer {
  text: string;
  alternativeText?: string; // Optional alternative answer text for fuzzy matching
  clue?: string; // Custom placeholder text for unrevealed answers (replaces hardcoded numbers)
  additionalText?: string; // Optional additional information shown in parentheses
  revealed: boolean;
  foundBy?: { // Track which team found this answer
    teamId: string;
    teamName: string;
  };
}

export interface QuestionSet {
  id: string;
  questionText: string;
  answers: Answer[];
}

export interface CustomRoundMetadata {
  id: string;           // UUID for tracking
  title: string;        // User-friendly name
  description?: string; // Optional round description
  author?: string;      // Creator name (optional)
  createdAt: string;    // ISO timestamp
  lastModified: string; // ISO timestamp
  playCount: number;    // Usage tracking
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;    // User-defined category
  isCustom: boolean;    // Distinguishes from default rounds
  version: string;      // Format version for compatibility
}

export interface CustomRoundSettings {
  shuffleAnswers?: boolean;     // Randomize answer order
  timeLimit?: number;           // Per-answer time limit (future)
  allowPartialCredit?: boolean; // Fuzzy matching tolerance
}

export interface CustomRound extends QuestionSet {
  metadata: CustomRoundMetadata;
  settings: CustomRoundSettings;
}

export interface RoundCollection {
  version: string;
  exportDate: string;
  rounds: CustomRound[];
  metadata: {
    title?: string;
    description?: string;
    author?: string;
  };
}

export interface Team {
  id: string;
  name: string;
  score: number;
  livesRemaining: number;
  eliminated: boolean;
}

export type Phase = 'setup' | 'question' | 'board' | 'summary' | 'ended';

export interface GameState {
  currentRoundIndex: number;
  currentTurnTeamId: string | null;
  phase: Phase;
  teams: Team[];
  rounds: (QuestionSet | CustomRound)[]; // Support both default and custom rounds
  firstTeamRotationIndex: number; // Index of team that should start the next round
  // Round source tracking
  roundSources?: {
    defaultRounds: boolean;
    customRounds: boolean;
    selectedRoundIds: string[];
  };
  // Animation state for progressive reveal
  animation?: {
    isAnimating: boolean;
    currentHighlightRow: number | null;
    submittedAnswer: string;
    animationType: 'scanning' | 'success' | 'failure' | null;
    foundAnswerIndex?: number; // Track which answer was found during scanning
    checkedUnrevealedAnswers?: number[]; // Track which unrevealed answer indices have been checked
  };
  // Celebration state for pyramid completion
  celebration?: {
    isActive: boolean;
    roundIndex: number;
  };
  // Undo state for last incorrect action
  lastAction?: {
    type: 'incorrect_answer';
    teamId: string;
    answerText: string;
    timestamp: number;
  };
}

export interface SubmitResult {
  correct: boolean;
  alreadyRevealed?: boolean;
  matchedAnswer?: Answer;
}

// Validation types for custom rounds
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface RoundValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Import/Export types
export interface ImportResult {
  success: boolean;
  importedRounds: CustomRound[];
  errors: string[];
  warnings: string[];
  skippedRounds: { round: any; reason: string }[];
}