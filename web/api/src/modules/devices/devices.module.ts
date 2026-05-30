import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from './schemas/device.schema.js';
import { QrToken, QrTokenSchema } from './schemas/qr-token.schema.js';
import { DevicesService } from './devices.service.js';
import { DevicesController } from './devices.controller.js';
import { ApiKeysModule } from '../api-keys/api-keys.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Device.name, schema: DeviceSchema },
      { name: QrToken.name, schema: QrTokenSchema },
    ]),
    ApiKeysModule,
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [MongooseModule, DevicesService],
})
export class DevicesModule {}
