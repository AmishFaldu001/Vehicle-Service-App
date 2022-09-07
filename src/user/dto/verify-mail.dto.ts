import { IsString } from 'class-validator';

export class VerifyMailDto {
  @IsString()
  token: string;

  @IsString()
  uniqueId: string;
}
