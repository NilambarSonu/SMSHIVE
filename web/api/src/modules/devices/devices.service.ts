import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';
import { Device, DeviceDocument } from './schemas/device.schema.js';
import { QrToken, QrTokenDocument } from './schemas/qr-token.schema.js';
import { CreateDeviceDto } from './dto/create-device.dto.js';
import { UpdateDeviceDto } from './dto/update-device.dto.js';
import { HeartbeatDto } from './dto/heartbeat.dto.js';
import { ApiKeysService } from '../api-keys/api-keys.service.js';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(QrToken.name) private qrTokenModel: Model<QrTokenDocument>,
    private apiKeysService: ApiKeysService,
  ) {}

  async create(
    userId: string,
    dto: CreateDeviceDto,
  ): Promise<DeviceDocument> {
    try {
      if (dto.qrToken) {
        const qrTokenDoc = await this.qrTokenModel.findOne({ token: dto.qrToken }).exec();
        if (!qrTokenDoc) {
          throw new NotFoundException('Invalid QR Token');
        }
        if (qrTokenDoc.used) {
          throw new ConflictException('QR Token already used');
        }
        if (qrTokenDoc.expiresAt < new Date()) {
          throw new ConflictException('QR Token expired');
        }
        if (qrTokenDoc.userId.toString() !== userId) {
          throw new UnauthorizedException('QR Token belongs to another user');
        }

        const generatedDeviceId = uuidv4();
        
        const device = new this.deviceModel({
          ...dto,
          userId: new Types.ObjectId(userId),
          deviceId: dto.deviceId || generatedDeviceId,
          name: dto.name || 'Android Gateway',
        });
        const savedDevice = await device.save();

        qrTokenDoc.used = true;
        qrTokenDoc.deviceId = savedDevice.deviceId;
        await qrTokenDoc.save();

        return savedDevice;
      }

      if (dto.deviceId) {
        const existing = await this.deviceModel.findOne({ deviceId: dto.deviceId }).exec();
        if (existing) {
          if (existing.userId.toString() === userId) {
            existing.name = dto.name;
            if (dto.model) existing.set('model', dto.model);
            existing.status = 'online';
            existing.lastSeen = new Date();
            return await existing.save();
          } else {
            throw new ConflictException('Device ID registered to another user');
          }
        }
      }

      const device = new this.deviceModel({
        ...dto,
        userId: new Types.ObjectId(userId),
        deviceId: dto.deviceId || uuidv4(),
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

    const query = Types.ObjectId.isValid(id)
      ? { $or: [{ _id: new Types.ObjectId(id) }, { deviceId: id }] }
      : { deviceId: id };

    const device = await this.deviceModel
      .findOneAndUpdate(query, { $set: updateData }, { new: true })
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

  async generateQrToken(userId: string): Promise<{ qrToken: string; expiresAt: Date; apiKey?: string }> {
    const token = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const qrTokenDoc = new this.qrTokenModel({
      token,
      userId: new Types.ObjectId(userId),
      expiresAt,
    });
    await qrTokenDoc.save();

    const apiKeys = await this.apiKeysService.findAllByUser(userId);
    let apiKeyStr: string | undefined = undefined;
    if (apiKeys.length === 0) {
      const result = await this.apiKeysService.generateKey(userId, { name: 'Android Gateway App', scopes: ['send_sms', 'receive_sms', 'manage_devices'] });
      apiKeyStr = result.rawKey;
    }

    return { qrToken: token, expiresAt, apiKey: apiKeyStr };
  }

  async getQrTokenStatus(token: string, userId: string): Promise<{ status: string; deviceId?: string; deviceName?: string }> {
    const qrTokenDoc = await this.qrTokenModel.findOne({ token, userId: new Types.ObjectId(userId) }).exec();
    if (!qrTokenDoc) {
      throw new NotFoundException('QR Token not found');
    }
    if (qrTokenDoc.used) {
      const device = await this.deviceModel.findOne({ deviceId: qrTokenDoc.deviceId }).exec();
      return { status: 'connected', deviceId: qrTokenDoc.deviceId, deviceName: device?.name };
    }
    return { status: 'pending' };
  }
}
