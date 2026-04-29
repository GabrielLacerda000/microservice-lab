import { IsEmail, IsString, MinLength } from 'class-validator';
import { IsEmailUnique } from '../validators/is-email-unique.constraint';

export class CreateUserDto {
  @IsEmail()
  @IsEmailUnique()
  readonly email: string;

  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  readonly name: string;
}
