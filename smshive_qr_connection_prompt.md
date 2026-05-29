# SMSHIVE — QR Connection Flow + Full App Upgrade Prompt
### For: Ramamani Behera | Site: smshive.nilambarsonu.me

---

## 🔬 HOW TEXTBEE QR CONNECTION ACTUALLY WORKS (Reverse Engineered)

Here is the exact flow textbee uses — understand this before building:

```
STEP 1 — User registers on website (textbee.dev)
         └── Backend creates user account + generates a master API key

STEP 2 — User goes to Dashboard → "Add Device" 
         └── Backend creates a pending device entry with a temp token
         └── Web generates a QR code encoding this JSON:
             {
               "apiKey": "sk_live_abc123...",
               "serverUrl": "https://api.textbee.dev",
               "userId": "user_xyz789"
             }

STEP 3 — User opens Android app → taps "Scan QR"
         └── CameraX + ML Kit scans the QR
         └── App parses the JSON string
         └── App calls POST /api/v1/devices/register with:
             { apiKey, serverUrl, deviceName, deviceModel, androidVersion }
         └── Server creates device record, returns deviceId
         └── App saves apiKey + serverUrl + deviceId in EncryptedSharedPreferences
         └── App starts foreground service + begins polling

STEP 4 — Dashboard instantly updates (via polling or WebSocket)
         └── New device appears as "Online" in real time
         └── User can now send SMS through that device
```

**Key insight:** The QR code never contains the deviceId — the deviceId is generated AFTER scanning, by the server, upon registration. The QR only carries enough to authenticate (apiKey + serverUrl). This is the correct, secure design.

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MASTER PROMPT — SMSHIVE QR FLOW + FULL APK UPGRADE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Give this entire prompt to Cursor AI / Android Studio Gemini

---

```
You are a senior Android developer. I am upgrading an existing Kotlin + 
Jetpack Compose Android SMS gateway app called SMSHIVE. The live web 
dashboard is already deployed at:

  PRIMARY:  https://smshive.nilambarsonu.me
  BACKUP:   https://smshive.onrender.com

I will describe EXACTLY what the app currently has, what the QR connection 
flow must do, and all new premium features to add. Build everything.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — WHAT THE APP CURRENTLY HAS (from screenshots)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current app has 3 screens (Dashboard, Inbox, Settings) with:

Dashboard screen:
- Device name (2312FRAFDI), Device ID shown
- Big green circle with checkmark → GATEWAY ONLINE status
- Gateway Configuration: Polling interval + SMS Send Delay
- Recent Dispatches list (number, message, SENT badge)
- Bottom nav: Dashboard / Inbox / Settings

Inbox screen:
- "Inbox Feed (Incoming Messages)" title
- Empty state: "No incoming messages captured."
- No search, no filters, no real-time refresh

Settings screen: (not shown but exists with API key entry fields)

PROBLEMS WITH CURRENT APP:
1. Device ID is hardcoded ("device_b50a98df") — not registered from server
2. No QR scanner — user must manually type API key + server URL
3. Server URL is hardcoded — defaults to a fixed value
4. No onboarding / setup flow — confusing for new users
5. Inbox has no features — no search, no refresh, no forward status
6. No device battery/network info sent in heartbeat
7. No push notification when SMS is sent/failed
8. No retry logic for failed SMS
9. No SIM selector UI
10. No real registration handshake with server

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — THE COMPLETE QR CONNECTION FLOW TO IMPLEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is the most critical part. Implement EXACTLY this flow:

──────────────────────────────────────────
A. WEB DASHBOARD SIDE (describe to your web dev / Next.js AI)
──────────────────────────────────────────

After user signs up and lands on dashboard:

1. Dashboard shows a banner: "No device connected — Add your first device"
   
2. User clicks "Add Device" button

3. Web backend calls: POST /api/v1/devices/generate-qr-token
   Returns: { qrToken: "temp_abc123", expiresAt: "2025-...", apiKey: "sk_live_xxx" }

4. Web generates a QR code (use `qrcode` npm package) encoding this JSON:
   {
     "v": 1,
     "apiKey": "<user's API key from their account>",
     "serverUrl": "https://smshive.nilambarsonu.me",
     "qrToken": "<one-time token, expires in 5 minutes>"
   }
   
   QR code displayed in a modal/dialog with:
   - Big QR code image (300x300px)
   - Countdown timer: "This QR expires in 4:32"
   - "Scan with SMSHIVE app" instruction
   - Download APK button below
   - Auto-refresh QR every 5 minutes

5. After Android app scans and registers, dashboard polls:
   GET /api/v1/devices/qr-token-status?token=temp_abc123
   Until it returns { status: "connected", deviceId: "...", deviceName: "..." }

6. Dashboard auto-closes the modal and shows:
   Toast: "✓ Device [POCO 2312FRAFDI] connected successfully!"
   New device card appears in device list with Online badge (green pulse)

──────────────────────────────────────────
B. ANDROID APP SIDE (implement fully)
──────────────────────────────────────────

FIRST LAUNCH FLOW (no config saved):

Screen 1: SPLASH
- Show SMSHIVE logo + tagline "Your Android is about to become powerful"
- 2 second delay
- Check if EncryptedSharedPreferences has apiKey + serverUrl + deviceId
  → If YES: skip to main app directly
  → If NO: go to Onboarding Screen 1

Screen 2: ONBOARDING — Welcome
- Title: "Turn this phone into an SMS gateway"
- 3 feature highlights with icons:
  * Send SMS via API from any app or website
  * Real-time delivery tracking
  * Works 24/7 even when screen is off
- Big button: "Get Started → Scan QR from dashboard"
- Small link: "Set up manually" (goes to manual setup)

Screen 3A: QR SCANNER (main setup path)
Layout:
- Full-screen CameraX viewfinder with rounded corner overlay frame
- Animated scanning line bouncing up/down in the QR frame
- Title: "Scan the QR code shown on your SMSHIVE dashboard"
- Subtitle: "Go to smshive.nilambarsonu.me → Dashboard → Add Device"
- "Open Dashboard" button (opens browser to smshive.nilambarsonu.me/dashboard)
- "Enter manually instead" link at bottom

Implementation:
- Use CameraX Preview + ImageAnalysis
- Use ML Kit Barcode Scanner: com.google.mlkit:barcode-scanning:17.2.0
- Process: BarcodeScanning.getClient() → Task<List<Barcode>>
- Extract barcode.rawValue (the JSON string)

On successful scan:
1. Parse JSON: val config = Gson().fromJson(rawValue, QrConfig::class.java)
   data class QrConfig(val v: Int, val apiKey: String, val serverUrl: String, val qrToken: String)

2. Validate fields — if any null/empty: show error toast, keep scanner open

3. Show "Connecting..." loading screen with animated dots

4. Call API: POST {serverUrl}/api/v1/devices/register
   Headers: x-api-key: {apiKey}
   Body: {
     "qrToken": "{qrToken}",
     "deviceName": Build.MODEL,
     "deviceBrand": Build.BRAND,
     "androidVersion": Build.VERSION.RELEASE,
     "appVersion": BuildConfig.VERSION_NAME
   }
   
5. Server returns: { deviceId: "dev_xxx", deviceName: "POCO 2312FRAFDI" }

6. Save to EncryptedSharedPreferences:
   KEY_API_KEY = apiKey
   KEY_SERVER_URL = serverUrl
   KEY_DEVICE_ID = deviceId
   KEY_DEVICE_NAME = deviceName
   KEY_REGISTERED_AT = System.currentTimeMillis()

7. Show success animation:
   - Big green checkmark with scale-in animation
   - "Connected!" in large text
   - "Device: POCO 2312FRAFDI" 
   - "Gateway ID: dev_xxx"
   - "Auto-starting gateway service..." 
   - Start SmsGatewayForegroundService automatically
   - Navigate to main Dashboard after 2 seconds

Screen 3B: MANUAL SETUP (fallback path)
- Server URL field (pre-filled: https://smshive.nilambarsonu.me, editable)
- API Key field (empty, user types from dashboard)
- Device Name (pre-filled: Build.MODEL, editable)
- "Connect" button → same registration flow as step 4-7 above
- "How to find my API Key?" help text with link

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — BACKEND API ENDPOINTS NEEDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These must exist on the NestJS backend. Tell your backend dev to add:

POST /api/v1/devices/generate-qr-token
  Auth: Bearer JWT (user must be logged in on web)
  Returns: { qrToken, expiresAt, apiKey }
  Logic: Create QrToken document in MongoDB { token, userId, expiresAt: now+5min, used: false }

POST /api/v1/devices/register
  Auth: x-api-key header
  Body: { qrToken, deviceName, deviceBrand, androidVersion, appVersion }
  Logic:
    1. Validate API key → get userId
    2. If qrToken provided: validate it exists, not expired, not used
       → mark qrToken as used: true
    3. Create Device document: { userId, deviceId: nanoid(), deviceName, ... }
    4. Return { deviceId, deviceName, serverUrl }

GET /api/v1/devices/qr-token-status?token=xxx
  Auth: Bearer JWT
  Returns: { status: "pending" | "connected", deviceId?, deviceName? }
  Logic: Look up QrToken → if used: true, return connected + deviceId

POST /api/v1/devices/:deviceId/heartbeat
  Auth: x-api-key
  Body: { batteryLevel, isCharging, networkType, simInfo, appVersion, timestamp }
  Logic: Update device.lastSeen, device.batteryLevel, device.isOnline = true
  Returns: { pendingSmsCount } (so app knows if it should poll now)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — UPGRADED MAIN APP SCREENS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DASHBOARD SCREEN (major upgrade from current):

Keep the same dark theme. Improve with:

Header row:
- Device name (from saved prefs, editable on long-press)
- Copy device ID button (icon button, tap copies to clipboard with toast)
- Settings gear icon → Settings screen

Status Card (upgrade current green circle):
- Larger card with gradient border (green when online, red when offline)
- Center: animated pulse ring around the checkmark (online) or X (offline)
- "GATEWAY ONLINE ✓" or "GATEWAY OFFLINE ✗" 
- Below: "Last sync: 12 seconds ago" (live-updating from heartbeat)
- Below: Battery indicator — icon + percentage (from heartbeat data)
- Below: Network type — WiFi/4G/5G icon
- Below: Active SIM — "SIM 1: Jio" or "SIM 2: BSNL" (from TelephonyManager)

Stats Row (NEW — add this below status card):
3 mini stat cards in a row:
- Sent Today: live counter
- This Month: from local Room DB
- Success Rate: (delivered/sent)*100%

SIM Selector Card (NEW):
- Title: "Active SIM for Outgoing SMS"
- Show SIM 1 and SIM 2 cards (if device has dual SIM)
- Each SIM: carrier logo color + name + signal strength bars
- Radio button to select which SIM(s) to use
- "Both (round-robin)" option

Gateway Config Card (upgrade current):
- Polling interval: segmented control — 5s / 10s / 15s / 30s / 60s
- SMS Send Delay: slider 0s → 10s with live value display
- Auto-start on boot: toggle (ON by default)
- Service status: "Running since 2h 34m" or "Stopped"
- START / STOP button with color change

Recent Dispatches (upgrade current):
- Keep the list but improve each item:
  * Recipient number + message preview
  * Status badge: SENT (blue) / DELIVERED (green) / FAILED (red) / PENDING (gray)
  * Timestamp "2 min ago"
  * On tap: expand to show full message + all status info
  * FAILED items: show "Retry" button
- "View All" button → opens full message log (new screen)
- Empty state: nice illustration + "No messages sent yet. Send one from the dashboard."

──────────────────────────────────────────

INBOX SCREEN (major upgrade from current empty state):

Current: just an empty list with "No incoming messages captured."
New design:

Top bar:
- Title: "Inbox"  
- Search icon → expands to search bar (filter by sender number or message text)
- Filter icon → dropdown: All / Unread / Forwarded / Today / This Week

Message list:
Each item:
- Sender number (bold), received time (right-aligned)
- Message preview (2 lines, truncated)
- Status badge: "Forwarded to webhook ✓" (green) or just gray dot
- Unread dot (blue) for new messages

Pull-to-refresh (SwipeRefresh):
- Pull down refreshes from server
- Show "Last updated: just now" below the top bar

Empty state (improve current):
- Custom SVG illustration of an empty mailbox
- "No messages yet"
- "Messages received on your SIM will appear here"
- "Make sure 'Receive SMS' is enabled in Settings"

Tap a message → full detail bottom sheet:
- Full message text
- Sender number (copy button)
- Received time (exact datetime)
- Device that received it
- SIM that received it
- "Reply" button (opens send form pre-filled with this number)
- "Forward to webhook now" button (manual retry)

Real-time:
- SmsReceiveBroadcastReceiver inserts to Room DB
- Compose UI uses collectAsState(Flow from DAO) — auto-updates instantly
- Also POST to server: /api/v1/gateway/{deviceId}/receive-sms

──────────────────────────────────────────

SETTINGS SCREEN (full rebuild):

Section: Account & Device
- Server URL (read-only, tap to view full / copy)
- API Key (masked ••••••, eye icon to reveal, copy button)
- Device ID (read-only, copy button)
- Device Name (editable — tap to edit inline, saves to server via API)
- "Re-scan QR code" button → navigates to QR scanner (with re-registration)
- "Disconnect device" button (red, with confirm dialog)
  → Clears all EncryptedSharedPreferences + stops service + goes to onboarding

Section: SMS Sending
- Default SIM: Auto / SIM 1 / SIM 2
- Send Delay: slider 0–10s
- Max retries on failure: 1 / 2 / 3
- Retry delay: 10s / 30s / 60s
- Multipart threshold: 160 chars / 320 chars (when to split messages)

Section: Background Service
- Auto-start on boot: toggle
- Polling interval: 5 / 10 / 15 / 30 / 60 seconds
- Keep-alive strategy: WorkManager / Foreground Service / Both
- Battery optimization status:
  → Green "Optimized ✓" if app is excluded from battery optimization
  → Red "Restricted ✗ — Fix this" if not (with one-tap button to open settings)

Section: Receive SMS
- Enable SMS receiving: main toggle
- Auto-forward to webhook: toggle
- Forward on receive: immediately / batch every 5 min

Section: Notifications
- Notify when SMS sent: toggle
- Notify when SMS failed: toggle
- Notify when device goes offline: toggle
- Notification sound: toggle
- Vibrate: toggle

Section: Debug (advanced)
- Show last 10 heartbeat logs (collapsible)
- Test connection button → sends a test heartbeat, shows response
- Clear message history (with confirm dialog)

Section: About
- App version: 1.0.0
- Server: smshive.nilambarsonu.me
- Open web dashboard (browser link)
- Rate app / Report issue links

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5 — UPGRADED BACKGROUND SERVICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SmsGatewayForegroundService — complete rewrite:

NOTIFICATION (improve current):
- Channel: "SMSHIVE Gateway" (low importance — no sound)
- Icon: custom gateway icon
- Content title: "SMSHIVE — Active ✓"  or  "SMSHIVE — Offline ✗"
- Content text: "Sent today: 12 · Last sync: 8s ago · Battery: 67%"
- Update every 15 seconds
- Action buttons:
  → "⏸ Pause" (pauses polling without killing service)
  → "📊 Open App" (opens main activity)
- Set priority to PRIORITY_LOW (no heads-up, no sound, no lock screen)

POLLING LOOP (upgrade):
- Store polling interval in SharedPreferences (user-configurable)
- On each poll:
  1. POST heartbeat with: { batteryLevel, isCharging, networkType, simSlots, timestamp }
     → Server returns: { pendingCount, configUpdate? }
  2. If pendingCount > 0 OR forced check:
     GET /api/v1/gateway/{deviceId}/pending-sms
  3. For each pending SMS in response:
     a. Insert to PendingQueue in Room DB
     b. Send via SmsManager with correct SIM subscriptionId
     c. Register SENT/DELIVERED PendingIntent BroadcastReceivers
     d. On SENT: PUT /api/v1/sms/{smsId}/status { status: "SENT", sentAt: timestamp }
     e. On DELIVERED: PUT /api/v1/sms/{smsId}/status { status: "DELIVERED", deliveredAt: timestamp }
     f. On FAILED: PUT /api/v1/sms/{smsId}/status { status: "FAILED", error: "ERROR_CODE_XYZ" }
        → If retryCount < maxRetries: re-queue with delay
  4. Wait {pollingInterval} seconds → repeat

SIM SELECTION (upgrade):
val subscriptionManager = getSystemService(SubscriptionManager::class.java)
val activeSubscriptions = subscriptionManager.activeSubscriptionInfoList

For each SMS to send:
- If userPref == SIM_1: use activeSubscriptions[0].subscriptionId
- If userPref == SIM_2: use activeSubscriptions[1].subscriptionId  
- If userPref == AUTO or ROUND_ROBIN:
  → Alternate between available SIMs using AtomicInteger counter
  
Use: SmsManager.getSmsManagerForSubscriptionId(subscriptionId).sendTextMessage(...)

MULTIPART SMS:
- If message.length > 160:
  val parts = SmsManager.divideMessage(message)
  val sentIntents = ArrayList<PendingIntent>()
  val deliveredIntents = ArrayList<PendingIntent>()
  SmsManager.sendMultipartTextMessage(to, null, parts, sentIntents, deliveredIntents)

RECEIVE SMS:
SmsReceiveBroadcastReceiver:
- Registered in manifest for android.provider.Telephony.SMS_RECEIVED
- On receive: extract messages from intent, loop through SmsMessage.createFromPdu()
- For each: insert to Room ReceivedMessages table
- POST to server: /api/v1/gateway/{deviceId}/receive-sms
  Body: { sender, message, receivedAt, simSlot (from PDU if available) }
- Show notification if setting enabled

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 6 — NEW SCREENS TO ADD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add to bottom navigation: Dashboard / Inbox / Logs / Settings (4 tabs now)

NEW: LOGS SCREEN
- Full paginated list of all sent messages (from Room DB)
- Columns: Recipient, Message (truncated 30 chars), Status, Timestamp
- Color-coded status badges
- Tap row → full message detail bottom sheet
- Filter chips: All / Sent / Delivered / Failed / Pending
- Search bar (filter by number or message)
- "Retry All Failed" button at top when failed messages exist
- "Export as CSV" button → generates CSV and shares via Android Share Sheet
- Pull-to-refresh

NEW: MESSAGE DETAIL BOTTOM SHEET (reusable)
- Full recipient number (copy tap)
- Full message text (selectable)
- Device used
- SIM used (SIM 1 / SIM 2 + carrier name)
- Sent at time
- Delivered at time (if available)
- Status with icon
- Error message (if failed, e.g. "RESULT_ERROR_NO_SERVICE")
- Retry button (if failed)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 7 — DEPENDENCIES (build.gradle.kts)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add all these to your existing dependencies:

// QR Scanner
implementation("com.google.mlkit:barcode-scanning:17.2.0")
implementation("androidx.camera:camera-camera2:1.3.1")
implementation("androidx.camera:camera-lifecycle:1.3.1")
implementation("androidx.camera:camera-view:1.3.1")

// QR Code Generation (for showing device's own info as QR)
implementation("com.google.zxing:core:3.5.3")

// Networking
implementation("com.squareup.retrofit2:retrofit:2.9.0")
implementation("com.squareup.retrofit2:converter-gson:2.9.0")
implementation("com.squareup.okhttp3:okhttp:4.12.0")
implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

// Security
implementation("androidx.security:security-crypto:1.1.0-alpha06")

// Room DB
implementation("androidx.room:room-runtime:2.6.1")
implementation("androidx.room:room-ktx:2.6.1")
kapt("androidx.room:room-compiler:2.6.1")

// DI
implementation("com.google.dagger:hilt-android:2.50")
kapt("com.google.dagger:hilt-compiler:2.50")
implementation("androidx.hilt:hilt-navigation-compose:1.1.0")

// WorkManager
implementation("androidx.work:work-runtime-ktx:2.9.0")
implementation("androidx.hilt:hilt-work:1.1.0")

// Compose + Material 3
implementation(platform("androidx.compose:compose-bom:2024.01.00"))
implementation("androidx.compose.ui:ui")
implementation("androidx.compose.material3:material3")
implementation("androidx.compose.ui:ui-tooling-preview")
implementation("androidx.activity:activity-compose:1.8.2")
implementation("androidx.navigation:navigation-compose:2.7.6")
implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")

// Lottie animations
implementation("com.airbnb.android:lottie-compose:6.3.0")

// DataStore (for non-sensitive prefs)
implementation("androidx.datastore:datastore-preferences:1.0.0")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 8 — DATA MODELS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QR Config data class:
data class QrConfig(
    val v: Int = 1,
    val apiKey: String,
    val serverUrl: String,
    val qrToken: String? = null
)

Device Registration Request:
data class RegisterDeviceRequest(
    val qrToken: String?,
    val deviceName: String,
    val deviceBrand: String,
    val androidVersion: String,
    val appVersion: String
)

Device Registration Response:
data class RegisterDeviceResponse(
    val deviceId: String,
    val deviceName: String,
    val serverUrl: String
)

Heartbeat Request:
data class HeartbeatRequest(
    val batteryLevel: Int,
    val isCharging: Boolean,
    val networkType: String,
    val simCount: Int,
    val sim1Carrier: String?,
    val sim2Carrier: String?,
    val appVersion: String,
    val timestamp: Long
)

Heartbeat Response:
data class HeartbeatResponse(
    val pendingCount: Int,
    val forceSync: Boolean = false
)

SMS Status Update:
data class SmsStatusUpdate(
    val status: String,  // SENT | DELIVERED | FAILED
    val sentAt: Long? = null,
    val deliveredAt: Long? = null,
    val errorCode: String? = null
)

Room Entities:
@Entity("sent_messages")
data class SentMessageEntity(
    @PrimaryKey val id: String,
    val serverId: String,
    val recipient: String,
    val message: String,
    val status: String,
    val simSlot: Int,
    val carrier: String?,
    val sentAt: Long,
    val deliveredAt: Long?,
    val errorMessage: String?,
    val retryCount: Int = 0
)

@Entity("received_messages")
data class ReceivedMessageEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val sender: String,
    val message: String,
    val receivedAt: Long,
    val simSlot: Int,
    val forwarded: Boolean = false,
    val read: Boolean = false
)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 9 — SECURE STORAGE HELPER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create SecurePrefsManager singleton using EncryptedSharedPreferences:

object SecurePrefsManager {
    private lateinit var prefs: SharedPreferences
    
    fun init(context: Context) {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        prefs = EncryptedSharedPreferences.create(
            context, "smshive_secure_prefs", masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }
    
    var apiKey: String?
        get() = prefs.getString("api_key", null)
        set(v) = prefs.edit().putString("api_key", v).apply()
    
    var serverUrl: String?
        get() = prefs.getString("server_url", null)
        set(v) = prefs.edit().putString("server_url", v).apply()
    
    var deviceId: String?
        get() = prefs.getString("device_id", null)
        set(v) = prefs.edit().putString("device_id", v).apply()
    
    var deviceName: String?
        get() = prefs.getString("device_name", null)
        set(v) = prefs.edit().putString("device_name", v).apply()
    
    val isConfigured: Boolean
        get() = !apiKey.isNullOrEmpty() && !serverUrl.isNullOrEmpty() && !deviceId.isNullOrEmpty()
    
    fun clearAll() = prefs.edit().clear().apply()
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 10 — NAVIGATION GRAPH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NavHost with these routes:

"splash" → check SecurePrefsManager.isConfigured
  → true: "main" (bottom nav host)
  → false: "onboarding_welcome"

"onboarding_welcome" → "onboarding_qr_scanner" or "onboarding_manual"

"onboarding_qr_scanner" → on success: "onboarding_success" → "main"

"onboarding_manual" → on success: "onboarding_success" → "main"

"onboarding_success" → "main" (after 2s delay)

"main" → BottomNavHost with tabs:
  "dashboard" (default)
  "inbox"
  "logs"
  "settings"

From settings: "rescan_qr" → same as "onboarding_qr_scanner" 
  but after success, calls re-registration endpoint and stays in main

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 11 — ANDROID PERMISSIONS (AndroidManifest.xml)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<uses-permission android:name="android.permission.SEND_SMS"/>
<uses-permission android:name="android.permission.RECEIVE_SMS"/>
<uses-permission android:name="android.permission.READ_SMS"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC"/>
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<uses-permission android:name="android.permission.READ_PHONE_STATE"/>
<uses-permission android:name="android.permission.READ_PHONE_NUMBERS"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.WAKE_LOCK"/>
<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES"/>

<!-- Battery optimization exclusion -->
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"/>

Permission request flow in onboarding:
1. Camera (for QR scanner) — request before showing QR screen
2. SMS (SEND + RECEIVE + READ) — request with rationale dialog
3. POST_NOTIFICATIONS (Android 13+) — request after setup complete
4. Battery optimization — show explanation then open settings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 12 — DESIGN IMPROVEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep the existing dark theme colors (matches dashboard):
- Background: #0A0A0F
- Card surface: #111118
- Primary accent: #6C63FF (electric violet)
- Success/online: #00D4AA (teal)
- Danger/offline: #EF4444 (red)
- Text primary: #F0F0FF
- Text muted: #6B7280

Improvements:
1. QR Scanner screen: dark overlay with transparent QR frame area
   Use Canvas to draw semi-transparent overlay with a hole cut out for the scan area
   Animated corner brackets (draw 4 L-shapes at corners of scan area)
   Scanning line: animate a teal gradient line from top to bottom of scan area

2. Success screen: use Lottie animation (green checkmark animation)
   URL: https://assets10.lottiefiles.com/packages/lf20_jbb3lezi.json

3. Status card: when ONLINE, animate a soft expanding ring (ripple effect)
   Use infinite transition: 
   val infiniteTransition = rememberInfiniteTransition()
   val ringAlpha by infiniteTransition.animateFloat(0.8f, 0f, tween(1500, easing = FastOutLinearInEasing), RepeatMode.Restart)
   val ringScale by infiniteTransition.animateFloat(1f, 1.5f, tween(1500), RepeatMode.Restart)

4. Stats cards: use CountAnimation composable for number increment animation

5. Bottom nav: active tab gets filled icon + accent color underline indicator

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 13 — PREMIUM FEATURES (ALL FREE, NO PAYWALL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ QR-based instant setup (no manual typing)
✅ Real device registration with server (not hardcoded IDs)
✅ Dynamic server URL (works with any self-hosted SMSHIVE server)
✅ Dual SIM support with carrier names + manual selection
✅ Per-SIM round-robin load balancing
✅ SMS retry with configurable count and delay
✅ Multipart SMS support (messages > 160 chars auto-split)
✅ Delivery receipts reported back to server in real-time
✅ Battery + charging + network status in every heartbeat
✅ Inbox with search + filter + reply
✅ Full message log with export to CSV
✅ Live updating stats (sent today / this month / success rate)
✅ Persistent foreground service with accurate notification
✅ Boot-time auto-restart
✅ Battery optimization bypass guide
✅ Android 13-15 permission handling
✅ Per-message detail sheet with full metadata
✅ Re-scan QR to reconnect (no uninstall needed)
✅ Test connection button in settings
✅ Configurable polling: 5s to 60s
✅ Configurable send delay: 0s to 10s
✅ Secure storage: EncryptedSharedPreferences for all credentials
✅ Lottie animations for success/error states
✅ Modern Material 3 Compose UI
✅ Dark mode (matches web dashboard aesthetic)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IMPORTANT NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- NO hardcoded server URL anywhere. Always read from SecurePrefsManager.serverUrl
- NO hardcoded API key anywhere. Always read from SecurePrefsManager.apiKey
- NO hardcoded device ID anywhere. Always read from SecurePrefsManager.deviceId
- The default serverUrl shown on the manual setup screen is:
  https://smshive.nilambarsonu.me
  But it must be EDITABLE — if user changes it, use their value.
- On fresh install, app MUST go through onboarding first
- On update (existing users have saved prefs), app MUST skip onboarding
- App name: SMSHIVE
- Package name: app.smshive.gateway
- APK name: smshive-gateway-v2.0.0.apk
- minSdk: 26 (Android 8.0)
- targetSdk: 34
```

---

## 📋 SUMMARY — WHAT THIS PROMPT BUILDS

| Feature | Before | After |
|---|---|---|
| Setup flow | Manual typing | QR scan in 3 seconds |
| Device ID | Hardcoded | Server-generated on registration |
| Server URL | Hardcoded | Dynamic, from QR or manual entry |
| Inbox | Empty list | Search + filter + reply + real-time |
| Stats | None | Sent today / this month / success % |
| SIM selection | None | SIM 1 / SIM 2 / Both with carrier names |
| Battery in heartbeat | No | Yes — shown in notification + dashboard |
| Message logs | None | Full log with export CSV |
| Delivery receipts | Basic | Full SENT + DELIVERED + FAILED tracking |
| Retry on failure | None | Configurable retries + delay |
| Notifications | Basic | Per-event toggles, low-interruption |
| Success animation | None | Lottie green checkmark |
| Re-connect | Uninstall + reinstall | Re-scan QR from settings |

---

## 🔗 YOUR WEB DASHBOARD QR GENERATION (add to Next.js)

```javascript
// Install: npm install qrcode react-qr-code

import QRCode from 'react-qr-code'

// In your "Add Device" modal:
const qrData = JSON.stringify({
  v: 1,
  apiKey: user.apiKey,           // from your auth session
  serverUrl: "https://smshive.nilambarsonu.me",
  qrToken: generatedToken        // one-time token from backend
})

<QRCode 
  value={qrData}
  size={280}
  bgColor="transparent"
  fgColor="#6C63FF"   // your brand violet
/>
```

The QR encodes exactly this JSON — the Android app parses it, registers with the server, and gets a real deviceId back. **No hardcoded values anywhere.**

---
*Generated for Ramamani Behera — SMSHIVE Project — May 2026*
