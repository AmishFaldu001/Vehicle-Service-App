import { IsString } from 'class-validator';

export class CancelScheduledMailDto {
  @IsString()
  status: 'Success' | 'Failed';
}
