package app.smshive.gateway.data

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class PreferencesManager(context: Context) {

    // Use EncryptedSharedPreferences for sensitive data
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val securePrefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "smshive_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    // Plain prefs for non-sensitive settings
    private val prefs: SharedPreferences = context.getSharedPreferences(
        "smshive_gateway_prefs", Context.MODE_PRIVATE
    )

    // ── Sensitive (Encrypted) ─────────────────────────────
    var apiKey: String
        get() = securePrefs.getString("api_key", "") ?: ""
        set(value) = securePrefs.edit().putString("api_key", value).apply()

    var serverUrl: String
        get() = securePrefs.getString("server_url", "https://smshive.nilambarsonu.me") ?: "https://smshive.nilambarsonu.me"
        set(value) = securePrefs.edit().putString("server_url", value).apply()

    var deviceId: String
        get() = securePrefs.getString("device_id", "") ?: ""
        set(value) = securePrefs.edit().putString("device_id", value).apply()

    var registeredAt: Long
        get() = securePrefs.getLong("registered_at", 0L)
        set(value) = securePrefs.edit().putLong("registered_at", value).apply()

    // ── Device Info (Plain) ───────────────────────────────
    var deviceName: String
        get() = prefs.getString("device_name", Build.MODEL) ?: Build.MODEL
        set(value) = prefs.edit().putString("device_name", value).apply()

    var gatewayEnabled: Boolean
        get() = prefs.getBoolean("gateway_enabled", false)
        set(value) = prefs.edit().putBoolean("gateway_enabled", value).apply()

    // ── SMS Gateway Config ────────────────────────────────
    var pollingIntervalSeconds: Int
        get() = prefs.getInt("polling_interval_sec", 10)
        set(value) = prefs.edit().putInt("polling_interval_sec", value).apply()

    var sendDelaySeconds: Int
        get() = prefs.getInt("send_delay_sec", 1)
        set(value) = prefs.edit().putInt("send_delay_sec", value).apply()

    var simPreference: Int
        get() = prefs.getInt("sim_pref", 0) // 0=SIM1, 1=SIM2, -1=Round-Robin
        set(value) = prefs.edit().putInt("sim_pref", value).apply()

    var maxRetries: Int
        get() = prefs.getInt("max_retries", 2)
        set(value) = prefs.edit().putInt("max_retries", value).apply()

    var retryDelaySeconds: Int
        get() = prefs.getInt("retry_delay_sec", 30)
        set(value) = prefs.edit().putInt("retry_delay_sec", value).apply()

    // ── Boot & Service ────────────────────────────────────
    var autoStartOnBoot: Boolean
        get() = prefs.getBoolean("auto_start_boot", true)
        set(value) = prefs.edit().putBoolean("auto_start_boot", value).apply()

    // ── Receive SMS ───────────────────────────────────────
    var receiveSmsEnabled: Boolean
        get() = prefs.getBoolean("receive_sms_enabled", true)
        set(value) = prefs.edit().putBoolean("receive_sms_enabled", value).apply()

    var autoForwardToWebhook: Boolean
        get() = prefs.getBoolean("auto_forward_webhook", true)
        set(value) = prefs.edit().putBoolean("auto_forward_webhook", value).apply()

    // ── Notifications ─────────────────────────────────────
    var notifyOnSent: Boolean
        get() = prefs.getBoolean("notify_on_sent", false)
        set(value) = prefs.edit().putBoolean("notify_on_sent", value).apply()

    var notifyOnFailed: Boolean
        get() = prefs.getBoolean("notify_on_failed", true)
        set(value) = prefs.edit().putBoolean("notify_on_failed", value).apply()

    var notifyOnOffline: Boolean
        get() = prefs.getBoolean("notify_on_offline", true)
        set(value) = prefs.edit().putBoolean("notify_on_offline", value).apply()

    // ── Runtime State ─────────────────────────────────────
    var lastHeartbeatAt: Long
        get() = prefs.getLong("last_heartbeat_at", 0L)
        set(value) = prefs.edit().putLong("last_heartbeat_at", value).apply()

    var lastBatteryLevel: Int
        get() = prefs.getInt("last_battery_level", 100)
        set(value) = prefs.edit().putInt("last_battery_level", value).apply()

    var lastNetworkType: String
        get() = prefs.getString("last_network_type", "UNKNOWN") ?: "UNKNOWN"
        set(value) = prefs.edit().putString("last_network_type", value).apply()

    fun isRegistered(): Boolean = apiKey.isNotEmpty() && serverUrl.isNotEmpty() && deviceId.isNotEmpty()

    fun clearDevice() {
        securePrefs.edit().clear().apply()
        prefs.edit()
            .remove("gateway_enabled")
            .remove("device_name")
            .apply()
    }
}
