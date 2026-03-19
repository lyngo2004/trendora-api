import { SetMetadata } from '@nestjs/common';
import { RESPONSE_MESSAGE } from '../constants/metadata.constant';

export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);