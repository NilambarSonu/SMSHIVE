import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ContactDocument = HydratedDocument<Contact>;

@Schema({
  timestamps: true,
  toJSON: {
    transform(_doc, ret: any) {
      delete ret.__v;
      return ret;
    },
  },
})
export class Contact {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ trim: true })
  email?: string;

  @Prop({ type: [String], default: [] })
  labels: string[];

  @Prop()
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);

ContactSchema.index({ userId: 1, phone: 1 }, { unique: true });
