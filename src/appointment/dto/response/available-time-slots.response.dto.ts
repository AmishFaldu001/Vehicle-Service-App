import { Type } from 'class-transformer';
import { IsArray, IsObject } from 'class-validator';

class TimeSlot {
  startTime: string;
  endTime: string;
}

export class AvailableTimeSlotsResponseDto {
  @IsArray()
  @Type(() => TimeSlot)
  @IsObject({ each: true })
  timeslots: TimeSlot[];
}
