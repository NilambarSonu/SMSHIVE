import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { GatewayService } from './gateway.service.js';
import { GatewayController } from './gateway.controller.js';
import { GatewayEvents } from './gateway.events.js';
import { SmsModule } from '../sms/sms.module.js';
import { DevicesModule } from '../devices/devices.module.js';
import { SmsProcessor } from './sms.processor.js';

@Module({
  imports: [
    SmsModule, 
    DevicesModule,
    BullModule.registerQueue({
      name: 'sms',
    }),
  ],
  controllers: [GatewayController],
  providers: [GatewayService, GatewayEvents, SmsProcessor],
  exports: [GatewayService],
})
export class GatewayModule {}
