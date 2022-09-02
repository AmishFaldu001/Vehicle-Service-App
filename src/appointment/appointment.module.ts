import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyAvailibilityEntity } from '../agency-availability/entities/agency-availibility.entity';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { AppointmentEntity } from './entities/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentEntity, AgencyAvailibilityEntity]),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
