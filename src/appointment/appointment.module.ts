import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyAvailabilityEntity } from '../agency-availability/entities/agency-availability.entity';
import { EmailModule } from '../email/email.module';
import { UserModule } from '../user/user.module';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { AppointmentEntity } from './entities/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentEntity, AgencyAvailabilityEntity]),
    EmailModule,
    UserModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
