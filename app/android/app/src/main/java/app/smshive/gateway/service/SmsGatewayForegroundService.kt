package app.smshive.gateway.service

import android.app.*
import android.content.*
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.*
import android.telephony.SmsManager
import android.telephony.SubscriptionManager
import androidx.core.app.NotificationCompat
import app.smshive.gateway.MainActivity
import app.smshive.gateway.data.*
import kotlinx.coroutines.*
import okhttp3.*
import org.json.JSONObject
import java.util.concurrent.atomic.AtomicInteger

class SmsGatewayForegroundService : Service() {
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private lateinit var prefs: PreferencesManager
    private lateinit var db: AppDatabase
    private lateinit var api: ApiService

    private var webSocket: WebSocket? = null
    private var pollingJob: Job? = null
    private var heartbeatJob: Job? = null
    private var notificationUpdateJob: Job? = null
    private var isRunning = false
    private var sentTodayCount = 0
    private var lastSyncSecondsAgo = 0
    private val simRoundRobinCounter = AtomicInteger(0)
    private val processedSmsIds = java.util.concurrent.ConcurrentHashMap<String, Long>()

    companion object {
        const val CHANNEL_ID = "smshive_gateway_channel"
        const val NOTIFICATION_ID = 8291
        const val ACTION_START = "ACTION_START"
        const val ACTION_STOP = "ACTION_STOP"
        const val ACTION_PAUSE = "ACTION_PAUSE"
        const val ACTION_SMS_SENT = "app.smshive.gateway.SMS_SENT"
        const val ACTION_SMS_DELIVERED = "app.smshive.gateway.SMS_DELIVERED"
    }

    override fun onCreate() {
        super.onCreate()
        prefs = PreferencesManager(this)
        db = AppDatabase.getDatabase(this)
        api = ApiService.create(prefs.serverUrl)
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification("Initializing..."))

        serviceScope.launch {
            val startOfDay = getStartOfDayTimestamp()
            db.smsDao().getSentTodayCount(startOfDay).collect { count ->
                sentTodayCount = count
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                if (!isRunning) {
                    isRunning = true
                    prefs.gatewayEnabled = true
                    api = ApiService.create(prefs.serverUrl)
                    startPollingAndHeartbeats()
                }
            }
            ACTION_STOP -> stopGateway()
            ACTION_PAUSE -> {
                pollingJob?.cancel()
                heartbeatJob?.cancel()
                updateNotification("Paused · Tap to resume")
            }
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun startPollingAndHeartbeats() {
        setupWebSocket()

        pollingJob?.cancel()
        pollingJob = serviceScope.launch {
            while (isRunning) {
                try {
                    pollPendingSms()
                } catch (e: Exception) {
                    android.util.Log.e("SMSHiveService", "SMS polling failed: ${e.message}", e)
                }
                delay(prefs.pollingIntervalSeconds * 1000L)
            }
        }

        heartbeatJob?.cancel()
        heartbeatJob = serviceScope.launch {
            while (isRunning) {
                try {
                    val pendingCount = sendHeartbeat()
                    prefs.lastHeartbeatAt = System.currentTimeMillis()
                    if (pendingCount > 0) {
                        // Trigger immediate poll
                        try { pollPendingSms() } catch (e: Exception) { e.printStackTrace() }
                    }
                    updateNotification("Active · $sentTodayCount sent today · ${getBatteryLevel()}% 🔋")
                } catch (e: Exception) {
                    updateNotification("Offline · Retrying...")
                    e.printStackTrace()
                }
                delay(30_000L)
            }
        }
    }

    private fun setupWebSocket() {
        if (prefs.serverUrl.isEmpty() || prefs.deviceId.isEmpty()) return
        try {
            val client = okhttp3.OkHttpClient()
            val baseUrl = prefs.serverUrl.trimEnd('/')
            val wsUrl = "$baseUrl/api/ws".replace("https://", "wss://").replace("http://", "ws://")
            val request = okhttp3.Request.Builder().url(wsUrl).build()
            webSocket = client.newWebSocket(request, object : WebSocketListener() {
                override fun onOpen(webSocket: WebSocket, response: Response) {
                    val reg = JSONObject()
                    reg.put("deviceId", prefs.deviceId)
                    webSocket.send(reg.toString())
                    updateNotification("Active · Online ✓ · $sentTodayCount sent")
                }
                override fun onMessage(webSocket: WebSocket, text: String) {
                    try {
                        val json = JSONObject(text)
                        if (json.optString("type") == "new_sms") {
                            val data = json.optJSONObject("data") ?: return
                            val id = data.optString("id")
                            val message = data.optString("message")
                            val recipientsArr = data.optJSONArray("recipients")
                            val recipients = mutableListOf<String>()
                            if (recipientsArr != null) {
                                for (i in 0 until recipientsArr.length()) recipients.add(recipientsArr.getString(i))
                            }
                            val simSlot = if (data.has("simSlot")) data.getInt("simSlot") else null
                            val pendingSms = PendingSms(id = id, recipients = recipients, message = message, simSlot = simSlot)
                            sendSms(pendingSms)
                        }
                    } catch (e: Exception) { e.printStackTrace() }
                }
                override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                    updateNotification("Active · Offline - Polling fallback")
                }
                override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                    updateNotification("Active · Reconnecting...")
                }
            })
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private suspend fun pollPendingSms() {
        val deviceId = prefs.deviceId
        val apiKey = prefs.apiKey
        if (deviceId.isEmpty() || apiKey.isEmpty()) return
        api = ApiService.create(prefs.serverUrl)
        val response = api.getPendingSms(deviceId, apiKey)
        if (response.success && response.data.isNotEmpty()) {
            for (sms in response.data) {
                sendSms(sms)
                delay(prefs.sendDelaySeconds * 1000L)
            }
        }
    }

    private fun sendSms(sms: PendingSms, retryCount: Int = 0) {
        val smsId = sms.id ?: return
        val now = System.currentTimeMillis()
        
        // Clean up old entries from processedSmsIds (older than 10 minutes)
        val iterator = processedSmsIds.entries.iterator()
        while (iterator.hasNext()) {
            if (now - iterator.next().value > 10 * 60 * 1000L) {
                iterator.remove()
            }
        }

        if (retryCount == 0 && processedSmsIds.putIfAbsent(smsId, now) != null) {
            android.util.Log.d("SMSHiveService", "SMS $smsId was already processed recently, ignoring duplicate.")
            return
        }

        val context = this
        serviceScope.launch {
            val simSlot = sms.simSlot ?: when (prefs.simPreference) {
                -1 -> simRoundRobinCounter.getAndIncrement() % getActiveSimCount()
                else -> prefs.simPreference
            }
            val subId = getSubscriptionIdForSlot(simSlot)
            
            val smsManager = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val systemSmsManager = context.getSystemService(SmsManager::class.java)
                if (subId != null) {
                    systemSmsManager.createForSubscriptionId(subId)
                } else {
                    systemSmsManager
                }
            } else if (subId != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                SmsManager.getSmsManagerForSubscriptionId(subId)
            } else {
                @Suppress("DEPRECATION")
                SmsManager.getDefault()
            }

            for (recipient in sms.recipients) {
                val smsId = sms.id
                val sentIntent = PendingIntent.getBroadcast(
                    context,
                    smsId.hashCode(),
                    Intent(ACTION_SMS_SENT).apply {
                        setPackage(context.packageName)
                        putExtra("smsId", smsId)
                        putExtra("recipient", recipient)
                        putExtra("message", sms.message)
                        putExtra("simSlot", simSlot)
                        putExtra("retryCount", retryCount)
                    },
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                val deliveredIntent = PendingIntent.getBroadcast(
                    context,
                    smsId.hashCode() + 1,
                    Intent(ACTION_SMS_DELIVERED).apply {
                        setPackage(context.packageName)
                        putExtra("smsId", smsId)
                    },
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

                try {
                    if (sms.message.length > 160) {
                        val parts = smsManager.divideMessage(sms.message)
                        val sentIntents = ArrayList<PendingIntent>().apply { add(sentIntent) }
                        val deliveredIntents = ArrayList<PendingIntent>().apply { add(deliveredIntent) }
                        smsManager.sendMultipartTextMessage(recipient, null, parts, sentIntents, deliveredIntents)
                    } else {
                        smsManager.sendTextMessage(recipient, null, sms.message, sentIntent, deliveredIntent)
                    }

                    db.smsDao().insertSent(
                        SentMessage(
                            recipient = recipient,
                            message = sms.message,
                            status = "SENT",
                            sentAt = System.currentTimeMillis(),
                            simSlot = simSlot,
                            retryCount = retryCount,
                            serverSmsId = smsId
                        )
                    )
                } catch (e: Exception) {
                    e.printStackTrace()
                    
                    var errorMsg = e.message ?: "Unknown error"
                    if (errorMsg.contains("SEND_SMS") || errorMsg.contains("permission")) {
                        errorMsg = "MIUI background SMS permission blocked. Go to Settings -> Apps -> Manage Apps -> SMSHIVE Gateway -> Other Permissions -> Send SMS -> Set to 'Always Allow'."
                    }

                    db.smsDao().insertSent(
                        SentMessage(
                            recipient = recipient,
                            message = sms.message,
                            status = "FAILED",
                            sentAt = System.currentTimeMillis(),
                            simSlot = simSlot,
                            errorMessage = errorMsg,
                            retryCount = retryCount,
                            serverSmsId = smsId
                        )
                    )
                    // Retry logic
                    if (retryCount < prefs.maxRetries) {
                        delay(prefs.retryDelaySeconds * 1000L)
                        sendSms(sms, retryCount + 1)
                    } else {
                        try {
                            api.updateSmsStatus(smsId, prefs.apiKey, StatusUpdateRequest("FAILED", errorMsg))
                        } catch (ex: Exception) { ex.printStackTrace() }
                    }
                }
            }
        }
    }

    private suspend fun sendHeartbeat(): Int {
        val deviceId = prefs.deviceId
        val apiKey = prefs.apiKey
        if (deviceId.isEmpty() || apiKey.isEmpty()) return 0

        val batteryStatus = registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val level = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        val batteryPct = if (level >= 0 && scale > 0) (level * 100 / scale.toFloat()).toInt() else 100
        val status = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
        val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL

        prefs.lastBatteryLevel = batteryPct

        val connManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        var networkType = "OFFLINE"
        val network = connManager.activeNetwork
        val capabilities = connManager.getNetworkCapabilities(network)
        if (capabilities != null) {
            networkType = when {
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "WiFi"
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "Mobile"
                else -> "Other"
            }
        }
        prefs.lastNetworkType = networkType

        val activeSims = mutableListOf<SimInfo>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
            val subManager = getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
            try {
                val activeList = subManager.activeSubscriptionInfoList
                if (activeList != null) {
                    for (info in activeList) {
                        activeSims.add(SimInfo(
                            slot = info.simSlotIndex,
                            carrier = info.carrierName.toString(),
                            phoneNumber = try {
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU)
                                    subManager.getPhoneNumber(info.subscriptionId)
                                else info.number
                            } catch (e: Exception) { null },
                            active = true
                        ))
                    }
                }
            } catch (e: SecurityException) { e.printStackTrace() }
        }

        try {
            val result = api.sendHeartbeat(
                deviceId,
                apiKey,
                HeartbeatRequest(
                    batteryLevel = batteryPct,
                    isCharging = isCharging,
                    networkType = networkType,
                    activeSims = activeSims,
                    appVersion = "2.0.0"
                )
            )
            return result.data?.pendingCount ?: 0
        } catch (e: Exception) {
            android.util.Log.e("SMSHiveService", "Heartbeat failed: ${e.message}", e)
            throw e
        }
    }

    private fun getActiveSimCount(): Int {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                val subManager = getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
                subManager.activeSubscriptionInfoList?.size ?: 1
            } else 1
        } catch (e: Exception) { 1 }
    }

    private fun getBatteryLevel(): Int = prefs.lastBatteryLevel

    private fun getSubscriptionIdForSlot(slotIndex: Int): Int? {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
            val subManager = getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
            try {
                val activeList = subManager.activeSubscriptionInfoList
                if (activeList != null) {
                    for (info in activeList) {
                        if (info.simSlotIndex == slotIndex) return info.subscriptionId
                    }
                }
            } catch (e: SecurityException) { e.printStackTrace() }
        }
        return null
    }

    private fun stopGateway() {
        isRunning = false
        prefs.gatewayEnabled = false
        webSocket?.close(1000, "Service stopped")
        webSocket = null
        pollingJob?.cancel()
        heartbeatJob?.cancel()
        notificationUpdateJob?.cancel()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        serviceScope.cancel()
    }

    private fun buildNotification(content: String): Notification {
        val mainIntent = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val stopIntent = PendingIntent.getService(
            this, 1,
            Intent(this, SmsGatewayForegroundService::class.java).apply { action = ACTION_STOP },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val pauseIntent = PendingIntent.getService(
            this, 2,
            Intent(this, SmsGatewayForegroundService::class.java).apply { action = ACTION_PAUSE },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("SMSHIVE Gateway ✓")
            .setContentText(content)
            .setSmallIcon(android.R.drawable.sym_action_chat)
            .setOngoing(true)
            .setContentIntent(mainIntent)
            .addAction(android.R.drawable.ic_media_pause, "Pause", pauseIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop", stopIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build()
    }

    private fun updateNotification(content: String) {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        nm.notify(NOTIFICATION_ID, buildNotification(content))
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "SMSHIVE Gateway Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Persistent notification for SMSHIVE gateway status"
                setShowBadge(false)
            }
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }

    private fun getStartOfDayTimestamp(): Long {
        val cal = java.util.Calendar.getInstance()
        cal.set(java.util.Calendar.HOUR_OF_DAY, 0)
        cal.set(java.util.Calendar.MINUTE, 0)
        cal.set(java.util.Calendar.SECOND, 0)
        cal.set(java.util.Calendar.MILLISECOND, 0)
        return cal.timeInMillis
    }
}
