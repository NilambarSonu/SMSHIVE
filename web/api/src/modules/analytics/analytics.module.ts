import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service.js';
import { AnalyticsController } from './analytics.controller.js';
import { SmsModule } from '../sms/sms.module.js';
import { DevicesModule } from '../devices/devices.module.js';

@Module({
  imports: [SmsModule, DevicesModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
