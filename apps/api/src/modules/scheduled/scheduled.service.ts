import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Scheduled, ScheduledDocument } from './schemas/scheduled.schema.js';
import { CreateScheduledDto } from './dto/create-scheduled.dto.js';
import { UpdateScheduledDto } from './dto/update-scheduled.dto.js';

@Injectable()
export class ScheduledService {
  constructor(
    @InjectModel(Scheduled.name)
    private scheduledModel: Model<ScheduledDocument>,
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
}
