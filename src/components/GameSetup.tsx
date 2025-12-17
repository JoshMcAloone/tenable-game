import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { QuestionSet, CustomRound } from '../types/domain';
import { incrementRoundPlayCount } from '../utils/roundManager';
import { loadDefaultRounds } from '../utils/loader';
import LanguageSelector from './LanguageSelector';
import RoundSelector from './RoundSelector';

export default function GameSetup() {
  const { dispatch, phase } = useGame();
  const { t } = useLanguage();
  const [names, setNames] = useState<string[]>(['Lag 1', 'Lag 2']);
  const [selectedRounds, setSelectedRounds] = useState<(QuestionSet | CustomRound)[]>([]);
  const [savedState, setSavedState] = useState<unknown | null>(null);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('tenable-game-state');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.phase && parsed.phase !== 'ended') {
        setSavedState(parsed);
        setHasResume(true);
        // Optionally adopt team names from saved state for context
        if (Array.isArray(parsed.teams) && parsed.teams.length >= 2) {
          setNames(parsed.teams.map((t: any) => t.name));
        }
      }
    } catch (e) {
      // Failed to read saved game state
    }
  }, []);

  // Load default rounds on mount
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const defaults = await loadDefaultRounds();
        if (selectedRounds.length === 0) {
          setSelectedRounds(defaults);
        }
      } catch (error) {
        console.error('Failed to load default rounds:', error);
      }
    };
    
    loadDefaults();
  }, []);

  function updateName(index: number, value: string) {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  }

  function addTeam() {
    if (names.length >= 6) return;
    setNames((prev) => [...prev, `Team ${prev.length + 1}`]);
  }

  function removeTeam(index: number) {
    if (names.length <= 2) return;
    setNames((prev) => prev.filter((_, i) => i !== index));
  }

  function newGame() {
    // Validate team names before starting
    const trimmedNames = names.map(name => name.trim());
    const emptyNames = trimmedNames.filter(name => name.length === 0);
    
    if (emptyNames.length > 0) {
      alert('Alla lag måste ha namn innan spelet kan startas.');
      return;
    }
    
    // Check for duplicate team names
    const uniqueNames = new Set(trimmedNames);
    if (uniqueNames.size !== trimmedNames.length) {
      alert('Alla lag måste ha unika namn.');
      return;
    }

    // Validate round selection
    if (selectedRounds.length === 0) {
      alert('You must select at least one round to start the game.');
      return;
    }
    
    // Clear any cached game before starting fresh
    if (hasResume) {
      localStorage.removeItem('tenable-game-state');
      setHasResume(false);
      setSavedState(null);
    }

    // Increment play count for custom rounds
    selectedRounds.forEach(round => {
      if ('metadata' in round && round.metadata.isCustom) {
        incrementRoundPlayCount(round.id);
      }
    });
    
    const teams = trimmedNames.map((name, i) => ({
      id: `team${i}`,
      name,
      score: 0,
      livesRemaining: 3, // INITIAL_LIVES
      eliminated: false,
    }));
    
    dispatch({ 
      type: 'START_GAME', 
      teams,
      rounds: selectedRounds
    });
  }

  function resume() {
    if (!hasResume || !savedState) return;
    dispatch({ type: 'RESTORE_STATE', state: savedState as any });
  }

  return (
    <div className="min-h-screen flex flex-col p-8 bg-black">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        {/* Language Selector */}
        <div className="flex justify-end">
          <LanguageSelector />
        </div>
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="bg-black border border-green-400 text-white px-8 py-4 rounded-md shadow-lg shadow-green-400/30">
            <h1 className="text-4xl font-bold tracking-wider text-green-400 filter drop-shadow-[0_0_12px_rgba(57,255,20,0.8)]">{t('setup.title')}</h1>
            <p className="text-xl font-semibold mt-2 text-cyan-300 tracking-wide">{t('setup.subtitle')}</p>
          </div>
          <p className="text-lg text-white/80">{t('setup.description')}</p>
          <p className="text-sm text-cyan-300">{t('setup.teamsRequired')}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Team Setup */}
          <div className="bg-black border border-purple-600 rounded-md p-8 shadow-lg shadow-purple-600/30">
            <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-wider">{t('setup.teamNames')}</h2>
            
            <div className="space-y-4 mb-6">
              {names.map((name, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-green-400 rounded-md flex items-center justify-center text-black font-bold">
                    {index + 1}
                  </div>
                  <input
                    value={name}
                    onChange={(e) => updateName(index, e.target.value)}
                    className="flex-1 rounded-md bg-black border border-cyan-400 px-4 py-3 text-white placeholder-cyan-400/50 focus:border-green-400 focus:outline-none transition-all font-mono tracking-wider shadow-lg shadow-cyan-400/20"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,255,0.4))' }}
                    placeholder={t('setup.teamPlaceholder', { number: (index + 1).toString() })}
                  />
                  <button
                    onClick={() => removeTeam(index)}
                    disabled={names.length <= 2}
                    className="px-4 py-3 bg-black border border-red-400 hover:bg-red-400/20 disabled:bg-gray-500/20 disabled:opacity-50 text-red-400 disabled:text-gray-500 rounded-md transition-all font-bold tracking-wider cursor-pointer"
                  >
                    {t('setup.removeTeam')}
                  </button>
                </div>
              ))}
            </div>

            {/* Team Controls */}
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              <button
                onClick={addTeam}
                disabled={names.length >= 6}
                className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 disabled:bg-gray-600 disabled:opacity-50 text-black font-bold rounded-md transition-all duration-200 hover:scale-105 disabled:hover:scale-100 shadow-lg shadow-cyan-400/50 tracking-wider cursor-pointer"
                style={{
                  filter: names.length >= 6 ? 'none' : 'drop-shadow(0 0 10px rgba(0,255,255,0.8))'
                }}
              >
                {t('setup.addTeam')}
              </button>
            </div>

            {/* Start/Resume Controls */}
            <div className="flex flex-wrap gap-4 justify-center">
              {hasResume ? (
                <>
                  <button
                    onClick={resume}
                    className="px-8 py-3 bg-green-400 hover:bg-green-300 text-black font-bold rounded-md shadow-lg transform transition-all duration-200 hover:scale-105 tracking-wider shadow-green-400/50 cursor-pointer"
                    style={{ filter: 'drop-shadow(0 0 15px rgba(57,255,20,0.8))' }}
                  >
                    {t('setup.resumeGame')}
                  </button>
                  <button 
                    onClick={newGame} 
                    disabled={selectedRounds.length === 0}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:opacity-50 text-white font-bold rounded-md shadow-lg transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100 tracking-wider shadow-purple-600/50 cursor-pointer"
                  >
                    {t('setup.newGame')}
                  </button>
                </>
              ) : (
                <button 
                  onClick={newGame} 
                  disabled={selectedRounds.length === 0}
                  className="px-8 py-3 bg-green-400 hover:bg-green-300 disabled:bg-gray-600 disabled:opacity-50 text-black font-bold rounded-md shadow-lg transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100 tracking-wider shadow-green-400/50 cursor-pointer"
                  style={{ filter: selectedRounds.length === 0 ? 'none' : 'drop-shadow(0 0 15px rgba(57,255,20,0.8))' }}
                >
                  {t('setup.startGame')}
                </button>
              )}
            </div>
          </div>

          {/* Round Selection */}
          <div>
            <RoundSelector
              selectedRounds={selectedRounds}
              onRoundsChanged={setSelectedRounds}
            />
          </div>
        </div>

        {/* Game Rules */}
        <div className="text-center text-white/60">
          <p className="text-sm">{t('setup.gameRules')}</p>
        </div>
      </div>
    </div>
  );
}