import React, { useState, useEffect, useMemo } from 'react';
import { CustomRound } from '../types/domain';
import { 
  getAllCustomRounds, 
  deleteCustomRound, 
  getStorageStats,
  exportRoundsToJSON 
} from '../utils/roundManager';

interface RoundLibraryProps {
  onCreateNew: () => void;
  onEditRound: (roundId: string) => void;
  onImportRounds: () => void;
}

type SortOption = 'title' | 'createdAt' | 'lastModified' | 'playCount';
type ViewMode = 'grid' | 'list';

export default function RoundLibrary({ onCreateNew, onEditRound, onImportRounds }: RoundLibraryProps) {
  const [rounds, setRounds] = useState<CustomRound[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('lastModified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedRounds, setSelectedRounds] = useState<Set<string>>(new Set());
  const [storageStats, setStorageStats] = useState({ used: 0, available: 0, roundCount: 0 });

  // Load rounds and storage stats
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setRounds(getAllCustomRounds());
    setStorageStats(getStorageStats());
  };

  // Get unique categories and difficulties
  const categories = useMemo(() => {
    const cats = rounds
      .map(r => r.metadata.category)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return cats.sort();
  }, [rounds]);

  const difficulties = ['easy', 'medium', 'hard'];

  // Filter and sort rounds
  const filteredAndSortedRounds = useMemo(() => {
    let filtered = rounds.filter(round => {
      const matchesSearch = round.metadata.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          round.questionText.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || round.metadata.category === selectedCategory;
      const matchesDifficulty = !selectedDifficulty || round.metadata.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    filtered.sort((a, b) => {
      let aValue: any = a.metadata[sortBy];
      let bValue: any = b.metadata[sortBy];

      if (sortBy === 'title') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (sortBy === 'createdAt' || sortBy === 'lastModified') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [rounds, searchTerm, selectedCategory, selectedDifficulty, sortBy, sortOrder]);

  const handleDelete = async (roundId: string) => {
    const round = rounds.find(r => r.id === roundId);
    if (!round) return;

    if (confirm(`Are you sure you want to delete "${round.metadata.title}"? This cannot be undone.`)) {
      if (deleteCustomRound(roundId)) {
        refreshData();
        setSelectedRounds(prev => {
          const newSet = new Set(prev);
          newSet.delete(roundId);
          return newSet;
        });
      } else {
        alert('Failed to delete round. Please try again.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRounds.size === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedRounds.size} rounds? This cannot be undone.`)) {
      let deleteCount = 0;
      for (const roundId of selectedRounds) {
        if (deleteCustomRound(roundId)) {
          deleteCount++;
        }
      }
      
      alert(`Deleted ${deleteCount} of ${selectedRounds.size} rounds.`);
      setSelectedRounds(new Set());
      refreshData();
    }
  };

  const handleBulkExport = () => {
    if (selectedRounds.size === 0) return;

    const roundsToExport = rounds.filter(round => selectedRounds.has(round.id));
    const jsonData = exportRoundsToJSON(roundsToExport, {
      title: `Custom Rounds Export (${roundsToExport.length} rounds)`,
      description: 'Exported from Tenable Game',
      author: roundsToExport[0]?.metadata.author || ''
    });

    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenable-rounds-${new Date().toISOString().split('T')[0]}.tenable`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleRoundSelection = (roundId: string) => {
    setSelectedRounds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(roundId)) {
        newSet.delete(roundId);
      } else {
        newSet.add(roundId);
      }
      return newSet;
    });
  };

  const toggleAllSelection = () => {
    if (selectedRounds.size === filteredAndSortedRounds.length) {
      setSelectedRounds(new Set());
    } else {
      setSelectedRounds(new Set(filteredAndSortedRounds.map(r => r.id)));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Round Library</h2>
            <p className="text-gray-400 mt-1">
              {rounds.length} custom rounds • {(storageStats.used / 1024).toFixed(1)} KB used
            </p>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={onImportRounds}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Import Rounds
            </button>
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Create New Round
            </button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search rounds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="title">Title</option>
                <option value="createdAt">Created</option>
                <option value="lastModified">Modified</option>
                <option value="playCount">Play Count</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-3 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors"
                title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* View Mode */}
            <div className="flex rounded-lg overflow-hidden border border-gray-600">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                title="Grid View"
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                title="List View"
              >
                ☰
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedRounds.size > 0 && (
            <div className="flex items-center gap-4 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
              <span>{selectedRounds.size} rounds selected</span>
              <button
                onClick={handleBulkExport}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
              >
                Export Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedRounds(new Set())}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm transition-colors"
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* Select All */}
          {filteredAndSortedRounds.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={selectedRounds.size === filteredAndSortedRounds.length && filteredAndSortedRounds.length > 0}
                onChange={toggleAllSelection}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-300">
                Select all {filteredAndSortedRounds.length} rounds
              </label>
            </div>
          )}
        </div>

        {/* Empty State */}
        {rounds.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">No Custom Rounds Yet</h3>
            <p className="text-gray-400 mb-6">
              Create your first custom round to get started, or import existing rounds from a file.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={onCreateNew}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Create Your First Round
              </button>
              <button
                onClick={onImportRounds}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Import Rounds
              </button>
            </div>
          </div>
        ) : filteredAndSortedRounds.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">No Rounds Found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search criteria or filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedDifficulty('');
              }}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Rounds Display */
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedRounds.map(round => (
                  <RoundCard
                    key={round.id}
                    round={round}
                    isSelected={selectedRounds.has(round.id)}
                    onSelect={() => toggleRoundSelection(round.id)}
                    onEdit={() => onEditRound(round.id)}
                    onDelete={() => handleDelete(round.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="p-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedRounds.size === filteredAndSortedRounds.length}
                          onChange={toggleAllSelection}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                        />
                      </th>
                      <th className="p-4 text-left">Title</th>
                      <th className="p-4 text-left">Category</th>
                      <th className="p-4 text-left">Difficulty</th>
                      <th className="p-4 text-left">Answers</th>
                      <th className="p-4 text-left">Play Count</th>
                      <th className="p-4 text-left">Modified</th>
                      <th className="p-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedRounds.map(round => (
                      <RoundRow
                        key={round.id}
                        round={round}
                        isSelected={selectedRounds.has(round.id)}
                        onSelect={() => toggleRoundSelection(round.id)}
                        onEdit={() => onEditRound(round.id)}
                        onDelete={() => handleDelete(round.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Round Card Component (Grid View)
interface RoundCardProps {
  round: CustomRound;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function RoundCard({ round, isSelected, onSelect, onEdit, onDelete }: RoundCardProps) {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border-2 transition-all ${
      isSelected ? 'border-blue-500' : 'border-gray-700 hover:border-gray-600'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded transition-colors"
            title="Edit Round"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
            title="Delete Round"
          >
            🗑️
          </button>
        </div>
      </div>

      <h3 className="font-bold text-lg mb-2 line-clamp-2">{round.metadata.title}</h3>
      
      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
        {round.questionText}
      </p>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Answers:</span>
          <span>{round.answers.length}/10</span>
        </div>
        
        {round.metadata.category && (
          <div className="flex justify-between">
            <span className="text-gray-400">Category:</span>
            <span className="text-blue-400">{round.metadata.category}</span>
          </div>
        )}
        
        {round.metadata.difficulty && (
          <div className="flex justify-between">
            <span className="text-gray-400">Difficulty:</span>
            <span className={getDifficultyColor(round.metadata.difficulty)}>
              {round.metadata.difficulty}
            </span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-gray-400">Plays:</span>
          <span>{round.metadata.playCount}</span>
        </div>
        
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
          Modified: {new Date(round.metadata.lastModified).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// Round Row Component (List View)
interface RoundRowProps {
  round: CustomRound;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function RoundRow({ round, isSelected, onSelect, onEdit, onDelete }: RoundRowProps) {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <tr className={`border-b border-gray-700 hover:bg-gray-750 ${isSelected ? 'bg-blue-900/20' : ''}`}>
      <td className="p-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
        />
      </td>
      <td className="p-4">
        <div>
          <div className="font-medium">{round.metadata.title}</div>
          <div className="text-sm text-gray-400 truncate max-w-xs">
            {round.questionText}
          </div>
        </div>
      </td>
      <td className="p-4 text-sm">
        {round.metadata.category && (
          <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs">
            {round.metadata.category}
          </span>
        )}
      </td>
      <td className="p-4 text-sm">
        {round.metadata.difficulty && (
          <span className={getDifficultyColor(round.metadata.difficulty)}>
            {round.metadata.difficulty}
          </span>
        )}
      </td>
      <td className="p-4 text-sm">{round.answers.length}/10</td>
      <td className="p-4 text-sm">{round.metadata.playCount}</td>
      <td className="p-4 text-sm text-gray-400">
        {new Date(round.metadata.lastModified).toLocaleDateString()}
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded transition-colors"
            title="Edit Round"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
            title="Delete Round"
          >
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
}