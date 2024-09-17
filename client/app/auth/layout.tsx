import { AuthRedirectFromSignIn } from '@/components/auth/AuthRedirect';
import ContentAnimation from '@/components/layouts/content-animation';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthRedirectFromSignIn>
      <div className="main-content flex min-h-screen flex-col justify-center">
        <ContentAnimation>{children}</ContentAnimation>
      </div>
    </AuthRedirectFromSignIn>
  );
};

export default AuthLayout;
