import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from '../constants/metadata.constant';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    const message =
      this.reflector.get<string>(
        RESPONSE_MESSAGE,
        context.getHandler(),
      ) || 'Success';

    return next.handle().pipe(
      map((data) => ({
        statusCode: response.statusCode,
        message,
        data,
      })),
    );
  }
}