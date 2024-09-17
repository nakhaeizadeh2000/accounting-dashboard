import AuthTemplate from '@/components/auth/AuthTemplate';
import SignUpForm from '@/components/auth/SignUpForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign up',
};

const SignUpPage = () => {
  return (
    <AuthTemplate>
      {/* Sign Up Form */}
      <SignUpForm />
    </AuthTemplate>
  );
};

export default SignUpPage;
