import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Shared database module that can be imported by feature modules
 * that need direct access to the Mongoose connection.
 */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        // Connection pool and reliability settings
        retryWrites: true,
        w: 'majority',
      }),
    }),
  ],
})
export class DatabaseModule {}
