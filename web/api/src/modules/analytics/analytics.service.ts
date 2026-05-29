import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Sms, SmsDocument } from '../sms/schemas/sms.schema.js';
import { Device, DeviceDocument } from '../devices/schemas/device.schema.js';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Sms.name) private smsModel: Model<SmsDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async getSummary(userId: string, from?: Date, to?: Date) {
    const filter: any = { userId: new Types.ObjectId(userId) };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = from;
      if (to) filter.createdAt.$lte = to;
    }

    const stats = await this.smsModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSent: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$type', 'outgoing'] }, { $eq: ['$status', 'sent'] }] }, 1, 0],
            },
          },
          totalDelivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
          totalFailed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
          totalPending: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'queued']] }, 1, 0] },
          },
          totalReceived: {
            $sum: { $cond: [{ $eq: ['$type', 'incoming'] }, 1, 0] },
          },
        },
      },
    ]);

    const activeDevices = await this.deviceModel.countDocuments({
      userId: new Types.ObjectId(userId),
      status: 'online',
    });

    return (
      stats[0] || {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        totalPending: 0,
        totalReceived: 0,
        activeDevices,
      }
    );
  }

  async getChartData(userId: string, from?: Date, to?: Date) {
    const filter: any = {
      userId: new Types.ObjectId(userId),
      type: 'outgoing',
    };

    const endDate = to || new Date();
    const startDate = from || new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    filter.createdAt = { $gte: startDate, $lte: endDate };

    const chartData = await this.smsModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          sent: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return chartData.map((item) => ({
      date: item._id,
      sent: item.sent,
      delivered: item.delivered,
      failed: item.failed,
    }));
  }
}
