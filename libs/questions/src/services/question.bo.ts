import 'server-only';
import { questionDao } from './question.dao';
import { Question } from '../models/question.model';
import { firestore } from '@daily-quiz/core/firebase';

const addQuestion = async (question: Omit<Question, 'id'>): Promise<void> => {
  await firestore?.runTransaction(async (transaction) => {
    questionDao.addQuestion(transaction, question);
  });
};

export const questionService = {
  addQuestion,
};
