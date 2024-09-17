'use client';
import { useEffect } from 'react';
import { getAccessTokenCookie } from '@/shared/functions/access-token-cookie';
import { useRouter } from 'next/navigation';

const AuthRedirectToSignIn = () => {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessTokenCookie();

    if (!token) {
      // Redirect to the sign-in page if the token does not exist
      router.push('/auth/signIn');
    }
  }, [router]);

  return null; // This component does not render anything
};

export const AuthRedirectFromSignIn = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessTokenCookie();

    if (token) {
      // Redirect to the sign-in page if the token does not exist
      router.push('/');
    }
  }, [router]);

  return <>{!getAccessTokenCookie() ? children : null}</>; // This component does not render anything
};

export default AuthRedirectToSignIn;
