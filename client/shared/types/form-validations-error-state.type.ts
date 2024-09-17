export type FormValidationsErrorState<T> = {
  fieldErrors: Partial<Record<keyof T, string[]>>;
  formErrors: string[];
};
