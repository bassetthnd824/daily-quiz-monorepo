import { Question } from '../questions/question.model';
import { QuizSummary } from './quiz-summary.model';

export type Quiz = {
  date: string;
  questions: Question[];
  summaries?: Record<string, QuizSummary>;
};
