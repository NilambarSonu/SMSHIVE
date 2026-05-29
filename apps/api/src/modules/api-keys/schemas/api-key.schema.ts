import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ApiKeyDocument = HydratedDocument<ApiKey>;

@Schema({
  timestamps: true,
  toJSON: {
    transform(_doc, ret) {
      delete ret.__v;
      delete ret.keyHash;
      return ret;
    },
  },
})
export class ApiKey {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  keyHash: string;

  @Prop({ required: true })
  prefix: string;

  @Prop({ type: [String], default: ['sms:send', 'sms:read', 'device:read'] })
  scopes: string[];

  @Prop({ type: [String], default: [] })
  ipWhitelist: string[];

  @Prop({ default: 100 })
  rateLimit: number;

  @Prop()
  lastUsed?: Date;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);

ApiKeySchema.index({ keyHash: 1 });
ApiKeySchema.index({ userId: 1 });
