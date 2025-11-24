import { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { soundEffects } from '../utils/soundEffects';

export function useProgressiveReveal() {
  const { animation, dispatch, rounds, currentRoundIndex } = useGame();
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if (!animation?.isAnimating) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Start the animation sequence
    if (animation.animationType === 'scanning' && animation.currentHighlightRow === null) {
      // Initialize the scanning
      timeoutRef.current = setTimeout(() => {
        dispatch({ type: 'START_REVEAL_ANIMATION', answerText: animation.submittedAnswer });
      }, 300); // Short delay before starting
    }
    
    // Handle row-by-row scanning
    if (animation.animationType === 'scanning' && animation.currentHighlightRow !== null) {
      // Get total answers for pitch progression calculation
      const currentRound = rounds[currentRoundIndex];
      const totalSteps = currentRound?.answers.length || 10;
      
      // Since scanning goes from bottom (highest index) to top (index 0),
      // we need to invert the step calculation for ascending pitch
      const invertedStep = totalSteps - 1 - animation.currentHighlightRow;
      
      // Play highlight sound with progressive pitch increase
      soundEffects.playRowHighlight(invertedStep, totalSteps);
      
      timeoutRef.current = setTimeout(() => {
        dispatch({ type: 'HIGHLIGHT_ROW', rowIndex: animation.currentHighlightRow! });
      }, 500); // Slightly faster scanning for more drama
    }
    
    // Handle success animation
    if (animation.animationType === 'success' && animation.currentHighlightRow !== null) {
      // Play success sound immediately
      soundEffects.playSuccess();
      
      timeoutRef.current = setTimeout(() => {
        dispatch({ type: 'REVEAL_ANSWER_SUCCESS', answerIndex: animation.currentHighlightRow! });
      }, 800); // Much faster success reveal for emphasis
    }
    
    // Handle failure animation
    if (animation.animationType === 'failure') {
      // Play failure sound
      soundEffects.playFailure();
      
      timeoutRef.current = setTimeout(() => {
        dispatch({ type: 'REVEAL_ANSWER_FAILURE' });
      }, 1500); // Longer failure animation for more drama
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [animation, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return null; // This hook doesn't render anything
}