'use client';
import { getAccessTokenCookie } from '@/shared/functions/access-token-cookie';

const CheckAuth = ({ children }: { children: React.ReactNode }) => {
  // If the token exists, render the children
  return <>{getAccessTokenCookie() ? children : null}</>;
};

export default CheckAuth;
