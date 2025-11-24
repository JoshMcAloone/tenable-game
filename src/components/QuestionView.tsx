import React from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

export default function QuestionView() {
  const { rounds, currentRoundIndex, dispatch } = useGame();
  const { t } = useLanguage();
  const round = rounds[currentRoundIndex];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-black">
      <div className="max-w-4xl w-full space-y-8 slide-in">
        {/* Round Header */}
        <div className="bg-black border border-green-400 text-white px-8 py-4 rounded-md shadow-lg shadow-green-400/30">
          <h1 className="text-4xl font-bold tracking-wider text-green-400 filter drop-shadow-[0_0_12px_rgba(57,255,20,0.8)]">{t('game.title')}</h1>
          <p className="text-xl font-semibold mt-2 text-cyan-300 tracking-wide">{t('game.round')} {currentRoundIndex + 1}</p>
        </div>

        {/* Question Display */}
        <div className="bg-black border border-purple-600 rounded-md p-12 shadow-lg shadow-purple-600/30">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-8 tracking-wide">
            {round.questionText}
          </h2>
          
          <div className="text-lg text-cyan-300 mb-8 font-mono tracking-wider">
            {t('game.findAll')} <span className="text-green-400 font-bold filter drop-shadow-[0_0_8px_rgba(57,255,20,0.6)]">{round.answers.length}</span> {t('game.answers')}
          </div>

          <button
            onClick={() => dispatch({ type: 'START_ROUND' })}
            className="px-12 py-4 bg-green-400 hover:bg-green-300 text-black text-xl font-bold rounded-md shadow-lg transform transition-all duration-200 hover:scale-105 tracking-wider shadow-green-400/50 cursor-pointer"
            style={{ filter: 'drop-shadow(0 0 15px rgba(57,255,20,0.8))' }}
          >
            {t('game.beginRound')}
          </button>
        </div>

        {/* Game Show Branding */}
        <div className="text-center text-white/60">
          <p className="text-sm font-medium tracking-wider">{t('game.canYouFind')}</p>
        </div>
      </div>
    </div>
  );
}