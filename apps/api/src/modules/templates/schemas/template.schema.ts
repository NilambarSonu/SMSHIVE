import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TemplateDocument = HydratedDocument<Template>;

@Schema({
  timestamps: true,
  toJSON: {
    transform(_doc, ret: any) {
      delete ret.__v;
      return ret;
    },
  },
})
export class Template {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  body: string;

  @Prop({ default: 'general' })
  category: string;

  @Prop({ type: [String], default: [] })
  variables: string[];

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
