import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: 86400,
        },
      }),
      inject: [ConfigService],
      global: true,
    }),
  ],
  providers: [
    BasicAuthGuard,
    {
      provide: APP_GUARD,
      useClass: BasicAuthGuard,
    },
  ],
  exports: [BasicAuthGuard],
})
export class AuthModule { }
