import 'server-only';
import { questionDao } from './question.dao';
import { Question } from '@daily-quiz/models/questions';
import { firestore } from '@daily-quiz/core/firebase/server';

const addQuestion = async (question: Omit<Question, 'id'>): Promise<void> => {
  await firestore?.runTransaction(async (transaction) => {
    questionDao.addQuestion(transaction, question);
  });
};

export const questionService = {
  addQuestion,
};
