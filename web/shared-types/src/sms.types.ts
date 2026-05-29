// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMSHIVE — SMS Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type SmsStatus = 'pending' | 'queued' | 'sent' | 'delivered' | 'failed';
export type SmsType = 'outgoing' | 'incoming';

export interface ISms {
  _id: string;
  userId: string;
  deviceId: string;
  recipients: string[];
  message: string;
  status: SmsStatus;
  type: SmsType;
  simSlot?: number;
  errorMessage?: string;
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISendSmsRequest {
  recipients: string[];
  message: string;
  deviceId?: string; // Optional — auto-select best device
  simSlot?: number;
  scheduledAt?: string;
  templateId?: string;
}

export interface IBulkSmsRequest {
  recipients: IBulkRecipient[];
  message: string; // Template with {variable} placeholders
  deviceId?: string;
  simSlot?: number;
  rateLimit?: number; // messages per minute
  delayMs?: number; // delay between messages in ms
}

export interface IBulkRecipient {
  phone: string;
  variables?: Record<string, string>;
}

export interface ISmsStatusUpdate {
  smsId: string;
  status: SmsStatus;
  errorMessage?: string;
  deliveredAt?: string;
}
