import { registerAs } from '@nestjs/config';

export const applicationConfig = registerAs('applicationConfig', () => ({
  port: process.env.PORT,
  database: {
    url: process.env.DATABASE_URL,
    ssl: {
      enabled: process.env.DATABASE_SSL_ENABLED === 'true',
      caCert: process.env.DATABASE_SSL_CA_CERT,
    },
  },
}));
