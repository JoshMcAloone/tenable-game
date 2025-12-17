import React, { useState, useEffect, useCallback } from 'react';
import { CustomRound, Answer, ValidationError } from '../types/domain';
import { 
  createEmptyCustomRound, 
  saveCustomRound, 
  validateCustomRound, 
  getCustomRoundById 
} from '../utils/roundManager';

interface RoundCreatorProps {
  roundId?: string; // For editing existing rounds
  onSave: (round: CustomRound) => void;
  onCancel: () => void;
}

interface AnswerFormData extends Answer {
  tempId: string; // For managing form state
}

export default function RoundCreator({ roundId, onSave, onCancel }: RoundCreatorProps) {
  const [round, setRound] = useState<CustomRound>(() => 
    roundId ? getCustomRoundById(roundId) || createEmptyCustomRound() : createEmptyCustomRound()
  );
  
  const [answers, setAnswers] = useState<AnswerFormData[]>([]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<ValidationError[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize answers from round data
  useEffect(() => {
    if (round.answers.length > 0) {
      setAnswers(round.answers.map((answer, index) => ({
        ...answer,
        tempId: `answer-${index}`
      })));
    } else {
      // Start with one empty answer
      addAnswer();
    }
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      saveDraft();
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [round, answers, hasUnsavedChanges]);

  // Validate whenever data changes
  useEffect(() => {
    const roundWithCurrentAnswers = {
      ...round,
      answers: answers.map(({ tempId, ...answer }) => answer)
    };
    
    const validation = validateCustomRound(roundWithCurrentAnswers);
    setErrors(validation.errors);
    setWarnings(validation.warnings);
  }, [round, answers]);

  const saveDraft = useCallback(() => {
    const roundWithAnswers = {
      ...round,
      answers: answers.map(({ tempId, ...answer }) => answer)
    };
    saveCustomRound(roundWithAnswers);
  }, [round, answers]);

  const addAnswer = () => {
    const newAnswer: AnswerFormData = {
      text: '',
      alternativeText: '',
      clue: `${answers.length + 1}`,
      additionalText: '',
      revealed: false,
      tempId: `answer-${Date.now()}`
    };
    setAnswers(prev => [...prev, newAnswer]);
    setHasUnsavedChanges(true);
  };

  const removeAnswer = (tempId: string) => {
    setAnswers(prev => prev.filter(a => a.tempId !== tempId));
    setHasUnsavedChanges(true);
  };

  const updateAnswer = (tempId: string, field: keyof Answer, value: string | boolean) => {
    setAnswers(prev => prev.map(answer => 
      answer.tempId === tempId 
        ? { ...answer, [field]: value }
        : answer
    ));
    setHasUnsavedChanges(true);
  };

  const moveAnswer = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= answers.length) return;
    
    setAnswers(prev => {
      const newAnswers = [...prev];
      const [movedAnswer] = newAnswers.splice(fromIndex, 1);
      newAnswers.splice(toIndex, 0, movedAnswer);
      return newAnswers;
    });
    setHasUnsavedChanges(true);
  };

  const updateRoundMetadata = (field: string, value: string) => {
    setRound(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
        lastModified: new Date().toISOString()
      }
    }));
    setHasUnsavedChanges(true);
  };

  const updateQuestionText = (text: string) => {
    setRound(prev => ({
      ...prev,
      questionText: text
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const roundWithAnswers = {
      ...round,
      answers: answers.map(({ tempId, ...answer }) => answer)
    };

    const validation = validateCustomRound(roundWithAnswers);
    if (!validation.isValid) {
      setIsSaving(false);
      return;
    }

    try {
      const success = saveCustomRound(roundWithAnswers);
      if (success) {
        setHasUnsavedChanges(false);
        onSave(roundWithAnswers);
      } else {
        alert('Failed to save round. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('An error occurred while saving. Please try again.');
    }
    
    setIsSaving(false);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  };

  const getFieldWarning = (field: string): string | undefined => {
    return warnings.find(warning => warning.field === field)?.message;
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Round Preview</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Back to Editor
              </button>
            </div>
          </div>
          
          {/* Preview the round as it would appear in game */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-2xl font-bold text-center mb-8">{round.questionText}</h3>
            
            <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
              {answers.map((answer, index) => (
                <div
                  key={answer.tempId}
                  className="bg-blue-600 p-4 rounded-lg text-center min-h-[80px] flex items-center justify-center"
                >
                  <div>
                    <div className="font-bold text-lg">
                      {answer.text || answer.clue || (index + 1)}
                    </div>
                    {answer.additionalText && (
                      <div className="text-sm opacity-75">({answer.additionalText})</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">
              {roundId ? 'Edit Round' : 'Create New Round'}
            </h2>
            {hasUnsavedChanges && (
              <p className="text-yellow-400 text-sm mt-1">Unsaved changes</p>
            )}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => setShowPreview(true)}
              disabled={errors.length > 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Preview
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || errors.length > 0}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Round'}
            </button>
          </div>
        </div>

        {/* Validation Summary */}
        {(errors.length > 0 || warnings.length > 0) && (
          <div className="mb-6">
            {errors.length > 0 && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
                <h4 className="font-bold text-red-400 mb-2">Errors ({errors.length})</h4>
                <ul className="text-sm text-red-300 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error.message}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {warnings.length > 0 && (
              <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-4">
                <h4 className="font-bold text-yellow-400 mb-2">Warnings ({warnings.length})</h4>
                <ul className="text-sm text-yellow-300 space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Round Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Round Metadata */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Round Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Round Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={round.metadata.title}
                    onChange={(e) => updateRoundMetadata('title', e.target.value)}
                    className={`w-full p-3 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      getFieldError('metadata.title') ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter round title"
                  />
                  {getFieldError('metadata.title') && (
                    <p className="text-red-400 text-sm mt-1">{getFieldError('metadata.title')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={round.metadata.description || ''}
                    onChange={(e) => updateRoundMetadata('description', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Author</label>
                  <input
                    type="text"
                    value={round.metadata.author || ''}
                    onChange={(e) => updateRoundMetadata('author', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <input
                      type="text"
                      value={round.metadata.category || ''}
                      onChange={(e) => updateRoundMetadata('category', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Movies, Sports"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <select
                      value={round.metadata.difficulty || ''}
                      onChange={(e) => updateRoundMetadata('difficulty', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select difficulty</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Question and Answers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Text */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">
                Question Text <span className="text-red-400">*</span>
              </h3>
              <textarea
                value={round.questionText}
                onChange={(e) => updateQuestionText(e.target.value)}
                className={`w-full p-3 bg-gray-700 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('questionText') ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter the main question for this round"
                rows={4}
              />
              {getFieldError('questionText') && (
                <p className="text-red-400 text-sm mt-1">{getFieldError('questionText')}</p>
              )}
              {getFieldWarning('questionText') && (
                <p className="text-yellow-400 text-sm mt-1">{getFieldWarning('questionText')}</p>
              )}
              <p className="text-gray-400 text-sm mt-2">
                {round.questionText.length}/500 characters
              </p>
            </div>

            {/* Answers */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">
                  Answers ({answers.length}/10)
                </h3>
                <button
                  onClick={addAnswer}
                  disabled={answers.length >= 10}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors text-sm"
                >
                  Add Answer
                </button>
              </div>

              <div className="space-y-4">
                {answers.map((answer, index) => (
                  <AnswerEditor
                    key={answer.tempId}
                    answer={answer}
                    index={index}
                    onUpdate={updateAnswer}
                    onRemove={removeAnswer}
                    onMoveUp={index > 0 ? () => moveAnswer(index, index - 1) : undefined}
                    onMoveDown={index < answers.length - 1 ? () => moveAnswer(index, index + 1) : undefined}
                    error={getFieldError(`answers[${index}].text`)}
                    warning={getFieldWarning(`answers[${index}].text`)}
                  />
                ))}

                {answers.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>No answers yet. Click "Add Answer" to get started.</p>
                  </div>
                )}
              </div>

              {getFieldError('answers') && (
                <p className="text-red-400 text-sm mt-4">{getFieldError('answers')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Answer Editor Component
interface AnswerEditorProps {
  answer: AnswerFormData;
  index: number;
  onUpdate: (tempId: string, field: keyof Answer, value: string | boolean) => void;
  onRemove: (tempId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  error?: string;
  warning?: string;
}

function AnswerEditor({ 
  answer, 
  index, 
  onUpdate, 
  onRemove, 
  onMoveUp, 
  onMoveDown,
  error,
  warning
}: AnswerEditorProps) {
  return (
    <div className={`border rounded-lg p-4 ${error ? 'border-red-500' : 'border-gray-600'} bg-gray-750`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Answer {index + 1}</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={onMoveUp}
            disabled={!onMoveUp}
            className="p-1 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={onMoveDown}
            disabled={!onMoveDown}
            className="p-1 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={() => onRemove(answer.tempId)}
            className="p-1 text-red-400 hover:text-red-300"
            title="Remove answer"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Primary Text <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={answer.text}
            onChange={(e) => onUpdate(answer.tempId, 'text', e.target.value)}
            className={`w-full p-2 bg-gray-700 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="The main answer text"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Alternative Text</label>
            <input
              type="text"
              value={answer.alternativeText || ''}
              onChange={(e) => onUpdate(answer.tempId, 'alternativeText', e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Comma-separated alternatives"
            />
            <p className="text-xs text-gray-400 mt-1">e.g., "Harry,Potter,Harry James Potter"</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Clue Text</label>
            <input
              type="text"
              value={answer.clue || ''}
              onChange={(e) => onUpdate(answer.tempId, 'clue', e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`${index + 1}`}
            />
            <p className="text-xs text-gray-400 mt-1">Text shown when unrevealed</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Additional Text</label>
          <input
            type="text"
            value={answer.additionalText || ''}
            onChange={(e) => onUpdate(answer.tempId, 'additionalText', e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Extra info shown in parentheses"
          />
          <p className="text-xs text-gray-400 mt-1">e.g., years, scores, statistics</p>
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
      {warning && (
        <p className="text-yellow-400 text-sm mt-2">{warning}</p>
      )}
    </div>
  );
}