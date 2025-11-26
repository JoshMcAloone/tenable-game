export interface Answer {
  text: string;
  alternativeText?: string; // Optional alternative answer text for fuzzy matching
  clue?: string; // Custom placeholder text for unrevealed answers (replaces hardcoded numbers)
  additionalText?: string; // Optional additional information shown in parentheses
  revealed: boolean;
}

export interface QuestionSet {
  id: string;
  questionText: string;
  answers: Answer[];
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
  rounds: QuestionSet[];
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