import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { GameState, SubmitResult, Answer } from '../types/domain';
import { reducer, INITIAL_STATE, Action } from './gameReducer';
import { isAnswerAcceptable } from '../utils/fuzzyMatch';

interface GameContextValue extends GameState {
  dispatch: React.Dispatch<Action>;
  submitAnswer: (text: string) => SubmitResult | null;
}


const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // We now defer restore to explicit Resume action (no auto mutation here)

  useEffect(() => {
    // Don't persist the initial empty state
    if (state.phase === 'setup' && state.teams.length === 0) {
      return;
    }
    
    try {
      const serializable = { ...state, rounds: state.rounds };
      localStorage.setItem('tenable-game-state', JSON.stringify(serializable));
    } catch (e) {
      // Failed to persist state
    }
  }, [state]);

  function submitAnswer(text: string): SubmitResult | null {
    if (state.phase !== 'board') return null;
    const round = state.rounds[state.currentRoundIndex];
    const userInput = text.trim();
    
    // First check for exact matches (already revealed answers)
    const exactMatch = round.answers.find((a) => a.text.trim().toLowerCase() === userInput.toLowerCase());
    if (exactMatch && exactMatch.revealed) {
      dispatch({ type: 'SUBMIT_ANSWER', answerText: text });
      return { correct: false, alreadyRevealed: true, matchedAnswer: exactMatch };
    }
    
    // Find the best fuzzy match from unrevealed answers
    let bestMatch: Answer | undefined = undefined;
    let bestScore = 0;
    
    for (const answer of round.answers) {
      if (answer.revealed) continue; // Skip already revealed answers
      
      // Check if this answer is acceptable with fuzzy matching (including alternatives)
      if (isAnswerAcceptable(userInput, answer.text, 0.8, answer.alternativeText)) {
        bestMatch = answer;
        bestScore = 1; // We found an acceptable match
        break;
      }
    }
    
    const correct = !!bestMatch;
    dispatch({ type: 'SUBMIT_ANSWER', answerText: bestMatch ? bestMatch.text : text });
    return { correct, alreadyRevealed: false, matchedAnswer: bestMatch };
  }

  const value: GameContextValue = { ...state, dispatch, submitAnswer };
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}