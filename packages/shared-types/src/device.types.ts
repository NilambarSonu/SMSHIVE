// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMSHIVE — Device Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type DeviceStatus = 'online' | 'offline';

export interface ISimInfo {
  slot: number;
  carrier: string;
  phoneNumber?: string;
  active: boolean;
}

export interface IDevice {
  _id: string;
  userId: string;
  deviceId: string;
  name: string;
  model?: string;
  status: DeviceStatus;
  batteryLevel: number;
  isCharging: boolean;
  networkType: string;
  activeSims: ISimInfo[];
  lastSeen: string;
  enabled: boolean;
  messagesSent: number;
  appVersion?: string;
  createdAt: string;
  updatedAt: string;
}
