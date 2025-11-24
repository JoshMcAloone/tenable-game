/**
 * Hook for managing pyramid completion celebration
 * Triggers fireworks and grand fanfare when all answers are revealed
 */

import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { fireworks } from '../utils/fireworks-simple';
import { soundEffects } from '../utils/soundEffects';

export function usePyramidCelebration() {
  const { rounds, currentRoundIndex, phase, celebration, dispatch } = useGame();
  const [localCelebrating, setLocalCelebrating] = useState(false);

  useEffect(() => {
    // Check if celebration just started for this round
    if (celebration?.isActive && 
        celebration.roundIndex === currentRoundIndex && 
        !localCelebrating) {
      
      setLocalCelebrating(true);
      
      // Start celebration immediately
      setTimeout(() => {
        triggerPyramidCelebration();
        
        // End celebration after 6 seconds and dispatch end action
        setTimeout(() => {
          setLocalCelebrating(false);
          dispatch({ type: 'END_CELEBRATION' });
        }, 6000);
      }, 1200); // Delay to let the success animation complete first
    }
    
    // Reset local state when celebration ends or round changes
    if (!celebration?.isActive || celebration.roundIndex !== currentRoundIndex) {
      setLocalCelebrating(false);
    }
  }, [celebration, currentRoundIndex, localCelebrating, dispatch]);

  return { isCelebrating: localCelebrating };
}

function triggerPyramidCelebration(): void {
  // Start grand fanfare
  soundEffects.playPyramidComplete();
  
  // Start fireworks display
  fireworks.start();
}