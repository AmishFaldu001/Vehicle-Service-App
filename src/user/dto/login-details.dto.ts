import { IsEmail } from 'class-validator';

export class LoginDetailsDto {
  @IsEmail()
  email: string;
}
