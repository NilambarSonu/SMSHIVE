import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service.js';
import { GatewayController } from './gateway.controller.js';
import { SmsModule } from '../sms/sms.module.js';
import { DevicesModule } from '../devices/devices.module.js';

@Module({
  imports: [SmsModule, DevicesModule],
  controllers: [GatewayController],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
