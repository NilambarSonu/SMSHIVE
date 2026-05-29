import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Device, DeviceDocument } from './schemas/device.schema.js';
import { CreateDeviceDto } from './dto/create-device.dto.js';
import { UpdateDeviceDto } from './dto/update-device.dto.js';
import { HeartbeatDto } from './dto/heartbeat.dto.js';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async create(
    userId: string,
    dto: CreateDeviceDto,
  ): Promise<DeviceDocument> {
    try {
      const device = new this.deviceModel({
        ...dto,
        userId: new Types.ObjectId(userId),
        deviceId: uuidv4(),
      });
      return await device.save();
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as Record<string, unknown>).code === 11000
      ) {
        throw new ConflictException('Device ID already exists');
      }
      throw error;
    }
  }

  async findAllByUser(userId: string): Promise<DeviceDocument[]> {
    return this.deviceModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<DeviceDocument> {
    const device = await this.deviceModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return device;
  }

  async findByDeviceId(deviceId: string): Promise<DeviceDocument | null> {
    return this.deviceModel.findOne({ deviceId }).exec();
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateDeviceDto,
  ): Promise<DeviceDocument> {
    const device = await this.deviceModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: dto },
        { new: true },
      )
      .exec();
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return device;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.deviceModel
      .findOneAndDelete({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!result) {
      throw new NotFoundException('Device not found');
    }
  }

  async heartbeat(id: string, dto: HeartbeatDto): Promise<DeviceDocument> {
    const updateData: Record<string, unknown> = {
      status: 'online',
      lastSeen: new Date(),
    };

    if (dto.batteryLevel !== undefined) updateData.batteryLevel = dto.batteryLevel;
    if (dto.isCharging !== undefined) updateData.isCharging = dto.isCharging;
    if (dto.networkType !== undefined) updateData.networkType = dto.networkType;
    if (dto.activeSims !== undefined) updateData.activeSims = dto.activeSims;
    if (dto.appVersion !== undefined) updateData.appVersion = dto.appVersion;

    const device = await this.deviceModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return device;
  }

  async incrementMessagesSent(deviceId: string): Promise<void> {
    await this.deviceModel
      .updateOne({ deviceId }, { $inc: { messagesSent: 1 } })
      .exec();
  }
}
