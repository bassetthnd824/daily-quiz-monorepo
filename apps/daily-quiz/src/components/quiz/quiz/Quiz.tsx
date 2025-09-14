'use client';

import { useCallback, useState } from 'react';
import classes from './Quiz.module.scss';
import QuestionComponent from '../question/Question';
import Summary from '../summary/Summary';
import { Quiz as QuizModel, UserAnswer } from '@daily-quiz/models/quizzes';
import { useAuth } from '../../../context/user-context';
import NoQuiz from '../no-quiz/NoQuiz';

export type QuizProps = {
  quiz: QuizModel;
};

export type AnswerState = '' | 'answered' | 'correct' | 'wrong';

const Quiz = ({ quiz }: QuizProps) => {
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const { currentUser } = useAuth();

  const activeQuestionIndex = userAnswers.length;
  const uid = currentUser?.uid;
  const noQuiz = quiz.questions.length === 0 && !quiz.summaries?.[uid!];
  const quizIsComplete =
    quiz.summaries?.[uid!] || activeQuestionIndex === quiz.questions.length;

  const handleSelectAnswer = useCallback((selectedAnswer: UserAnswer) => {
    setUserAnswers((prevUserAnswers) => {
      return [...prevUserAnswers, selectedAnswer];
    });
  }, []);

  const handleSkipAnswer = useCallback(
    () => handleSelectAnswer({ answer: '', timeToAnswer: 0 }),
    [handleSelectAnswer]
  );

  if (noQuiz) {
    return <NoQuiz />;
  }

  if (quizIsComplete) {
    return (
      <Summary
        userAnswers={userAnswers}
        questions={quiz.questions}
        prevSummary={quiz.summaries?.[uid!]}
      />
    );
  }

  return (
    <div className={classes.quiz}>
      <QuestionComponent
        key={activeQuestionIndex}
        question={
          quiz.questions.length > 0
            ? quiz.questions[activeQuestionIndex]
            : undefined
        }
        onSelectAnswer={handleSelectAnswer}
        onSkipAnswer={handleSkipAnswer}
      />
    </div>
  );
};

export default Quiz;
