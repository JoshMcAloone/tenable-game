import { GameState, QuestionSet, Team } from '../types/domain';
import { INITIAL_LIVES } from '../constants';
import { loadRounds } from '../utils/loader';
import { isAnswerAcceptable } from '../utils/fuzzyMatch';

export type Action =
  | { type: 'START_GAME'; teams: Team[] }
  | { type: 'START_ROUND' }
  | { type: 'SUBMIT_ANSWER'; answerText: string }
  | { type: 'START_REVEAL_ANIMATION'; answerText: string }
  | { type: 'HIGHLIGHT_ROW'; rowIndex: number }
  | { type: 'REVEAL_ANSWER_SUCCESS'; answerIndex: number }
  | { type: 'REVEAL_ANSWER_FAILURE' }
  | { type: 'END_ANIMATION' }
  | { type: 'ADVANCE_TURN' }
  | { type: 'START_CELEBRATION'; roundIndex: number }
  | { type: 'END_CELEBRATION' }
  | { type: 'END_ROUND' }
  | { type: 'END_GAME' }
  | { type: 'RESTORE_STATE'; state: GameState };

export const INITIAL_STATE: GameState = {
  currentRoundIndex: -1,
  currentTurnTeamId: null,
  phase: 'setup',
  teams: [],
  rounds: loadRounds() as QuestionSet[],
  animation: {
    isAnimating: false,
    currentHighlightRow: null,
    submittedAnswer: '',
    animationType: null
  },
  celebration: {
    isActive: false,
    roundIndex: -1
  }
};

export function nextTeamId(state: GameState): string | null {
  const { teams, currentTurnTeamId } = state;
  const activeTeams = teams.filter(t => !t.eliminated);
  if (!activeTeams.length) return null;
  // If no current turn yet, start with first active.
  if (!currentTurnTeamId) return activeTeams[0].id;
  // Find index of current team in full ordered list (even if now eliminated).
  const startIndex = teams.findIndex(t => t.id === currentTurnTeamId);
  if (startIndex === -1) return activeTeams[0].id;
  // Walk forward through original ordering to find next non-eliminated.
  for (let offset = 1; offset <= teams.length; offset++) {
    const idx = (startIndex + offset) % teams.length;
    const candidate = teams[idx];
    if (!candidate.eliminated) return candidate.id;
  }
  // Fallback (should not happen) return first active.
  return activeTeams[0].id;
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME': {
      return { ...state, teams: action.teams, phase: 'question', currentRoundIndex: 0, currentTurnTeamId: action.teams[0]?.id || null };
    }
    case 'START_ROUND': {
      if (state.phase !== 'question') return state;
      return { ...state, phase: 'board' };
    }
    case 'SUBMIT_ANSWER': {
      if (state.phase !== 'board' || state.animation?.isAnimating) return state;
      
      // Start the animation instead of immediately processing the answer
      return {
        ...state,
        animation: {
          isAnimating: true,
          currentHighlightRow: null,
          submittedAnswer: action.answerText,
          animationType: 'scanning'
        }
      };
    }
    
    case 'START_REVEAL_ANIMATION': {
      if (!state.animation?.isAnimating) return state;
      
      const round = state.rounds[state.currentRoundIndex];
      const unrevealedAnswers = round.answers
        .map((answer, index) => ({ answer, index }))
        .filter(({ answer }) => !answer.revealed)
        .reverse(); // Start from bottom
      
      if (unrevealedAnswers.length === 0) return state;
      
      // Start highlighting the bottom-most unrevealed row
      const firstRowIndex = unrevealedAnswers[0].index;
      return {
        ...state,
        animation: {
          ...state.animation,
          currentHighlightRow: firstRowIndex,
          animationType: 'scanning'
        }
      };
    }
    
    case 'HIGHLIGHT_ROW': {
      if (!state.animation?.isAnimating || state.animation.animationType !== 'scanning') return state;
      
      const round = state.rounds[state.currentRoundIndex];
      const submittedAnswer = state.animation.submittedAnswer;
      const currentRow = action.rowIndex;
      const currentAnswer = round.answers[currentRow];
      
      // Check if this row matches the submitted answer using fuzzy matching
      if (isAnswerAcceptable(submittedAnswer, currentAnswer.text)) {
        // Found a match! Start success animation
        return {
          ...state,
          animation: {
            ...state.animation,
            currentHighlightRow: currentRow,
            animationType: 'success'
          }
        };
      }
      
      // Check if this is the last unrevealed row to check
      const unrevealedAnswers = round.answers
        .map((answer, index) => ({ answer, index }))
        .filter(({ answer }) => !answer.revealed)
        .reverse();
        
      const currentRowPosition = unrevealedAnswers.findIndex(({ index }) => index === currentRow);
      const isLastRow = currentRowPosition === unrevealedAnswers.length - 1;
      
      if (isLastRow) {
        // No match found, trigger failure animation
        return {
          ...state,
          animation: {
            ...state.animation,
            currentHighlightRow: null,
            animationType: 'failure'
          }
        };
      }
      
      // Move to next row (going up the pyramid)
      const nextRowIndex = unrevealedAnswers[currentRowPosition + 1]?.index;
      return {
        ...state,
        animation: {
          ...state.animation,
          currentHighlightRow: nextRowIndex
        }
      };
    }
    
    case 'REVEAL_ANSWER_SUCCESS': {
      if (!state.animation?.isAnimating) return state;
      
      const round = state.rounds[state.currentRoundIndex];
      const answerIndex = action.answerIndex;
      
      // Update the answer as revealed and score
      const teams = state.teams.map((t) => {
        if (t.id !== state.currentTurnTeamId) return t;
        return { ...t, score: t.score + 1 };
      });
      
      const updatedRounds = state.rounds.map((r, idx) => {
        if (idx !== state.currentRoundIndex) return r;
        const newAnswers = r.answers.map((a, i) => 
          i === answerIndex ? { ...a, revealed: true } : a
        );
        return { ...r, answers: newAnswers };
      });
      
      const allRevealed = updatedRounds[state.currentRoundIndex].answers.every((a) => a.revealed);
      const activeTeams = teams.filter((t) => !t.eliminated);
      
      // Check if this is a pyramid completion (need to start celebration)
      const isPyramidComplete = allRevealed && !state.celebration?.isActive;
      
      return {
        ...state,
        teams,
        rounds: updatedRounds,
        // Only transition to summary if all revealed AND not celebrating
        phase: allRevealed && !isPyramidComplete ? 'summary' : state.phase,
        currentTurnTeamId: allRevealed ? state.currentTurnTeamId : nextTeamId({ ...state, teams }),
        // Start celebration if pyramid just completed
        celebration: isPyramidComplete ? {
          isActive: true,
          roundIndex: state.currentRoundIndex
        } : state.celebration,
        animation: {
          isAnimating: false,
          currentHighlightRow: null,
          submittedAnswer: '',
          animationType: null
        }
      };
    }
    
    case 'REVEAL_ANSWER_FAILURE': {
      if (!state.animation?.isAnimating) return state;
      
      // Deduct a life for incorrect answer
      const teams = state.teams.map((t) => {
        if (t.id !== state.currentTurnTeamId) return t;
        const livesRemaining = t.livesRemaining - 1;
        return { ...t, livesRemaining, eliminated: livesRemaining <= 0 };
      });
      
      const activeTeams = teams.filter((t) => !t.eliminated);
      const prematureEnd = activeTeams.length === 0;
      
      return {
        ...state,
        teams,
        phase: prematureEnd ? 'summary' : state.phase,
        currentTurnTeamId: prematureEnd ? state.currentTurnTeamId : nextTeamId({ ...state, teams }),
        animation: {
          isAnimating: false,
          currentHighlightRow: null,
          submittedAnswer: '',
          animationType: null
        }
      };
    }
    
    case 'END_ANIMATION': {
      return {
        ...state,
        animation: {
          isAnimating: false,
          currentHighlightRow: null,
          submittedAnswer: '',
          animationType: null
        }
      };
    }
    case 'ADVANCE_TURN': {
      if (state.phase !== 'board') return state;
      return { ...state, currentTurnTeamId: nextTeamId(state) };
    }
    case 'START_CELEBRATION': {
      return {
        ...state,
        celebration: {
          isActive: true,
          roundIndex: action.roundIndex
        }
      };
    }
    case 'END_CELEBRATION': {
      // When celebration ends, check if we should transition to summary
      const currentRound = state.rounds[state.currentRoundIndex];
      const allRevealed = currentRound?.answers.every((a) => a.revealed) ?? false;
      
      return {
        ...state,
        celebration: {
          isActive: false,
          roundIndex: -1
        },
        // Transition to summary if all answers are revealed
        phase: allRevealed ? 'summary' : state.phase
      };
    }
    case 'END_ROUND': {
      if (state.phase !== 'summary') return state;
      const nextIndex = state.currentRoundIndex + 1;
      const moreRounds = nextIndex < state.rounds.length;
      const activeTeamsRemain = state.teams.some((t) => !t.eliminated);
      
      if (!moreRounds || !activeTeamsRemain) {
        return { ...state, phase: 'ended' };
      }
      return {
        ...state,
        currentRoundIndex: moreRounds ? nextIndex : state.currentRoundIndex,
        phase: moreRounds ? 'question' : 'ended',
        currentTurnTeamId: moreRounds ? state.teams.find((t) => !t.eliminated)?.id || null : null,
        // Reset celebration state for new round
        celebration: {
          isActive: false,
          roundIndex: -1
        }
      };
    }
    case 'END_GAME': {
      return { ...state, phase: 'ended' };
    }
    case 'RESTORE_STATE': {
      const incoming = action.state;
      
      if (incoming.phase === 'ended') return state;
      
      // Validate that we have the required fields
      if (!incoming.teams || !Array.isArray(incoming.teams)) {
        // Invalid teams data in saved state
        return state;
      }
      
      if (!incoming.phase) {
        // Missing phase in saved state
        return state;
      }
      
      // If teams array is empty, this is likely an invalid save from initial state
      if (incoming.teams.length === 0) {
        // Saved state has no teams - likely saved too early
        return state;
      }
      
      // Basic team validation - ensure we have valid team objects
      const teams = incoming.teams.filter(t => {
        return t && typeof t === 'object' && t.name && t.id;
      });
      
      if (teams.length === 0) {
        // No valid teams in saved state after filtering
        return state;
      }
      
      // Create completely new state object
      const newState: GameState = {
        currentRoundIndex: typeof incoming.currentRoundIndex === 'number' ? incoming.currentRoundIndex : 0,
        currentTurnTeamId: incoming.currentTurnTeamId || teams[0]?.id || null,
        phase: incoming.phase,
        teams,
        rounds: incoming.rounds && Array.isArray(incoming.rounds) ? incoming.rounds : loadRounds(),
      };
      
      return newState;
    }
    default:
      return state;
  }
}