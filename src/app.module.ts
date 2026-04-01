import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { SequelizeModule } from '@nestjs/sequelize';
import * as fs from 'fs';
import { BooksModule } from './books/books.module';
import { BorrowersModule } from './borrowers/borrowers.module';
import { BorrowingModule } from './borrowing/borrowing.module';
import databaseModels from './shared/database/databaseModel';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbHost = configService.get('DB_HOST') || '';
        const isProduction = configService.get('NODE_ENV') === 'production';

        // For TCP connections in production, SSL is required
        const needsSSL = isProduction;

        // Default password for development
        const defaultPassword = 'postgres';
        const dbPassword = configService.get('DB_PASSWORD') || defaultPassword;

        if (dbPassword === undefined || dbPassword === null) {
          throw new Error('DB_PASSWORD environment variable is not set');
        }

        return {
          dialect: 'postgres',
          host: dbHost || 'localhost',
          port: configService.get('DB_PORT') || 5432,
          username: configService.get('DB_USER') || 'postgres',
          password: String(dbPassword),
          database: configService.get('DB_DATABASE') || 'library_system',
          schema: configService.get('DB_SCHEMA') || 'public',
          dialectOptions: {
            ...(needsSSL
              ? {
                  ssl: {
                    require: true,
                    rejectUnauthorized: false,
                    ca: configService.get<string>('DB_SSL_CA')
                      ? fs
                          .readFileSync(configService.get<string>('DB_SSL_CA')!)
                          .toString()
                      : undefined,
                  },
                }
              : {}),
          },
          models: databaseModels(),
          force: false,
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,

    BooksModule,
    BorrowersModule,
    BorrowingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
