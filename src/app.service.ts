import { Injectable } from '@nestjs/common';
import { MessageResponseDto } from './common/dtos/response-dtos/message.response.dto';

/**
 * Service methods for common routes
 */
@Injectable()
export class AppService {
  /**
   * Basic health check route
   * @returns message indicating service is healthy
   */
  healthCheck(): MessageResponseDto {
    return { message: 'Application is healthy!' };
  }
}
