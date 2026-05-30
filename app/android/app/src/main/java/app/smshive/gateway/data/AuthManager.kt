package app.smshive.gateway.data

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

data class ClerkSignInResponse(
    val client: ClerkClient?
)

data class ClerkClient(
    val sessions: List<ClerkSession>?
)

data class ClerkSession(
    val id: String?,
    val lastActiveToken: ClerkToken?
)

data class ClerkToken(
    val jwt: String?
)

class AuthManager(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs = EncryptedSharedPreferences.create(
        context,
        "smshive_auth_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    private val gson = Gson()
    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    var clerkToken: String
        get() = prefs.getString("clerk_token", "") ?: ""
        set(value) = prefs.edit().putString("clerk_token", value).apply()

    var userEmail: String
        get() = prefs.getString("user_email", "") ?: ""
        set(value) = prefs.edit().putString("user_email", value).apply()

    var userName: String
        get() = prefs.getString("user_name", "") ?: ""
        set(value) = prefs.edit().putString("user_name", value).apply()

    fun isLoggedIn(): Boolean = clerkToken.isNotEmpty()

    fun logout() {
        prefs.edit().clear().apply()
    }

    suspend fun signIn(email: String, password: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            // Step 1: Create sign-in attempt
            // IMPORTANT: Replace this with your actual Clerk Publishable Key (pk_test_... or pk_live_...)
            val publishableKey = "pk_live_Y2xlcmsuc21zaGl2ZS5uaWxhbWJhcnNvbnUubWUk"
            val frontendApiBase = decodeFrontendApi(publishableKey)

            val createBody = gson.toJson(mapOf(
                "identifier" to email,
                "password" to password,
                "strategy" to "password"
            )).toRequestBody("application/json".toMediaType())

            val createRequest = Request.Builder()
                .url("$frontendApiBase/v1/client/sign_ins")
                .post(createBody)
                .addHeader("Authorization", "Bearer $publishableKey")
                .addHeader("Content-Type", "application/json")
                .build()

            val createResponse = client.newCall(createRequest).execute()
            val createBody2 = createResponse.body?.string() ?: ""

            if (!createResponse.isSuccessful) {
                val errMsg = try {
                    val errJson = gson.fromJson(createBody2, Map::class.java)
                    val errors = errJson["errors"] as? List<*>
                    val firstError = errors?.firstOrNull() as? Map<*, *>
                    firstError?.get("long_message") as? String ?: "Login failed"
                } catch (e: Exception) {
                    "Login failed: ${createResponse.code}"
                }
                return@withContext Result.failure(Exception(errMsg))
            }

            val signInResp = gson.fromJson(createBody2, Map::class.java)
            val clientObj = signInResp["client"] as? Map<*, *>
            val sessions = clientObj?.get("sessions") as? List<*>
            val firstSession = sessions?.firstOrNull() as? Map<*, *>
            val lastActiveToken = firstSession?.get("last_active_token") as? Map<*, *>
            val jwt = lastActiveToken?.get("jwt") as? String

            if (jwt != null) {
                clerkToken = jwt
                userEmail = email
                Result.success(jwt)
            } else {
                Result.failure(Exception("Could not retrieve session token"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun decodeFrontendApi(publishableKey: String): String {
        // pk_test_bm9ibGUtcXVhZ2dhLTU1LmNsZXJrLmFjY291bnRzLmRldiQ
        // Remove "pk_test_" or "pk_live_" prefix, base64 decode, strip trailing $
        val stripped = publishableKey.removePrefix("pk_test_").removePrefix("pk_live_")
        val decoded = android.util.Base64.decode(stripped, android.util.Base64.DEFAULT)
            .toString(Charsets.UTF_8)
            .trimEnd('$')
        return "https://$decoded"
    }
}
