import React from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';

export default function RoundSummary() {
  const { rounds, currentRoundIndex, teams, dispatch, phase } = useGame();
  const { t } = useLanguage();
  const round = rounds[currentRoundIndex];
  if (phase !== 'summary') return null;

  const isGameComplete = currentRoundIndex + 1 >= rounds.length;
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto space-y-8 slide-in">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="bg-black border border-green-400 text-white px-8 py-4 rounded-md shadow-lg shadow-green-400/30">
            <h1 className="text-4xl font-bold tracking-wider text-green-400 filter drop-shadow-[0_0_12px_rgba(57,255,20,0.8)]">{t('game.title')}</h1>
            <p className="text-xl font-semibold mt-2 text-cyan-300 tracking-wide">
              {isGameComplete ? t('summary.finalResults') : `${t('game.round')} ${currentRoundIndex + 1} ${t('summary.roundComplete')}`}
            </p>
          </div>
        </div>

        {/* Question Recap */}
        <div className="bg-black border border-purple-600 rounded-md p-6 shadow-lg shadow-purple-600/30">
          <h2 className="text-2xl font-bold text-white mb-6 text-center tracking-wider">
            {round.questionText}
          </h2>
          
          {/* Summary Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 filter drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]">
                {round.answers.filter(a => a.revealed).length}
              </div>
              <div className="text-sm text-green-300">Found</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                {round.answers.filter(a => !a.revealed).length}
              </div>
              <div className="text-sm text-red-300">Missed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                {round.answers.length}
              </div>
              <div className="text-sm text-cyan-300">Total</div>
            </div>
          </div>
          
          {/* Answers Grid with Enhanced Visual Design */}
          <div className="space-y-6">
            {/* Found Answers */}
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-4 text-center tracking-wider filter drop-shadow-[0_0_6px_rgba(57,255,20,0.6)]">
                ✓ Answers Found ({round.answers.filter(a => a.revealed).length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {round.answers.map((answer, index) => (
                  answer.revealed && (
                    <div
                      key={index}
                      className="bg-green-400 border-2 border-green-300 rounded-lg p-4 text-center text-black shadow-lg transform hover:scale-105 transition-transform"
                      style={{ filter: 'drop-shadow(0 0 12px rgba(57,255,20,0.7))' }}
                    >
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-green-800 font-bold">✓</span>
                      </div>
                      <div className="text-lg font-bold break-words leading-tight">
                        <span>{answer.text}</span>
                        {answer.additionalText && (
                          <span className="text-yellow-300 font-bold ml-2 text-base">
                            ({answer.additionalText})
                          </span>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Missed Answers */}
            {round.answers.some(a => !a.revealed) && (
              <div>
                <h3 className="text-xl font-bold text-red-400 mb-4 text-center tracking-wider filter drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]">
                  ✗ Answers Missed ({round.answers.filter(a => !a.revealed).length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {round.answers.map((answer, index) => (
                    !answer.revealed && (
                      <div
                        key={index}
                        className="bg-red-500 border-2 border-red-400 rounded-lg p-4 text-center text-white shadow-lg opacity-80"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(239,68,68,0.5))' }}
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="w-6 h-6 bg-red-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-red-200 font-bold">✗</span>
                        </div>
                        <div className="text-lg font-bold break-words leading-tight">
                          <span>{answer.text}</span>
                          {answer.additionalText && (
                            <span className="text-red-200 font-bold ml-2 text-base">
                              ({answer.additionalText})
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team Scores */}
        <div className="bg-black border border-cyan-400 rounded-md p-6 shadow-lg shadow-cyan-400/30">
          <h3 className="text-2xl font-bold text-white mb-6 text-center tracking-wider">
            {isGameComplete ? t('summary.finalStandings') : t('summary.currentScores')}
          </h3>
          
          <div className="space-y-4 max-w-2xl mx-auto">
            {sortedTeams.map((team, index) => (
              <div
                key={team.id}
                className={`relative overflow-hidden rounded-md border p-6 transition-all ${
                  isGameComplete && index === 0
                    ? 'border-green-400 bg-black shadow-lg shadow-green-400/30'
                    : 'border-purple-600 bg-black shadow-lg shadow-purple-600/20'
                }`}
                style={{
                  filter: isGameComplete && index === 0 
                    ? 'drop-shadow(0 0 15px rgba(57,255,20,0.8))' 
                    : 'drop-shadow(0 0 6px rgba(139,69,191,0.4))'
                }}
              >
                {isGameComplete && index === 0 && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-green-400 shadow-sm shadow-green-400/50"></div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center font-bold text-lg ${
                      isGameComplete && index === 0
                        ? 'bg-green-400 text-black'
                        : 'bg-purple-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className={`font-bold text-lg tracking-wider ${
                        isGameComplete && index === 0 ? 'text-green-400' : 'text-white'
                      }`}>
                        {team.name}
                        {isGameComplete && index === 0 && (
                          <span className="ml-2 text-sm font-normal text-green-300 filter drop-shadow-[0_0_6px_rgba(57,255,20,0.6)]">👑 {t('summary.winner')}</span>
                        )}
                      </div>
                      {team.eliminated && (
                        <div className="text-red-400 text-sm font-bold tracking-wider">{t('team.eliminated')}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      isGameComplete && index === 0 ? 'text-green-400' : 'text-cyan-400'
                    }`}>
                      {team.score}
                    </div>
                    <div className="text-white/70 text-sm">
                      {team.livesRemaining} ❤ {t('summary.remaining')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={() => dispatch({ type: 'END_ROUND' })}
            className="px-12 py-4 bg-green-400 hover:bg-green-300 text-black text-xl font-bold rounded-md shadow-lg transform transition-all duration-200 hover:scale-105 tracking-wider shadow-green-400/50 cursor-pointer"
            style={{ filter: 'drop-shadow(0 0 15px rgba(57,255,20,0.8))' }}
          >
            {isGameComplete ? t('summary.newGame') : t('summary.nextRound')}
          </button>
        </div>
      </div>
    </div>
  );
}