import roundsData from '../data/rounds.example.json';
import { QuestionSet } from '../types/domain';
import { validateRounds } from './validation';

export function loadRounds(): QuestionSet[] {
  const rounds = roundsData as QuestionSet[];
  const { valid, errors } = validateRounds(rounds);
  if (!valid) {
    // Validation errors found
  }
  return rounds;
}