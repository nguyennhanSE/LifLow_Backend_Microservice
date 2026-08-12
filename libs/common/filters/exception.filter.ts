import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';
import { BaseError, ValidationException } from 'libs/common/errors/error-base';
import { AppLogger } from 'libs/common/logger/logger.service';
import { ResponseModel } from 'libs/common/response/response.model';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly loggerService: AppLogger,
  ) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse();
    const request = httpContext.getRequest<Request>();

    this.loggerService.error(`[AllExceptionsFilter]`, exception);

    const { httpStatus, errorPayload } = this.getStandardizedErrorResponse(
      exception,
      this.getLanguage(request),
    );

    const responseModel = new ResponseModel();
    responseModel.setError(errorPayload as any);

    httpAdapter.reply(response, responseModel, httpStatus);
  }

  private getLanguage(request: Request): string {
    const acceptLanguage = request.headers['accept-language'];
    const languageHeader = Array.isArray(acceptLanguage)
      ? acceptLanguage[0]
      : acceptLanguage;

    return (languageHeader ?? 'en').split(',')[0].split('-')[0];
  }

  private getStandardizedErrorResponse(
    exception: unknown,
    _language: string = 'en',
  ): { httpStatus: HttpStatus; errorPayload: object } {
    if (exception instanceof BaseError) {
      const originalPayload = exception.toErrorPayload() as any;
      return {
        httpStatus: exception.getStatusCode(),
        errorPayload: {
          ...originalPayload,
          message: exception.message,
        },
      };
    }

    if (exception instanceof ValidationException) {
      let translatedMessage: string;

      if (exception.errorCode === 'validation.general') {
        translatedMessage = exception.message;
      } else if (exception.errorCode.startsWith('validation.')) {
        const validationType = exception.errorCode.replace('validation.', '');
        translatedMessage = exception.message;

        if (
          !translatedMessage ||
          translatedMessage === `validation.${validationType}`
        ) {
          translatedMessage = exception.message;
        }
      } else {
        translatedMessage = exception.message;

        if (
          !translatedMessage ||
          translatedMessage === `errors.${exception.errorCode}`
        ) {
          translatedMessage = exception.message;
        }
      }

      if (!translatedMessage || translatedMessage === 'validation.error.err') {
        translatedMessage = 'Validation error';
      }

      return {
        httpStatus: HttpStatus.BAD_REQUEST,
        errorPayload: {
          statusCode: HttpStatus.BAD_REQUEST,
          message: translatedMessage,
          error: 'ValidationException',
          errorCode: exception.errorCode,
          detail: exception.detail,
        },
      };
    }

    if (exception instanceof HttpException) {
      return {
        httpStatus: exception.getStatus(),
        errorPayload: exception.getResponse() as object,
      };
    }

    if (exception instanceof Error) {
      return {
        httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
        errorPayload: {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: exception.message,
          error: exception.name,
        },
      };
    }

    return {
      httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
      errorPayload: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'An unexpected and unknown error occurred.',
        error: 'Internal Server Error',
      },
    };
  }
}
