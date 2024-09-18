import { FastifyReply } from 'fastify';
import { ResponseData } from '../interceptors/response/response.interface';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException) // Change this to catch all HttpExceptions
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    console.warn('Caught an exception:', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const status = exception.getStatus();

    let mappedResponse: ResponseData<never> = {
      statusCode: status,
      success: false,
      message: Array.isArray(exception.message)
        ? exception.message
        : [exception.message],
    };

    response.status(status).send(mappedResponse);
  }
}
