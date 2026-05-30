import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Webhook, WebhookDocument } from './schemas/webhook.schema.js';
import { EmailsService } from '../emails/emails.service.js';

interface WebhookJobData {
  webhookId: string;
  event: string;
  data: unknown;
  userEmail?: string;
}

@Processor('webhooks')
export class WebhooksProcessor {
  private readonly logger = new Logger(WebhooksProcessor.name);

  constructor(
    @InjectModel(Webhook.name) private webhookModel: Model<WebhookDocument>,
    private readonly emailsService: EmailsService,
  ) {}

  @Process()
  async handleWebhook(job: Job<WebhookJobData>) {
    const { webhookId, event, data, userEmail } = job.data;
    
    const webhook = await this.webhookModel.findById(webhookId).exec();
    if (!webhook || !webhook.enabled) {
      this.logger.warn(`Webhook ${webhookId} is disabled or not found. Skipping.`);
      return;
    }

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
        
      this.logger.log(`Webhook ${webhookId} delivered successfully.`);
    } catch (error) {
      const updated = await this.webhookModel
        .findOneAndUpdate(
          { _id: webhook._id },
          {
            $inc: { failureCount: 1 },
            $set: { lastTriggered: new Date() },
          },
          { new: true }
        )
        .exec();

      if (updated && updated.failureCount >= 5) {
        // Disable webhook after 5 consecutive failures
        await this.webhookModel.updateOne({ _id: webhook._id }, { $set: { enabled: false } }).exec();
        this.logger.warn(`Webhook ${webhookId} disabled due to consecutive failures.`);
        
        // Send email alert to user if email is provided
        if (userEmail) {
          await this.emailsService.sendWebhookFailureAlert(userEmail, webhook.url);
        }
      }
      throw error; // Rethrow to trigger Bull retry mechanism
    } finally {
      clearTimeout(timeout);
    }
  }
}
