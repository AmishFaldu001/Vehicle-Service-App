import { IsOptional, IsString } from 'class-validator';

export class SendScheduledMailDto {
  @IsString()
  status: 'Success' | 'Failed';

  @IsString()
  @IsOptional()
  mailId?: string;
}
