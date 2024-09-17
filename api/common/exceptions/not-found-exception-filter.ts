import { FastifyReply } from 'fastify';
import { ResponseData } from '../interceptors/response/response.interface';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    let mappedResponse: ResponseData<never> = {
      statusCode: HttpStatus.NOT_FOUND,
      success: false,
      message: [exception.message],
    };

    response.status(HttpStatus.NOT_FOUND).send(mappedResponse);
  }
}
