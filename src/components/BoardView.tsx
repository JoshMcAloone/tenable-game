import React, { useRef, useEffect, useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { useProgressiveReveal } from '../hooks/useProgressiveReveal';
import { usePyramidCelebration } from '../hooks/usePyramidCelebration';
import TeamPanel from './TeamPanel';
import AnswerInput from './AnswerInput';

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
    <div className="min-h-screen flex flex-col bg-black">
      {/* Compact header with better layout */}
      <div className="bg-black border-b border-cyan-400 text-white px-6 py-3 shadow-lg shadow-cyan-400/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-green-400 tracking-wider filter drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">{t('game.title')}</h1>
            <div className="text-cyan-300">
              <span className="text-sm font-medium">{t('game.round')} {currentRoundIndex + 1}</span>
              <span className="mx-2">•</span>
              <span className="text-sm font-bold text-green-400">{revealedCount}/{round.answers.length} {t('game.found')}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Question with better integration */}
      <div className="px-6 py-4 text-center bg-black border-b border-purple-600 shadow-lg shadow-purple-600/20">
        <h2 className="text-xl font-bold text-white tracking-wide max-w-4xl mx-auto" title={round.questionText}>{round.questionText}</h2>
      </div>
      {/* Main area with optimized layout */}
      <div className="flex-1 flex max-w-full w-full mx-auto overflow-hidden">
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
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 bg-black overflow-hidden max-w-7xl mx-auto">
          {/* Board & Input Container */}
          <div className="flex-1 flex flex-col justify-center items-center min-h-0">
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
            <div className="w-full max-w-2xl mt-6">
              <AnswerInput />
            </div>
          </div>
          
          {/* Teams Sidebar - Streamlined */}
          <div className="w-full lg:w-80 flex flex-col">
            <div className="bg-black border border-green-400 rounded-lg p-3 mb-4 shadow-lg shadow-green-400/20">
              <h3 className="font-bold text-green-400 text-center tracking-wider filter drop-shadow-[0_0_6px_rgba(57,255,20,0.8)]">{t('setup.teamNames')}</h3>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[60vh]">
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
              <div className="bg-black border border-green-400 rounded-lg p-4 mt-4 shadow-lg shadow-green-400/30">
                <button
                  onClick={() => dispatch({ type: 'END_ROUND' })}
                  className="w-full px-4 py-3 bg-green-400 text-black font-bold rounded-lg tracking-wider shadow-lg shadow-green-400/50 hover:scale-105 transition filter drop-shadow-[0_0_8px_rgba(57,255,20,0.8)] cursor-pointer"
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