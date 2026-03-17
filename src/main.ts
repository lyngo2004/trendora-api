import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/response/response.interceptor';
import { PrismaExceptionFilter } from './common/prisma-exception/prisma-exception.filter';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, }),);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new PrismaExceptionFilter());
}
bootstrap();
