import { useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundEffects } from '../utils/soundEffects';

export function useProgressiveReveal() {
  const { animation, dispatch, rounds, currentRoundIndex, teams, currentTurnTeamId } = useGame();
  const timeoutRef = useRef<number>();
  const isProcessingRef = useRef<boolean>(false);
  const heartbeatIntervalRef = useRef<number>();

  // Get current round and calculate suspense factors
  const currentRound = rounds[currentRoundIndex];
  const unrevealedCount = currentRound?.answers.filter(a => !a.revealed).length || 0;
  const totalAnswers = currentRound?.answers.length || 1;
  
  // Find the active team using currentTurnTeamId or fallback to first non-eliminated team
  const activeTeam = currentTurnTeamId 
    ? teams.find(team => team.id === currentTurnTeamId)
    : teams.find(team => !team.eliminated) || teams[0];
  
  const livesRemaining = activeTeam?.livesRemaining || 3;
  const maxLives = 3; // Assuming teams start with 3 lives
  const hasLostLives = livesRemaining < maxLives;
  
  // Global suspense: only when 4 or fewer unrevealed answers remain
  const isGlobalSuspense = unrevealedCount <= 4;
  
  // Calculate dynamic timing based on suspense factors
  const calculateTiming = () => {
    const baseTiming = {
      INITIAL_DELAY: 200,
      SCAN_INTERVAL: 400,
      SUCCESS_REVEAL: 600,
      FAILURE_REVEAL: 1200
    };
    
    let suspenseMultiplier = 1.0;
    
    // Team-level suspense: apply when active team has lost lives
    if (hasLostLives) {
      // Lives multiplier: 2 lives = 1.3x slower, 1 life = 1.6x slower
      const livesMultiplier = 1.0 + ((maxLives - livesRemaining) * 0.3);
      suspenseMultiplier *= livesMultiplier;
    }
    
    // Global suspense: only when 4 or fewer answers remain
    if (isGlobalSuspense) {
      // Answers multiplier: gets slower as fewer remain (4 answers = 1.1x, 1 answer = 1.4x)
      const answersMultiplier = 1.0 + ((4 - unrevealedCount) * 0.1);
      suspenseMultiplier *= answersMultiplier;
    }
    
    return {
      INITIAL_DELAY: Math.round(baseTiming.INITIAL_DELAY * suspenseMultiplier),
      SCAN_INTERVAL: Math.round(baseTiming.SCAN_INTERVAL * suspenseMultiplier),
      SUCCESS_REVEAL: baseTiming.SUCCESS_REVEAL,
      FAILURE_REVEAL: baseTiming.FAILURE_REVEAL,
      HEARTBEAT_INTERVAL: livesRemaining === 1 ? 2000 : 1600 // Faster heartbeat when critical
    };
  };
  
  const TIMING = calculateTiming();
  
  // Check if heartbeat should be active (when active team has exactly 1 life remaining AND no animation)
  const shouldPlayHeartbeat = activeTeam && livesRemaining === 1 && !animation?.isAnimating;
  
  // Memoized sound playing functions to prevent recreation
  const playRowSound = useCallback((invertedStep: number, totalSteps: number) => {
    // Use requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      soundEffects.playRowHighlight(invertedStep, totalSteps);
    });
  }, []);

  const playSuccessSound = useCallback(() => {
    requestAnimationFrame(() => {
      soundEffects.playSuccess();
    });
  }, []);

  const playFailureSound = useCallback(() => {
    requestAnimationFrame(() => {
      soundEffects.playFailure();
    });
  }, []);

  // Manage background heartbeat when team has 1 life remaining
  useEffect(() => {
    if (shouldPlayHeartbeat) {
      // Start heartbeat immediately
      soundEffects.playHeartbeat();
      
      // Set up repeating heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
        if (activeTeam && livesRemaining === 1) {
          soundEffects.playHeartbeat();
        } else {
          // Stop heartbeat if conditions change
          if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = undefined;
          }
        }
      }, TIMING.HEARTBEAT_INTERVAL);
    } else {
      // Stop heartbeat when not needed
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = undefined;
      }
    }
    
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = undefined;
      }
    };
  }, [shouldPlayHeartbeat, livesRemaining, TIMING.HEARTBEAT_INTERVAL, activeTeam, animation?.isAnimating]);

  useEffect(() => {
    if (!animation?.isAnimating || isProcessingRef.current) {
      // Reset processing flag if animation stopped
      if (!animation?.isAnimating) {
        isProcessingRef.current = false;
      }
      return;
    }

    // Clear any existing timeout to prevent overlapping animations
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    // Mark as processing to prevent race conditions
    isProcessingRef.current = true;

    // Start the animation sequence
    if (animation.animationType === 'scanning' && animation.currentHighlightRow === null) {
      // Initialize the scanning with optimized delay
      timeoutRef.current = setTimeout(() => {
        // Triple-check animation is still active and unchanged
        if (animation?.isAnimating && animation.animationType === 'scanning' && animation.currentHighlightRow === null) {
          dispatch({ type: 'START_REVEAL_ANIMATION', answerText: animation.submittedAnswer });
        }
        isProcessingRef.current = false;
      }, TIMING.INITIAL_DELAY);
      return;
    }
    
    // Handle row-by-row scanning
    if (animation.animationType === 'scanning' && animation.currentHighlightRow !== null) {
      const currentRound = rounds[currentRoundIndex];
      if (!currentRound) {
        isProcessingRef.current = false;
        return;
      }
      
      const totalSteps = currentRound.answers.length;
      const invertedStep = totalSteps - 1 - animation.currentHighlightRow;
      
      // Play sound immediately for better responsiveness
      playRowSound(invertedStep, totalSteps);
      
      timeoutRef.current = setTimeout(() => {
        // Verify animation state hasn't changed during timeout
        if (animation?.isAnimating && 
            animation.animationType === 'scanning' && 
            animation.currentHighlightRow === animation.currentHighlightRow) {
          dispatch({ type: 'HIGHLIGHT_ROW', rowIndex: animation.currentHighlightRow! });
        }
        isProcessingRef.current = false;
      }, TIMING.SCAN_INTERVAL);
      return;
    }
    
    // Handle success animation
    if (animation.animationType === 'success' && animation.currentHighlightRow !== null) {
      // Play success sound immediately
      playSuccessSound();
      
      timeoutRef.current = setTimeout(() => {
        if (animation?.isAnimating) {
          dispatch({ type: 'REVEAL_ANSWER_SUCCESS', answerIndex: animation.currentHighlightRow! });
        }
        isProcessingRef.current = false;
      }, TIMING.SUCCESS_REVEAL);
      return;
    }
    
    // Handle failure animation
    if (animation.animationType === 'failure') {
      // Play failure sound immediately
      playFailureSound();
      
      timeoutRef.current = setTimeout(() => {
        if (animation?.isAnimating) {
          dispatch({ type: 'REVEAL_ANSWER_FAILURE' });
        }
        isProcessingRef.current = false;
      }, TIMING.FAILURE_REVEAL);
      return;
    }

    // Reset processing flag if no conditions matched
    isProcessingRef.current = false;

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = undefined;
      }
      isProcessingRef.current = false;
    };
  }, [animation, dispatch, rounds, currentRoundIndex, playRowSound, playSuccessSound, playFailureSound, teams, shouldPlayHeartbeat, hasLostLives, isGlobalSuspense]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = undefined;
      }
      isProcessingRef.current = false;
    };
  }, []);

  return null; // This hook doesn't render anything
}