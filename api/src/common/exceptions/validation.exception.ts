import { BadRequestException } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  /**
   *
   * @param messages it should be array of strings that have to be like this pattern: ['fieldName message text errors']. fieldName should have a space after itself(between itself and error messages)
   */
  constructor(messages: string[]) {
    super({ statusCode: 400, message: messages });
  }
}
