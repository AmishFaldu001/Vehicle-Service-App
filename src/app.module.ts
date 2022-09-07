import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentModule } from './appointment/appointment.module';
import { AuthGuard } from './common/guards/auth.guard';
import { AuthJwtModule } from './common/modules/auth-jwt.module';
import { applicationConfig } from './config/application.config';
import { validationSchema } from './config/validation.schema';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [applicationConfig],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (
        appConfig: ConfigType<typeof applicationConfig>,
      ): TypeOrmModuleOptions => {
        return {
          type: 'postgres',
          url: appConfig.database.url,
          ssl: appConfig.database.ssl.enabled
            ? appConfig.database.ssl.caCert !== 'null'
              ? { ca: appConfig.database.ssl.caCert }
              : true
            : false,
          migrations: [__dirname + '/dist/migrations/*.js'],
          synchronize: false,
          autoLoadEntities: true,
          migrationsRun: false,
        };
      },
      inject: [applicationConfig.KEY],
    }),
    AuthJwtModule,
    AppointmentModule,
    UserModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
