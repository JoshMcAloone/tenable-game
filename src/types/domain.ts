export interface Answer {
  text: string;
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
  };
  // Celebration state for pyramid completion
  celebration?: {
    isActive: boolean;
    roundIndex: number;
  };
}

export interface SubmitResult {
  correct: boolean;
  alreadyRevealed?: boolean;
  matchedAnswer?: Answer;
}