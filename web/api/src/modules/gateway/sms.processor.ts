import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { GatewayEvents } from './gateway.events.js';
import { SmsService } from '../sms/sms.service.js';
import { DevicesService } from '../devices/devices.service.js';

interface SmsJobData {
  deviceId: string;
  phone: string;
  message: string;
  smsId: string;
}

@Processor('sms')
export class SmsProcessor {
  private readonly logger = new Logger(SmsProcessor.name);

  constructor(
    private readonly gatewayEvents: GatewayEvents,
    private readonly smsService: SmsService,
    private readonly devicesService: DevicesService,
  ) {}

  @Process()
  async handleSms(job: Job<SmsJobData>) {
    const { deviceId, phone, message, smsId } = job.data;
    
    // Check if the message is already processed to prevent double-dispatches
    try {
      const sms = await this.smsService.findById(smsId);
      if (sms.status === 'sent' || sms.status === 'delivered' || sms.status === 'failed') {
        this.logger.log(`SMS ${smsId} has already been processed (${sms.status}). Skipping duplicate queue dispatch.`);
        return;
      }
    } catch (err: any) {
      this.logger.warn(`Failed to inspect SMS status during queue processing: ${err.message}`);
    }

    // Emit the message via WebSockets
    this.logger.log(`Dispatching SMS ${smsId} to device ${deviceId} via WebSocket.`);
    this.gatewayEvents.emitNewSms(deviceId, {
      id: smsId,
      recipients: phone.split(','),
      message,
    });
  }
}
