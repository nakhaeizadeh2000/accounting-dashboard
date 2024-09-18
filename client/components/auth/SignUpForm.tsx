'use client';

import { SignUpFormData, SignUpSchema } from '@/schemas/validations/auth/sign-up.schema';
import { FormValidationsErrorState } from '@/shared/types/form-validations-error-state.type';
import { isResponseCatchError } from '@/store/features/base-response.model';
import { useSignUpMutation } from '@/store/features/sign-up/sign-up.api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type SignUpErrorState = FormValidationsErrorState<SignUpFormData>;

export default function SignUpForm() {
  const router = useRouter();
  const [signUp, { isLoading }] = useSignUpMutation();
  const [errors, setErrors] = useState<SignUpErrorState>({
    fieldErrors: {},
    formErrors: [],
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData) as SignUpFormData;

    // Client-side validation using safeParse
    const validationResult = SignUpSchema.safeParse(data);

    if (!validationResult.success) {
      const flattenedErrors = validationResult.error.flatten();
      setErrors({
        fieldErrors: flattenedErrors.fieldErrors as SignUpErrorState['fieldErrors'],
        formErrors: flattenedErrors.formErrors,
      });
      return;
    }

    setErrors({ fieldErrors: {}, formErrors: [] });

    try {
      const result = await signUp(data).unwrap();
      if (result.success) {
        // Handle successful signup (e.g., redirect to signIn)
        router.push('/auth/signIn'); // Redirect to signIn page after successful signup
      }
    } catch (error) {
      if (isResponseCatchError(error)) {
        // Handle ResponseCatchError specifically
        setErrors({
          fieldErrors: error.data.validationErrors,
          formErrors: error.data.message,
        });
      } else {
        setErrors({
          fieldErrors: {},
          formErrors: ['یک خطای غیرمنتظره رخ داده است. لطفا به پشتیبانی اطلاع دهید.'],
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-lg font-medium">ثبت نام</p>

      {/* First Name input */}
      <div>
        <div className="relative mt-4" data-twe-input-wrapper-init>
          <input
            type="text"
            name="firstName"
            className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-neutral-300 dark:autofill:shadow-autofill dark:peer-focus:text-primary [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
            id="firstName"
            placeholder="نام"
          />
          <label
            htmlFor="firstName"
            className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[twe-input-state-active]:-translate-y-[0.9rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
          >
            نام
          </label>
        </div>
        {errors.fieldErrors.firstName && (
          <ul className="mt-1 text-xs text-red-600">
            {errors.fieldErrors.firstName.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Last Name input */}
      <div>
        <div className="relative mt-4" data-twe-input-wrapper-init>
          <input
            type="text"
            name="lastName"
            className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-neutral-300 dark:autofill:shadow-autofill dark:peer-focus:text-primary [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
            id="lastName"
            placeholder="نام خانوادگی"
          />
          <label
            htmlFor="lastName"
            className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[twe-input-state-active]:-translate-y-[0.9rem] peer-data-[twe-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-400 dark:peer-focus:text-primary"
          >
            نام خانوادگی
          </label>
        </div>
        {errors.fieldErrors.lastName && (
          <ul className="mt-1 text-xs text-red-600">
            {errors.fieldErrors.lastName.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Email input */}
      <div>
        <div className="relative mt-4" data-twe-input-wrapper-init>
          <input
            type="text"
            name="email"
            className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-neutral-300 dark:autofill:shadow-autofill dark:peer-focus:text-primary [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
            id="email"
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
        )}
      </div>

      {/* Password input */}
      <div>
        <div className="relative mt-4" data-twe-input-wrapper-init>
          <input
            type="password"
            name="password"
            className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[twe-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-white dark:placeholder:text-neutral-300 dark:autofill:shadow-autofill dark:peer-focus:text-primary [&:not([data-twe-input-placeholder-active])]:placeholder:opacity-0"
            id="password"
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
          {/* TODO: work on response when email is not uniqe */}
          {isLoading ? 'در حال بارگزاری...' : 'ثبت نام'}
        </button>

        {/* Form errors */}
        {errors.formErrors.length > 0 && (
          <ul className="flex justify-center pb-4 text-xs text-red-600">
            {errors.formErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Already have an account? Link */}
      <div className="flex items-center justify-between pb-2">
        <p className="mb-0 me-2 text-xs sm:text-sm">قبلاً ثبت نام کرده‌اید؟</p>
        <button
          type="button"
          onClick={() => router.push('/auth/signIn')} // Redirect to signIn page
          className="inline-block rounded border border-danger px-3 pb-[3px] pt-1 text-xs font-light uppercase leading-normal text-danger transition duration-150 ease-in-out hover:border-danger-600 hover:bg-danger-50/50 hover:text-danger-600 focus:border-danger-600 focus:bg-danger-50/50 focus:text-danger-600 focus:outline-none focus:ring-0 active:border-danger-700 active:text-danger-700 dark:hover:bg-rose-950 dark:focus:bg-rose-950"
          data-twe-ripple-init
          data-twe-ripple-color="light"
        >
          ورود
        </button>
      </div>
    </form>
  );
}
