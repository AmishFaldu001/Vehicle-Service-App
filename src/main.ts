import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/utils/global-exception-filter';
import { applicationConfig } from './config/application.config';

async function bootstrap(): Promise<void> {
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

  // Swagger configuration
  const documentBuilder = new DocumentBuilder();
  documentBuilder.setTitle('Vehicle service app');
  documentBuilder.setDescription(
    'An app to book your vehicle service appointments',
  );
  documentBuilder.setVersion('1.0.0');
  documentBuilder
    .addSecurity('JWTToken', {
      type: 'apiKey',
      description: 'Login Jwt token',
      in: 'header',
      name: 'authorization',
    })
    .addSecurityRequirements('JWTToken');
  const document = SwaggerModule.createDocument(app, documentBuilder.build());
  SwaggerModule.setup('/api-explorer', app, document);

  // Start listening to port
  await app.listen(appConfig.port);
  Logger.log('Application started and listening on port ' + appConfig.port);
}

bootstrap();
