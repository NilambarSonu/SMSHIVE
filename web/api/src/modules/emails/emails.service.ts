import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);
  private resend: Resend | null = null;
  private readonly fromEmail = 'SMSHIVE <noreply@smshive.app>';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('resend.apiKey');
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend email service initialized.');
    } else {
      this.logger.warn('RESEND_API_KEY is not set. Emails will not be sent.');
    }
  }

  async sendWebhookFailureAlert(email: string, webhookUrl: string): Promise<void> {
    if (!this.resend) return;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Action Required: Webhook Delivery Failed',
        html: `
          <h2>Webhook Delivery Failed</h2>
          <p>We attempted to deliver a webhook to <strong>${webhookUrl}</strong> multiple times but it failed.</p>
          <p>Please check your server logs and ensure the endpoint is reachable.</p>
          <p>The webhook will be temporarily disabled until you re-enable it in the dashboard.</p>
        `,
      });
      this.logger.log(`Sent webhook failure alert to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sendDeviceOfflineAlert(email: string, deviceName: string): Promise<void> {
    if (!this.resend) return;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Alert: Device Offline',
        html: `
          <h2>Your Device is Offline</h2>
          <p>Your SMS gateway device <strong>${deviceName}</strong> has gone offline.</p>
          <p>Please ensure the TextBee/SMSHIVE app is running and has an active internet connection to continue sending and receiving messages.</p>
        `,
      });
      this.logger.log(`Sent device offline alert to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
