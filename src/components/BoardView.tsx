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
  const { rounds, currentRoundIndex, teams, currentTurnTeamId, dispatch, animation } = useGame();
  const { t } = useLanguage();
  
  // Initialize the animation system
  useProgressiveReveal();
  
  // Initialize pyramid completion celebration
  usePyramidCelebration();
  
  const round = rounds[currentRoundIndex];

  // Component for individual answer with overflow detection
  const AnswerWithTooltip = ({ answer, tierNumber }: { answer: any, tierNumber: number }) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      if (textRef.current && answer.revealed) {
        const element = textRef.current;
        setIsOverflowing(element.scrollWidth > element.clientWidth);
      }
    }, [answer.text, answer.revealed]);
    
    if (!answer.revealed) {
      return <div className="answer-slot-number">{tierNumber}</div>;
    }
    
    const content = (
      <div className="answer-content answer-tooltip-trigger">
        <div className="answer-text" ref={textRef}>
          {answer.text}
        </div>
      </div>
    );
    
    if (isOverflowing) {
      return (
        <Tippy 
          content={answer.text}
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
  const activeCount = teams.length - eliminatedCount;
  const revealedCount = round.answers.filter((a) => a.revealed).length;

  return (
    <div className="min-h-screen flex flex-col bg-black lg:mx-20"> {/* Add horizontal margins on large screens */}
      {/* Neon header */}
      <div className="bg-black border-b border-cyan-400 text-white px-4 py-3 shadow-lg shadow-cyan-400/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-baseline gap-4">
            <h1 className="text-2xl font-bold leading-none text-green-400 tracking-wider filter drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">{t('game.title')}</h1>
            <p className="text-sm font-semibold text-cyan-300">{t('game.round')} {currentRoundIndex + 1}</p>
          </div>
          <div className="text-right text-sm leading-tight">
            <p className="font-bold text-lg text-green-400">{revealedCount}/{round.answers.length}</p>
            <p className="font-medium text-cyan-300">{t('game.found')}</p>
          </div>
        </div>
      </div>
      {/* Question */}
      <div className="px-4 py-3 text-center bg-black border-b border-purple-600 shadow-lg shadow-purple-600/20">
        <h2 className="text-lg md:text-xl font-bold text-white tracking-wide" title={round.questionText}>{round.questionText}</h2>
      </div>
      {/* Main area with flanking panels */}
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
        
        {/* Central Game Board - Compact Layout */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 bg-black overflow-hidden">
          {/* Board & Input Container */}
          <div className="flex-1 flex flex-col justify-center items-center space-y-4 min-h-0">
            {/* Pyramid Board - CSS Classes */}
            <div className={`pyramid-container ${animation?.animationType === 'failure' ? 'pyramid-container--failure' : ''}`}>
              
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
                    
                    // Smart width calculation: constrain top rows for ellipsis, give bottom rows full width
                    let widthPercent;
                    if (tierNumber <= 3) {
                      // Top 3 rows: small width to force ellipsis for long text
                      widthPercent = 40 + (tierNumber - 1) * 10; // 40%, 50%, 60%
                    } else {
                      // Bottom rows: generous width, no ellipsis needed
                      widthPercent = 60 + ((tierNumber - 3) / (totalAnswers - 3)) * 30; // 60% to 90%
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
            
            {/* Answer Input - Compact */}
            <div className="w-full max-w-lg bg-black border border-cyan-400 rounded-md p-3 shadow-lg shadow-cyan-400/20">
              <AnswerInput />
            </div>
          </div>
          
          {/* Teams Sidebar - Compact */}
          <div className="w-full md:w-64 flex flex-col gap-2">
            <div className="bg-black border border-green-400 rounded-md p-2 shadow-lg shadow-green-400/20">
              <h3 className="font-bold text-green-400 text-center text-sm tracking-wider filter drop-shadow-[0_0_6px_rgba(57,255,20,0.8)]">{t('setup.teamNames')}</h3>
            </div>
            
            <div className="flex-1 space-y-2 overflow-y-auto max-h-96">
              {teams.map((team) => (
                <TeamPanel key={team.id} team={team} active={team.id === currentTurnTeamId} />
              ))}
            </div>
            
            <div className="bg-black border border-cyan-400 rounded-md p-3 shadow-lg shadow-cyan-400/20">
              <div className="text-center mb-2">
                <div className="font-medium text-cyan-300 text-xs tracking-wider">{t('ui.status')}</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-white text-xs">
                <div className="text-center">
                  <div className="font-bold text-green-400 text-sm">{revealedCount}</div>
                  <div className="opacity-70 text-xs">{t('game.found')}</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-400 text-sm">{round.answers.length - revealedCount}</div>
                  <div className="opacity-70 text-xs">{t('game.remain')}</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-cyan-400 text-sm">{activeCount}</div>
                  <div className="opacity-70 text-xs">{t('game.active')}</div>
                </div>
              </div>
              {allRevealed && (
                <button
                  onClick={() => dispatch({ type: 'END_ROUND' })}
                  className="w-full mt-3 px-3 py-2 bg-green-400 text-black font-bold rounded-md text-xs tracking-wider shadow-lg shadow-green-400/50 hover:scale-105 transition filter drop-shadow-[0_0_8px_rgba(57,255,20,0.8)] cursor-pointer"
                >
                  {t('game.endRound')}
                </button>
              )}
            </div>
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