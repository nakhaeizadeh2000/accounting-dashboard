import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { ResponseData } from './response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseData<T>>
{
  // Set a default timeout duration (in milliseconds)
  // private readonly timeoutDuration: number = 5000; // 5 seconds

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseData<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      // timeout(this.timeoutDuration), // Apply the timeout operator
      map((data) => {
        // Handle successful responses
        return {
          success: true,
          statusCode: response.statusCode,
          message: 'Request processed successfully',
          data,
        };
      }),
      catchError((error) => {
        // Handle timeout errors
        if (error.name === 'TimeoutError') {
          const responseData: ResponseData<null> = {
            success: false,
            statusCode: 408, // HTTP status code for Request Timeout
            error: {
              code: 408,
              message: 'The operation timed out.',
            },
          };
          return of(responseData); // Return the timeout response as an observable
        }

        // Handle common error fileds
        const statusCode = error.status || 500;
        let responseData: ResponseData<null> = {
          success: false,
          statusCode,
        };

        // If validation errors are present, format them
        if (error instanceof BadRequestException) {
          const validationErrors = error.getResponse() as any;

          // Map validation errors to the desired structure
          if (Array.isArray(validationErrors.message)) {
            validationErrors.message.forEach((msg: string) => {
              const field = msg.split(' ')[0]; // Extract field name from the message

              // Initialize the field in validationErrors if it doesn't exist
              if (!responseData.validationErrors) {
                responseData = { ...responseData, validationErrors: {} };
              }

              if (!responseData.validationErrors[field]) {
                responseData.validationErrors[field] = [];
              }

              // Add the error message to the array for this field
              responseData.validationErrors[field].push(msg); // Add to validationErrors
            });
          }

          return of(responseData);
        }

        // Handle rest kind of errors
        responseData.error = {
          code: statusCode,
          message: error.message || 'An unexpected error occurred',
          details: error.response || null,
        };

        // Return the formatted error response as an observable
        return of(responseData);
      }),
    );
  }
}
