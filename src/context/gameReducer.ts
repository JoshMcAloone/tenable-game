import { GameState, QuestionSet, Team, CustomRound } from '../types/domain';
import { INITIAL_LIVES } from '../constants';
import { loadRounds } from '../utils/loader';
import { isAnswerAcceptable } from '../utils/fuzzyMatch';

export type Action =
  | { type: 'START_GAME'; teams: Team[]; rounds?: (QuestionSet | CustomRound)[] }
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
  | { type: 'RESTORE_STATE'; state: GameState }
  | { type: 'UNDO_LAST_ACTION' };

export const INITIAL_STATE: GameState = {
  currentRoundIndex: -1,
  currentTurnTeamId: null,
  phase: 'setup',
  teams: [],
  rounds: loadRounds() as QuestionSet[],
  firstTeamRotationIndex: 0,
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
      const rounds = action.rounds || state.rounds;
      return { 
        ...state, 
        teams: action.teams, 
        rounds,
        phase: 'question', 
        currentRoundIndex: 0, 
        currentTurnTeamId: action.teams[0]?.id || null, 
        firstTeamRotationIndex: 0,
        roundSources: action.rounds ? {
          defaultRounds: action.rounds.some(r => !('metadata' in r)),
          customRounds: action.rounds.some(r => 'metadata' in r),
          selectedRoundIds: action.rounds.map(r => r.id)
        } : undefined
      };
    }
    case 'START_ROUND': {
      if (state.phase !== 'question') return state;
      return { 
        ...state, 
        phase: 'board',
        lastAction: undefined // Clear any undo action when starting new round
      };
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
      
      // Check if there are any unrevealed answers left
      const hasUnrevealedAnswers = round.answers.some(answer => !answer.revealed);
      
      if (!hasUnrevealedAnswers) {
        // No unrevealed answers left - immediate failure
        return {
          ...state,
          animation: {
            ...state.animation,
            currentHighlightRow: null,
            animationType: 'failure'
          }
        };
      }
      
      // Start highlighting from the bottom row (index 9)
      const bottomRowIndex = round.answers.length - 1;
      return {
        ...state,
        animation: {
          ...state.animation,
          currentHighlightRow: bottomRowIndex,
          animationType: 'scanning',
          checkedUnrevealedAnswers: [] // Track which unrevealed answers we've checked
        }
      };
    }
    
    case 'HIGHLIGHT_ROW': {
      if (!state.animation?.isAnimating || state.animation.animationType !== 'scanning') return state;
      
      const round = state.rounds[state.currentRoundIndex];
      const submittedAnswer = state.animation.submittedAnswer;
      const currentRow = action.rowIndex;
      const currentAnswer = round.answers[currentRow];
      
      // Track that we've checked this unrevealed answer
      const checkedAnswers = state.animation.checkedUnrevealedAnswers || [];
      const updatedCheckedAnswers = currentAnswer.revealed ? checkedAnswers : [...checkedAnswers, currentRow];
      
      // Check if this row matches the submitted answer and is not already revealed
      if (!currentAnswer.revealed && isAnswerAcceptable(submittedAnswer, currentAnswer.text, 0.8, currentAnswer.alternativeText)) {
        // Found the new correct answer! Start success animation
        return {
          ...state,
          animation: {
            ...state.animation,
            currentHighlightRow: currentRow,
            animationType: 'success',
            foundAnswerIndex: currentRow
          }
        };
      }
      
      // Move to the next row up (currentRow - 1)
      const nextRowIndex = currentRow - 1;
      
      if (nextRowIndex < 0) {
        // Reached the top without finding a match - trigger failure
        return {
          ...state,
          animation: {
            ...state.animation,
            currentHighlightRow: null,
            animationType: 'failure'
          }
        };
      }
      
      // Check if there are any unrevealed answers above the next position
      const hasUnrevealedAnswersAbove = round.answers
        .slice(0, nextRowIndex + 1) // Include nextRowIndex and all above it
        .some(answer => !answer.revealed);
      
      if (!hasUnrevealedAnswersAbove) {
        // No unrevealed answers above - we've checked all possible matches, trigger failure
        return {
          ...state,
          animation: {
            ...state.animation,
            currentHighlightRow: null,
            animationType: 'failure'
          }
        };
      }
      
      // Continue to next row
      return {
        ...state,
        animation: {
          ...state.animation,
          currentHighlightRow: nextRowIndex,
          checkedUnrevealedAnswers: updatedCheckedAnswers
        }
      };
    }
    
    case 'REVEAL_ANSWER_SUCCESS': {
      if (!state.animation?.isAnimating) return state;
      
      const round = state.rounds[state.currentRoundIndex];
      // Use the foundAnswerIndex from animation state, fallback to action.answerIndex for backward compatibility
      const answerIndex = state.animation.foundAnswerIndex ?? action.answerIndex;
      
      if (answerIndex === undefined) {
        // Fallback if no answer index found
        return state;
      }
      
      // Update the answer as revealed and score
      const teams = state.teams.map((t) => {
        if (t.id !== state.currentTurnTeamId) return t;
        return { ...t, score: t.score + 1 };
      });
      
      const currentTeam = teams.find(t => t.id === state.currentTurnTeamId);
      
      const updatedRounds = state.rounds.map((r, idx) => {
        if (idx !== state.currentRoundIndex) return r;
        const newAnswers = r.answers.map((a, i) => 
          i === answerIndex ? { 
            ...a, 
            revealed: true,
            foundBy: currentTeam ? {
              teamId: currentTeam.id,
              teamName: currentTeam.name
            } : undefined
          } : a
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
        },
        // Clear last action on successful answer
        lastAction: undefined
      };
    }
    
    case 'REVEAL_ANSWER_FAILURE': {
      if (!state.animation?.isAnimating) return state;
      
      const currentTeam = state.teams.find(t => t.id === state.currentTurnTeamId);
      if (!currentTeam) return state;
      
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
        },
        // Track last incorrect action for undo functionality
        lastAction: {
          type: 'incorrect_answer',
          teamId: state.currentTurnTeamId!,
          answerText: state.animation.submittedAnswer,
          timestamp: Date.now()
        }
      };
    }
    
    case 'UNDO_LAST_ACTION': {
      if (!state.lastAction || state.lastAction.type !== 'incorrect_answer') return state;
      
      // Only allow undo within 30 seconds and not during animations
      const timeSinceAction = Date.now() - state.lastAction.timestamp;
      if (timeSinceAction > 30000 || state.animation?.isAnimating) return state;
      
      // Restore life to the team that made the incorrect answer
      const teams = state.teams.map((t) => {
        if (t.id !== state.lastAction!.teamId) return t;
        const livesRemaining = t.livesRemaining + 1;
        return { 
          ...t, 
          livesRemaining, 
          eliminated: false // Remove elimination since they got a life back
        };
      });
      
      return {
        ...state,
        teams,
        currentTurnTeamId: state.lastAction.teamId, // Give turn back to the team
        phase: 'board', // Ensure we're back in board phase
        lastAction: undefined // Clear the undo action
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
      
      if (!moreRounds) {
        return { ...state, phase: 'ended' };
      }
      
      // Reset all teams' lives and elimination status for the new round
      const teamsWithResetLives = state.teams.map(team => ({
        ...team,
        livesRemaining: INITIAL_LIVES,
        eliminated: false // Reset elimination status for new round
      }));
      
      // Calculate next starting team using rotation
      const nextFirstTeamIndex = (state.firstTeamRotationIndex + 1) % state.teams.length;
      const nextStartingTeamId = teamsWithResetLives[nextFirstTeamIndex]?.id || null;
      
      return {
        ...state,
        teams: teamsWithResetLives,
        currentRoundIndex: nextIndex,
        phase: 'question',
        currentTurnTeamId: nextStartingTeamId,
        firstTeamRotationIndex: nextFirstTeamIndex,
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
        firstTeamRotationIndex: typeof incoming.firstTeamRotationIndex === 'number' ? incoming.firstTeamRotationIndex : 0,
      };
      
      return newState;
    }
    default:
      return state;
  }
}