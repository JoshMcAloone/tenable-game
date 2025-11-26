import React, { useRef, useEffect, useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { useProgressiveReveal } from '../hooks/useProgressiveReveal';
import { usePyramidCelebration } from '../hooks/usePyramidCelebration';
import TeamPanel from './TeamPanel';
import AnswerInput from './AnswerInput';
import '../styles/board-view.css';

export default function BoardView() {
  const { rounds, currentRoundIndex, teams, currentTurnTeamId, dispatch, animation, lastAction } = useGame();
  const { t } = useLanguage();
  
  // Initialize the animation system
  useProgressiveReveal();
  
  // Initialize pyramid completion celebration
  usePyramidCelebration();
  
  const round = rounds[currentRoundIndex];

  // Component for individual answer with smart additional text prioritization
  const AnswerWithTooltip = ({ answer, tierNumber }: { answer: any, tierNumber: number }) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const mainTextRef = useRef<HTMLSpanElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      if (mainTextRef.current && containerRef.current && answer.revealed) {
        const mainTextOverflowing = mainTextRef.current.scrollWidth > mainTextRef.current.clientWidth;
        const containerOverflowing = containerRef.current.scrollWidth > containerRef.current.clientWidth;
        setIsOverflowing(mainTextOverflowing || containerOverflowing);
      }
    }, [answer.text, answer.additionalText, answer.revealed]);
    
    if (!answer.revealed) {
      const clueText = answer.clue || tierNumber.toString();
      return <div className="answer-slot-number">{clueText}</div>;
    }
    
    const content = (
      <div className="answer-content answer-tooltip-trigger" ref={containerRef}>
        <div className="answer-text">
          <span className="main-answer-text" ref={mainTextRef}>{answer.text}</span>
          {answer.additionalText && (
            <span className="answer-additional-text"> ({answer.additionalText})</span>
          )}
        </div>
      </div>
    );
    
    if (isOverflowing) {
      const tooltipContent = (
        <div className="tooltip-content">
          <div>{answer.text}</div>
          {answer.additionalText && (
            <div className="tooltip-additional">({answer.additionalText})</div>
          )}
        </div>
      );
      return (
        <Tippy 
          content={tooltipContent}
          theme="neon"
          animation="fade"
          duration={200}
          arrow={true}
          placement="top"
        >
          {content}
        </Tippy>
      );
    }
    
    return content;
  };

  const allRevealed = round.answers.every((a) => a.revealed);
  const eliminatedCount = teams.filter((t) => t.eliminated).length;
  const revealedCount = round.answers.filter((a) => a.revealed).length;

  return (
    <div className="board-view">
      {/* Compact header with better layout */}
      <div className="board-header">
        <div className="board-header__container">
          <div className="board-header__left">
            <h1 className="board-header__title">{t('game.title')}</h1>
            <div className="board-header__info">
              <span className="board-header__round">{t('game.round')} {currentRoundIndex + 1}</span>
              <span className="board-header__separator">•</span>
              <span className="board-header__progress">{revealedCount}/{round.answers.length} {t('game.found')}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Question with better integration */}
      <div className="board-question">
        <h2 className="board-question__text" title={round.questionText}>{round.questionText}</h2>
      </div>
      {/* Main area with optimized layout */}
      <div className="board-main">
        {/* Left Status Panel */}
        <div className="status-panel status-panel--left">
          <div className="status-panel__container">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className={`status-panel__bar ${i % 3 === 0 ? 'status-panel__bar--primary' : 'status-panel__bar--secondary'}`}
                style={{
                  width: `${60 + Math.random() * 40}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Central Game Board - Optimized Layout */}
        <div className="board-content">
          {/* Board & Input Container */}
          <div className="board-game-area">
            {/* Pyramid Board - Enhanced Layout */}
            <div className={`pyramid-container w-full ${animation?.animationType === 'failure' ? 'pyramid-container--failure' : ''}`}>
              
              {/* Broken Heart Overlay for Life Lost */}
              {animation?.animationType === 'failure' && (
                <div className="heart-overlay">
                  <div className="heart-wrapper">
                    <div className="heart-split left-half"></div>
                    <div className="heart-split right-half"></div>

                    <svg className="crack-svg" viewBox="0 0 100 150">
                      <polyline 
                        points="50,10 45,25 55,45 47,65 53,85 48,105 52,125 50,145"
                        className="crack-line"
                      />
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Main Pyramid Structure */}
              <div className="pyramid-main">
                {/* Top Green Block */}
                <div className="pyramid-top-block" />
                
                {/* Answer Tiers */}
                <div className="pyramid-answers-container">
                  {round.answers.map((answer, idx) => {
                    const tierNumber = idx + 1;
                    const totalAnswers = round.answers.length;
                    const progressRatio = tierNumber / totalAnswers;
                    
                    // Width progression for optimized pyramid space
                    let widthPercent;
                    if (tierNumber <= 3) {
                      widthPercent = 70 + (tierNumber - 1) * 8; // 70%, 78%, 86%
                    } else if (tierNumber <= 6) {
                      widthPercent = 86 + (tierNumber - 3) * 3; // 89%, 92%, 95%
                    } else {
                      widthPercent = 95;
                    }
                    
                    // Determine animation class for this tier
                    let animationClass = '';
                    if (animation?.isAnimating) {
                      if (animation.currentHighlightRow === idx && animation.animationType === 'scanning') {
                        animationClass = 'answer-tier--highlighting';
                      } else if (animation.currentHighlightRow === idx && animation.animationType === 'success') {
                        animationClass = 'answer-tier--success';
                      }
                    }
                    
                    return (
                      <div
                        key={idx}
                        className={`answer-tier ${answer.revealed ? 'answer-tier--revealed' : ''} ${animationClass}`}
                        style={{ width: `${widthPercent}%` }}
                      >
                        <div className={`answer-slot ${answer.revealed ? 'answer-slot--revealed' : 'answer-slot--unrevealed'}`}>
                          <AnswerWithTooltip answer={answer} tierNumber={tierNumber} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Bottom Green Block */}
                <div className="pyramid-bottom-block" />
              </div>
            </div>
            
            {/* Answer Input - Prominent and Clean */}
            <div className="board-input-area">
              <AnswerInput />
            </div>
          </div>
          
          {/* Teams Sidebar - Streamlined */}
          <div className="board-sidebar">
            <div className="board-sidebar__header">
              <h3 className="board-sidebar__title">{t('setup.teamNames')}</h3>
            </div>
            
            <div className="board-sidebar__teams">
              {teams.map((team) => (
                <TeamPanel 
                  key={team.id} 
                  team={team} 
                  active={team.id === currentTurnTeamId} 
                  isAnimating={animation?.isAnimating}
                />
              ))}
            </div>
            
            {allRevealed && (
              <div className="board-sidebar__end-round">
                <button
                  onClick={() => dispatch({ type: 'END_ROUND' })}
                  className="board-end-round-button"
                >
                  {t('game.endRound')}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Status Panel */}
        <div className="status-panel status-panel--right">
          <div className="status-panel__container">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className={`status-panel__bar ${i % 3 === 0 ? 'status-panel__bar--primary' : 'status-panel__bar--secondary'}`}
                style={{
                  width: `${60 + Math.random() * 40}%`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}