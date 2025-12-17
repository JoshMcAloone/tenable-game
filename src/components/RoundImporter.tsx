import React, { useState, useRef } from 'react';
import { CustomRound, ImportResult } from '../types/domain';
import { importRoundsFromJSON, saveCustomRound } from '../utils/roundManager';

interface RoundImporterProps {
  onImportComplete: (importedRounds: CustomRound[]) => void;
  onCancel: () => void;
}

export default function RoundImporter({ onImportComplete, onCancel }: RoundImporterProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [previewRounds, setPreviewRounds] = useState<CustomRound[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith('.tenable') && !file.name.endsWith('.json')) {
      alert('Please select a .tenable or .json file');
      return;
    }

    setIsImporting(true);
    
    try {
      const content = await file.text();
      const result = importRoundsFromJSON(content);
      setImportResult(result);
      setPreviewRounds(result.importedRounds);
    } catch (error) {
      setImportResult({
        success: false,
        importedRounds: [],
        errors: [`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        skippedRounds: []
      });
      setPreviewRounds([]);
    }
    
    setIsImporting(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!importResult || importResult.importedRounds.length === 0) return;

    setIsImporting(true);
    
    // Save all rounds to localStorage
    let savedCount = 0;
    for (const round of importResult.importedRounds) {
      if (saveCustomRound(round)) {
        savedCount++;
      }
    }

    if (savedCount === importResult.importedRounds.length) {
      onImportComplete(importResult.importedRounds);
    } else {
      alert(`Successfully imported ${savedCount} of ${importResult.importedRounds.length} rounds.`);
      onImportComplete(importResult.importedRounds.slice(0, savedCount));
    }
    
    setIsImporting(false);
  };

  const resetImport = () => {
    setImportResult(null);
    setPreviewRounds([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // If we have import results, show the preview
  if (importResult) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Import Preview</h2>
              <p className="text-gray-400 mt-1">
                Review the rounds before importing them to your library
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={resetImport}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Choose Different File
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              {importResult.success && importResult.importedRounds.length > 0 && (
                <button
                  onClick={handleConfirmImport}
                  disabled={isImporting}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {isImporting ? 'Importing...' : `Import ${importResult.importedRounds.length} Rounds`}
                </button>
              )}
            </div>
          </div>

          {/* Import Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-green-900/50 border border-green-500 rounded-lg p-4">
              <h3 className="font-bold text-green-400 mb-2">Successfully Imported</h3>
              <p className="text-2xl font-bold">{importResult.importedRounds.length}</p>
              <p className="text-sm text-green-300">rounds ready to import</p>
            </div>

            {importResult.skippedRounds.length > 0 && (
              <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-4">
                <h3 className="font-bold text-yellow-400 mb-2">Skipped</h3>
                <p className="text-2xl font-bold">{importResult.skippedRounds.length}</p>
                <p className="text-sm text-yellow-300">rounds with issues</p>
              </div>
            )}

            {importResult.errors.length > 0 && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
                <h3 className="font-bold text-red-400 mb-2">Errors</h3>
                <p className="text-2xl font-bold">{importResult.errors.length}</p>
                <p className="text-sm text-red-300">issues found</p>
              </div>
            )}
          </div>

          {/* Errors and Warnings */}
          {(importResult.errors.length > 0 || importResult.warnings.length > 0 || importResult.skippedRounds.length > 0) && (
            <div className="mb-6 space-y-4">
              {importResult.errors.length > 0 && (
                <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
                  <h4 className="font-bold text-red-400 mb-2">Import Errors</h4>
                  <ul className="text-sm text-red-300 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importResult.warnings.length > 0 && (
                <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">Warnings</h4>
                  <ul className="text-sm text-yellow-300 space-y-1">
                    {importResult.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importResult.skippedRounds.length > 0 && (
                <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-400 mb-2">Skipped Rounds</h4>
                  <div className="space-y-2">
                    {importResult.skippedRounds.map((skipped, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-yellow-300">
                          {skipped.round.questionText || skipped.round.metadata?.title || `Round ${index + 1}`}
                        </div>
                        <div className="text-yellow-400">Reason: {skipped.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Round Previews */}
          {previewRounds.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4">
                Rounds to Import ({previewRounds.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {previewRounds.map((round, index) => (
                  <RoundPreviewCard key={`${round.id}-${index}`} round={round} />
                ))}
              </div>
            </div>
          )}

          {/* No Valid Rounds */}
          {!importResult.success && importResult.importedRounds.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-bold mb-2">No Valid Rounds Found</h3>
              <p className="text-gray-400 mb-6">
                The file you selected doesn't contain any valid rounds that can be imported.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // File selection interface
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">Import Rounds</h2>
            <p className="text-gray-400 mt-1">
              Import custom rounds from a .tenable or .json file
            </p>
          </div>
          
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragOver
              ? 'border-blue-400 bg-blue-900/20'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isImporting ? (
            <div>
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-bold mb-2">Processing File...</h3>
              <p className="text-gray-400">Please wait while we validate the rounds</p>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-bold mb-2">Drop your file here</h3>
              <p className="text-gray-400 mb-6">
                Or click the button below to select a .tenable or .json file
              </p>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Choose File
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".tenable,.json"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Format Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="font-bold text-lg mb-3">Supported Formats</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-blue-400">•</span>
                <strong>.tenable files:</strong> Exported from this game
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">•</span>
                <strong>.json files:</strong> Standard JSON format rounds
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-400">•</span>
                <strong>Legacy format:</strong> Simple array of rounds
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="font-bold text-lg mb-3">Import Process</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-green-400">1.</span>
                File validation and format detection
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">2.</span>
                Round validation and error checking
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">3.</span>
                Preview rounds before final import
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">4.</span>
                Add valid rounds to your library
              </li>
            </ul>
          </div>
        </div>

        {/* Example Format */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h4 className="font-bold text-lg mb-3">Example JSON Format</h4>
          <pre className="text-sm text-gray-300 bg-gray-900 p-4 rounded overflow-x-auto">
{`{
  "version": "1.0.0",
  "exportDate": "2024-01-15T12:00:00.000Z",
  "rounds": [
    {
      "id": "unique-round-id",
      "questionText": "The top 10 most popular programming languages",
      "answers": [
        {
          "text": "JavaScript",
          "alternativeText": "JS,Javascript",
          "clue": "1",
          "additionalText": "Web development",
          "revealed": false
        }
      ],
      "metadata": {
        "title": "Programming Languages",
        "category": "Technology",
        "difficulty": "medium",
        "isCustom": true
      }
    }
  ]
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}

// Round Preview Card Component
interface RoundPreviewCardProps {
  round: CustomRound;
}

function RoundPreviewCard({ round }: RoundPreviewCardProps) {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h4 className="font-bold text-lg mb-2">{round.metadata.title}</h4>
      
      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
        {round.questionText}
      </p>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Answers:</span>
          <span>{round.answers.length}</span>
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

        {round.metadata.author && (
          <div className="flex justify-between">
            <span className="text-gray-400">Author:</span>
            <span className="text-purple-400">{round.metadata.author}</span>
          </div>
        )}
      </div>

      {/* Sample answers preview */}
      {round.answers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 mb-2">Sample answers:</div>
          <div className="flex flex-wrap gap-1">
            {round.answers.slice(0, 3).map((answer, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-700 rounded text-xs"
              >
                {answer.text}
              </span>
            ))}
            {round.answers.length > 3 && (
              <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">
                +{round.answers.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}