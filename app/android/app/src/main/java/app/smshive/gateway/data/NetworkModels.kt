package app.smshive.gateway.data

import com.google.gson.annotations.SerializedName

// ── QR Config (from scanned QR) ──────────────────
data class QrConfig(
    @SerializedName("v") val v: Int,
    @SerializedName("apiKey") val apiKey: String,
    @SerializedName("serverUrl") val serverUrl: String,
    @SerializedName("qrToken") val qrToken: String
)

// ── Device Registration ───────────────────────────
data class DeviceRegisterRequest(
    @SerializedName("name") val name: String,
    @SerializedName("deviceId") val deviceId: String? = null,
    @SerializedName("model") val model: String,
    @SerializedName("qrToken") val qrToken: String? = null,
    @SerializedName("deviceBrand") val deviceBrand: String? = null,
    @SerializedName("androidVersion") val androidVersion: String? = null,
    @SerializedName("appVersion") val appVersion: String? = null
)

data class DeviceRegisterResponse(
    @SerializedName("_id") val id: String?,
    @SerializedName("deviceId") val deviceId: String?,
    @SerializedName("name") val name: String?,
    @SerializedName("status") val status: String?
)

// ── Heartbeat ─────────────────────────────────────
data class SimInfo(
    @SerializedName("slot") val slot: Int,
    @SerializedName("carrier") val carrier: String,
    @SerializedName("phoneNumber") val phoneNumber: String?,
    @SerializedName("active") val active: Boolean
)

data class HeartbeatRequest(
    @SerializedName("batteryLevel") val batteryLevel: Int,
    @SerializedName("isCharging") val isCharging: Boolean,
    @SerializedName("networkType") val networkType: String,
    @SerializedName("activeSims") val activeSims: List<SimInfo>,
    @SerializedName("appVersion") val appVersion: String
)

data class HeartbeatResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: HeartbeatData?
)

data class HeartbeatData(
    @SerializedName("pendingCount") val pendingCount: Int = 0
)

// ── Pending SMS ───────────────────────────────────
data class PendingSms(
    @SerializedName("_id") val id: String,
    @SerializedName("recipients") val recipients: List<String>,
    @SerializedName("message") val message: String,
    @SerializedName("simSlot") val simSlot: Int?
)

data class PendingSmsResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: List<PendingSms>
)

// ── SMS Status Update ─────────────────────────────
data class StatusUpdateRequest(
    @SerializedName("status") val status: String,
    @SerializedName("errorMessage") val errorMessage: String? = null
)

// ── Incoming SMS ──────────────────────────────────
data class IncomingSmsRequest(
    @SerializedName("sender") val sender: String,
    @SerializedName("message") val message: String,
    @SerializedName("simSlot") val simSlot: Int,
    @SerializedName("receivedAt") val receivedAt: String
)

// ── Generic API Response ──────────────────────────
data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: T?,
    @SerializedName("message") val message: String?
)
