package app.smshive.gateway.data

import android.content.Context
import android.content.SharedPreferences
import android.os.Build

class PreferencesManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("smshive_gateway_prefs", Context.MODE_PRIVATE)

    var apiKey: String
        get() = prefs.getString("api_key", "shv_dev_bypass_key_12345678") ?: "shv_dev_bypass_key_12345678"
        set(value) = prefs.edit().putString("api_key", value).apply()

    var serverUrl: String
        get() = prefs.getString("server_url", "http://10.180.3.230:8000") ?: "http://10.180.3.230:8000"
        set(value) = prefs.edit().putString("server_url", value).apply()

    var deviceId: String
        get() = prefs.getString("device_id", "") ?: ""
        set(value) = prefs.edit().putString("device_id", value).apply()

    var deviceName: String
        get() = prefs.getString("device_name", Build.MODEL) ?: Build.MODEL
        set(value) = prefs.edit().putString("device_name", value).apply()

    var gatewayEnabled: Boolean
        get() = prefs.getBoolean("gateway_enabled", false)
        set(value) = prefs.edit().putBoolean("gateway_enabled", value).apply()

    var pollingIntervalSeconds: Int
        get() = prefs.getInt("polling_interval_sec", 2)
        set(value) = prefs.edit().putInt("polling_interval_sec", value).apply()

    var sendDelaySeconds: Int
        get() = prefs.getInt("send_delay_sec", 1)
        set(value) = prefs.edit().putInt("send_delay_sec", value).apply()

    var simPreference: Int
        get() = prefs.getInt("sim_pref", 0) // 0 for SIM 1, 1 for SIM 2, -1 for Auto/Alternating
        set(value) = prefs.edit().putInt("sim_pref", value).apply()

    var autoStartOnBoot: Boolean
        get() = prefs.getBoolean("auto_start_boot", true)
        set(value) = prefs.edit().putBoolean("auto_start_boot", value).apply()

    fun clear() {
        prefs.edit().clear().apply()
    }
}
