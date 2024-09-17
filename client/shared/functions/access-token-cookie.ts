import Cookies from 'js-cookie';
import { secondsToDate } from './seconds-to-date';

export const setAccessTokenCookie = (cookieValue: string, cookieExpiresIn: number) => {
  Cookies.set('access_token_client', cookieValue, {
    expires: secondsToDate(cookieExpiresIn),
    path: '/', // Cookie will be available across the entire site
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    sameSite: 'Lax', // Adjust based on your needs
  });
};

export const getAccessTokenCookie = () => {
  const cookie = Cookies.get('access_token_client');
  return cookie;
};

export const removeAccessTokenCookie = () => {
  Cookies.remove('access_token_client', { path: '/' }); // Ensure you specify the path if it was set
};
