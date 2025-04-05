import { removeAccessTokenCookie } from '@/shared/functions/access-token-cookie';

export const authMiddleware =
  ({ dispatch }) =>
  (next) =>
  (action) => {
    // Check if the action is a rejected action from baseApi
    if (
      action.type === 'api/executeQuery/rejected' && // Check if it's an API action
      action.error && // Ensure there's an error
      action.payload.status === 401 // Check for status 401
    ) {
      // Dispatch a logout action or clear user data if needed
      // dispatch({ type: 'LOGOUT_USER' });

      // remove client jwt coockie to prevent redirecting to '/'
      removeAccessTokenCookie();

      // Redirect to the sign-in page
      window.location.href = '/auth/signIn';
    }

    return next(action);
  };
