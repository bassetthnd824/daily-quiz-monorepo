'use client';

import { CSRF_TOKEN_NAME } from '@daily-quiz/core/constants';
import { clientAuth } from '@daily-quiz/core/firebase/client';
import { QuizUser, UserProfile } from '@daily-quiz/models/users';
import { getCookie } from '../util/csrf-tokens';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

export type UserContextValue = {
  currentUser: QuizUser | null;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

export const UserContext = createContext<UserContextValue>({
  currentUser: null,
  loginGoogle: async () => {
    throw new Error('loginGoogle not implemented');
  },
  logout: async () => {
    throw new Error('logout not implemented');
  },
});

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<QuizUser | null>(null);
  const [sessionChecked, setSessionChecked] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const getUserSession = async () => {
      if (currentUser) {
        setSessionChecked(true);
        return;
      }

      const response = await fetch('/api/auth/session');

      if (!response.ok) {
        setSessionChecked(true);
        router.push('/sign-in');
        return;
      }

      const user: QuizUser | undefined = await response.json();

      if (user) {
        setCurrentUser(user);
      }

      setSessionChecked(true);
    };

    if (!sessionChecked) {
      getUserSession();
    }
  }, [currentUser, router, sessionChecked]);

  useEffect(() => {
    if (!clientAuth) {
      return;
    }

    return clientAuth.onAuthStateChanged(async (user) => {
      if (!user) {
        setCurrentUser(null);
        return;
      }

      let userProfile: UserProfile;
      const csrfTokenCookie = getCookie(CSRF_TOKEN_NAME);

      const userResponse = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          [CSRF_TOKEN_NAME]: csrfTokenCookie ?? '',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          idToken: await user.getIdToken(),
          userId: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }),
      });

      if (userResponse.ok) {
        const userJson = await userResponse.json();
        if (userJson) {
          userProfile = {
            ...userJson,
          };

          setCurrentUser({
            uid: user.uid,
            email: user.email ? user.email : undefined,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber ? user.phoneNumber : undefined,
            ...userProfile,
          });
        } else {
          console.error('Could not get user profile');
        }
      } else {
        console.error('Could not get user profile');
      }
    });
  }, []);

  const loginGoogle = () => {
    return new Promise<void>((resolve, reject) => {
      if (!clientAuth) {
        reject();
        return;
      }

      signInWithPopup(clientAuth, new GoogleAuthProvider())
        .then(() => {
          console.log('Signed In');
          resolve();
        })
        .catch(() => {
          console.error('Something went wrong');
          reject();
        });
    });
  };

  const logout = () => {
    return new Promise<void>((resolve, reject) => {
      if (!clientAuth) {
        reject();
        return;
      }

      fetch('/api/auth/logout')
        .then((response) => {
          if (response.ok) {
            setCurrentUser(null);

            clientAuth
              ?.signOut()
              .then(() => {
                console.log('Signed out');
                resolve();
              })
              .catch(() => {
                resolve();
              });
          } else {
            console.log('Something went wrong');
            reject();
          }
        })
        .catch(() => {
          console.error('Something went wrong');
          reject();
        });
    });
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        loginGoogle,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;

export const useAuth = () => useContext(UserContext);
