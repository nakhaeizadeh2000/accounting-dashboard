import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign up',
};

const SignUpPage = () => {
  return (
    <div>
      <h1 className="text-white">Sign Up</h1>
      {/* Your sign-up form goes here */}
    </div>
  );
};

export default SignUpPage;
