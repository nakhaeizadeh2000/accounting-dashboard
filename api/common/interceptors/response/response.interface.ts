export interface ResponseData<T> {
  success: boolean; // Indicates if the request was successful
  statusCode: number; // HTTP status code for the response
  message?: string[]; // Optional message for additional context
  data?: T; // The actual data returned by the API
  // error?: {
  //   code: number; // Error code
  //   message: string[]; // Error message
  //   details?: any; // Optional additional error details
  // };
  validationErrors?: {
    [key: string]: string[]; // Field-specific validation error messages
  };
}
