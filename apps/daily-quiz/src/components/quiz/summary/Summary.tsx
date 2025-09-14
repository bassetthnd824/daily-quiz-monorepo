'use client';

import { Question } from '@daily-quiz/questions/models';
import classes from './Summary.module.scss';
import { QuizSummary, UserAnswer } from '@daily-quiz/quizzes/models';
import { useEffect, useState } from 'react';
import { getCurrentDate } from '@daily-quiz/core/utils';
import { CSRF_TOKEN_NAME } from '@daily-quiz/core/constants';
import { getCookie } from '../../../util/csrf-tokens';

export type SummaryProps = {
  userAnswers: UserAnswer[];
  questions: Question[];
  prevSummary?: QuizSummary;
};

const Summary = ({ userAnswers, questions, prevSummary }: SummaryProps) => {
  const [loading, setLoading] = useState(true);
  const [quizSummary, setQuizSummary] = useState<QuizSummary>();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const patchQuiz = async () => {
      try {
        const csrfTokenCookie = getCookie(CSRF_TOKEN_NAME);

        const quizPatchResponse = await fetch(`/api/quiz/${getCurrentDate()}`, {
          method: 'PATCH',
          headers: {
            [CSRF_TOKEN_NAME]: csrfTokenCookie ?? '',
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            userAnswers,
            questions,
          }),
        });

        if (!quizPatchResponse.ok) {
          throw new Error('Failed to patch quiz');
        }

        const data = await quizPatchResponse.json();
        setQuizSummary(data);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (!prevSummary) {
      patchQuiz();
    } else {
      setQuizSummary(prevSummary);
      setLoading(false);
    }
  }, [questions, userAnswers, prevSummary]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={classes.summary}>
      <h2>Quiz Completed!</h2>
      <h3>Your Score: {quizSummary?.score}</h3>
      <div className={classes.summaryStats}>
        <p>
          <span className={classes.number}>
            {quizSummary?.skippedAnswersShare}%
          </span>
          <span className={classes.text}>skipped</span>
        </p>
        <p>
          <span className={classes.number}>
            {quizSummary?.correctAnswersShare}%
          </span>
          <span className={classes.text}>answered correctly</span>
        </p>
        <p>
          <span className={classes.number}>
            {quizSummary?.wrongAnswersShare}%
          </span>
          <span className={classes.text}>answered incorrectly</span>
        </p>
      </div>
      <div className={classes.answerGrid}>
        {quizSummary?.answers.map((answer, index) => {
          return (
            <>
              <div className={classes.answerNumber} key={`${index}-number`}>
                <p>{index + 1}</p>
              </div>
              <div className={classes.answerQuestion} key={`${index}-question`}>
                <p className={classes.question}>Q: {answer?.questionText}</p>
                <p
                  className={`${classes.userAnswer} ${
                    answer?.status ? classes[answer.status] : ''
                  }`}
                >
                  A: {answer.answer || 'Skipped'}
                </p>
                <p className={classes.question}>Score: {answer.bonus}</p>
              </div>
            </>
          );
        })}
      </div>
    </div>
  );
};

export default Summary;
