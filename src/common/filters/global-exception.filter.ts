import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    // Prisma error
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError
    ) {
      if (exception.code === 'P2002') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Email already exists';
        errorCode = 'USER_ALREADY_EXISTS';
      }
    }

    // Nest HttpException
    else if (exception instanceof HttpException) {
      status = exception.getStatus();

      const res: any = exception.getResponse();

      message = res.message || res || 'Error';
      errorCode = res.error || 'HTTP_EXCEPTION';
    }

    // Unknown error
    else {
      this.logger.error(exception);
    }

    response.status(status).json({
      success: false,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}