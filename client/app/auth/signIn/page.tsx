import AuthTemplate from '@/components/auth/AuthTemplate';
import SignInForm from '@/components/auth/SignInForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in',
};

const SignInPage = () => {
  return (
    <AuthTemplate>
      {/* Sign In Form */}
      <SignInForm />
    </AuthTemplate>
  );
};

export default SignInPage;
