import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { applicationConfig } from '../../config/application.config';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (
        appConfig: ConfigType<typeof applicationConfig>,
      ): JwtModuleOptions => {
        return {
          privateKey: appConfig.jwt.privateKey,
          publicKey: appConfig.jwt.publicKey,
          signOptions: {
            algorithm: 'ES512',
            expiresIn: appConfig.jwt.expiresIn,
          },
          verifyOptions: {
            algorithms: ['ES512'],
            ignoreExpiration: false,
            ignoreNotBefore: false,
          },
        };
      },
      inject: [applicationConfig.KEY],
    }),
  ],
  exports: [JwtModule],
})
export class AuthJwtModule {}
