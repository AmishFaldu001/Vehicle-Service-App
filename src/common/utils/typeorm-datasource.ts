import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { applicationConfig } from '../../config/application.config';

async function initApp(): Promise<DataSource> {
  const app = await NestFactory.create(AppModule);
  const appConfig: ConfigType<typeof applicationConfig> = app.get(
    applicationConfig.KEY,
  );

  return new DataSource({
    type: 'postgres',
    url: appConfig.database.url,

    ssl: appConfig.database.ssl.enabled
      ? appConfig.database.ssl.caCert !== 'null'
        ? { ca: appConfig.database.ssl.caCert }
        : true
      : false,
    migrations: [process.cwd() + '/dist/migrations/*.js'],
    entities: [process.cwd() + '/dist/**/*.entity.js'],
    migrationsRun: false,
    synchronize: false,
  } as any);
}

export const typeormDatasource = initApp();
