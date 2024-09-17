import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Authentication',
};

const AuthPage = () => {
  // Redirect to /auth/signIn when the user accesses /auth
  redirect('/auth/signIn');
};

export default AuthPage;
