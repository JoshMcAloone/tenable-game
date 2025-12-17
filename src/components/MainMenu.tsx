import React from 'react';
import { getAllCustomRounds, getStorageStats } from '../utils/roundManager';

interface MainMenuProps {
  onStartGame: () => void;
  onRoundLibrary: () => void;
  onCreateRound: () => void;
  onImportRounds: () => void;
}

export default function MainMenu({ onStartGame, onRoundLibrary, onCreateRound, onImportRounds }: MainMenuProps) {
  const customRounds = getAllCustomRounds();
  const storageStats = getStorageStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto">
        {/* Game Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Tenable
          </h1>
          <p className="text-xl text-gray-300">
            The ultimate quiz game experience
          </p>
        </div>

        {/* Main Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Start Game */}
          <div 
            onClick={onStartGame}
            className="group bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 p-8 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🎮</div>
              <div className="text-sm bg-green-800/50 px-3 py-1 rounded-full">
                Play Now
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Start Game</h3>
            <p className="text-green-100">
              Begin a new quiz game with your teams. Choose from default rounds or your custom creations.
            </p>
          </div>

          {/* Round Library */}
          <div 
            onClick={onRoundLibrary}
            className="group bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 p-8 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📚</div>
              <div className="text-sm bg-blue-800/50 px-3 py-1 rounded-full">
                {customRounds.length} rounds
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Round Library</h3>
            <p className="text-blue-100">
              Browse, edit, and manage your custom rounds. Export and share your favorites.
            </p>
          </div>

          {/* Create Round */}
          <div 
            onClick={onCreateRound}
            className="group bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 p-8 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">✨</div>
              <div className="text-sm bg-purple-800/50 px-3 py-1 rounded-full">
                Create
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Create Round</h3>
            <p className="text-purple-100">
              Design your own custom quiz rounds with questions and answers.
            </p>
          </div>

          {/* Import Rounds */}
          <div 
            onClick={onImportRounds}
            className="group bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 p-8 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📥</div>
              <div className="text-sm bg-orange-800/50 px-3 py-1 rounded-full">
                Import
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Import Rounds</h3>
            <p className="text-orange-100">
              Import custom rounds from files shared by others or exported from other games.
            </p>
          </div>
        </div>

        {/* Statistics */}
        {customRounds.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
            <h4 className="font-bold text-lg mb-4 text-center">Your Library</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">{customRounds.length}</div>
                <div className="text-sm text-gray-400">Custom Rounds</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {customRounds.reduce((sum, round) => sum + round.answers.length, 0)}
                </div>
                <div className="text-sm text-gray-400">Total Answers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {customRounds.reduce((sum, round) => sum + round.metadata.playCount, 0)}
                </div>
                <div className="text-sm text-gray-400">Times Played</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {(storageStats.used / 1024).toFixed(1)} KB
                </div>
                <div className="text-sm text-gray-400">Storage Used</div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state for new users */}
        {customRounds.length === 0 && (
          <div className="text-center py-8 bg-gray-800/30 rounded-lg border border-gray-700">
            <div className="text-4xl mb-4">🚀</div>
            <h4 className="font-bold text-lg mb-2">Welcome to Tenable!</h4>
            <p className="text-gray-400 mb-4">
              Create your first custom round or import rounds from friends to get started.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={onCreateRound}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Create Your First Round
              </button>
              <button
                onClick={onImportRounds}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
              >
                Import Rounds
              </button>
            </div>
          </div>
        )}

        {/* Version Info */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Tenable Game v2.0 - Now with custom rounds!</p>
        </div>
      </div>
    </div>
  );
}