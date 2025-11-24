import { QuestionSet } from '../types/domain';

export function validateRounds(rounds: QuestionSet[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  rounds.forEach((r) => {
    if (r.answers.length !== 10) {
      errors.push(`Round '${r.id}' must have exactly 10 answers (found ${r.answers.length}).`);
    }
    const texts = r.answers.map((a) => a.text.trim().toLowerCase());
    const duplicates = texts.filter((t, i) => texts.indexOf(t) !== i);
    if (duplicates.length) {
      errors.push(`Round '${r.id}' has duplicate answers: ${[...new Set(duplicates)].join(', ')}`);
    }
  });
  return { valid: errors.length === 0, errors };
}