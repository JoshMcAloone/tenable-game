import { CustomRound, CustomRoundMetadata, RoundCollection, ValidationError, RoundValidationResult, ImportResult } from '../types/domain';

const STORAGE_KEYS = {
  CUSTOM_ROUNDS: 'tenable_custom_rounds',
  ROUND_METADATA: 'tenable_round_metadata',
  USER_PREFERENCES: 'tenable_user_preferences'
} as const;

const CURRENT_FORMAT_VERSION = '1.0.0';

// Generate UUID for round IDs
export function generateRoundId(): string {
  return crypto.randomUUID();
}

// Get all custom rounds from localStorage
export function getAllCustomRounds(): CustomRound[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROUNDS);
    if (!stored) return [];
    
    const rounds = JSON.parse(stored) as CustomRound[];
    return rounds.filter(round => round.metadata?.isCustom);
  } catch (error) {
    console.error('Error loading custom rounds:', error);
    return [];
  }
}

// Get a single custom round by ID
export function getCustomRoundById(id: string): CustomRound | null {
  const rounds = getAllCustomRounds();
  return rounds.find(round => round.id === id) || null;
}

// Save a custom round
export function saveCustomRound(round: CustomRound): boolean {
  try {
    const rounds = getAllCustomRounds();
    const existingIndex = rounds.findIndex(r => r.id === round.id);
    
    // Update timestamp
    round.metadata.lastModified = new Date().toISOString();
    
    if (existingIndex >= 0) {
      rounds[existingIndex] = round;
    } else {
      rounds.push(round);
    }
    
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ROUNDS, JSON.stringify(rounds));
    return true;
  } catch (error) {
    console.error('Error saving custom round:', error);
    return false;
  }
}

// Delete a custom round
export function deleteCustomRound(id: string): boolean {
  try {
    const rounds = getAllCustomRounds();
    const filteredRounds = rounds.filter(round => round.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ROUNDS, JSON.stringify(filteredRounds));
    return true;
  } catch (error) {
    console.error('Error deleting custom round:', error);
    return false;
  }
}

// Create a new empty custom round
export function createEmptyCustomRound(title: string = 'New Round'): CustomRound {
  const now = new Date().toISOString();
  const id = generateRoundId();
  
  return {
    id,
    questionText: '',
    answers: [],
    metadata: {
      id,
      title,
      description: '',
      author: '',
      createdAt: now,
      lastModified: now,
      playCount: 0,
      isCustom: true,
      version: CURRENT_FORMAT_VERSION
    },
    settings: {
      shuffleAnswers: false,
      allowPartialCredit: true
    }
  };
}

// Validate a custom round
export function validateCustomRound(round: Partial<CustomRound>): RoundValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  // Check required fields
  if (!round.questionText || round.questionText.trim().length === 0) {
    errors.push({
      field: 'questionText',
      message: 'Question text is required',
      severity: 'error'
    });
  }
  
  if (round.questionText && round.questionText.length > 500) {
    warnings.push({
      field: 'questionText',
      message: 'Question text is longer than 500 characters',
      severity: 'warning'
    });
  }
  
  if (!round.answers || round.answers.length === 0) {
    errors.push({
      field: 'answers',
      message: 'At least one answer is required',
      severity: 'error'
    });
  } else {
    // Validate answers
    round.answers.forEach((answer, index) => {
      if (!answer.text || answer.text.trim().length === 0) {
        errors.push({
          field: `answers[${index}].text`,
          message: `Answer ${index + 1}: Primary text is required`,
          severity: 'error'
        });
      }
      
      if (answer.text && answer.text.length > 100) {
        warnings.push({
          field: `answers[${index}].text`,
          message: `Answer ${index + 1}: Text is longer than 100 characters`,
          severity: 'warning'
        });
      }
    });
    
    // Check for potential duplicates
    if (round.answers.length > 1) {
      for (let i = 0; i < round.answers.length - 1; i++) {
        for (let j = i + 1; j < round.answers.length; j++) {
          if (round.answers[i].text.toLowerCase() === round.answers[j].text.toLowerCase()) {
            warnings.push({
              field: 'answers',
              message: `Potential duplicate answers: "${round.answers[i].text}" and "${round.answers[j].text}"`,
              severity: 'warning'
            });
          }
        }
      }
    }
    
    if (round.answers.length > 10) {
      errors.push({
        field: 'answers',
        message: 'Maximum 10 answers allowed',
        severity: 'error'
      });
    }
  }
  
  // Validate metadata
  if (!round.metadata?.title || round.metadata.title.trim().length === 0) {
    errors.push({
      field: 'metadata.title',
      message: 'Round title is required',
      severity: 'error'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Export rounds to JSON
export function exportRoundsToJSON(rounds: CustomRound[], metadata?: { title?: string; description?: string; author?: string }): string {
  const collection: RoundCollection = {
    version: CURRENT_FORMAT_VERSION,
    exportDate: new Date().toISOString(),
    rounds,
    metadata: metadata || {}
  };
  
  return JSON.stringify(collection, null, 2);
}

// Import rounds from JSON
export function importRoundsFromJSON(jsonString: string): ImportResult {
  const result: ImportResult = {
    success: false,
    importedRounds: [],
    errors: [],
    warnings: [],
    skippedRounds: []
  };
  
  try {
    const data = JSON.parse(jsonString);
    
    // Check if it's a single round or a collection
    if (Array.isArray(data)) {
      // Legacy format - array of rounds
      result.warnings.push('Imported legacy format. Some metadata may be missing.');
      data.forEach((roundData, index) => {
        try {
          const round = convertLegacyRound(roundData);
          const validation = validateCustomRound(round);
          
          if (validation.isValid) {
            result.importedRounds.push(round);
          } else {
            result.skippedRounds.push({
              round: roundData,
              reason: `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
            });
          }
        } catch (error) {
          result.skippedRounds.push({
            round: roundData,
            reason: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      });
    } else if (data.rounds && Array.isArray(data.rounds)) {
      // Collection format
      if (data.version && data.version !== CURRENT_FORMAT_VERSION) {
        result.warnings.push(`Format version mismatch. Expected ${CURRENT_FORMAT_VERSION}, got ${data.version}`);
      }
      
      data.rounds.forEach((roundData: any, index: number) => {
        try {
          const round = ensureCustomRoundFormat(roundData);
          const validation = validateCustomRound(round);
          
          if (validation.isValid) {
            result.importedRounds.push(round);
          } else {
            result.skippedRounds.push({
              round: roundData,
              reason: `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
            });
          }
        } catch (error) {
          result.skippedRounds.push({
            round: roundData,
            reason: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      });
    } else {
      // Single round
      try {
        const round = ensureCustomRoundFormat(data);
        const validation = validateCustomRound(round);
        
        if (validation.isValid) {
          result.importedRounds.push(round);
        } else {
          result.errors.push(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }
      } catch (error) {
        result.errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    result.success = result.importedRounds.length > 0;
    
  } catch (error) {
    result.errors.push(`JSON parse error: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
  }
  
  return result;
}

// Convert legacy round format to custom round format
function convertLegacyRound(roundData: any): CustomRound {
  const now = new Date().toISOString();
  const id = roundData.id || generateRoundId();
  
  return {
    id,
    questionText: roundData.questionText || '',
    answers: roundData.answers || [],
    metadata: {
      id,
      title: roundData.questionText?.substring(0, 50) || 'Imported Round',
      description: 'Imported from legacy format',
      createdAt: now,
      lastModified: now,
      playCount: 0,
      isCustom: true,
      version: CURRENT_FORMAT_VERSION
    },
    settings: {
      shuffleAnswers: false,
      allowPartialCredit: true
    }
  };
}

// Ensure round data has all required CustomRound fields
function ensureCustomRoundFormat(roundData: any): CustomRound {
  const now = new Date().toISOString();
  const id = roundData.id || generateRoundId();
  
  return {
    id,
    questionText: roundData.questionText || '',
    answers: roundData.answers || [],
    metadata: {
      id,
      title: roundData.metadata?.title || roundData.questionText?.substring(0, 50) || 'Imported Round',
      description: roundData.metadata?.description || '',
      author: roundData.metadata?.author || '',
      createdAt: roundData.metadata?.createdAt || now,
      lastModified: roundData.metadata?.lastModified || now,
      playCount: roundData.metadata?.playCount || 0,
      difficulty: roundData.metadata?.difficulty,
      category: roundData.metadata?.category,
      isCustom: true,
      version: roundData.metadata?.version || CURRENT_FORMAT_VERSION
    },
    settings: {
      shuffleAnswers: roundData.settings?.shuffleAnswers || false,
      timeLimit: roundData.settings?.timeLimit,
      allowPartialCredit: roundData.settings?.allowPartialCredit !== false
    }
  };
}

// Get storage usage statistics
export function getStorageStats(): { used: number; available: number; roundCount: number } {
  try {
    const rounds = getAllCustomRounds();
    const roundsData = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROUNDS) || '';
    
    return {
      used: new Blob([roundsData]).size,
      available: 5 * 1024 * 1024, // Estimate 5MB localStorage limit
      roundCount: rounds.length
    };
  } catch {
    return { used: 0, available: 0, roundCount: 0 };
  }
}

// Clear all custom rounds (with confirmation in UI)
export function clearAllCustomRounds(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_ROUNDS);
    return true;
  } catch (error) {
    console.error('Error clearing custom rounds:', error);
    return false;
  }
}

// Increment play count for a round
export function incrementRoundPlayCount(roundId: string): void {
  const round = getCustomRoundById(roundId);
  if (round) {
    round.metadata.playCount++;
    saveCustomRound(round);
  }
}