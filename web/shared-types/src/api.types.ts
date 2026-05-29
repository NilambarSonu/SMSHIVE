// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMSHIVE — API & Feature Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── API Response Wrapper ─────────────────
export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: IPaginationMeta;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── API Key ──────────────────────────────
export type ApiKeyScope =
  | 'send_sms'
  | 'receive_sms'
  | 'manage_devices'
  | 'manage_webhooks'
  | 'read_logs';

export interface IApiKey {
  _id: string;
  userId: string;
  name: string;
  prefix: string; // e.g. "sk-live-xxxx"
  scopes: ApiKeyScope[];
  ipWhitelist: string[];
  rateLimit: number; // req/s
  lastUsed?: string;
  createdAt: string;
}

// ── Webhook ──────────────────────────────
export type WebhookEvent =
  | 'message_sent'
  | 'message_received'
  | 'message_failed'
  | 'message_delivered'
  | 'device_online'
  | 'device_offline';

export interface IWebhook {
  _id: string;
  userId: string;
  url: string;
  events: WebhookEvent[];
  method: 'POST' | 'GET';
  headers: Record<string, string>;
  secret?: string; // HMAC-SHA256 key
  enabled: boolean;
  failureCount: number;
  lastTriggered?: string;
  createdAt: string;
}

export interface IWebhookDelivery {
  _id: string;
  webhookId: string;
  event: WebhookEvent;
  statusCode?: number;
  responseBody?: string;
  retryCount: number;
  success: boolean;
  createdAt: string;
}

// ── Template ─────────────────────────────
export type TemplateCategory = 'otp' | 'alert' | 'marketing' | 'custom';

export interface ITemplate {
  _id: string;
  userId: string;
  name: string;
  body: string;
  category: TemplateCategory;
  variables: string[]; // extracted from {name}, {code} etc.
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// ── Scheduled SMS ────────────────────────
export type ScheduleRecurrence = 'one-time' | 'daily' | 'weekly' | 'monthly' | 'cron';
export type ScheduleStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface IScheduledSms {
  _id: string;
  userId: string;
  deviceId?: string;
  recipients: string[];
  message: string;
  scheduledAt: string;
  recurrence: ScheduleRecurrence;
  cronExpression?: string;
  status: ScheduleStatus;
  lastRunAt?: string;
  nextRunAt?: string;
  runCount: number;
  createdAt: string;
}

// ── Contact ──────────────────────────────
export interface IContact {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  labels: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Team Member ──────────────────────────
export interface ITeamMember {
  _id: string;
  userId: string;
  teamOwnerId: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'viewer';
  status: 'pending' | 'active';
  invitedAt: string;
  joinedAt?: string;
}

// ── Analytics ────────────────────────────
export interface IAnalyticsSummary {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalPending: number;
  totalReceived: number;
  activeDevices: number;
  deliveryRate: number; // percentage
}

export interface IChartDataPoint {
  date: string;
  sent: number;
  delivered: number;
  failed: number;
}

export interface IHourlyHeatmapData {
  day: number; // 0-6
  hour: number; // 0-23
  count: number;
}

// ── Realtime Events ──────────────────────
export interface IRealtimeEvent {
  type: 'sms:status_update' | 'sms:new_received' | 'device:status_change' | 'sms:new_sent';
  payload: unknown;
  timestamp: string;
}

// ── Auth ─────────────────────────────────
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

// Re-export from user types
import type { IUser } from './user.types';
export type { IUser };
