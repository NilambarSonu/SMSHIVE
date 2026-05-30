import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { Scheduled, ScheduledSchema } from './schemas/scheduled.schema.js';
import { ScheduledService } from './scheduled.service.js';
import { ScheduledController } from './scheduled.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Scheduled.name, schema: ScheduledSchema },
    ]),
    BullModule.registerQueue({
      name: 'sms',
    }),
  ],
  controllers: [ScheduledController],
  providers: [ScheduledService],
  exports: [ScheduledService],
})
export class ScheduledModule {}
