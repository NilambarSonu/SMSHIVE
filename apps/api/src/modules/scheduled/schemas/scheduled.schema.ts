import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ScheduledDocument = HydratedDocument<Scheduled>;

@Schema({
  timestamps: true,
  toJSON: {
    transform(_doc, ret: any) {
      delete ret.__v;
      return ret;
    },
  },
})
export class Scheduled {
  @Prop({ type: [String], required: true })
  recipients: string[];

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  scheduledAt: Date;

  @Prop({
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly'],
    default: 'once',
  })
  recurrence: string;

  @Prop()
  cronExpression?: string;

  @Prop({
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active',
  })
  status: string;

  @Prop()
  nextRunAt?: Date;

  @Prop()
  lastRunAt?: Date;

  @Prop({ default: 0 })
  runCount: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop()
  deviceId?: string;
}

export const ScheduledSchema = SchemaFactory.createForClass(Scheduled);

ScheduledSchema.index({ status: 1, nextRunAt: 1 });
