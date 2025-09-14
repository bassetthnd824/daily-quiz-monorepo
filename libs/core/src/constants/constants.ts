export const IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production';

export const CSRF_TOKEN_NAME = 'csrftoken';

export const ERROR_CODE_INVALID_CSRF = 'middleware/invalid-csrf-token';
export const ERROR_CODE_INTERNAL_SERVER = 'server/internal-server-error';
export const SESSION_COOKIE = 'daily-quiz-session';

export const REUSE_QUESTION_AFTER_DAYS = 30;
export const MAX_DAILY_QUESTIONS = 10;
export const MAX_POINTS = 10;

export const QUESTION_TIME = 20000;
export const SELECTED_TIME = 1000;
export const CORRECT_TIME = 2000;

export const DATE_FORMAT = 'YYYY-MM-DD';

export const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
export const ONE_HOUR = 60 * 60 * 1000;
