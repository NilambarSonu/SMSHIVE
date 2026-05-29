import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service.js';
import { GatewayController } from './gateway.controller.js';
import { GatewayEvents } from './gateway.events.js';
import { SmsModule } from '../sms/sms.module.js';
import { DevicesModule } from '../devices/devices.module.js';

@Module({
  imports: [SmsModule, DevicesModule],
  controllers: [GatewayController],
  providers: [GatewayService, GatewayEvents],
  exports: [GatewayService],
})
export class GatewayModule {}
