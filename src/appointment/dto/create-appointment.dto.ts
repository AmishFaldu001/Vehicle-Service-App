import { IsDateString, IsEnum, IsString } from 'class-validator';
import { VehicleServiceTypeEnum } from '../constants/vehicle-service-type.enum';
import { VehicleTypeEnum } from '../constants/vehicle-type.enum';

export class CreateAppointmentDto {
  @IsEnum(VehicleServiceTypeEnum)
  serviceType: VehicleServiceTypeEnum;

  @IsEnum(VehicleTypeEnum)
  vehicleType: VehicleTypeEnum;

  @IsString()
  vehicleCompany: string;

  @IsString()
  vehicleModel: string;

  @IsDateString()
  appointmentStartTime: string;
}
