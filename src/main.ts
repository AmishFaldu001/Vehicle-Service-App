import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/utils/global-exception-filter';
import { applicationConfig } from './config/application.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Fetch application configuration from initialized app
  const appConfig: ConfigType<typeof applicationConfig> = app.get(
    applicationConfig.KEY,
  );

  // Setup global stuff
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }),
  );

  // Enable api versioning
  app.enableVersioning({ type: VersioningType.URI });

  await app.listen(appConfig.port);
  Logger.log('Application started and listening on port 3000');
}

bootstrap();
