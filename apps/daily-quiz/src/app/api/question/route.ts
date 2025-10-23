import { userService } from '@daily-quiz/users';
import {
  auth,
  firestore,
  SESSION_COOKIE,
} from '@daily-quiz/core/firebase-server';
import { QuestionStatus, Question } from '@daily-quiz/models/questions';
import { withCsrf } from '../../../util/csrf-tokens';
import { getCurrentDate } from '@daily-quiz/core/utils';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { questionService } from '@daily-quiz/questions';

const POST_handler = async (request: NextRequest) => {
  try {
    const cookieStore = await cookies();

    if (!cookieStore.has(SESSION_COOKIE)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (!firestore || !auth) {
      return new NextResponse('Internal Error: no firestore or no auth', {
        status: 500,
      });
    }

    const sessionCookie = cookieStore.get(SESSION_COOKIE);

    if (!sessionCookie) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { uid } = await auth.verifySessionCookie(sessionCookie.value, true);
    const question = await request.json();
    const quizUser = await userService.getQuizUser(uid);

    const newQuestion: Omit<Question, 'id'> = {
      text: question.text,
      answers: [question.correctAnswer, ...question.answers],
      lastUsedDate: '1111-11-11',
      status: QuestionStatus.PENDING,
      submittedBy: quizUser?.displayName ?? 'Anonymous',
      dateSubmitted: getCurrentDate(),
    };

    await questionService.addQuestion(newQuestion);

    return NextResponse.json('Question Added', { status: 201 });
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
};

export const POST = withCsrf(POST_handler);
