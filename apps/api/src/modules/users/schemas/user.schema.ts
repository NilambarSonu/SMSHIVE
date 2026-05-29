import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
class NotificationPreferences {
  @Prop({ default: true })
  email: boolean;

  @Prop({ default: true })
  push: boolean;

  @Prop({ default: false })
  sms: boolean;
}

@Schema({ _id: false })
class UserPreferences {
  @Prop({ default: 'UTC' })
  timezone: string;

  @Prop()
  defaultDeviceId?: string;

  @Prop({ default: 0 })
  smsDelay: number;

  @Prop({ type: NotificationPreferences, default: () => ({}) })
  notifications: NotificationPreferences;

  @Prop({ enum: ['light', 'dark', 'system'], default: 'system' })
  theme: string;
}

@Schema({ _id: false })
class TwoFactorAuth {
  @Prop({ default: false })
  enabled: boolean;

  @Prop({ select: false })
  secret?: string;

  @Prop({ type: [String], default: [] })
  backupCodes: string[];
}

@Schema({
  timestamps: true,
  toJSON: {
    transform(_doc, ret) {
      delete ret.passwordHash;
      delete ret.__v;
      if (ret.twoFactor) {
        delete ret.twoFactor.secret;
      }
      return ret;
    },
  },
})
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop()
  avatar?: string;

  @Prop({
    type: String,
    enum: ['admin', 'operator', 'viewer'],
    default: 'operator',
  })
  role: string;

  @Prop({ type: UserPreferences, default: () => ({}) })
  preferences: UserPreferences;

  @Prop({ type: TwoFactorAuth, default: () => ({}) })
  twoFactor: TwoFactorAuth;
}

export const UserSchema = SchemaFactory.createForClass(User);
