import { Module } from '@nestjs/common';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
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
