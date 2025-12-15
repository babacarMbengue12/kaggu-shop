import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { Response } from 'express';

@Catch(InternalServerErrorException)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse() as Response;
    const request = ctx.getRequest();

    const status = exception.getStatus();

    const responseMessage = (type: string, message: string) => {
      response.status(status).json({
        statusCode: status,
        path: request.url,
        errorType: type,
        errorMessage: message,
        error: exception
      });
    };

    return responseMessage(exception.name ?? 'Error', exception.message);
  }
}

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse() as Response;
    const request = ctx.getRequest();

    const status = exception.getStatus();

    const responseMessage = (type: string, message: string) => {
      response.status(status).send({
        statusCode: status,
        path: request.url,
        errorType: type,
        errorMessage: message,
        error: exception
      });
    };

    return responseMessage(exception.name ?? 'Error', exception.message);
  }
}
