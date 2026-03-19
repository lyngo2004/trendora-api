import { HttpStatus } from '@nestjs/common';

export const PrismaErrorMap = {
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'Resource already exists',
    errorCode: 'UNIQUE_CONSTRAINT',
  },
  P2025: {
    status: HttpStatus.NOT_FOUND,
    message: 'Record not found',
    errorCode: 'NOT_FOUND',
  },
};