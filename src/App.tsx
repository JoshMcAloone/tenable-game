import React, { useState } from 'react';
import { useGame } from './context/GameContext';
import { useLanguage } from './context/LanguageContext';
import { CustomRound, QuestionSet } from './types/domain';
import MainMenu from './components/MainMenu';
import GameSetup from './components/GameSetup';
import QuestionView from './components/QuestionView';
import BoardView from './components/BoardView';
import RoundSummary from './components/RoundSummary';
import RoundLibrary from './components/RoundLibrary';
import RoundCreator from './components/RoundCreator';
import RoundImporter from './components/RoundImporter';

type AppScreen = 'menu' | 'game' | 'library' | 'creator' | 'importer';

export default function App() {
  const { phase } = useGame();
  const { t } = useLanguage();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('menu');
  const [editingRoundId, setEditingRoundId] = useState<string | undefined>();

  // Handle navigation
  const handleStartGame = () => {
    setCurrentScreen('game');
  };

  const handleRoundLibrary = () => {
    setCurrentScreen('library');
  };

  const handleCreateRound = () => {
    setEditingRoundId(undefined);
    setCurrentScreen('creator');
  };

  const handleEditRound = (roundId: string) => {
    setEditingRoundId(roundId);
    setCurrentScreen('creator');
  };

  const handleImportRounds = () => {
    setCurrentScreen('importer');
  };

  const handleBackToMenu = () => {
    setCurrentScreen('menu');
    setEditingRoundId(undefined);
  };

  const handleRoundCreated = (round: CustomRound) => {
    setCurrentScreen('library');
    setEditingRoundId(undefined);
  };

  const handleRoundsImported = (importedRounds: CustomRound[]) => {
    setCurrentScreen('library');
  };

  // When in game mode, show game screens
  if (currentScreen === 'game') {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        {/* Back to menu button during setup */}
        {phase === 'setup' && (
          <div className="absolute top-4 left-4 z-50">
            <button
              onClick={handleBackToMenu}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
            >
              ← Back to Menu
            </button>
          </div>
        )}
        
        <main className="flex-1">
          {phase === 'setup' && <GameSetup />}
          {phase === 'question' && <QuestionView />}
          {phase === 'board' && <BoardView />}
          {phase === 'summary' && <RoundSummary />}
          {phase === 'ended' && (
            <div className="p-8 text-center space-y-4">
              <h2 className="text-3xl font-bold text-green-400 tracking-wider filter drop-shadow-[0_0_12px_rgba(57,255,20,0.8)]">
                {t('summary.gameOver')}
              </h2>
              <p className="text-cyan-300">{t('summary.thanksForPlaying')}</p>
              <button
                onClick={handleBackToMenu}
                className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Back to Menu
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Show appropriate screen based on current screen state
  switch (currentScreen) {
    case 'menu':
      return (
        <MainMenu
          onStartGame={handleStartGame}
          onRoundLibrary={handleRoundLibrary}
          onCreateRound={handleCreateRound}
          onImportRounds={handleImportRounds}
        />
      );

    case 'library':
      return (
        <div>
          {/* Back button */}
          <div className="absolute top-4 left-4 z-50">
            <button
              onClick={handleBackToMenu}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
            >
              ← Back to Menu
            </button>
          </div>
          
          <RoundLibrary
            onCreateNew={handleCreateRound}
            onEditRound={handleEditRound}
            onImportRounds={handleImportRounds}
          />
        </div>
      );

    case 'creator':
      return (
        <RoundCreator
          roundId={editingRoundId}
          onSave={handleRoundCreated}
          onCancel={handleBackToMenu}
        />
      );

    case 'importer':
      return (
        <RoundImporter
          onImportComplete={handleRoundsImported}
          onCancel={handleBackToMenu}
        />
      );

    default:
      return null;
  }
}
