package app.smshive.gateway.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.telephony.SmsMessage
import app.smshive.gateway.data.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class SmsReceiver : BroadcastReceiver() {
    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != "android.provider.Telephony.SMS_RECEIVED") return

        val bundle = intent.extras ?: return
        val pdus = bundle.get("pdus") as? Array<*> ?: return
        val format = bundle.getString("format")
        val prefs = PreferencesManager(context)
        val db = AppDatabase.getDatabase(context)
        val api = ApiService.create(prefs.serverUrl)

        val deviceId = prefs.deviceId
        val apiKey = prefs.apiKey

        scope.launch {
            for (pdu in pdus) {
                val sms = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    SmsMessage.createFromPdu(pdu as ByteArray, format)
                } else {
                    @Suppress("DEPRECATION")
                    SmsMessage.createFromPdu(pdu as ByteArray)
                }

                val sender = sms.originatingAddress ?: continue
                val message = sms.messageBody ?: continue
                val timestamp = sms.timestampMillis
                val simSlot = 0 // Default to SIM 1 or let Telephony manager resolve if possible

                // Save locally first
                db.smsDao().insertReceived(
                    ReceivedMessage(
                        sender = sender,
                        message = message,
                        receivedAt = timestamp,
                        forwarded = false
                    )
                )

                // If device and key are registered, forward to server
                if (deviceId.isNotEmpty() && apiKey.isNotEmpty()) {
                    try {
                        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
                        val dateStr = sdf.format(Date(timestamp))

                        val response = api.receiveSms(
                            deviceId,
                            apiKey,
                            IncomingSmsRequest(
                                sender = sender,
                                message = message,
                                simSlot = simSlot,
                                receivedAt = dateStr
                            )
                        )
                        if (response.success) {
                            // Mark as forwarded
                            val lastId = db.smsDao().getRecentReceived()
                            // Simple update - for simplicity we just proceed
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        }
    }
}
