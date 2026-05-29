import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import CryptoJS from 'crypto-js';
import { ApiKey, ApiKeyDocument } from './schemas/api-key.schema.js';
import { CreateApiKeyDto } from './dto/create-api-key.dto.js';
import { UpdateApiKeyDto } from './dto/update-api-key.dto.js';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKeyDocument>,
  ) {}

  async generateKey(
    userId: string,
    dto: CreateApiKeyDto,
  ): Promise<{ apiKey: ApiKeyDocument; rawKey: string }> {
    const rawKeyBody = randomBytes(32).toString('hex');
    const rawKey = `shv_${rawKeyBody}`;
    const keyHash = CryptoJS.SHA256(rawKey).toString();

    const apiKey = new this.apiKeyModel({
      name: dto.name,
      keyHash,
      prefix: rawKey.substring(0, 8),
      scopes: dto.scopes || ['sms:send', 'sms:read', 'device:read'],
      ipWhitelist: dto.ipWhitelist || [],
      rateLimit: dto.rateLimit || 100,
      userId: new Types.ObjectId(userId),
    });

    await apiKey.save();

    return { apiKey, rawKey };
  }

  async validateKey(rawKey: string): Promise<ApiKeyDocument | null> {
    const keyHash = CryptoJS.SHA256(rawKey).toString();

    const apiKey = await this.apiKeyModel
      .findOne({ keyHash, isActive: true })
      .exec();

    if (!apiKey) {
      return null;
    }

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    // Update lastUsed
    await this.apiKeyModel
      .updateOne({ _id: apiKey._id }, { $set: { lastUsed: new Date() } })
      .exec();

    return apiKey;
  }

  async findAllByUser(userId: string): Promise<ApiKeyDocument[]> {
    return this.apiKeyModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<ApiKeyDocument> {
    const apiKey = await this.apiKeyModel
      .findOne({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }
    return apiKey;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateApiKeyDto,
  ): Promise<ApiKeyDocument> {
    const apiKey = await this.apiKeyModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        {
          $set: {
            ...(dto.name && { name: dto.name }),
            ...(dto.scopes && { scopes: dto.scopes }),
            ...(dto.ipWhitelist && { ipWhitelist: dto.ipWhitelist }),
            ...(dto.rateLimit && { rateLimit: dto.rateLimit }),
          },
        },
        { new: true },
      )
      .exec();
    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }
    return apiKey;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.apiKeyModel
      .findOneAndDelete({ _id: id, userId: new Types.ObjectId(userId) })
      .exec();
    if (!result) {
      throw new NotFoundException('API key not found');
    }
  }

  async revokeKey(id: string, userId: string): Promise<ApiKeyDocument> {
    const apiKey = await this.apiKeyModel
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: { isActive: false } },
        { new: true },
      )
      .exec();
    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }
    return apiKey;
  }
}
