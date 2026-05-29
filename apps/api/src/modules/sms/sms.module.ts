import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Sms, SmsSchema } from './schemas/sms.schema.js';
import { SmsService } from './sms.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sms.name, schema: SmsSchema }]),
  ],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
