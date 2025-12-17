import React, { useState, useEffect } from 'react';
import { QuestionSet, CustomRound } from '../types/domain';
import { getAllCustomRounds } from '../utils/roundManager';
import { loadDefaultRounds } from '../utils/loader';

interface RoundSelectorProps {
  selectedRounds: (QuestionSet | CustomRound)[];
  onRoundsChanged: (rounds: (QuestionSet | CustomRound)[]) => void;
}

type RoundSource = 'default' | 'custom' | 'mixed';

export default function RoundSelector({ selectedRounds, onRoundsChanged }: RoundSelectorProps) {
  const [roundSource, setRoundSource] = useState<RoundSource>('default');
  const [defaultRounds, setDefaultRounds] = useState<QuestionSet[]>([]);
  const [customRounds, setCustomRounds] = useState<CustomRound[]>([]);
  const [availableRounds, setAvailableRounds] = useState<(QuestionSet | CustomRound)[]>([]);

  // Load rounds on component mount
  useEffect(() => {
    const loadRounds = async () => {
      try {
        const defaults = await loadDefaultRounds();
        const customs = getAllCustomRounds();
        
        setDefaultRounds(defaults);
        setCustomRounds(customs);
        
        // Set initial available rounds based on default source
        setAvailableRounds(defaults);
        
        // If no rounds are selected, select all default rounds
        if (selectedRounds.length === 0) {
          onRoundsChanged(defaults);
        }
      } catch (error) {
        console.error('Failed to load rounds:', error);
        alert('Failed to load game rounds. Please try refreshing the page.');
      }
    };
    
    loadRounds();
  }, []);

  // Update available rounds when source changes
  useEffect(() => {
    switch (roundSource) {
      case 'default':
        setAvailableRounds(defaultRounds);
        break;
      case 'custom':
        setAvailableRounds(customRounds);
        break;
      case 'mixed':
        setAvailableRounds([...defaultRounds, ...customRounds]);
        break;
    }
  }, [roundSource, defaultRounds, customRounds]);

  // Update selected rounds when available rounds change
  useEffect(() => {
    // Filter selected rounds to only include those that are still available
    const validSelectedRounds = selectedRounds.filter(selected => 
      availableRounds.some(available => available.id === selected.id)
    );
    
    // If we have no valid selected rounds and there are available rounds, select all
    if (validSelectedRounds.length === 0 && availableRounds.length > 0) {
      onRoundsChanged(availableRounds);
    } else if (validSelectedRounds.length !== selectedRounds.length) {
      onRoundsChanged(validSelectedRounds);
    }
  }, [availableRounds]);

  const handleSourceChange = (source: RoundSource) => {
    setRoundSource(source);
  };

  const toggleRound = (round: QuestionSet | CustomRound) => {
    const isSelected = selectedRounds.some(selected => selected.id === round.id);
    
    if (isSelected) {
      // Remove from selection
      const newSelection = selectedRounds.filter(selected => selected.id !== round.id);
      onRoundsChanged(newSelection);
    } else {
      // Add to selection
      onRoundsChanged([...selectedRounds, round]);
    }
  };

  const selectAll = () => {
    onRoundsChanged(availableRounds);
  };

  const clearAll = () => {
    onRoundsChanged([]);
  };

  const moveRound = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= selectedRounds.length) return;
    
    const newRounds = [...selectedRounds];
    const [movedRound] = newRounds.splice(fromIndex, 1);
    newRounds.splice(toIndex, 0, movedRound);
    onRoundsChanged(newRounds);
  };

  const isCustomRound = (round: QuestionSet | CustomRound): round is CustomRound => {
    return 'metadata' in round;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-6 text-center">Round Selection</h3>
      
      {/* Round Source Selection */}
      <div className="mb-6">
        <div className="grid grid-cols-3 gap-2 bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => handleSourceChange('default')}
            className={`py-2 px-4 rounded-md transition-colors ${
              roundSource === 'default' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Default Rounds ({defaultRounds.length})
          </button>
          <button
            onClick={() => handleSourceChange('custom')}
            className={`py-2 px-4 rounded-md transition-colors ${
              roundSource === 'custom' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
            disabled={customRounds.length === 0}
          >
            Custom Rounds ({customRounds.length})
          </button>
          <button
            onClick={() => handleSourceChange('mixed')}
            className={`py-2 px-4 rounded-md transition-colors ${
              roundSource === 'mixed' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
            disabled={customRounds.length === 0}
          >
            Mixed ({defaultRounds.length + customRounds.length})
          </button>
        </div>
      </div>

      {availableRounds.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {roundSource === 'custom' ? (
            <div>
              <p className="mb-4">No custom rounds available.</p>
              <p className="text-sm">Create some custom rounds first or switch to default rounds.</p>
            </div>
          ) : (
            <p>No rounds available.</p>
          )}
        </div>
      ) : (
        <>
          {/* Selection Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-400">
              {selectedRounds.length} of {availableRounds.length} rounds selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                disabled={selectedRounds.length === availableRounds.length}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
              >
                Select All
              </button>
              <button
                onClick={clearAll}
                disabled={selectedRounds.length === 0}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Rounds */}
            <div>
              <h4 className="font-medium mb-3 text-gray-300">Available Rounds</h4>
              <div className="max-h-64 overflow-y-auto space-y-2 bg-gray-750 p-3 rounded border border-gray-600">
                {availableRounds.map(round => {
                  const isSelected = selectedRounds.some(selected => selected.id === round.id);
                  const isCustom = isCustomRound(round);
                  
                  return (
                    <div
                      key={round.id}
                      onClick={() => toggleRound(round)}
                      className={`p-3 border rounded cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-900/30' 
                          : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium truncate">
                            {isCustom ? round.metadata.title : `Round ${round.id}`}
                          </h5>
                          <p className="text-sm text-gray-400 truncate mt-1">
                            {round.questionText}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="text-gray-500">
                              {round.answers.length} answers
                            </span>
                            {isCustom && round.metadata.category && (
                              <span className="text-blue-400">
                                {round.metadata.category}
                              </span>
                            )}
                            {isCustom && round.metadata.difficulty && (
                              <span className={getDifficultyColor(round.metadata.difficulty)}>
                                {round.metadata.difficulty}
                              </span>
                            )}
                            <span className={isCustom ? 'text-purple-400' : 'text-cyan-400'}>
                              {isCustom ? 'Custom' : 'Default'}
                            </span>
                          </div>
                        </div>
                        <div className={`w-5 h-5 border-2 rounded flex-shrink-0 ml-3 ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-500'
                        }`}>
                          {isSelected && (
                            <div className="text-white text-xs flex items-center justify-center h-full">✓</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Rounds (Order) */}
            <div>
              <h4 className="font-medium mb-3 text-gray-300">Round Order</h4>
              <div className="max-h-64 overflow-y-auto space-y-2 bg-gray-750 p-3 rounded border border-gray-600">
                {selectedRounds.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p>No rounds selected</p>
                    <p className="text-sm mt-1">Select rounds from the left to begin</p>
                  </div>
                ) : (
                  selectedRounds.map((round, index) => {
                    const isCustom = isCustomRound(round);
                    
                    return (
                      <div
                        key={`${round.id}-${index}`}
                        className="p-3 border border-gray-600 rounded bg-gray-700"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h6 className="font-medium text-sm truncate">
                                {isCustom ? round.metadata.title : `Round ${round.id}`}
                              </h6>
                              <p className="text-xs text-gray-400 truncate">
                                {round.questionText}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-3">
                            <button
                              onClick={() => moveRound(index, index - 1)}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveRound(index, index + 1)}
                              disabled={index === selectedRounds.length - 1}
                              className="p-1 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          {selectedRounds.length > 0 && (
            <div className="mt-4 p-3 bg-gray-700 rounded border border-gray-600">
              <div className="text-sm text-gray-300">
                <strong>Game Summary:</strong> {selectedRounds.length} rounds selected
                {selectedRounds.some(isCustomRound) && (
                  <span className="ml-2 text-purple-400">
                    (includes {selectedRounds.filter(isCustomRound).length} custom rounds)
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}