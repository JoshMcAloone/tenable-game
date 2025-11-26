import { QuestionSet } from '../types/domain';

export function validateRounds(rounds: QuestionSet[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  rounds.forEach((r) => {
    if (r.answers.length !== 10) {
      errors.push(`Round '${r.id}' must have exactly 10 answers (found ${r.answers.length}).`);
    }
    
    // Check for duplicate primary texts
    const texts = r.answers.map((a) => a.text.trim().toLowerCase());
    const duplicates = texts.filter((t, i) => texts.indexOf(t) !== i);
    if (duplicates.length) {
      errors.push(`Round '${r.id}' has duplicate primary answer texts: ${[...new Set(duplicates)].join(', ')}`);
    }
    
    // Check for duplicate alternative texts (if they exist)
    const altTexts = r.answers
      .filter((a) => a.alternativeText)
      .map((a) => a.alternativeText!.trim().toLowerCase());
    if (altTexts.length > 0) {
      const altDuplicates = altTexts.filter((t, i) => altTexts.indexOf(t) !== i);
      if (altDuplicates.length) {
        errors.push(`Round '${r.id}' has duplicate alternative answer texts: ${[...new Set(altDuplicates)].join(', ')}`);
      }
    }
    
    // Check for conflicts between primary and alternative texts
    r.answers.forEach((answer, idx) => {
      if (answer.alternativeText) {
        const normalizedAlt = answer.alternativeText.trim().toLowerCase();
        // Check if this alternative text conflicts with any other answer's primary text
        texts.forEach((text, textIdx) => {
          if (textIdx !== idx && text === normalizedAlt) {
            const conflictAnswer = r.answers[textIdx];
            errors.push(`Round '${r.id}': Alternative text "${answer.alternativeText}" conflicts with primary text of answer "${conflictAnswer.text}"`);
          }
        });
        
        // Check if this alternative text conflicts with any other answer's alternative text
        r.answers.forEach((otherAnswer, otherIdx) => {
          if (otherIdx !== idx && otherAnswer.alternativeText && 
              otherAnswer.alternativeText.trim().toLowerCase() === normalizedAlt) {
            errors.push(`Round '${r.id}': Alternative text "${answer.alternativeText}" is duplicated between multiple answers`);
          }
        });
      }
    });
  });
  return { valid: errors.length === 0, errors };
}