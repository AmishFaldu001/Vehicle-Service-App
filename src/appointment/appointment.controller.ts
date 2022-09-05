import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { MessageResponseDto } from '../common/dtos/response-dtos/message.response.dto';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentEntity } from './entities/appointment.entity';

@Controller({ path: 'appointment', version: '1' })
@ApiTags('Appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  create(
    @Req() request: Request & { user?: { id?: string } },
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentEntity> {
    const userId = request?.user?.id;
    return this.appointmentService.create(userId, createAppointmentDto);
  }

  @Get()
  findAll(
    @Req() request: Request & { user?: { id?: string } },
    @Query('skip', ParseIntPipe) skip: number,
    @Query('limit', ParseIntPipe) limit: number,
  ): Promise<AppointmentEntity[]> {
    const userId = request?.user?.id;
    return this.appointmentService.findAll({ userId, skip, limit });
  }

  @Get(':id')
  findOne(
    @Req() request: Request & { user?: { id?: string } },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AppointmentEntity> {
    const userId = request?.user?.id;
    return this.appointmentService.findOne({ userId, id });
  }

  @Patch(':id')
  update(
    @Req() request: Request & { user?: { id?: string } },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentEntity> {
    const userId = request?.user?.id;
    return this.appointmentService.update(userId, id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(
    @Req() request: Request & { user?: { id?: string } },
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MessageResponseDto> {
    const userId = request?.user?.id;
    return this.appointmentService.remove(userId, id);
  }
}
