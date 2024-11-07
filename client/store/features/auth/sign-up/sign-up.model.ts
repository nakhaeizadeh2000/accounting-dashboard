import { SignUpFormData } from '@/schemas/validations/auth/sign-up.schema';

export type SignUpBody = SignUpFormData;

export type SignUpResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
};
