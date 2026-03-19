import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaErrorMap } from './prisma-error.map';

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    // Prisma error
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = PrismaErrorMap[exception.code];

      if (mapped) {
        status = mapped.status;
        message = mapped.message;
        errorCode = mapped.errorCode;
      } else {
        message = exception.message;
        errorCode = exception.code;
      }
    }

    // HttpException
    else if (exception instanceof HttpException) {
      status = exception.getStatus();

      const res: any = exception.getResponse();

      message = res.message || 'Error';
      errorCode = res.error || 'HTTP_EXCEPTION';
    }

    // Unknown error → log
    else {
      this.logger.error(
        `[${request.method}] ${request.url}`,
        exception.stack,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      errorCode,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}