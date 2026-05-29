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
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.*
import org.json.JSONObject
import java.util.UUID

class SmsGatewayForegroundService : Service() {
    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private lateinit var prefs: PreferencesManager
    private lateinit var db: AppDatabase
    private lateinit var api: ApiService

    private var socket: Socket? = null
    private var pollingJob: Job? = null
    private var heartbeatJob: Job? = null
    private var isRunning = false
    private var sentTodayCount = 0

    companion object {
        const val CHANNEL_ID = "smshive_gateway_channel"
        const val NOTIFICATION_ID = 8291
        const val ACTION_START = "ACTION_START"
        const val ACTION_STOP = "ACTION_STOP"
        
        // Custom actions for SMS broadcasts
        const val ACTION_SMS_SENT = "app.smshive.gateway.SMS_SENT"
        const val ACTION_SMS_DELIVERED = "app.smshive.gateway.SMS_DELIVERED"
    }

    override fun onCreate() {
        super.onCreate()
        prefs = PreferencesManager(this)
        db = AppDatabase.getDatabase(this)
        api = ApiService.create(prefs.serverUrl)

        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification("Service initialized"))
        
        // Listen to live database counts
        serviceScope.launch {
            val startOfDay = getStartOfDayTimestamp()
            db.smsDao().getSentTodayCount(startOfDay).collect { count ->
                sentTodayCount = count
                updateNotification("Active · $sentTodayCount sent today")
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                if (!isRunning) {
                    isRunning = true
                    prefs.gatewayEnabled = true
                    startPollingAndHeartbeats()
                }
            }
            ACTION_STOP -> {
                stopGateway()
            }
        }
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun startPollingAndHeartbeats() {
        // Real-time socket connection
        setupSocket()

        // Polling loop (Fallback)
        pollingJob?.cancel()
        pollingJob = serviceScope.launch {
            while (isRunning) {
                try {
                    pollPendingSms()
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                delay(prefs.pollingIntervalSeconds * 1000L)
            }
        }

        // Heartbeat loop
        heartbeatJob?.cancel()
        heartbeatJob = serviceScope.launch {
            while (isRunning) {
                try {
                    sendHeartbeat()
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                delay(30000L) // 30 seconds
            }
        }
    }

    private fun setupSocket() {
        if (prefs.serverUrl.isEmpty() || prefs.deviceId.isEmpty()) return
        
        try {
            val options = IO.Options()
            options.forceNew = true
            options.reconnection = true
            
            socket = IO.socket(prefs.serverUrl, options)
            
            socket?.on(Socket.EVENT_CONNECT) {
                val registrationData = JSONObject()
                registrationData.put("deviceId", prefs.deviceId)
                socket?.emit("register", registrationData)
                updateNotification("Active · Online ✓")
            }
            
            socket?.on(Socket.EVENT_DISCONNECT) {
                updateNotification("Active · Offline ✗")
            }
            
            socket?.on("new_sms") { args ->
                if (args.isNotEmpty()) {
                    val data = args[0] as JSONObject
                    val recipients = mutableListOf<String>()
                    val recipientsArray = data.optJSONArray("recipients")
                    if (recipientsArray != null) {
                        for (i in 0 until recipientsArray.length()) {
                            recipients.add(recipientsArray.getString(i))
                        }
                    }
                    
                    val pendingSms = PendingSms(
                        id = data.getString("id"),
                        recipients = recipients,
                        message = data.getString("message"),
                        simSlot = if (data.has("simSlot")) data.getInt("simSlot") else null
                    )
                    
                    sendSms(pendingSms)
                }
            }
            
            socket?.connect()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun disconnectSocket() {
        socket?.disconnect()
        socket?.off()
        socket = null
    }

    private suspend fun pollPendingSms() {
        val deviceId = prefs.deviceId
        val apiKey = prefs.apiKey
        if (deviceId.isEmpty() || apiKey.isEmpty()) return

        // Make sure we refresh api client if url changed
        api = ApiService.create(prefs.serverUrl)

        val response = api.getPendingSms(deviceId, apiKey)
        if (response.success && response.data.isNotEmpty()) {
            for (sms in response.data) {
                sendSms(sms)
                delay(prefs.sendDelaySeconds * 1000L) // Delay between SMS
            }
        }
    }

    private fun sendSms(sms: PendingSms) {
        val context = this
        val recipients = sms.recipients
        val message = sms.message
        val simSlot = sms.simSlot ?: prefs.simPreference

        if (recipients.isEmpty() || message.isEmpty()) return

        serviceScope.launch {
            // Determine Subscription ID for SIM selection
            val subId = getSubscriptionIdForSlot(simSlot)
            val smsManager = if (subId != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
                context.getSystemService(SmsManager::class.java).createForSubscriptionId(subId)
            } else {
                SmsManager.getDefault()
            }

            for (recipient in recipients) {
                val smsId = sms.id
                val sentIntent = PendingIntent.getBroadcast(
                    context,
                    smsId.hashCode(),
                    Intent(ACTION_SMS_SENT).apply {
                        putExtra("smsId", smsId)
                        putExtra("recipient", recipient)
                        putExtra("message", message)
                        putExtra("simSlot", simSlot)
                    },
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

                val deliveredIntent = PendingIntent.getBroadcast(
                    context,
                    smsId.hashCode() + 1,
                    Intent(ACTION_SMS_DELIVERED).apply {
                        putExtra("smsId", smsId)
                    },
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

                try {
                    if (message.length > 160) {
                        val parts = smsManager.divideMessage(message)
                        val sentIntents = ArrayList<PendingIntent>().apply { add(sentIntent) }
                        val deliveredIntents = ArrayList<PendingIntent>().apply { add(deliveredIntent) }
                        smsManager.sendMultipartTextMessage(recipient, null, parts, sentIntents, deliveredIntents)
                    } else {
                        smsManager.sendTextMessage(recipient, null, message, sentIntent, deliveredIntent)
                    }

                    // Save locally in Room
                    db.smsDao().insertSent(
                        SentMessage(
                            recipient = recipient,
                            message = message,
                            status = "SENT",
                            sentAt = System.currentTimeMillis(),
                            simSlot = simSlot
                        )
                    )
                } catch (e: Exception) {
                    e.printStackTrace()
                    api.updateSmsStatus(smsId, prefs.apiKey, StatusUpdateRequest("FAILED", e.message))
                }
            }
        }
    }

    private suspend fun sendHeartbeat() {
        val deviceId = prefs.deviceId
        val apiKey = prefs.apiKey
        if (deviceId.isEmpty() || apiKey.isEmpty()) return

        // 1. Battery Level & Charging State
        val batteryStatus = registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val level = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        val batteryPct = if (level >= 0 && scale > 0) (level * 100 / scale.toFloat()).toInt() else 100
        
        val status = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
        val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL

        // 2. Network Type
        val connManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        var networkType = "OFFLINE"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connManager.activeNetwork
            val capabilities = connManager.getNetworkCapabilities(network)
            if (capabilities != null) {
                if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)) {
                    networkType = "WIFI"
                } else if (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) {
                    networkType = "CELLULAR"
                }
            }
        } else {
            val activeNetInfo = connManager.activeNetworkInfo
            if (activeNetInfo != null && activeNetInfo.isConnected) {
                networkType = activeNetInfo.typeName
            }
        }

        // 3. Active SIM Info
        val activeSims = mutableListOf<SimInfo>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
            val subManager = getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
            try {
                val activeList = subManager.activeSubscriptionInfoList
                if (activeList != null) {
                    for (info in activeList) {
                        activeSims.add(
                            SimInfo(
                                slot = info.simSlotIndex,
                                carrier = info.carrierName.toString(),
                                phoneNumber = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                    subManager.getPhoneNumber(info.subscriptionId)
                                } else {
                                    info.number
                                },
                                active = true
                            )
                        )
                    }
                }
            } catch (e: SecurityException) {
                e.printStackTrace()
            }
        }

        api.sendHeartbeat(
            deviceId,
            apiKey,
            HeartbeatRequest(
                batteryLevel = batteryPct,
                isCharging = isCharging,
                networkType = networkType,
                activeSims = activeSims,
                appVersion = "1.0.0"
            )
        )
    }

    private fun getSubscriptionIdForSlot(slotIndex: Int): Int? {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1) {
            val subManager = getSystemService(Context.TELEPHONY_SUBSCRIPTION_SERVICE) as SubscriptionManager
            try {
                val activeList = subManager.activeSubscriptionInfoList
                if (activeList != null) {
                    for (info in activeList) {
                        if (info.simSlotIndex == slotIndex) {
                            return info.subscriptionId
                        }
                    }
                }
            } catch (e: SecurityException) {
                e.printStackTrace()
            }
        }
        return null
    }

    private fun stopGateway() {
        isRunning = false
        prefs.gatewayEnabled = false
        disconnectSocket()
        pollingJob?.cancel()
        heartbeatJob?.cancel()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        serviceScope.cancel()
    }

    private fun buildNotification(content: String): Notification {
        val mainIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            mainIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, SmsGatewayForegroundService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("SMSHIVE Gateway")
            .setContentText(content)
            .setSmallIcon(android.R.drawable.sym_def_app_icon)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop Gateway", stopPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun updateNotification(content: String) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, buildNotification(content))
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "SMSHIVE Gateway Active Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    private fun getStartOfDayTimestamp(): Long {
        val calendar = java.util.Calendar.getInstance()
        calendar.set(java.util.Calendar.HOUR_OF_DAY, 0)
        calendar.set(java.util.Calendar.MINUTE, 0)
        calendar.set(java.util.Calendar.SECOND, 0)
        calendar.set(java.util.Calendar.MILLISECOND, 0)
        return calendar.timeInMillis
    }
}
