package app.smshive.gateway.data

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import java.util.concurrent.TimeUnit

interface ApiService {

    @POST("api/v1/devices/register")
    suspend fun registerDevice(
        @Header("x-api-key") apiKey: String,
        @Body request: DeviceRegisterRequest
    ): ApiResponse<Any>

    @POST("api/v1/devices/{id}/heartbeat")
    suspend fun sendHeartbeat(
        @Path("id") deviceId: String,
        @Header("x-api-key") apiKey: String,
        @Body request: HeartbeatRequest
    ): ApiResponse<Any>

    @GET("api/v1/gateway/devices/{id}/pending-sms")
    suspend fun getPendingSms(
        @Path("id") deviceId: String,
        @Header("x-api-key") apiKey: String
    ): PendingSmsResponse

    @POST("api/v1/gateway/devices/{id}/receive-sms")
    suspend fun receiveSms(
        @Path("id") deviceId: String,
        @Header("x-api-key") apiKey: String,
        @Body request: IncomingSmsRequest
    ): ApiResponse<Any>

    @PUT("api/v1/sms/{smsId}/status")
    suspend fun updateSmsStatus(
        @Path("smsId") smsId: String,
        @Header("x-api-key") apiKey: String,
        @Body request: StatusUpdateRequest
    ): ApiResponse<Any>

    companion object {
        fun create(baseUrl: String): ApiService {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BASIC
            }

            val client = OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .addInterceptor(logging)
                .build()

            // Normalize base url
            val normalizedUrl = if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"

            return Retrofit.Builder()
                .baseUrl(normalizedUrl)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(ApiService::class.java)
        }
    }
}
