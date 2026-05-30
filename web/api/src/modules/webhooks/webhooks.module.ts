import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { WebhooksService } from './webhooks.service.js';
import { WebhooksController } from './webhooks.controller.js';
import { Webhook, WebhookSchema } from './schemas/webhook.schema.js';
import { WebhooksProcessor } from './webhooks.processor.js';
import { EmailsModule } from '../emails/emails.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Webhook.name, schema: WebhookSchema }]),
    BullModule.registerQueue({
      name: 'webhooks',
    }),
    EmailsModule,
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhooksProcessor],
  exports: [WebhooksService],
})
export class WebhooksModule {}
