import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { VehicleServiceTypeEnum } from '../constants/vehicle-service-type.enum';
import { VehicleTypeEnum } from '../constants/vehicle-type.enum';

// Entity to store all the vehicle service appointments booked
@Entity({ name: 'appointments' })
export class AppointmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: VehicleServiceTypeEnum })
  serviceType: VehicleServiceTypeEnum;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  vehicleOwner: string | UserEntity;

  @Column({ enum: VehicleTypeEnum })
  vehicleType: VehicleTypeEnum;

  // Name of company which created the vehicle like Ford or Dodge
  @Column()
  vehicleCompany: string;

  // This will be usually name of the vehicle like Mustang GT, Challenger SRT Hellcat
  @Column()
  vehicleModel: string;

  // Time after when vehicle service appointment starts
  @Column({ type: 'timestamp with time zone' })
  appointmentStartTime: string;

  // Time after when vehicle service appointment is completed
  @Column({ type: 'timestamp with time zone' })
  appointmentEndTime: string;

  // Sendgrid batch id. This is used to cancel scheduled mail for appointment reminder
  @Column({ nullable: true })
  batchId: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: string;
}
