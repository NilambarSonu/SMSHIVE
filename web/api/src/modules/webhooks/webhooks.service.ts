import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Webhook, WebhookDocument } from './schemas/webhook.schema.js';
import { CreateWebhookDto } from './dto/create-webhook.dto.js';
import { UpdateWebhookDto } from './dto/update-webhook.dto.js';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectModel(Webhook.name) private webhookModel: Model<WebhookDocument>,
  ) {}

  async create(
    userId: string,
    dto: CreateWebhookDto,
  ): Promise<WebhookDocument> {
    const webhook = new this.webhookModel({
      ...dto,
      userId: new Types.ObjectId(userId),
    });
    return webhook.save();
  }

  async findAllByUser(userId: string): Promise<WebhookDocument[]> {
    return this.webhookModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<WebhookDocument> {
    const webhook = await this.webhookModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }
    return webhook;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateWebhookDto,
  ): Promise<WebhookDocument> {
    const webhook = await this.webhookModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: dto },
        { new: true },
      )
      .exec();
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }
    return webhook;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.webhookModel
      .findOneAndDelete({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!result) {
      throw new NotFoundException('Webhook not found');
    }
  }

  async fireWebhook(
    event: string,
    data: unknown,
    userId: string,
  ): Promise<void> {
    const webhooks = await this.webhookModel
      .find({
        userId: new Types.ObjectId(userId),
        enabled: true,
        events: event,
      })
      .exec();

    for (const webhook of webhooks) {
      // Fire and forget — don't await
      this.sendWebhookRequest(webhook, event, data).catch((err) => {
        this.logger.error(
          `Webhook ${(webhook._id as object).toString()} failed: ${err.message}`,
        );
      });
    }
  }

  async testWebhook(id: string, userId: string) {
    const webhook = await this.findById(id, userId);

    const testPayload = {
      event: 'test',
      data: {
        message: 'This is a test webhook from SMSHIVE',
        timestamp: new Date().toISOString(),
      },
    };

    try {
      await this.sendWebhookRequest(webhook, 'test', testPayload);
      return { success: true, message: 'Test webhook sent successfully' };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `Test webhook failed: ${message}` };
    }
  }

  private async sendWebhookRequest(
    webhook: WebhookDocument,
    event: string,
    data: unknown,
  ): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (webhook.headers) {
      for (const [key, value] of webhook.headers.entries()) {
        headers[key] = value;
      }
    }

    if (webhook.secret) {
      headers['X-Webhook-Secret'] = webhook.secret;
    }

    const body = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString(),
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(webhook.url, {
        method: webhook.method || 'POST',
        headers,
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      await this.webhookModel
        .updateOne(
          { _id: webhook._id },
          {
            $set: { lastTriggered: new Date(), failureCount: 0 },
          },
        )
        .exec();
    } catch (error) {
      await this.webhookModel
        .updateOne(
          { _id: webhook._id },
          {
            $inc: { failureCount: 1 },
            $set: { lastTriggered: new Date() },
          },
        )
        .exec();
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
