import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().required(),
  DATABASE_SSL_ENABLED: Joi.boolean().default(false),
  DATABASE_SSL_CA_CERT: Joi.alternatives().conditional('DATABASE_SSL_ENABLED', {
    is: true,
    then: Joi.string().required(),
    otherwise: Joi.not().required(),
  }),
  JWT_PRIVATE_KEY: Joi.string().required(),
  JWT_PUBLIC_KEY: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.number().positive().required(),
  MAIL_API_KEY: Joi.string().required(),
  MAIL_FROM_EMAIL: Joi.string().email().required(),
});
