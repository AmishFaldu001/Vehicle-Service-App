import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PublicRoute } from './common/decorators/public.decorator';
import { MessageResponseDto } from './common/dtos/response-dtos/message.response.dto';

/**
 * Controller for common routes
 */
@Controller()
@ApiTags('Basic routes')
@PublicRoute()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health-check')
  healthCheck(): MessageResponseDto {
    return this.appService.healthCheck();
  }
}
