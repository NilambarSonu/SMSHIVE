import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DeviceDocument = HydratedDocument<Device>;

@Schema({ _id: false })
class SimInfo {
  @Prop({ required: true })
  slot: number;

  @Prop({ default: '' })
  carrier: string;

  @Prop({ default: '' })
  phoneNumber: string;

  @Prop({ default: true })
  active: boolean;
}

@Schema({
  timestamps: true,
  toJSON: {
    transform(_doc, ret: any) {
      delete ret.__v;
      return ret;
    },
  },
})
export class Device {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  deviceId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  model?: string;

  @Prop({
    type: String,
    enum: ['online', 'offline'],
    default: 'offline',
  })
  status: string;

  @Prop({ min: 0, max: 100 })
  batteryLevel?: number;

  @Prop({ default: false })
  isCharging: boolean;

  @Prop()
  networkType?: string;

  @Prop({ type: [SimInfo], default: [] })
  activeSims: SimInfo[];

  @Prop()
  lastSeen?: Date;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: 0 })
  messagesSent: number;

  @Prop()
  appVersion?: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.index({ userId: 1, status: 1 });
