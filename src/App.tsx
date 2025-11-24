import React from 'react';
import { useGame } from './context/GameContext';
import { useLanguage } from './context/LanguageContext';
import GameSetup from './components/GameSetup';
import QuestionView from './components/QuestionView';
import BoardView from './components/BoardView';
import RoundSummary from './components/RoundSummary';

export default function App() {
  const { phase } = useGame();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <main className="flex-1">
        {phase === 'setup' && <GameSetup />}
        {phase === 'question' && <QuestionView />}
        {phase === 'board' && <BoardView />}
        {phase === 'summary' && <RoundSummary />}
        {phase === 'ended' && (
          <div className="p-8 text-center space-y-4">
            <h2 className="text-3xl font-bold text-green-400 tracking-wider filter drop-shadow-[0_0_12px_rgba(57,255,20,0.8)]">{t('summary.gameOver')}</h2>
            <p className="text-cyan-300">{t('summary.thanksForPlaying')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
