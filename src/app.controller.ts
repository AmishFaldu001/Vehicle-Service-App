import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessageResponseDto } from './common/dtos/response-dtos/message.response.dto';

/**
 * Controller for common routes
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health-check')
  healthCheck(): MessageResponseDto {
    return this.appService.healthCheck();
  }
}
