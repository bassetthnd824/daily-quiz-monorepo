import { userService } from '@daily-quiz/users';
import {
  CSRF_TOKEN_NAME,
  IS_PRODUCTION,
  ONE_HOUR,
} from '@daily-quiz/core/constants';
import { auth, SESSION_COOKIE } from '@daily-quiz/core/firebase-server';
import { QuizUser } from '@daily-quiz/models/users';
import { generateCsrfToken } from '../../../../util/csrf-tokens';
import { DecodedIdToken } from 'firebase-admin/auth';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  let quizUser: QuizUser | undefined = undefined;
  let idToken: DecodedIdToken | undefined;

  if (!sessionCookie) {
    return new NextResponse(undefined, { status: 404 });
  }

  try {
    idToken = await auth?.verifySessionCookie(sessionCookie.value, true);
  } catch (error) {
    console.log(error);
    cookieStore.delete(SESSION_COOKIE);
    return new NextResponse('Session Invalid', { status: 403 });
  }

  try {
    if (!idToken) {
      return new NextResponse(undefined, { status: 404 });
    }

    quizUser = await userService.getQuizUser(idToken?.uid);

    if (!quizUser) {
      return new NextResponse(undefined, { status: 404 });
    }

    cookieStore.set(CSRF_TOKEN_NAME, generateCsrfToken(), {
      path: '/',
      httpOnly: false,
      maxAge: ONE_HOUR,
      sameSite: 'strict',
      secure: IS_PRODUCTION,
    });

    return NextResponse.json(quizUser);
  } catch (error) {
    console.log(error);
    return new NextResponse('Internal Error', { status: 500 });
  }
};
