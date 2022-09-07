import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RecurrentHolidays {
  SUNDAY = 'sunday',
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
}

@Entity({ name: 'agency_availability' })
export class AgencyAvailabilityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('enum', { array: true, enum: RecurrentHolidays, nullable: true })
  recurrentHolidays?: RecurrentHolidays[];

  @Column('jsonb', { array: true })
  availableTimesForADay: {
    startHour: number;
    endHour: number;
    timezone: string;
  }[];

  @Column('timestamp with time zone', { array: true, nullable: true })
  holidays?: string[];
}
