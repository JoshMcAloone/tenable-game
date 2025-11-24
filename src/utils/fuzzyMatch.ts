/**
 * Fuzzy matching utility for answer checking
 * Handles common variations like:
 * - Missing/extra articles (the, a, an)
 * - Punctuation differences
 * - Typos and character substitutions
 * - Case insensitive matching
 * - Extra whitespace
 */

/**
 * Calculate Levenshtein distance between two strings
 * Used for typo tolerance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Normalize text for fuzzy matching
 * - Convert to lowercase
 * - Remove extra whitespace
 * - Remove common punctuation
 * - Remove common articles
 */
function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Handle abbreviations with dots (e.g., "S.O.S" -> "SOS")
    .replace(/\b([a-z])\.(?=\s*[a-z]\.|\s*[a-z]\b)/gi, '$1')
    // Remove remaining punctuation but keep apostrophes in contractions
    .replace(/[^\w\s']/g, ' ')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    // Remove common articles at the beginning
    .replace(/^(the|a|an)\s+/i, '')
    // Remove common articles in the middle (be careful not to break real words)
    .replace(/\s+(the|a|an)\s+/gi, ' ');
}

/**
 * Calculate similarity percentage between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1, str2);
  return (maxLength - distance) / maxLength;
}

/**
 * Check if an answer is close enough to be considered correct
 * Returns a match score from 0 to 1 (1 = perfect match)
 */
export function fuzzyMatchAnswer(userAnswer: string, correctAnswer: string): number {
  // First try exact match after normalization (highest score)
  const normalizedUser = normalizeForMatching(userAnswer);
  const normalizedCorrect = normalizeForMatching(correctAnswer);
  
  if (normalizedUser === normalizedCorrect) {
    return 1.0; // Perfect match
  }
  
  // Calculate similarity
  const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);
  
  // Additional checks for common variations
  let bonusScore = 0;
  
  // Check if one is contained in the other (handles missing words)
  if (normalizedCorrect.includes(normalizedUser) || normalizedUser.includes(normalizedCorrect)) {
    bonusScore += 0.1;
  }
  
  // Special handling for abbreviations - check if removing all spaces makes them match
  const userNoSpaces = normalizedUser.replace(/\s/g, '');
  const correctNoSpaces = normalizedCorrect.replace(/\s/g, '');
  if (userNoSpaces === correctNoSpaces) {
    return 1.0; // Perfect abbreviation match
  }
  
  // Check for word order independence (split and compare words)
  const userWords = new Set(normalizedUser.split(' '));
  const correctWords = new Set(normalizedCorrect.split(' '));
  const intersection = new Set([...userWords].filter(x => correctWords.has(x)));
  const union = new Set([...userWords, ...correctWords]);
  
  if (union.size > 0) {
    const wordSimilarity = intersection.size / union.size;
    bonusScore += wordSimilarity * 0.1;
  }
  
  return Math.min(1.0, similarity + bonusScore);
}

/**
 * Check if answer should be accepted based on fuzzy matching
 * Returns true if the answer is close enough to be considered correct
 */
export function isAnswerAcceptable(userAnswer: string, correctAnswer: string, threshold: number = 0.8): boolean {
  const score = fuzzyMatchAnswer(userAnswer, correctAnswer);
  return score >= threshold;
}