import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { AgencyAvailibilityEntity } from '../agency-availability/entities/agency-availibility.entity';
import { MessageResponseDto } from '../common/dtos/response-dtos/message.response.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentEntity } from './entities/appointment.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private appointmentRepo: Repository<AppointmentEntity>,
    @InjectRepository(AgencyAvailibilityEntity)
    private agencyAvailabilityRepo: Repository<AgencyAvailibilityEntity>,
  ) {}

  private async checkIfAppointmentIsAvailable(
    appointmentStartDate: Date,
    appointmentEndDate: Date,
  ): Promise<void> {
    const availableTimes = (await this.agencyAvailabilityRepo.find({}))[0];

    if (!availableTimes) {
      throw new BadRequestException(
        'No timeslots available for service booking',
      );
    }

    const currentDate = new Date();
    const agencyStartTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      availableTimes.startHour,
      0,
      0,
      0,
    );
    const agencyEndTime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      availableTimes.endHour,
      0,
      0,
      0,
    );

    if (
      appointmentStartDate < agencyStartTime ||
      appointmentEndDate > agencyEndTime
    ) {
      throw new BadRequestException(
        'No bookings available for out of working hours',
      );
    }

    const appointmentExists = await this.appointmentRepo.findOne({
      where: {
        appointmentStartTime: MoreThanOrEqual(
          appointmentStartDate.toISOString(),
        ),
        appointmentEndTime: LessThanOrEqual(appointmentEndDate.toISOString()),
      },
    });

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
      appointmentEndTime: appointmentEndDate.toISOString(),
      vehicleOwner: userId,
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
      where: {
        vehicleOwner: { id: userId },
      },
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
      where: { vehicleOwner: { id: userId }, id },
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
    let appointment = await this.appointmentRepo.findOne({
      where: { id, vehicleOwner: { id: userId } },
    });
    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

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
      appointment.appointmentEndTime = appointmentEndDate.toISOString();
    }

    appointment = { ...appointment, ...updateAppointmentDto };
    await this.appointmentRepo.save(appointment);
    return appointment;
  }

  async remove(userId: string, id: string): Promise<MessageResponseDto> {
    const appointment = await this.appointmentRepo.delete({
      id,
      vehicleOwner: { id: userId },
    });
    if (!Boolean(appointment.affected)) {
      throw new BadRequestException('Appointment with that id not found');
    }

    return { message: 'Successfully removed appointment' };
  }
}
