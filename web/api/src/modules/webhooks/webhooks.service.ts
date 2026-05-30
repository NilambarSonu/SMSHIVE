import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Webhook, WebhookDocument } from './schemas/webhook.schema.js';
import { CreateWebhookDto } from './dto/create-webhook.dto.js';
import { UpdateWebhookDto } from './dto/update-webhook.dto.js';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectModel(Webhook.name) private webhookModel: Model<WebhookDocument>,
    @InjectQueue('webhooks') private webhooksQueue: Queue,
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
    userEmail?: string,
  ): Promise<void> {
    const webhooks = await this.webhookModel
      .find({
        userId: new Types.ObjectId(userId),
        enabled: true,
        events: event,
      })
      .exec();

    for (const webhook of webhooks) {
      await this.webhooksQueue.add(
        {
          webhookId: (webhook._id as object).toString(),
          event,
          data,
          userEmail,
        },
        {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
        },
      );
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
      await this.webhooksQueue.add(
        {
          webhookId: (webhook._id as object).toString(),
          event: 'test',
          data: testPayload,
        },
        {
          attempts: 1, // Don't retry test webhooks
          removeOnComplete: true,
        },
      );
      return { success: true, message: 'Test webhook queued successfully' };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `Failed to queue test webhook: ${message}` };
    }
  }
}
