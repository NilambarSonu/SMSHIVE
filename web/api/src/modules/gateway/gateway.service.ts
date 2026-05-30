import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { SmsService } from '../sms/sms.service.js';
import { DevicesService } from '../devices/devices.service.js';
import { GatewayEvents } from './gateway.events.js';
import { SendSmsDto } from './dto/send-sms.dto.js';
import { ReceiveSmsDto } from './dto/receive-sms.dto.js';

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);

  constructor(
    private readonly smsService: SmsService,
    private readonly devicesService: DevicesService,
    private readonly gatewayEvents: GatewayEvents,
    @InjectQueue('sms') private smsQueue: Queue,
  ) {}

  async sendSms(userId: string, deviceId: string, dto: SendSmsDto) {
    const sms = await this.smsService.create({
      userId: new Types.ObjectId(userId),
      deviceId,
      recipients: dto.recipients,
      message: dto.message,
      simSlot: dto.simSlot,
      status: 'pending',
      type: 'outgoing',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    });

    this.logger.log(
      `SMS created: ${(sms._id as object).toString()} for device ${deviceId}`,
    );

    // Push to the Bull queue
    try {
      await this.smsQueue.add(
        {
          deviceId,
          phone: sms.recipients.join(','),
          message: sms.message,
          smsId: (sms._id as object).toString(),
        },
        {
          removeOnComplete: true,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      );
    } catch (err: any) {
      this.logger.warn(`Failed to push SMS to Bull queue (Redis offline/missing): ${err.message}`);
      // Fallback: Attempt to notify the device directly via WebSocket if connected
      try {
        this.gatewayEvents.emitNewSms(deviceId, {
          id: (sms._id as object).toString(),
          recipients: sms.recipients,
          message: sms.message,
        });
      } catch (wsErr) {}
    }

    return sms;
  }

  async bulkSend(
    userId: string,
    messages: { deviceId: string; recipients: string[]; message: string }[],
  ) {
    const results = await Promise.allSettled(
      messages.map((msg) =>
        this.smsService.create({
          userId: new Types.ObjectId(userId),
          deviceId: msg.deviceId,
          recipients: msg.recipients,
          message: msg.message,
          status: 'pending',
          type: 'outgoing',
        }),
      ),
    );

    const successful = results
      .filter((r) => r.status === 'fulfilled')
      .map((r: any) => r.value);

    // Queue successful creations
    for (const sms of successful) {
      try {
        await this.smsQueue.add(
          {
            deviceId: sms.deviceId,
            phone: sms.recipients.join(','),
            message: sms.message,
            smsId: (sms._id as object).toString(),
          },
          {
            removeOnComplete: true,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          }
        );
      } catch (err: any) {
        this.logger.warn(`Failed to push SMS to Bull queue (Redis offline/missing): ${err.message}`);
        try {
          this.gatewayEvents.emitNewSms(sms.deviceId, {
            id: (sms._id as object).toString(),
            recipients: sms.recipients,
            message: sms.message,
          });
        } catch (wsErr) {}
      }
    }

    const failed = results
      .filter((r) => r.status === 'rejected')
      .map((r: any) => ({ error: r.reason?.message || 'Unknown error' }));

    return {
      total: messages.length,
      successful: successful.length,
      failed: failed.length,
      results: successful,
      errors: failed,
    };
  }

  async getReceivedSms(
    userId: string,
    deviceId: string,
    page = 1,
    limit = 20,
  ) {
    return this.smsService.findByUser(userId, {
      page,
      limit,
      type: 'incoming',
      deviceId,
    });
  }

  async receiveSms(deviceId: string, dto: ReceiveSmsDto) {
    const device = await this.devicesService.findByDeviceId(deviceId);
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    const sms = await this.smsService.create({
      userId: device.userId,
      deviceId,
      recipients: [],
      sender: dto.sender,
      message: dto.message,
      simSlot: dto.simSlot,
      status: 'delivered',
      type: 'incoming',
      deliveredAt: dto.receivedAt ? new Date(dto.receivedAt) : new Date(),
    });

    this.logger.log(
      `Incoming SMS received on device ${deviceId} from ${dto.sender}`,
    );

    return sms;
  }

  async getPendingSms(deviceId: string) {
    const device = await this.devicesService.findByDeviceId(deviceId);
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    // Find messages that are 'pending' OR 'queued' but stuck
    const result = await this.smsService.findPendingOrStuckQueued(deviceId);

    // Update status to queued for retrieved messages
    await Promise.all(
      result.map((sms) =>
        this.smsService.updateStatus((sms._id as object).toString(), 'queued'),
      ),
    );

    return result;
  }

  async updateSmsStatus(
    smsId: string,
    status: string,
    errorMessage?: string,
  ) {
    const extra: { errorMessage?: string; sentAt?: Date; deliveredAt?: Date } =
      {};

    const normalizedStatus = status ? status.toLowerCase() : 'sent';

    if (errorMessage) extra.errorMessage = errorMessage;
    if (normalizedStatus === 'sent') extra.sentAt = new Date();
    if (normalizedStatus === 'delivered') extra.deliveredAt = new Date();

    const sms = await this.smsService.updateStatus(smsId, normalizedStatus, extra);

    // Increment device message counter on successful send
    if (normalizedStatus === 'sent' && sms.deviceId) {
      await this.devicesService
        .incrementMessagesSent(sms.deviceId)
        .catch((err) =>
          this.logger.error(
            `Failed to increment message count: ${err.message}`,
          ),
        );
    }

    return sms;
  }
}
