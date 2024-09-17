import { Metadata } from 'next';
import SignInForm from './SignInForm';
import { AuthRedirectFromSignIn } from '@/components/auth/AuthRedirect';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Sign in',
};

const SignInPage = () => {
  return (
    <>
      <AuthRedirectFromSignIn>
        <section className="gradient-form h-full bg-transparent">
          <div className="container h-full p-10">
            <div className="flex h-full flex-wrap items-center justify-center text-neutral-800 dark:text-neutral-200">
              <div className="w-full">
                <div className="block rounded-lg bg-white shadow-lg dark:bg-neutral-800">
                  <div className="g-0 lg:flex lg:flex-wrap">
                    {/* Left column container */}
                    <div className="px-4 md:px-0 lg:w-6/12">
                      <div className="pt-2 md:mx-6 md:p-12">
                        {/* Logo */}
                        <div className="text-center">
                          <Image
                            className="mx-auto w-48"
                            src="/assets/images/logo-01.png"
                            alt="logo"
                            width={192} // Set width according to your design (48 * 4 for 4x scaling)
                            height={48} // Set height according to your design
                          />

                          <h4 className="mb-12 mt-1 pb-1 text-base font-normal sm:text-lg">
                            شرکت کویر سرخ
                          </h4>
                        </div>

                        {/* Sign In Form */}
                        <SignInForm />
                      </div>
                    </div>

                    {/* Right column container with background and description */}
                    <div
                      className="hidden items-center rounded-b-lg sm:flex lg:w-6/12 lg:rounded-e-lg lg:rounded-br-none"
                      style={{
                        background: 'linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)',
                      }}
                    >
                      <div className="px-4 py-6 text-right text-white md:mx-6 md:p-12">
                        <h4 className="mb-6 text-sm font-semibold">
                          سیستم حسابداری پیشرفته <p className="inline text-xl">حساب باما</p>
                        </h4>
                        <ul className="space-y-2 text-sm">
                          <li>✓ مدیریت آسان درآمدها و هزینه‌ها</li>
                          <li>✓ گزارش‌گیری دقیق و سریع</li>
                          <li>✓ صدور فاکتور و مدیریت موجودی</li>
                          <li>✓ محاسبه خودکار مالیات و عوارض</li>
                          <li>✓ داشبورد مدیریتی هوشمند</li>
                          <li>✓ پشتیبانی ۲۴/۷ از مشتریان</li>
                        </ul>
                        <div className="mt-4 flex flex-wrap">
                          <p className="text-sm">با استفاده از سیستم حسابداری</p>
                          <p className="inline px-1 text-xl">حساب باما,</p>
                          <p className="text-sm">
                            مدیریت مالی کسب و کار خود را به سطح جدیدی ارتقا دهید.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AuthRedirectFromSignIn>
    </>
  );
};

export default SignInPage;
