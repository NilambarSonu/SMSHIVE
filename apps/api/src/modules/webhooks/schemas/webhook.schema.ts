import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';

export type WebhookDocument = HydratedDocument<Webhook>;

@Schema({
  timestamps: true,
  toJSON: {
    transform(_doc, ret: any) {
      delete ret.__v;
      return ret;
    },
  },
})
export class Webhook {
  @Prop({ required: true })
  url: string;

  @Prop({ type: [String], required: true })
  events: string[];

  @Prop({ type: String, enum: ['POST', 'PUT'], default: 'POST' })
  method: string;

  @Prop({ type: MongooseSchema.Types.Map, of: String })
  headers?: Map<string, string>;

  @Prop()
  secret?: string;

  @Prop({ default: true })
  enabled: boolean;

  @Prop({ default: 0 })
  failureCount: number;

  @Prop()
  lastTriggered?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);
