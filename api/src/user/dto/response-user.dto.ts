import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsEmail, IsDate } from 'class-validator';

export class UserDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 'c9b1e3d0-3b5d-4f5e-8e16-d5a9ebecb9b6',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The date when the user was created',
    example: '2024-09-08T10:43:04.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the user was last updated',
    example: '2024-09-08T10:43:04.000Z',
  })
  @IsDate()
  updatedAt: Date;
}
