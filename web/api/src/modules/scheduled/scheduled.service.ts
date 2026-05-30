import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Scheduled, ScheduledDocument } from './schemas/scheduled.schema.js';
import { CreateScheduledDto } from './dto/create-scheduled.dto.js';
import { UpdateScheduledDto } from './dto/update-scheduled.dto.js';

@Injectable()
export class ScheduledService {
  private readonly logger = new Logger(ScheduledService.name);

  constructor(
    @InjectModel(Scheduled.name)
    private scheduledModel: Model<ScheduledDocument>,
    @InjectQueue('sms') private smsQueue: Queue,
  ) {}

  async create(
    userId: string,
    dto: CreateScheduledDto,
  ): Promise<ScheduledDocument> {
    const scheduled = new this.scheduledModel({
      ...dto,
      scheduledAt: new Date(dto.scheduledAt),
      nextRunAt: new Date(dto.scheduledAt),
      userId: new Types.ObjectId(userId),
    });
    return scheduled.save();
  }

  async findAllByUser(
    userId: string,
    query?: { status?: string },
  ): Promise<ScheduledDocument[]> {
    const filter: any = {
      userId: new Types.ObjectId(userId),
    };
    if (query?.status) {
      filter.status = query.status;
    }
    return this.scheduledModel.find(filter).sort({ scheduledAt: -1 }).exec();
  }

  async findById(id: string, userId: string): Promise<ScheduledDocument> {
    const scheduled = await this.scheduledModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!scheduled) {
      throw new NotFoundException('Scheduled message not found');
    }
    return scheduled;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateScheduledDto,
  ): Promise<ScheduledDocument> {
    const updateData: Record<string, unknown> = { ...dto };
    if (dto.scheduledAt) {
      updateData.scheduledAt = new Date(dto.scheduledAt);
      updateData.nextRunAt = new Date(dto.scheduledAt);
    }

    const scheduled = await this.scheduledModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: updateData },
        { new: true },
      )
      .exec();
    if (!scheduled) {
      throw new NotFoundException('Scheduled message not found');
    }
    return scheduled;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.scheduledModel
      .findOneAndDelete({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!result) {
      throw new NotFoundException('Scheduled message not found');
    }
  }

  async cancel(id: string, userId: string): Promise<ScheduledDocument> {
    const scheduled = await this.scheduledModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: { status: 'cancelled' } },
        { new: true },
      )
      .exec();
    if (!scheduled) {
      throw new NotFoundException('Scheduled message not found');
    }
    return scheduled;
  }

  async findDueScheduled(): Promise<ScheduledDocument[]> {
    return this.scheduledModel
      .find({
        status: 'active',
        nextRunAt: { $lte: new Date() },
      })
      .exec();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledMessages() {
    this.logger.debug('Checking for due scheduled messages...');
    const dueMessages = await this.findDueScheduled();

    for (const msg of dueMessages) {
      this.logger.log(`Queueing scheduled message ${msg._id}`);
      try {
        await this.smsQueue.add(
          {
            deviceId: msg.deviceId,
            phone: msg.recipients.join(','),
            message: msg.message,
            smsId: (msg._id as object).toString(), // Usually scheduled messages would create a new SMS record or use their own ID. We use scheduled message ID as reference.
          },
          {
            removeOnComplete: true,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          },
        );

        // Update next run or complete it
        if (msg.recurrence === 'none') {
          await this.scheduledModel.updateOne(
            { _id: msg._id },
            { $set: { status: 'completed' } },
          ).exec();
        } else {
          // Calculate next run date based on recurrence
          const nextRun = new Date(msg.nextRunAt);
          if (msg.recurrence === 'daily') nextRun.setDate(nextRun.getDate() + 1);
          if (msg.recurrence === 'weekly') nextRun.setDate(nextRun.getDate() + 7);
          if (msg.recurrence === 'monthly') nextRun.setMonth(nextRun.getMonth() + 1);
          
          await this.scheduledModel.updateOne(
            { _id: msg._id },
            { $set: { nextRunAt: nextRun } },
          ).exec();
        }
      } catch (error) {
        this.logger.error(`Failed to queue scheduled message ${msg._id}: ${error}`);
      }
    }
  }
}
