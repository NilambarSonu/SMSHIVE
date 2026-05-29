package app.smshive.gateway.receiver

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.SmsManager
import app.smshive.gateway.data.AppDatabase
import app.smshive.gateway.data.ApiService
import app.smshive.gateway.data.PreferencesManager
import app.smshive.gateway.data.StatusUpdateRequest
import app.smshive.gateway.service.SmsGatewayForegroundService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class SmsStatusReceiver : BroadcastReceiver() {
    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        val smsId = intent.getStringExtra("smsId") ?: return
        val prefs = PreferencesManager(context)
        val api = ApiService.create(prefs.serverUrl)

        scope.launch {
            try {
                if (action == SmsGatewayForegroundService.ACTION_SMS_SENT) {
                    val status = if (resultCode == Activity.RESULT_OK) "sent" else "failed"
                    val errorMsg = if (resultCode != Activity.RESULT_OK) {
                        getSmsErrorString(resultCode)
                    } else null

                    // Update server
                    api.updateSmsStatus(smsId, prefs.apiKey, StatusUpdateRequest(status.toUpperCase(), errorMsg))
                } else if (action == SmsGatewayForegroundService.ACTION_SMS_DELIVERED) {
                    // Update server
                    api.updateSmsStatus(smsId, prefs.apiKey, StatusUpdateRequest("DELIVERED"))
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun getSmsErrorString(resultCode: Int): String {
        return when (resultCode) {
            SmsManager.RESULT_ERROR_GENERIC_FAILURE -> "Generic failure"
            SmsManager.RESULT_ERROR_NO_SERVICE -> "No service"
            SmsManager.RESULT_ERROR_NULL_PDU -> "Null PDU"
            SmsManager.RESULT_ERROR_RADIO_OFF -> "Radio off"
            else -> "Unknown error code: $resultCode"
        }
    }
}
