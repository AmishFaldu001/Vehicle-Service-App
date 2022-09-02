import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'agency_availability' })
export class AgencyAvailibilityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  startHour: number;

  @Column()
  endHour: number;
}
