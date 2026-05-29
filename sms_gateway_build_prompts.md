# SMS Gateway Builder — Two Complete AI Prompts
### For: Ramamani Behera | Project: Custom SMS Gateway (TextBee Alternative)

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 1 — FULL-STACK WEB DASHBOARD
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🌐 PROMPT FOR WEB DASHBOARD (Give this to Cursor / Claude / ChatGPT / v0)

---

```
You are a senior full-stack engineer and UI/UX designer. Build a complete, 
production-grade SMS Gateway web application called "SMSHIVE" — a powerful, 
beautiful, and fully free alternative to textbee.dev with ZERO paywalls, 
ZERO feature restrictions, and ALL premium features unlocked for every user.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend:    Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
Backend:     NestJS (Node.js), REST API, WebSockets
Database:    MongoDB with Mongoose
Auth:        NextAuth.js (email/password + Google OAuth)
Deploy:      Docker + docker-compose (self-hostable on any VPS)
Real-time:   Socket.io for live message status updates
Email:       Nodemailer (SMTP-based, configurable)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM & UI/UX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Design Direction: "Dark-mode-first enterprise SaaS with electric accents"
— Think Vercel + Linear + Resend combined aesthetic

Color Palette:
  - Background:   #0A0A0F (near black with slight blue tint)
  - Surface:      #111118 (card backgrounds)
  - Border:       #1E1E2E (subtle borders)
  - Primary:      #6C63FF (electric violet — brand accent)
  - Secondary:    #00D4AA (teal green — success/live states)
  - Warning:      #F59E0B (amber)
  - Danger:       #EF4444 (red)
  - Text Primary: #F0F0FF (near white)
  - Text Muted:   #6B7280

Typography:
  - Display/Headings: "Cal Sans" or "Syne" (bold, geometric)
  - Body:             "DM Sans" (clean, readable)
  - Code/Monospace:   "JetBrains Mono"
  - Import all from Google Fonts

Visual Effects:
  - Glassmorphism cards with backdrop-blur
  - Subtle gradient borders on active cards
  - Animated dot-grid background on landing page
  - Live pulse animation on device "Online" status badges
  - Number counter animations on stats
  - Skeleton loaders for all data-fetching states
  - Toast notifications with smooth slide-in animation
  - Page transitions with fade-slide

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGES & ROUTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. / (Landing Page)
   - Hero with animated tagline: "Turn your Android into a 
     professional SMS gateway. Free. Forever. No limits."
   - Feature grid (6 cards with icons + descriptions)
   - Live stats ticker: "X messages sent today globally"
   - Comparison table vs textbee.dev (show all features unlocked)
   - How it works: 3-step animated timeline
   - CTA: "Get Started Free" → /register

2. /register and /login
   - Email + password with strength meter
   - Google OAuth button
   - Clean split-screen layout (form left, animated visual right)

3. /dashboard (main authenticated layout)
   - Sidebar navigation (collapsible, icon + label)
   - Top header with: user avatar, notifications bell, quick-send button
   - Sidebar links: Overview, Devices, Send SMS, Inbox, Bulk SMS, 
     Scheduled, Templates, Webhooks, API Keys, Analytics, Logs, Settings

4. /dashboard (Overview)
   - Stats cards: Total Sent Today, Delivered, Failed, Pending, 
     Active Devices, Messages This Month — all with trend arrows
   - Real-time message feed (last 10 messages, live-updating)
   - Device status panel (all connected devices with signal strength)
   - Quick Send widget inline
   - Activity graph (last 7 days, area chart with gradient fill)
   - Recent webhook events log

5. /dashboard/devices
   - Grid of device cards showing:
     * Device name (editable)
     * Device ID (copyable with one click)
     * Online/Offline status with animated pulse
     * Battery level indicator
     * Active SIM(s) with carrier names
     * Messages sent count
     * Last seen timestamp
   - Add Device button → shows QR code scanner modal + manual entry
   - Each device card has: Edit Name, Select SIM, Remove, View Logs
   - Load balancing toggle (round-robin across devices)
   - Unlimited devices allowed (no cap)

6. /dashboard/send
   - Single SMS form:
     * Recipient phone number (with country flag picker)
     * Message body with character counter (160/SMS, shows segment count)
     * Device selector dropdown (or "Auto — best available")
     * SIM card selector (if device has dual SIM)
     * Schedule toggle (datetime picker for delayed send)
     * Template selector (load from saved templates)
     * Preview pane showing how SMS will look
     * Send button with loading state and delivery confirmation toast

7. /dashboard/bulk
   - Two input modes:
     * Manual: textarea for numbers (one per line or comma-separated)
     * CSV Upload: drag-and-drop CSV with column mapping
   - Recipient count badge
   - Message body with variable placeholder support: {name}, {code}, {date}
   - Per-recipient variable data from CSV columns
   - Rate limiting config: messages/minute (to avoid carrier blocking)
   - Delay between messages: 0ms to 60s configurable
   - Preview first 3 messages before sending
   - Send All button with progress bar
   - Estimated time to complete shown live
   - Stop/Pause mid-send capability
   - Unlimited recipients per batch (no cap)

8. /dashboard/inbox
   - Full two-pane inbox layout (like email client)
   - Left: conversation list with sender, preview, timestamp, unread badge
   - Right: conversation thread view
   - Search bar (full-text search across all received messages)
   - Filter by: device, date range, read/unread, starred
   - Mark as read/unread, star, delete
   - Reply inline (opens send form pre-filled with that number)
   - Export inbox as CSV

9. /dashboard/scheduled
   - Calendar view + list view toggle
   - Upcoming scheduled messages with:
     * Recipient(s), message preview, scheduled time, device
     * Edit, Cancel, Send Now buttons
   - Recurring schedule support:
     * One-time, daily, weekly, monthly
     * Cron expression builder (visual, no code needed)
   - History of sent scheduled messages

10. /dashboard/templates
    - Template cards grid with:
      * Name, category tag, character count, usage count
      * Preview on hover
      * Edit, Duplicate, Delete, Use Now
    - Create template:
      * Name, category (OTP, Alert, Marketing, Custom)
      * Message body with {variable} inserter tool
      * Test-send with sample values
    - Template categories filter
    - Unlimited templates (no cap)

11. /dashboard/webhooks
    - Webhook endpoint manager:
      * Add URL + event type (message_sent, message_received, 
        message_failed, device_online, device_offline)
      * HTTP method (POST/GET)
      * Custom headers (key-value editor)
      * Secret key for HMAC-SHA256 signature verification
    - Test webhook button (sends sample payload)
    - Delivery log per webhook (status codes, response body, retry count)
    - Auto-retry on failure: 3 retries with exponential backoff
    - Auto-disable toggle if failure rate > 50% (with re-enable option)
    - Payload preview (JSON schema viewer)
    - Unlimited webhook subscriptions

12. /dashboard/api-keys
    - List of API keys with:
      * Name, prefix (e.g. sk-live-xxxx), created date, last used
      * Permission scopes: send_sms, receive_sms, manage_devices, 
        manage_webhooks, read_logs (checkboxes per key)
      * IP whitelist per key (optional)
      * Rate limit per key: configurable req/s
      * Revoke, regenerate, copy
    - "View API Docs" button → opens interactive Swagger UI
    - Code snippet generator: 
      * Language selector: cURL, JavaScript, Python, PHP, Go
      * Live code preview with user's actual API key populated
    - Unlimited API keys per account

13. /dashboard/analytics
    - Date range picker (last 7d / 30d / 90d / custom)
    - Charts:
      * Messages sent/day (line chart)
      * Success vs Failed rate (donut chart)
      * Messages by device (bar chart)
      * Top recipients (table)
      * Hourly heatmap (calendar-style grid)
      * Response time (webhook delivery latency)
    - Summary table: total sent, delivered, failed, pending, cost 
      estimate (your SIM plan cost / msg)
    - Export as CSV or PDF

14. /dashboard/logs
    - Full searchable message log table:
      Columns: ID, To, Message (truncated), Status (badge), Device, 
      SIM, Sent At, Delivered At, Error (if failed)
    - Filters: status, device, date, search by number
    - Click any row → full detail modal
    - Retry failed messages in bulk
    - Export filtered logs as CSV

15. /dashboard/settings
    - Profile: name, email, password change, avatar upload
    - Notification preferences: email alerts for failures, 
      device offline, daily summary
    - Timezone selector
    - Default device selector
    - SMS delay config (global send delay between messages)
    - Danger zone: delete account, export all data (GDPR)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BACKEND API ENDPOINTS (NestJS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Auth:
  POST /api/auth/register
  POST /api/auth/login
  POST /api/auth/logout
  POST /api/auth/refresh-token

Devices:
  GET    /api/v1/devices
  POST   /api/v1/devices/register
  PUT    /api/v1/devices/:id
  DELETE /api/v1/devices/:id
  GET    /api/v1/devices/:id/status
  POST   /api/v1/devices/:id/heartbeat   ← Android app calls this

SMS Send:
  POST /api/v1/gateway/devices/:id/send-sms
  POST /api/v1/gateway/bulk-send
  POST /api/v1/gateway/schedule-sms

SMS Receive:
  GET  /api/v1/gateway/devices/:id/get-received-sms
  POST /api/v1/gateway/devices/:id/receive-sms  ← Android pushes here

Status:
  PUT  /api/v1/sms/:smsId/status  ← Android updates delivery status

Templates:
  GET    /api/v1/templates
  POST   /api/v1/templates
  PUT    /api/v1/templates/:id
  DELETE /api/v1/templates/:id

Webhooks:
  GET    /api/v1/webhooks
  POST   /api/v1/webhooks
  PUT    /api/v1/webhooks/:id
  DELETE /api/v1/webhooks/:id
  POST   /api/v1/webhooks/:id/test

API Keys:
  GET    /api/v1/api-keys
  POST   /api/v1/api-keys
  DELETE /api/v1/api-keys/:id

Analytics:
  GET    /api/v1/analytics/summary?from=&to=
  GET    /api/v1/analytics/chart-data

Logs:
  GET    /api/v1/logs?page=&limit=&status=&device=

Scheduled:
  GET    /api/v1/scheduled
  POST   /api/v1/scheduled
  PUT    /api/v1/scheduled/:id
  DELETE /api/v1/scheduled/:id

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PREMIUM FEATURES INCLUDED (ALL FREE, NO PAYWALL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Unlimited messages per day (no 50/day cap)
✅ Unlimited messages per month (no 300/month cap)
✅ Unlimited devices (no 5-device cap)
✅ Unlimited bulk SMS recipients per batch
✅ Unlimited API keys per account
✅ Unlimited webhook subscriptions
✅ Unlimited templates
✅ API rate: 1000 req/s (no 60 req/s cap)
✅ Scheduled SMS (one-time + recurring cron)
✅ Message templates with dynamic variables
✅ Dual SIM selection per device
✅ Per-device load balancing
✅ HMAC-SHA256 webhook signature verification
✅ Per-API-key scope + IP whitelist + rate limits
✅ Full analytics with export
✅ CSV bulk upload with variable mapping
✅ Retry failed messages
✅ Full conversation inbox view
✅ Real-time delivery tracking via WebSocket
✅ Interactive API docs (Swagger)
✅ Multi-language code snippets
✅ Device battery + connectivity monitoring
✅ Custom device names
✅ Send delay configuration (anti-spam SIM protection)
✅ GDPR data export
✅ Dark mode (default) + Light mode toggle

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXTRA FEATURES BEYOND TEXTBEE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Smart Number Masking Note: Show a banner in UI explaining users 
   can configure a Sender ID via MSG91 relay for ₹99/month — 
   with a settings toggle to route through external gateway

🚀 OTP Widget Generator: 
   A no-code OTP widget users can embed in any website with 
   a single <script> tag. Plug in their API key and device ID.

🚀 Team Members:
   Invite team members to your account with role-based access 
   (Admin, Operator, Viewer)

🚀 Contact Book:
   Save phone numbers with names/labels. Use contacts in send form 
   and bulk send by picking from contact list.

🚀 Message Inbox Search:
   Full-text search across all received messages

🚀 Delivery Reports:
   Per-message delivery receipt from Android (READ vs SENT vs FAILED)

🚀 Send Rate Limiter:
   Per-device configurable delay to prevent SIM from getting 
   flagged by carrier for spam

🚀 Two-Factor Auth (2FA) for Dashboard login

🚀 Webhook Playground:
   Test webhook payloads in a browser sandbox before deploying

🚀 Device Offline Alerts:
   Email + in-app notification when a device goes offline

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELF-HOSTING SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Provide a complete docker-compose.yml with:
  - smshive-api (NestJS backend)
  - smshive-web (Next.js frontend)
  - mongodb (data storage)
  - redis (queue + rate limiting)
  - nginx (reverse proxy with SSL config)

Include a .env.example with all required variables.
Include a README.md with step-by-step deploy on:
  - Oracle Cloud Free Tier
  - Railway.app
  - Render.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- NO pricing page. NO subscription wall. NO feature gating.
- All users get all features immediately on signup.
- The project name is "SMSHIVE"
- Logo: a hexagon made of signal waves (SVG, provide inline)
- Favicon: same logo
- Support email placeholder: support@smshive.app
- GitHub link in footer: github.com/yourusername/smshive
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROMPT 2 — ANDROID APK
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📱 PROMPT FOR ANDROID APK (Give this to Cursor / Android Studio AI / Claude)

---

```
You are a senior Android developer. Build a complete, production-grade 
Android application called "SMSHIVE" — the companion Android app to 
the SMSHIVE web gateway. This app turns any Android phone into a fully 
functioning SMS gateway device. The app must support Android 8.0 (API 26) 
and above, and be buildable as a standalone APK (no Play Store required).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Language:     Kotlin
Architecture: MVVM + Clean Architecture (UseCase layer)
UI:           Jetpack Compose (Material 3)
Networking:   Retrofit2 + OkHttp3 + Gson
Background:   WorkManager + Foreground Service
DB (local):   Room Database
DI:           Hilt (Dagger)
Async:        Kotlin Coroutines + Flow
Notifications: NotificationCompat
Security:     EncryptedSharedPreferences (API key storage)
Build:        Gradle (Kotlin DSL), minSdk 26, targetSdk 34

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Theme: Dark-first Material 3
Primary color:   #6C63FF (electric violet — matches web dashboard)
Secondary:       #00D4AA (teal green)
Background:      #0A0A0F
Surface:         #111118
On-surface:      #F0F0FF
Error:           #EF4444
Font:            Use Material 3 default with custom fontFamily 
                 (import DM Sans via assets)

All screens use:
  - Card-based layout with rounded corners (16dp)
  - Status badges with color coding
  - Smooth Compose animations (AnimatedVisibility, animateContentSize)
  - Pull-to-refresh on list screens
  - Bottom navigation bar (3 tabs: Dashboard, Inbox, Settings)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUIRED PERMISSIONS (AndroidManifest.xml)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEND_SMS
RECEIVE_SMS
READ_SMS
RECEIVE_BOOT_COMPLETED
FOREGROUND_SERVICE
FOREGROUND_SERVICE_DATA_SYNC
INTERNET
ACCESS_NETWORK_STATE
READ_PHONE_STATE
READ_PHONE_NUMBERS
VIBRATE
POST_NOTIFICATIONS (Android 13+)
WAKE_LOCK

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCREENS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SPLASH SCREEN
   - SMSHIVE logo + app name animated in
   - Auto-navigate to Setup if not configured, 
     else to Main Dashboard

2. SETUP / ONBOARDING SCREEN
   - Step 1: Enter API Key (text field with show/hide toggle)
   - Step 2: Enter Server URL (default: https://api.smshive.app)
   - Step 3: Optional — Enter Device ID (leave blank to auto-register)
   - Step 4: Optional — Enter Device Name (default: device model)
   - QR Code Scanner option: scan QR from web dashboard to 
     auto-fill all fields (use CameraX + ML Kit barcode scanning)
   - "Connect & Register" button
   - On success: show green tick animation, navigate to main app
   - On error: show error toast with specific message

3. MAIN DASHBOARD SCREEN (Home Tab)
   - Top card: Device status — 
     * Name, Device ID (tap to copy)
     * Gateway ON/OFF toggle (big, prominent)
     * Status indicator: "Online ✓" (green pulse) or "Offline ✗"
     * Connection to server: last heartbeat timestamp
   - Stats row: 
     * Messages Sent Today / This Month / Total (animated counters)
   - SIM Card selector card:
     * Shows SIM 1 and SIM 2 (if dual SIM)
     * Carrier name, phone number (if readable)
     * Select which SIM(s) to use for outgoing SMS
     * Toggle each SIM active/inactive
   - Recent Activity list (last 10 outgoing messages):
     * Recipient number, message preview, timestamp, status badge
       (Sent / Delivered / Failed / Pending)
   - Retry failed button on each failed item
   - Foreground service status card:
     * "Running in background" / "Stopped"
     * Start / Stop button
     * Battery optimization warning with one-tap fix button

4. INBOX SCREEN (Inbox Tab)
   - List of received SMS messages:
     * Sender number, message preview, received time
     * "Forwarded to webhook ✓" badge (if webhook configured)
     * Unread count badge on tab
   - Tap message → full detail view
   - Search bar (filter by sender number or message content)
   - Pull to refresh
   - Mark as read/unread, delete

5. SETTINGS SCREEN (Settings Tab)
   Sections:

   A. Account & Server
      - API Key (masked, tap to edit)
      - Server URL (tap to edit)
      - Device ID (read-only, copy button)
      - Device Name (editable)
      - Re-register device button
      - Disconnect (clears all saved config)

   B. SIM & Sending
      - Active SIM selection (SIM 1 / SIM 2 / Both alternating)
      - Send delay between messages: slider 0s → 60s
      - Max retries on failure: 1, 2, 3 (default 2)
      - Retry delay: 10s / 30s / 60s

   C. Background Service
      - Auto-start on boot: toggle
      - Keep-alive polling interval: 5s / 10s / 30s / 60s
      - Battery optimization: show if restricted, button to fix
      - Notification channel settings

   D. Receive SMS
      - Enable/disable receive SMS forwarding: toggle
      - When enabled: received SMS are forwarded to server via API

   E. Notifications
      - Notify on message sent: toggle
      - Notify on message failed: toggle
      - Notify on server disconnect: toggle
      - Sound / vibration toggles

   F. About
      - App version, build number
      - Open web dashboard link
      - GitHub link
      - Report issue link
      - Privacy policy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE BACKGROUND SERVICE (Critical)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SmsGatewayForegroundService (extends Service):

1. POLLING LOOP (runs every N seconds, configurable):
   - Call GET /api/v1/gateway/devices/{deviceId}/pending-sms
   - For each pending SMS returned:
     a. Use Android SmsManager to send SMS
     b. Select correct SIM based on user's SIM preference
     c. Use sendTextMessage() or sendMultipartTextMessage() 
        for messages > 160 chars
     d. Register BroadcastReceiver for SENT and DELIVERED intents
     e. Report status back to server:
        PUT /api/v1/sms/{smsId}/status 
        with status: SENT / DELIVERED / FAILED + error message

2. HEARTBEAT (every 30 seconds):
   - POST /api/v1/devices/{deviceId}/heartbeat
   - Include: battery level, charging state, network type, 
     active SIM info, app version

3. RECEIVE SMS BroadcastReceiver:
   - Registered for android.provider.Telephony.SMS_RECEIVED
   - On new SMS: POST to /api/v1/gateway/devices/{deviceId}/receive-sms
   - Include: sender, message, timestamp, simSlot

4. BOOT BroadcastReceiver:
   - Registered for RECEIVE_BOOT_COMPLETED
   - Auto-starts SmsGatewayForegroundService on device reboot
   - Only starts if gateway was enabled before reboot (store in 
     EncryptedSharedPreferences)

5. Persistent Foreground Notification:
   - Title: "SMSHIVE Gateway — Active"
   - Body: "X messages sent today · Last sync: 2 seconds ago"
   - Action buttons: "Stop Gateway" | "Open App"
   - Updates every 30 seconds with live stats
   - Low priority (no sound, minimal interruption)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOCAL DATABASE (Room)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tables:
  - SentMessages: id, recipient, message, status, 
    sentAt, deliveredAt, simSlot, errorMessage
  - ReceivedMessages: id, sender, message, receivedAt, 
    forwardedToServer (boolean)
  - PendingSmsQueue: id, serverId, recipient, message, 
    retryCount, scheduledAt

Use Room DAO + Flow for reactive UI updates.
Retain 1000 most recent messages (auto-prune older ones).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NETWORK LAYER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ApiService interface (Retrofit):
  - All requests include header: x-api-key: {storedKey}
  - Timeout: connect 10s, read 30s, write 30s
  - Auto-retry interceptor for 5xx errors (2 retries, 2s delay)
  - Custom error handler: parse server error JSON into 
    sealed class ApiResult<T>
  - Support custom base URL (self-hosted server support)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANDROID 13+ / 15+ COMPATIBILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Handle POST_NOTIFICATIONS permission request (Android 13+)
- Handle SEND_SMS permission for sideloaded APKs on Android 15+:
  Show in Settings a clear guide + direct intent to 
  Settings.ACTION_APPLICATION_DETAILS_SETTINGS so user can 
  manually enable SMS permission (same fix as textbee blog post)
- Handle multi-SIM SubscriptionManager API differences across 
  Android versions (8 through 15)
- Target SDK 34, min SDK 26

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QR CODE SETUP (Convenience Feature)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QR code format (generated by web dashboard):
  JSON string: {"apiKey":"xxx","deviceId":"yyy","serverUrl":"zzz"}

Android app scans QR using CameraX + ML Kit Barcode Scanning,
parses the JSON, pre-fills setup form, user taps Connect.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUILD & DISTRIBUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Build as release APK (not AAB) so it can be sideloaded directly
- Provide build.gradle.kts with signing config template
- Include proguard-rules.pro to keep Retrofit + Room models
- APK name: smshive-gateway-v1.0.0.apk
- Provide step-by-step README for building the APK in Android Studio
- App icon: hexagon shape with signal wave inside 
  (provide as SVG, convert to adaptive icon mipmap set)
- Support "Install from unknown sources" flow — 
  add in-app prompt if device doesn't allow installs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURES SUMMARY (ALL FREE, NO PAYWALL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Send unlimited SMS via API polling
✅ Receive SMS and forward to server + webhook
✅ Dual SIM support with manual SIM selection
✅ Auto-start on device reboot
✅ Persistent foreground service (stays alive in background)
✅ Custom device name
✅ Custom server URL (self-hosted support)
✅ QR code setup from web dashboard
✅ Battery + network status in heartbeat
✅ Delivery receipts reported back to server
✅ Failed message retry (configurable count + delay)
✅ Per-message send delay (carrier spam protection)
✅ Local message history (Room DB)
✅ Full inbox for received messages
✅ Live stats on home screen
✅ Configurable polling interval
✅ Android 13+ notification permission handling
✅ Android 15+ SMS permission fix guide built in
✅ Battery optimization bypass guidance
✅ Secure API key storage (EncryptedSharedPreferences)
✅ Dark mode (matches web dashboard colors)
✅ Material 3 Compose UI — modern, clean, smooth
```

---

## 🔑 HOW TO USE THESE PROMPTS

| Step | Action |
|------|--------|
| 1 | Give **Prompt 1** to **Cursor AI** (cursor.com) or **v0.dev** for the website |
| 2 | Give **Prompt 2** to **Cursor AI** or **Android Studio Gemini** for the APK |
| 3 | Host the backend on **Oracle Free VPS** (always free, 4 CPU, 24GB RAM) |
| 4 | Deploy frontend on **Vercel** (free tier, perfect for Next.js) |
| 5 | Host MongoDB on **MongoDB Atlas Free Tier** (512MB, always free) |
| 6 | Point your Android APK to your own server URL |
| 7 | Done — your own fully free, unlimited SMS gateway |

## 💡 For the Number Masking Issue
- In Settings page of the web app, add an option: **"Route via MSG91 Sender ID"**
- User adds their MSG91 API key → SMS goes via MSG91 and shows `SMSHIVE` or any custom name
- Cost: ₹0.18/SMS via MSG91 DLT — but OTPs look 100% professional
- OR just use a dedicated cheap SIM (not your personal number) as the gateway phone

---
*Generated by Claude for Ramamani Behera — May 2026*
