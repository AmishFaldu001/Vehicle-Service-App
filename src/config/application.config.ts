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
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    publicKey: process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n'),
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN),
  },
  mail: {
    apiKey: process.env.MAIL_API_KEY,
    fromEmail: process.env.MAIL_FROM_EMAIL,
  },
}));
