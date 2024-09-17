import ContentAnimation from '@/components/layouts/content-animation';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="main-content flex min-h-screen flex-col justify-center">
      <ContentAnimation>{children}</ContentAnimation>
    </div>
  );
};

export default AuthLayout;
