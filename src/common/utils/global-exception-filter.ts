import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter to catch all types of error and send a formatted message
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    Logger.error(exception);

    const httpStatusCode = Boolean(exception.getStatus)
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const requestPath = host.switchToHttp().getRequest<Request>().url;
    const requestMethod = host.switchToHttp().getRequest<Request>().method;

    let message = 'Something went wrong';
    if (Array.isArray(exception?.response?.message)) {
      message = exception.response.message.join('\n');
    } else if (exception?.message) {
      message = exception.message;
    }

    Logger.error({ message, requestPath, requestMethod });
    const response = host.switchToHttp().getResponse<Response>();
    response
      .status(httpStatusCode)
      .json({ message, path: requestPath, method: requestMethod });
  }
}
