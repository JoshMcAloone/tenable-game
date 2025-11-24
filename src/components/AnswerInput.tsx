import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  onSubmitted?: () => void;
}

export default function AnswerInput({ onSubmitted }: Props) {
  const { submitAnswer, currentTurnTeamId, teams, dispatch, phase, animation } = useGame();
  const { t } = useLanguage();
  const activeTeam = teams.find((t) => t.id === currentTurnTeamId);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [currentTurnTeamId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || animation?.isAnimating) return; // Prevent submission during animation
    
    // Clear any previous feedback
    setFeedback(null);
    
    const result = submitAnswer(input);
    if (!result) return;
    
    // Handle immediate feedback for already revealed answers
    if (result.alreadyRevealed) {
      setFeedback(t('game.alreadyRevealed'));
      setInput('');
      if (phase === 'board') {
        dispatch({ type: 'ADVANCE_TURN' });
      }
      return;
    }
    
    // For new answers, clear input and the animation system will handle feedback
    setInput('');
    onSubmitted?.();
  }

  return (
    <div className="answer-input" aria-label="Submit answer form">
      {/* Current Team Indicator */}
      {activeTeam && (
        <div className="answer-input__team-indicator">
          <div className="answer-input__team-badge">
            <div className="answer-input__team-dot" />
            <span className="answer-input__team-name">
              {activeTeam.name}{t('game.turn')}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="answer-input__form">
        <div className="answer-input__row">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activeTeam ? t('game.enterAnswer') : t('game.noActiveTeam')}
            disabled={!activeTeam || animation?.isAnimating}
            className="answer-input__field"
            autoComplete="off"
            aria-disabled={!activeTeam || animation?.isAnimating}
            aria-label="Answer input"
          />
          <button
            type="submit"
            disabled={!activeTeam || !input.trim() || animation?.isAnimating}
            className={`answer-input__submit ${!activeTeam || !input.trim() || animation?.isAnimating ? 'answer-input__submit--disabled' : 'answer-input__submit--enabled'}`}
            aria-label="Submit answer"
          >
            {animation?.isAnimating ? t('game.checking') : t('game.submit')}
          </button>
        </div>

        {/* Feedback */}
        <div aria-live="polite" className="answer-input__feedback-container">
          {feedback && (
            <div className={`answer-input__feedback ${
              feedback === t('game.correct') 
                ? 'answer-input__feedback--correct'
                : feedback === t('game.alreadyRevealed')
                ? 'answer-input__feedback--info'
                : 'answer-input__feedback--error'
            }`}>
              {feedback}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}