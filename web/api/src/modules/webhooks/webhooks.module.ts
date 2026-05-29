import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Webhook, WebhookSchema } from './schemas/webhook.schema.js';
import { WebhooksService } from './webhooks.service.js';
import { WebhooksController } from './webhooks.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Webhook.name, schema: WebhookSchema }]),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
