import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ValidationErrorDto,
  UnauthorizedErrorDto,
  ForbiddenErrorDto,
  NotFoundErrorDto,
  ConflictErrorDto,
  InternalServerErrorDto,
} from '../dto/error-response.dto';

/**
 * Global Exception Filter to standardize error responses
 * Handles all exceptions and returns proper error DTOs
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const timestamp = new Date().toISOString();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const objectResponse = exceptionResponse as any;
        message = objectResponse.message || exception.message;
        error = objectResponse.error || exception.name;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Build response based on status code
    let responseBody: any = {
      statusCode: status,
      message,
      error,
      path: request.url,
      method: request.method,
      timestamp,
    };

    // Filter out message if it's an array for non-validation errors
    if (Array.isArray(message) && status !== HttpStatus.BAD_REQUEST) {
      responseBody.message = message[0];
    }

    response.status(status).json(responseBody);
  }
}
