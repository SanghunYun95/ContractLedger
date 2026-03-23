import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    
    // Extract detailed error message (for ValidationPipe errors etc)
    const message = (exceptionResponse as any).message || exception.message;

    response
      .status(status)
      .json({
        statusCode: status,
        message: message,
        path: request.url,
      });
  }
}
