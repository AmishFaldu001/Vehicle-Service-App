import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VehicleServiceTypeEnum } from '../constants/vehicle-service-type.enum';
import { VehicleTypeEnum } from '../constants/vehicle-type.enum';

// Entity to store all the vehicle service appointments booked
@Entity({ name: 'appointments' })
export class AppointmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: VehicleServiceTypeEnum })
  serviceType: VehicleServiceTypeEnum;

  @Column()
  vehicleOwnerId: string;

  @Column({ enum: VehicleTypeEnum })
  vehicleType: VehicleTypeEnum;

  // Name of company which created the vehicle like Ford or Dodge
  @Column()
  vehicleCompany: string;

  // This will be usually name of the vehicle like Mustang GT, Challenger SRT Hellcat
  @Column()
  vehicleModel: string;

  // Time after when vehicle service appointment starts
  @Column({ type: 'timestamp' })
  appointmentStartTime: string;

  // Time after when vehicle service appointment is completed
  @Column({ type: 'timestamp' })
  appointmentEndTime: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: string;
}
