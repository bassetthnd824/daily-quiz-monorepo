'use client';

import Quiz from '../../components/quiz/quiz/Quiz';
import { Quiz as QuizModel } from '@daily-quiz/quizzes/models';
import { getCurrentDate } from '@daily-quiz/core/utils';
import { useEffect, useState } from 'react';

const TodaysQuiz = () => {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizModel>();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const getQuiz = async () => {
      try {
        const data = await fetch(`/api/quiz/${getCurrentDate()}`);
        const quiz = await data.json();
        setQuiz(quiz);
      } catch (error) {
        setError(error as unknown as string);
      } finally {
        setLoading(false);
      }
    };

    getQuiz();
  }, []);

  return (
    <>
      {loading && <div>Loading...</div>}
      {!loading && <Quiz quiz={quiz!}></Quiz>}
      {error && <div>{error}</div>}
    </>
  );
};

export default TodaysQuiz;
