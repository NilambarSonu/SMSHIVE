import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SmsDocument = HydratedDocument<Sms>;

@Schema({
  timestamps: true,
  toJSON: {
    transform(_doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
})
export class Sms {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ index: true })
  deviceId?: string;

  @Prop({ type: [String], required: true })
  recipients: string[];

  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    enum: ['pending', 'queued', 'sent', 'delivered', 'failed'],
    default: 'pending',
  })
  status: string;

  @Prop({
    type: String,
    enum: ['outgoing', 'incoming'],
    default: 'outgoing',
  })
  type: string;

  @Prop()
  simSlot?: number;

  @Prop()
  sender?: string;

  @Prop()
  errorMessage?: string;

  @Prop()
  scheduledAt?: Date;

  @Prop()
  sentAt?: Date;

  @Prop()
  deliveredAt?: Date;
}

export const SmsSchema = SchemaFactory.createForClass(Sms);

SmsSchema.index({ userId: 1, createdAt: -1 });
SmsSchema.index({ deviceId: 1, status: 1 });
SmsSchema.index({ status: 1, scheduledAt: 1 });
