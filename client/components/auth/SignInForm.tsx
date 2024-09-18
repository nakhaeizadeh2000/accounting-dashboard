'use client';

import { SignInFormData, SignInSchema } from '@/schemas/validations/auth/sign-in.schema';
import { setAccessTokenCookie } from '@/shared/functions/access-token-cookie';
import { FormValidationsErrorState } from '@/shared/types/form-validations-error-state.type';
import { isResponseCatchError } from '@/store/features/base-response.model';
import { useSignInMutation } from '@/store/features/sign-in/sign-in.api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AnimatedInput from '../tw-components/forms/input-groups/AnimatedInput';

type SignInErrorState = FormValidationsErrorState<SignInFormData>;

export default function SignInForm() {
  const router = useRouter();
  const [signIn, { isLoading }] = useSignInMutation();
  const [errors, setErrors] = useState<SignInErrorState>({
    fieldErrors: {},
    formErrors: [],
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData) as SignInFormData;

    // Client-side validation using safeParse
    const validationResult = SignInSchema.safeParse(data);

    if (!validationResult.success) {
      const flattenedErrors = validationResult.error.flatten();
      setErrors({
        fieldErrors: (flattenedErrors.fieldErrors as SignInErrorState['fieldErrors']) || {},
        formErrors: flattenedErrors.formErrors || [],
      });
      return;
    }

    setErrors({ fieldErrors: {}, formErrors: [] });

    try {
      const result = await signIn(data).unwrap();
      if (result.success) {
        setAccessTokenCookie(result.data.access_token, result.data.cookie_expires_in);
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push('/'); // Redirect to home if no back page
        }
      }
    } catch (error: unknown) {
      if (isResponseCatchError(error)) {
        // Handle ResponseCatchError specifically
        setErrors({
          fieldErrors: error.data.validationErrors || {},
          formErrors: error.data.message || [],
        });
      } else {
        // Handle other types of errors
        setErrors({
          fieldErrors: {},
          formErrors: ['یک خطای غیرمنتظره رخ داده است. لطفا به پشتیبانی اطلاع دهید.'],
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-lg font-medium">ورود</p>

      {/* Email input */}
      <div>
        {/* <div className="relative mt-4" data-twe-input-wrapper-init>
          <input
            type="text"
            name="email"
            className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-neutral-300 dark:autofill:shadow-autofill dark:peer-focus:text-primary [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
            id="exampleFormControlInput1"
            placeholder="ایمیل"
          />
          <label
            htmlFor="email"
            className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[twe-input-state-active]:-translate-y-[0.9rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
          >
            ایمیل
          </label>
        </div>
        {errors.fieldErrors.email && (
          <ul className="mt-1 text-xs text-red-600">
            {errors.fieldErrors.email.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )} */}
        <AnimatedInput />
      </div>

      {/* Password input */}
      <div>
        <div className="relative mt-4" data-twe-input-wrapper-init>
          <input
            type="password"
            name="password"
            className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-neutral-300 dark:autofill:shadow-autofill dark:peer-focus:text-primary [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
            id="exampleFormControlInput11"
            placeholder="رمزعبور"
          />
          <label
            htmlFor="password"
            className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[twe-input-state-active]:-translate-y-[0.9rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
          >
            رمزعبور
          </label>
        </div>
        {errors.fieldErrors.password && (
          <ul className="mt-1 text-xs text-red-600">
            {errors.fieldErrors.password.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit button */}
      <div className="pt-3 text-center">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md px-6 py-2 text-sm font-medium text-white transition duration-150 ease-in-out"
          data-twe-ripple-init
          data-twe-ripple-color="light"
          style={{
            background: 'linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)',
          }}
        >
          {isLoading ? 'در حال بارگزاری...' : 'ورود'}
        </button>

        {/* Form errors */}
        {errors.formErrors.length > 0 && (
          <ul className="flex justify-center py-3 text-xs text-red-600">
            {errors.formErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}

        {/* Forgot password link */}
        {/* TODO: handle forgot password section in signIn form */}
        <a
          href="#!"
          className="dark:text- mt-2 block text-xs text-neutral-600 hover:underline dark:text-neutral-400 sm:text-sm"
        >
          رمزعبور خود را فراموش کرده اید؟
        </a>
      </div>

      {/* Register button */}
      <div className="flex items-center justify-between pb-2">
        <p className="mb-0 me-2 text-xs sm:text-sm">ثبت نام نکرده اید؟</p>
        <button
          type="button"
          onClick={() => router.push('/auth/signUp')} // Redirect to signUp page
          className="inline-block rounded border border-danger px-3 pb-[3px] pt-1 text-xs font-light uppercase leading-normal text-danger transition duration-150 ease-in-out hover:border-danger-600 hover:bg-danger-50/50 hover:text-danger-600 focus:border-danger-600 focus:bg-danger-50/50 focus:text-danger-600 focus:outline-none focus:ring-0 active:border-danger-700 active:text-danger-700 dark:hover:bg-rose-950 dark:focus:bg-rose-950"
          data-twe-ripple-init
          data-twe-ripple-color="light"
        >
          ثبت نام
        </button>
      </div>
    </form>
  );
}
