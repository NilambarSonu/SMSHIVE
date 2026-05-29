package app.smshive.gateway.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import app.smshive.gateway.data.PreferencesManager
import app.smshive.gateway.service.SmsGatewayForegroundService

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            val prefs = PreferencesManager(context)
            if (prefs.gatewayEnabled && prefs.autoStartOnBoot) {
                val serviceIntent = Intent(context, SmsGatewayForegroundService::class.java).apply {
                    action = SmsGatewayForegroundService.ACTION_START
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
        }
    }
}
