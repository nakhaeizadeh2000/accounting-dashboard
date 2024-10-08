'use client';

import { SignInFormData, SignInSchema } from '@/schemas/validations/auth/sign-in.schema';
import { setAccessTokenCookie } from '@/shared/functions/access-token-cookie';
import { FormValidationsErrorState } from '@/shared/types/form-validations-error-state.type';
import { isResponseCatchError } from '@/store/features/base-response.model';
import { useSignInMutation } from '@/store/features/auth/sign-in/sign-in.api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AnimatedInputElement from '@/Elements/input-elements/AnimatedInputElement';
import FormButton from '../Elements/buttons/FormButton';
import { FiLogIn } from 'react-icons/fi';
import { MdOutlineAlternateEmail } from 'react-icons/md';
import { FaEyeLowVision } from 'react-icons/fa6';
import AnimatedPasswordInputelement from '../Elements/input-elements/AnimatedPasswordInputElement';

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
        if (window.history.length > 1 && document.referrer.includes('SignUp')) {
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
    <form onSubmit={handleSubmit} className="space-y-1">
      <p className="text-lg font-medium">ورود</p>

      {/* Email input */}

      <AnimatedInputElement
        options={{
          key: 'email',
          label: 'ایمیل',
          type: 'text',
          fieldError: errors.fieldErrors.email,
          icon: { Icon: MdOutlineAlternateEmail },
        }}
      />

      {/* Password input */}
      <AnimatedPasswordInputelement passwordFieldErrors={errors.fieldErrors.password} />

      {/* Submit button */}
      <div className="pt-3 text-center">
        <FormButton
          isLoading={isLoading}
          className="text-white"
          style={{
            background: 'linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)',
          }}
          label="ورود"
          Icon={FiLogIn}
          loadingIconColor="bg-neutral-300"
        ></FormButton>

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
      <div className="flex items-center justify-between py-2">
        <p className="mb-0 me-2 text-xs sm:text-sm">ثبت نام نکرده اید؟</p>
        <button
          type="button"
          onClick={() => router.push('/auth/signUp')} // Redirect to signUp page
          className="hover:border-danger-600 hover:bg-danger-50/50 hover:text-danger-600 focus:border-danger-600 focus:bg-danger-50/50 focus:text-danger-600 active:border-danger-700 active:text-danger-700 inline-block rounded border border-danger px-3 pb-[3px] pt-1 text-xs font-light uppercase leading-normal text-danger transition duration-150 ease-in-out focus:outline-none focus:ring-0 dark:hover:bg-rose-950 dark:focus:bg-rose-950"
        >
          ثبت نام
        </button>
      </div>
    </form>
  );
}
