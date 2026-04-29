import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  readonly name: string;
}
