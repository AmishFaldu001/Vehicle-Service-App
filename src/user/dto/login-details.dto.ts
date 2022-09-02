import { IsEmail, IsString } from 'class-validator';

export class LoginDetailsDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
