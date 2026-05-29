import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sms, SmsDocument } from './schemas/sms.schema.js';

@Injectable()
export class SmsService {
  constructor(@InjectModel(Sms.name) private smsModel: Model<SmsDocument>) {}

  async create(data: Partial<Sms>): Promise<SmsDocument> {
    const sms = new this.smsModel(data);
    return sms.save();
  }

  async findById(id: string): Promise<SmsDocument> {
    const sms = await this.smsModel.findById(id).exec();
    if (!sms) {
      throw new NotFoundException('SMS not found');
    }
    return sms;
  }

  async updateStatus(
    id: string,
    status: string,
    extra?: { errorMessage?: string; sentAt?: Date; deliveredAt?: Date },
  ): Promise<SmsDocument> {
    const updateData: Record<string, unknown> = { status };

    if (extra?.errorMessage !== undefined) {
      updateData.errorMessage = extra.errorMessage;
    }
    if (extra?.sentAt !== undefined) {
      updateData.sentAt = extra.sentAt;
    }
    if (extra?.deliveredAt !== undefined) {
      updateData.deliveredAt = extra.deliveredAt;
    }

    const sms = await this.smsModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
    if (!sms) {
      throw new NotFoundException('SMS not found');
    }
    return sms;
  }

  async findByUser(
    userId: string,
    query: {
      page?: number;
      limit?: number;
      status?: string;
      type?: string;
      deviceId?: string;
    } = {},
  ) {
    const { page = 1, limit = 20, status, type, deviceId } = query;
    const skip = (page - 1) * limit;

    const filter: any = {
      userId: new Types.ObjectId(userId),
    };

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (deviceId) filter.deviceId = deviceId;

    const [data, total] = await Promise.all([
      this.smsModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.smsModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getStats(userId: string) {
    const objectUserId = new Types.ObjectId(userId);

    const [stats] = await this.smsModel.aggregate([
      { $match: { userId: objectUserId } },
      {
        $group: {
          _id: null,
          totalSent: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$type', 'outgoing'] }, { $eq: ['$status', 'sent'] }] },
                1,
                0,
              ],
            },
          },
          totalDelivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
          totalFailed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
          totalPending: {
            $sum: {
              $cond: [
                { $in: ['$status', ['pending', 'queued']] },
                1,
                0,
              ],
            },
          },
          totalReceived: {
            $sum: { $cond: [{ $eq: ['$type', 'incoming'] }, 1, 0] },
          },
        },
      },
    ]);

    return (
      stats || {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        totalPending: 0,
        totalReceived: 0,
      }
    );
  }
}
