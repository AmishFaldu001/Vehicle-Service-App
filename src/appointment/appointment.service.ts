import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { MessageResponseDto } from '../common/dtos/response-dtos/message.response.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentEntity } from './entities/appointment.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private appointmentRepo: Repository<AppointmentEntity>,
  ) {}

  private async checkIfAppointmentIsAvailable(
    appointmentStartDate: Date,
    appointmentEndDate: Date,
  ): Promise<void> {
    const appointmentExists = Boolean(
      (
        await this.appointmentRepo.findOne({
          where: {
            appointmentStartTime: MoreThan(appointmentStartDate.toISOString()),
            appointmentEndTime: LessThan(appointmentEndDate.toISOString()),
          },
        })
      )?.id,
    );

    if (appointmentExists) {
      throw new BadRequestException(
        'This time slot is not available. Please select another time slot',
      );
    }
  }

  async create(
    userId: string,
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentEntity> {
    const appointmentStartDate = new Date(
      createAppointmentDto.appointmentStartTime,
    );

    const appointmentEndDate = new Date(
      createAppointmentDto.appointmentStartTime,
    );
    // Set fixed 1 hour appointment time slot from starting time
    appointmentEndDate.setHours(appointmentEndDate.getHours() + 1);

    await this.checkIfAppointmentIsAvailable(
      appointmentStartDate,
      appointmentEndDate,
    );

    const appointment = this.appointmentRepo.create({
      ...createAppointmentDto,
      vehicleOwnerId: userId,
    });
    await this.appointmentRepo.save(appointment);
    return appointment;
  }

  async findAll({
    limit,
    skip,
    userId,
  }: {
    userId: string;
    skip: number;
    limit: number;
  }): Promise<AppointmentEntity[]> {
    const appointments = await this.appointmentRepo.find({
      where: { vehicleOwnerId: userId },
      skip,
      take: limit,
    });

    return appointments;
  }

  async findOne({
    id,
    userId,
  }: {
    userId: string;
    id: string;
  }): Promise<AppointmentEntity> {
    const appointment = await this.appointmentRepo.findOne({
      where: { vehicleOwnerId: userId, id },
    });
    if (!Boolean(appointment)) {
      throw new BadRequestException('Appointment not found');
    }

    return appointment;
  }

  async update(
    userId: string,
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentEntity> {
    // If the appointment time is changed then check if that timeslot is available
    if (Boolean(updateAppointmentDto?.appointmentStartTime)) {
      const appointmentStartDate = new Date(
        updateAppointmentDto.appointmentStartTime,
      );

      const appointmentEndDate = new Date(
        updateAppointmentDto.appointmentStartTime,
      );
      // Set fixed 1 hour appointment time slot from starting time
      appointmentEndDate.setHours(appointmentEndDate.getHours() + 1);

      await this.checkIfAppointmentIsAvailable(
        appointmentStartDate,
        appointmentEndDate,
      );
    }

    let appointment = await this.appointmentRepo.findOne({
      where: { id, vehicleOwnerId: userId },
    });
    if (Boolean(appointment)) {
      throw new BadRequestException('Appointment not found');
    }

    appointment = { ...appointment, ...updateAppointmentDto };
    await this.appointmentRepo.save(appointment);
    return appointment;
  }

  async remove(userId: string, id: string): Promise<MessageResponseDto> {
    const appointment = await this.appointmentRepo.delete({
      id,
      vehicleOwnerId: userId,
    });
    if (!Boolean(appointment.affected)) {
      throw new BadRequestException('Appointment with that id not found');
    }

    return { message: 'Successfully removed appointment' };
  }
}
