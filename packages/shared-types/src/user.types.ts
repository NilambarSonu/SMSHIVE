// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMSHIVE — User Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface IUser {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  preferences: IUserPreferences;
  twoFactor?: ITwoFactorConfig;
  createdAt: string;
  updatedAt: string;
}

export interface IUserPreferences {
  timezone: string;
  defaultDeviceId?: string;
  smsDelay: number; // ms between messages
  notifications: INotificationPrefs;
  theme: 'dark' | 'light' | 'system';
}

export interface INotificationPrefs {
  emailOnFailure: boolean;
  emailOnDeviceOffline: boolean;
  emailDailySummary: boolean;
}

export interface ITwoFactorConfig {
  enabled: boolean;
  secret?: string;
  backupCodes?: string[];
}
