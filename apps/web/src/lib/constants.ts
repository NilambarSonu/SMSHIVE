export const APP_NAME = 'SMSHIVE';
export const APP_DESCRIPTION = 'Turn your Android into a professional SMS gateway. Free. Forever. No limits.';
export const SUPPORT_EMAIL = 'support@smshive.app';
export const GITHUB_URL = 'https://github.com/yourusername/smshive';

export const SMS_MAX_LENGTH = 1600;
export const SMS_SEGMENT_LENGTH = 160;
export const SMS_MULTIPART_SEGMENT_LENGTH = 153;

export const DASHBOARD_NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Devices', href: '/dashboard/devices', icon: 'Smartphone' },
  { label: 'Send SMS', href: '/dashboard/send', icon: 'Send' },
  { label: 'Inbox', href: '/dashboard/inbox', icon: 'Inbox' },
  { label: 'Bulk SMS', href: '/dashboard/bulk', icon: 'Users' },
  { label: 'Scheduled', href: '/dashboard/scheduled', icon: 'Clock' },
  { label: 'Templates', href: '/dashboard/templates', icon: 'FileText' },
  { label: 'Contacts', href: '/dashboard/contacts', icon: 'Contact' },
  { label: 'Webhooks', href: '/dashboard/webhooks', icon: 'Webhook' },
  { label: 'API Keys', href: '/dashboard/api-keys', icon: 'Key' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: 'BarChart3' },
  { label: 'Logs', href: '/dashboard/logs', icon: 'ScrollText' },
  { label: 'Team', href: '/dashboard/team', icon: 'UsersRound' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
] as const;

export const SMS_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  queued: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  sent: 'bg-primary/10 text-primary border-primary/20',
  delivered: 'bg-success/10 text-success border-success/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const DEVICE_STATUS_COLORS: Record<string, string> = {
  online: 'bg-success/10 text-success border-success/20',
  offline: 'bg-muted text-muted-foreground border-border',
};

export const TEMPLATE_CATEGORIES = [
  { value: 'otp', label: 'OTP', color: 'bg-blue-500/10 text-blue-500' },
  { value: 'alert', label: 'Alert', color: 'bg-yellow-500/10 text-yellow-500' },
  { value: 'marketing', label: 'Marketing', color: 'bg-purple-500/10 text-purple-500' },
  { value: 'custom', label: 'Custom', color: 'bg-muted text-muted-foreground' },
] as const;

export const WEBHOOK_EVENTS = [
  { value: 'message_sent', label: 'Message Sent' },
  { value: 'message_received', label: 'Message Received' },
  { value: 'message_failed', label: 'Message Failed' },
  { value: 'message_delivered', label: 'Message Delivered' },
  { value: 'device_online', label: 'Device Online' },
  { value: 'device_offline', label: 'Device Offline' },
] as const;

export const API_KEY_SCOPES = [
  { value: 'send_sms', label: 'Send SMS', description: 'Send messages via API' },
  { value: 'receive_sms', label: 'Receive SMS', description: 'Read received messages' },
  { value: 'manage_devices', label: 'Manage Devices', description: 'Register, update, remove devices' },
  { value: 'manage_webhooks', label: 'Manage Webhooks', description: 'Create, update, delete webhooks' },
  { value: 'read_logs', label: 'Read Logs', description: 'Access message logs' },
] as const;

export const CODE_SNIPPETS = {
  curl: (apiKey: string, deviceId: string) => `curl -X POST \\
  '${process.env.NEXT_PUBLIC_API_URL || 'https://api.smshive.app'}/api/v1/gateway/devices/${deviceId}/send-sms' \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: ${apiKey}' \\
  -d '{
    "recipients": ["+1234567890"],
    "message": "Hello from SMSHIVE!"
  }'`,

  javascript: (apiKey: string, deviceId: string) => `const response = await fetch(
  '${process.env.NEXT_PUBLIC_API_URL || 'https://api.smshive.app'}/api/v1/gateway/devices/${deviceId}/send-sms',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '${apiKey}',
    },
    body: JSON.stringify({
      recipients: ['+1234567890'],
      message: 'Hello from SMSHIVE!',
    }),
  }
);
const data = await response.json();
console.log(data);`,

  python: (apiKey: string, deviceId: string) => `import requests

response = requests.post(
    '${process.env.NEXT_PUBLIC_API_URL || 'https://api.smshive.app'}/api/v1/gateway/devices/${deviceId}/send-sms',
    headers={
        'Content-Type': 'application/json',
        'x-api-key': '${apiKey}',
    },
    json={
        'recipients': ['+1234567890'],
        'message': 'Hello from SMSHIVE!',
    }
)
print(response.json())`,

  php: (apiKey: string, deviceId: string) => `<?php
$ch = curl_init('${process.env.NEXT_PUBLIC_API_URL || 'https://api.smshive.app'}/api/v1/gateway/devices/${deviceId}/send-sms');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: ${apiKey}',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'recipients' => ['+1234567890'],
    'message' => 'Hello from SMSHIVE!',
]));
$response = curl_exec($ch);
echo $response;`,

  go: (apiKey: string, deviceId: string) => `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    payload := map[string]interface{}{
        "recipients": []string{"+1234567890"},
        "message":    "Hello from SMSHIVE!",
    }
    body, _ := json.Marshal(payload)

    req, _ := http.NewRequest("POST",
        "${process.env.NEXT_PUBLIC_API_URL || 'https://api.smshive.app'}/api/v1/gateway/devices/${deviceId}/send-sms",
        bytes.NewBuffer(body))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("x-api-key", "${apiKey}")

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    fmt.Println(resp.Status)
}`,
} as const;
