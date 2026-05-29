import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import configuration from './config/configuration.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { UsersModule } from './modules/users/users.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { DevicesModule } from './modules/devices/devices.module.js';
import { SmsModule } from './modules/sms/sms.module.js';
import { GatewayModule } from './modules/gateway/gateway.module.js';
import { TemplatesModule } from './modules/templates/templates.module.js';
import { WebhooksModule } from './modules/webhooks/webhooks.module.js';
import { ApiKeysModule } from './modules/api-keys/api-keys.module.js';
import { ScheduledModule } from './modules/scheduled/scheduled.module.js';
import { ContactsModule } from './modules/contacts/contacts.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    DevicesModule,
    SmsModule,
    GatewayModule,
    TemplatesModule,
    WebhooksModule,
    ApiKeysModule,
    ScheduledModule,
    ContactsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
