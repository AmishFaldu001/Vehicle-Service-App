import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentModule } from './appointment/appointment.module';
import { applicationConfig } from './config/application.config';
import { validationSchema } from './config/validation.schema';
import { UserModule } from './user/user.module';

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
            ? { ca: appConfig.database.ssl.caCert }
            : false,
          migrations: [__dirname + '/dist/migrations/*.js'],
          synchronize: false,
          autoLoadEntities: true,
          migrationsRun: false,
        };
      },
      inject: [applicationConfig.KEY],
    }),
    AppointmentModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
