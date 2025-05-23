import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty({
    description: 'Error code',
    example: 404,
  })
  code: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Not Found',
  })
  message: string[];

  @ApiProperty({
    description: 'Optional additional error details',
    example: { field: 'username', issue: 'User not found' },
    required: false,
  })
  details?: any; // You can further define this type if you have a specific structure for details
}

export class ValidationErrorsDto {
  @ApiProperty({
    description: 'Field-specific validation error messages',
    type: 'object',
    additionalProperties: { type: 'array', items: { type: 'string' } },
  })
  validationErrors?: {
    [key: string]: string[]; // Dynamic keys with array of strings as values
  };
}

export class BaseResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty({
    example: 201,
  })
  statusCode: number;

  @ApiProperty({
    example: 'User login has been successfully',
  })
  message?: string;

  // @ApiProperty({
  //   type: ErrorDto,
  // })
  // error?: ErrorDto;

  // @ApiProperty({
  //   type: ValidationErrorsDto,
  // })
  // validationErrors?: ValidationErrorsDto;
}
