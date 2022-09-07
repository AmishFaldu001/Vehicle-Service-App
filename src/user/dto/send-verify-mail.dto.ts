import { IsEmail } from 'class-validator';

export class SendVerifyMailDto {
  @IsEmail()
  email: string;
}
