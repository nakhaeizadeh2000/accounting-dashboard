export interface BaseResponse<T> {
  success: boolean; // Indicates if the request was successful
  statusCode: number; // HTTP status code for the response
  message: string[]; // Optional message for additional context
  data: T; // The actual data returned by the API
  // error: {
  //   code: number; // Error code
  //   message: string[]; // Error message
  //   details?: unknown; // Optional additional error details
  // };
  validationErrors: {
    [key: string]: string[]; // Field-specific validation error messages
  };
}

export type ResponseCatchError = {
  status: number;
  data: Omit<BaseResponse<never>, 'data'>;
};

// Type guard to check if the error is of type ResponseCatchError
export function isResponseCatchError(error: unknown): error is ResponseCatchError {
  return typeof error === 'object' && error !== null && 'status' in error && 'data' in error;
}
