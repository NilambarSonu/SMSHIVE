package app.smshive.gateway.data

import com.google.gson.annotations.SerializedName

// Heartbeat DTOs
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

// Pending SMS DTO
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

// Update Status DTO
data class StatusUpdateRequest(
    @SerializedName("status") val status: String,
    @SerializedName("errorMessage") val errorMessage: String? = null
)

// Incoming SMS DTO
data class IncomingSmsRequest(
    @SerializedName("sender") val sender: String,
    @SerializedName("message") val message: String,
    @SerializedName("simSlot") val simSlot: Int,
    @SerializedName("receivedAt") val receivedAt: String
)

// Register Device DTOs
data class DeviceRegisterRequest(
    @SerializedName("deviceId") val deviceId: String,
    @SerializedName("name") val name: String,
    @SerializedName("model") val model: String
)

data class ApiResponse<T>(
    @SerializedName("success") val success: Boolean,
    @SerializedName("data") val data: T?,
    @SerializedName("message") val message: String?
)
