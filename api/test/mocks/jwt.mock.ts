export const createJwtServiceMock = () => {
  return {
    sign: jest.fn(() => 'mocked-jwt-token'),
    verify: jest.fn(() => true),
    verifyAsync: jest.fn(async (token: string, options?: any) => {
      if (token === 'invalid-token') {
        throw new Error('Invalid token');
      }
      return { user_id: '1', refresh_token_id: '123' };
    }),
  };
};
