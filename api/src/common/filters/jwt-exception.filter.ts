import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';

@Catch(JsonWebTokenError, TokenExpiredError, Error)
export class JwtExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(JwtExceptionFilter.name);

  catch(
    exception: JsonWebTokenError | TokenExpiredError | Error,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Log the error for debugging
    this.logger.error(`JWT error: ${exception.message}`, exception.stack);

    let message = 'دسترسی غیرمجاز';
    let statusCode = 401;

    if (exception instanceof TokenExpiredError) {
      message = 'توکن منقضی شده است';
    } else if (exception instanceof JsonWebTokenError) {
      message = 'توکن نامعتبر است';
    } else if (
      exception.message.includes('token') ||
      exception.message.includes('jwt')
    ) {
      message = 'خطای احراز هویت';
    } else {
      // If it's not a JWT-related error, let it propagate up
      return response.status(500).json({
        statusCode: 500,
        message: ['خطای داخلی سرور'],
        success: false,
        data: {
          timestamp: new Date().toISOString(),
        },
      });
    }

    response.status(statusCode).json({
      statusCode: statusCode,
      message: [message],
      success: false,
      data: {
        timestamp: new Date().toISOString(),
      },
    });
  }
}
