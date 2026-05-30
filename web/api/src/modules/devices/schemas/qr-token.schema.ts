import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QrTokenDocument = QrToken & Document;

@Schema({ timestamps: true })
export class QrToken {
  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;

  @Prop({ type: String, required: false })
  deviceId?: string;
}

export const QrTokenSchema = SchemaFactory.createForClass(QrToken);
