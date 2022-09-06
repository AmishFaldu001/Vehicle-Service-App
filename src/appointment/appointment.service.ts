import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import {
  AgencyAvailabilityEntity,
  RecurrentHolidays,
} from '../agency-availability/entities/agency-availability.entity';
import { MessageResponseDto } from '../common/dtos/response-dtos/message.response.dto';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { AvailableTimeSlotsResponseDto } from './dto/response/available-time-slots.response.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentEntity } from './entities/appointment.entity';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private appointmentRepo: Repository<AppointmentEntity>,
    @InjectRepository(AgencyAvailabilityEntity)
    private agencyAvailabilityRepo: Repository<AgencyAvailabilityEntity>,
    private emailService: EmailService,
    private userService: UserService,
  ) {}

  private checkForHoliday(
    availability: AgencyAvailabilityEntity,
    date: dayjs.Dayjs,
  ): boolean {
    const weekdayNames = Object.values(RecurrentHolidays);
    const isHoliday =
      availability?.recurrentHolidays?.includes(weekdayNames[date.day()]) ||
      availability?.holidays?.some((holiday) => {
        const dayJsHoliday = dayjs
          .utc(holiday)
          .set('hours', 0)
          .set('minutes', 0)
          .set('seconds', 0)
          .set('milliseconds', 0);
        const dayJsDate = date
          .set('hours', 0)
          .set('minutes', 0)
          .set('seconds', 0)
          .set('milliseconds', 0);
        return dayJsHoliday.isSame(dayJsDate);
      });
    return isHoliday;
  }

  private async checkIfAppointmentIsAvailable(
    appointmentStartTime: string,
  ): Promise<{
    appointmentStartDate: dayjs.Dayjs;
    appointmentEndDate: dayjs.Dayjs;
  }> {
    const availability = (await this.agencyAvailabilityRepo.find({}))[0];

    if (!availability) {
      throw new BadRequestException(
        'No timeslots available for service booking',
      );
    }

    const currentDatePlusFiveMinutes = dayjs
      .utc()
      .add(5, 'minutes')
      .set('seconds', 0)
      .set('milliseconds', 0);

    const appointmentStartDate = dayjs
      .utc(appointmentStartTime)
      .set('seconds', 0)
      .set('milliseconds', 0);
    // Set fixed 1 hour appointment time slot from starting time
    const appointmentEndDate = appointmentStartDate.add(1, 'hours');

    if (appointmentStartDate <= currentDatePlusFiveMinutes) {
      throw new BadRequestException(
        'Cannot book appointment within 5 minutes of current time or in past time',
      );
    }

    const isHoliday =
      this.checkForHoliday(availability, appointmentStartDate) ||
      this.checkForHoliday(availability, appointmentEndDate);
    if (isHoliday) {
      throw new BadRequestException(
        "It's holiday and service booking is not available\nSorry for any inconveniences",
      );
    }

    let agencyOpenInAppoinmentTime = false;
    for (const availableTime of availability.availableTimesForADay) {
      const agencyStartTime = appointmentStartDate
        .set('hours', availableTime.startHour)
        .set('minutes', 0)
        .set('seconds', 0)
        .set('milliseconds', 0)
        .tz(availableTime.timezone, true);

      const agencyEndTime = appointmentEndDate
        .set('hours', availableTime.endHour)
        .set('minutes', 0)
        .set('seconds', 0)
        .set('milliseconds', 0)
        .tz(availableTime.timezone, true);

      if (
        appointmentStartDate >= agencyStartTime &&
        appointmentEndDate <= agencyEndTime
      ) {
        agencyOpenInAppoinmentTime = true;
        break;
      }
    }
    if (!agencyOpenInAppoinmentTime) {
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

    return { appointmentStartDate, appointmentEndDate };
  }

  async create(
    userId: string,
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentEntity> {
    const { appointmentStartDate, appointmentEndDate } =
      await this.checkIfAppointmentIsAvailable(
        createAppointmentDto.appointmentStartTime,
      );

    const appointment = this.appointmentRepo.create({
      ...createAppointmentDto,
      appointmentStartTime: appointmentStartDate.toISOString(),
      appointmentEndTime: appointmentEndDate.toISOString(),
      vehicleOwner: userId,
    });
    await this.appointmentRepo.save(appointment);

    const user = await this.userService.findOne(userId);

    // We will setup email scheduled to be send 2 hours before timeslot
    const mailScheduleDate = appointmentStartDate.add(-2, 'hours');
    const emailSubject = `Vehicle service appointment - ${appointment.id}`;
    const emailBody = `Your vehicle appointment with following details will start shortly.
    \n\nAppointment id: ${appointment.id}
    \nAppointment date: ${appointment.appointmentStartTime}
    \nService type: ${appointment.serviceType}
    \nVehicle company: ${appointment.vehicleCompany}
    \nVehicle model: ${appointment.vehicleModel}
    \nVehicle type: ${appointment.vehicleType}`;
    await this.emailService.sendMail(
      user.email,
      emailSubject,
      emailBody,
      mailScheduleDate,
    );

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

  async findTimeSlots(date: string): Promise<AvailableTimeSlotsResponseDto> {
    const availability = (await this.agencyAvailabilityRepo.find({}))[0];
    const dateToSearchFor = dayjs
      .utc(date)
      .set('hours', 0)
      .set('minutes', 0)
      .set('seconds', 0)
      .set('milliseconds', 0);
    const isHoliday = this.checkForHoliday(availability, dateToSearchFor);
    if (isHoliday) {
      return { timeslots: [] };
    }

    let availableTimeSlots = availability.availableTimesForADay.map(
      (availableTime) => {
        return {
          startTime: dayjs
            .utc(date)
            .set('hours', availableTime.startHour)
            .set('minutes', 0)
            .set('seconds', 0)
            .set('milliseconds', 0)
            .tz(availableTime.timezone, true),
          endTime: dayjs
            .utc(date)
            .set('hours', availableTime.endHour)
            .set('minutes', 0)
            .set('seconds', 0)
            .set('milliseconds', 0)
            .tz(availableTime.timezone, true),
        };
      },
    );
    const appoinmentsForDate = await this.appointmentRepo.find({
      where: {
        appointmentStartTime: MoreThanOrEqual(dateToSearchFor.toISOString()),
        appointmentEndTime: LessThanOrEqual(
          dateToSearchFor.add(1, 'days').toISOString(),
        ),
      },
    });

    for (const appointment of appoinmentsForDate) {
      const appointmentStartDate = dayjs.utc(appointment.appointmentStartTime);
      const appointmentEndDate = dayjs.utc(appointment.appointmentEndTime);

      const timeslotIndex = availableTimeSlots.findIndex((timeslot) => {
        if (
          appointmentStartDate >= timeslot.startTime &&
          appointmentEndDate <= timeslot.endTime
        ) {
          return true;
        }
        return false;
      });

      const modifiedOccupiedTimeslot: {
        startTime: dayjs.Dayjs;
        endTime: dayjs.Dayjs;
      }[] = [];
      if (
        availableTimeSlots[timeslotIndex].startTime === appointmentStartDate &&
        availableTimeSlots[timeslotIndex].endTime !== appointmentEndDate
      ) {
        modifiedOccupiedTimeslot.push({
          endTime: availableTimeSlots[timeslotIndex].endTime,
          startTime: appointmentEndDate,
        });
      } else if (
        availableTimeSlots[timeslotIndex].endTime === appointmentEndDate &&
        availableTimeSlots[timeslotIndex].startTime !== appointmentStartDate
      ) {
        modifiedOccupiedTimeslot.push({
          startTime: availableTimeSlots[timeslotIndex].startTime,
          endTime: appointmentStartDate,
        });
      } else if (
        appointmentStartDate > availableTimeSlots[timeslotIndex].startTime &&
        appointmentEndDate < availableTimeSlots[timeslotIndex].endTime
      ) {
        modifiedOccupiedTimeslot.push({
          startTime: availableTimeSlots[timeslotIndex].startTime,
          endTime: appointmentStartDate,
        });
        modifiedOccupiedTimeslot.push({
          startTime: appointmentEndDate,
          endTime: availableTimeSlots[timeslotIndex].endTime,
        });
      }

      availableTimeSlots = [
        ...availableTimeSlots.slice(0, timeslotIndex),
        ...modifiedOccupiedTimeslot,
        ...availableTimeSlots.slice(timeslotIndex + 1),
      ];
    }

    const availableTimeslotsWithDateString = {
      timeslots: availableTimeSlots.map((timeslot) => {
        return {
          startTime: timeslot.startTime.toISOString(),
          endTime: timeslot.endTime.toISOString(),
        };
      }),
    };
    return availableTimeslotsWithDateString;
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
      const { appointmentEndDate, appointmentStartDate } =
        await this.checkIfAppointmentIsAvailable(
          updateAppointmentDto.appointmentStartTime,
        );
      appointment.appointmentEndTime = appointmentEndDate.toISOString();

      // Reschedule notification mail
      const user = await this.userService.findOne(userId);
      await this.emailService.cancelScheduleMail(id, user.email);

      // We will setup email scheduled to be send 2 hours before timeslot
      const mailSendDate = appointmentStartDate.add(-2, 'hours');
      const emailSubject = `Vehicle service appointment - ${appointment.id}`;
      const emailBody = `Your vehicle appointment with following details will start shortly.
      \n\nAppointment id: ${appointment.id}
      \nAppointment date: ${appointment.appointmentStartTime}
      \nService type: ${appointment.serviceType}
      \nVehicle company: ${appointment.vehicleCompany}
      \nVehicle model: ${appointment.vehicleModel}
      \nVehicle type: ${appointment.vehicleType}`;
      await this.emailService.sendMail(
        user.email,
        emailSubject,
        emailBody,
        mailSendDate,
      );
    }

    appointment = { ...appointment, ...updateAppointmentDto };
    await this.appointmentRepo.save(appointment);
    return appointment;
  }

  async remove(userId: string, id: string): Promise<MessageResponseDto> {
    const user = await this.userService.findOne(userId);
    await this.emailService.cancelScheduleMail(id, user.email);

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
