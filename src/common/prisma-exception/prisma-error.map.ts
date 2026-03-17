export const PrismaErrorMap: Record<
  string,
  { message: string; errorCode: string; status: number }
> = {
  P2002: {
    message: 'Resource already exists',
    errorCode: 'RESOURCE_ALREADY_EXISTS',
    status: 400,
  },
  P2025: {
    message: 'Resource not found',
    errorCode: 'RESOURCE_NOT_FOUND',
    status: 404,
  },
};