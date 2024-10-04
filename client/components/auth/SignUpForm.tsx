'use client';

import { SignUpFormData, SignUpSchema } from '@/schemas/validations/auth/sign-up.schema';
import { FormValidationsErrorState } from '@/shared/types/form-validations-error-state.type';
import { isResponseCatchError } from '@/store/features/base-response.model';
import { useSignUpMutation } from '@/store/features/sign-up/sign-up.api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AnimatedInputElement from '../Elements/input-elements/AnimatedInputElement';
import FormButton from '../Elements/buttons/FormButton';

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

    // Client validation via Zod
    if (!validationResult.success) {
      const flattenedErrors = validationResult.error.flatten();
      setErrors({
        fieldErrors: (flattenedErrors.fieldErrors as SignUpErrorState['fieldErrors']) || {},
        formErrors: flattenedErrors.formErrors || [],
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
          fieldErrors: error.data.validationErrors || {},
          formErrors: error.data.message || [],
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
    <form onSubmit={handleSubmit} className="space-y-1">
      <p className="text-lg font-medium">ثبت نام</p>

      <div className="columns-2 gap-2">
        {/* First Name input */}
        <AnimatedInputElement
          options={{
            key: 'firstName',
            label: 'نام',
            type: 'text',
            fieldError: errors.fieldErrors.firstName,
          }}
        />

        {/* Last Name input */}
        <AnimatedInputElement
          options={{
            key: 'lastName',
            label: 'نام خانوادگی',
            type: 'text',
            fieldError: errors.fieldErrors.lastName,
          }}
        />
      </div>

      {/* Email input */}
      <AnimatedInputElement
        options={{
          key: 'email',
          label: 'ایمیل',
          type: 'text',
          fieldError: errors.fieldErrors.email,
        }}
      />

      {/* Password input */}
      <AnimatedInputElement
        options={{
          key: 'password',
          label: 'رمزعبور',
          type: 'password',
          fieldError: errors.fieldErrors.password,
        }}
      />

      {/* Submit button */}
      <div className="pt-3 text-center">
        <FormButton
          isLoading={isLoading}
          className="text-white"
          style={{
            background: 'linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)',
          }}
          label="ثبت نام"
          loadingIconColor="bg-neutral-300"
        ></FormButton>
        {/* <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md px-6 py-2 text-sm font-medium text-white transition duration-150 ease-in-out"
          style={{
            background: 'linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)',
          }}
        >
          {isLoading ? 'در حال بارگزاری...' : 'ثبت نام'}
        </button> */}

        {/* Form errors */}
        {errors.formErrors.length > 0 && (
          <ul className="flex justify-center py-3 text-xs text-red-600">
            {errors.formErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Already have an account? Link */}
      <div className="flex items-center justify-between pb-2 pt-2">
        <p className="mb-0 me-2 text-xs sm:text-sm">قبلاً ثبت نام کرده‌اید؟</p>
        <button
          type="button"
          onClick={() => router.push('/auth/signIn')} // Redirect to signIn page
          className="hover:border-danger-600 hover:bg-danger-50/50 hover:text-danger-600 focus:border-danger-600 focus:bg-danger-50/50 focus:text-danger-600 active:border-danger-700 active:text-danger-700 inline-block rounded border border-danger px-3 pb-[3px] pt-1 text-xs font-light uppercase leading-normal text-danger transition duration-150 ease-in-out focus:outline-none focus:ring-0 dark:hover:bg-rose-950 dark:focus:bg-rose-950"
        >
          ورود
        </button>
      </div>
    </form>
  );
}
