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

    private var currentAttemptId: String? = null
    private var currentClientToken: String? = null
    private var pendingEmail: String? = null

    fun isLoggedIn(): Boolean = clerkToken.isNotEmpty()

    fun logout() {
        prefs.edit().clear().apply()
    }

    suspend fun signIn(email: String, password: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            // Step 1: Create sign-in attempt (URL-encoded)
            val publishableKey = "pk_live_Y2xlcmsuc21zaGl2ZS5uaWxhbWJhcnNvbnUubWUk"
            val frontendApiBase = decodeFrontendApi(publishableKey)

            val params1 = "identifier=${android.net.Uri.encode(email)}"
            val body1 = params1.toRequestBody("application/x-www-form-urlencoded".toMediaType())

            val req1 = Request.Builder()
                .url("$frontendApiBase/v1/client/sign_ins")
                .post(body1)
                .addHeader("Authorization", "Bearer $publishableKey")
                .addHeader("Content-Type", "application/x-www-form-urlencoded")
                .build()

            val res1 = client.newCall(req1).execute()
            val bodyStr1 = res1.body?.string() ?: ""

            if (!res1.isSuccessful) {
                val errMsg = parseClerkError(bodyStr1, "Login initialization failed")
                return@withContext Result.failure(Exception(errMsg))
            }

            val clientToken1 = res1.header("authorization") ?: "Bearer $publishableKey"
            val json1 = gson.fromJson(bodyStr1, Map::class.java)
            val responseObj1 = json1["response"] as? Map<*, *>
            val clientObj1 = json1["client"] as? Map<*, *>
            val attemptId = responseObj1?.get("id") as? String
                ?: (clientObj1?.get("sign_in") as? Map<*, *>)?.get("id") as? String

            if (attemptId == null) {
                return@withContext Result.failure(Exception("Failed to initialize login attempt ID."))
            }

            // Step 2: Attempt First Factor (URL-encoded)
            val params2 = "strategy=password&password=${android.net.Uri.encode(password)}"
            val body2 = params2.toRequestBody("application/x-www-form-urlencoded".toMediaType())

            val req2 = Request.Builder()
                .url("$frontendApiBase/v1/client/sign_ins/$attemptId/attempt_first_factor")
                .post(body2)
                .addHeader("Authorization", clientToken1)
                .addHeader("Content-Type", "application/x-www-form-urlencoded")
                .build()

            val res2 = client.newCall(req2).execute()
            val bodyStr2 = res2.body?.string() ?: ""

            if (!res2.isSuccessful) {
                val errMsg = parseClerkError(bodyStr2, "Password authentication failed")
                return@withContext Result.failure(Exception(errMsg))
            }

            val clientToken2 = res2.header("authorization") ?: clientToken1
            val json2 = gson.fromJson(bodyStr2, Map::class.java)
            val clientObj2 = json2["client"] as? Map<*, *>
            val sessions2 = clientObj2?.get("sessions") as? List<*>
            val firstSession2 = sessions2?.firstOrNull() as? Map<*, *>
            val lastActiveToken2 = firstSession2?.get("last_active_token") as? Map<*, *>
            val jwt2 = lastActiveToken2?.get("jwt") as? String

            if (jwt2 != null) {
                clerkToken = jwt2
                userEmail = email
                currentAttemptId = null
                currentClientToken = null
                pendingEmail = null
                return@withContext Result.success(jwt2)
            }

            // Step 3: Handle needs_client_trust or other statuses
            val responseObj2 = json2["response"] as? Map<*, *>
            val attemptStatus = responseObj2?.get("status") as? String
                ?: (clientObj2?.get("sign_in") as? Map<*, *>)?.get("status") as? String

            if (attemptStatus == "needs_client_trust" || attemptStatus == "needs_second_factor") {
                // Trigger prepare_second_factor for email code
                val params3 = "strategy=email_code"
                val body3 = params3.toRequestBody("application/x-www-form-urlencoded".toMediaType())

                val req3 = Request.Builder()
                    .url("$frontendApiBase/v1/client/sign_ins/$attemptId/prepare_second_factor")
                    .post(body3)
                    .addHeader("Authorization", clientToken2)
                    .addHeader("Content-Type", "application/x-www-form-urlencoded")
                    .build()

                val res3 = client.newCall(req3).execute()
                val bodyStr3 = res3.body?.string() ?: ""

                if (!res3.isSuccessful) {
                    val errMsg = parseClerkError(bodyStr3, "Failed to send email verification code")
                    return@withContext Result.failure(Exception(errMsg))
                }

                // Save in memory for verification step
                currentAttemptId = attemptId
                currentClientToken = res3.header("authorization") ?: clientToken2
                pendingEmail = email

                return@withContext Result.failure(Exception("verification_code_required"))
            }

            return@withContext Result.failure(Exception("Unexpected login status: $attemptStatus"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyEmailCode(code: String): Result<String> = withContext(Dispatchers.IO) {
        val attemptId = currentAttemptId ?: return@withContext Result.failure(Exception("No active sign-in session found. Please try logging in again."))
        val clientToken = currentClientToken ?: "Bearer pk_live_Y2xlcmsuc21zaGl2ZS5uaWxhbWJhcnNvbnUubWUk"
        val email = pendingEmail ?: ""
        val publishableKey = "pk_live_Y2xlcmsuc21zaGl2ZS5uaWxhbWJhcnNvbnUubWUk"
        val frontendApiBase = decodeFrontendApi(publishableKey)

        try {
            val params = "strategy=email_code&code=${code.trim()}"
            val requestBody = params.toRequestBody("application/x-www-form-urlencoded".toMediaType())

            val request = Request.Builder()
                .url("$frontendApiBase/v1/client/sign_ins/$attemptId/attempt_second_factor")
                .post(requestBody)
                .addHeader("Authorization", clientToken)
                .addHeader("Content-Type", "application/x-www-form-urlencoded")
                .build()

            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""

            if (!response.isSuccessful) {
                val errMsg = parseClerkError(responseBody, "Verification failed")
                return@withContext Result.failure(Exception(errMsg))
            }

            val signInResp = gson.fromJson(responseBody, Map::class.java)
            val clientObj = signInResp["client"] as? Map<*, *>
            val sessions = clientObj?.get("sessions") as? List<*>
            val firstSession = sessions?.firstOrNull() as? Map<*, *>
            val lastActiveToken = firstSession?.get("last_active_token") as? Map<*, *>
            val jwt = lastActiveToken?.get("jwt") as? String

            if (jwt != null) {
                clerkToken = jwt
                userEmail = email
                currentAttemptId = null
                currentClientToken = null
                pendingEmail = null
                Result.success(jwt)
            } else {
                Result.failure(Exception("Could not retrieve session token after verification"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun parseClerkError(responseBody: String, fallback: String): String {
        return try {
            val errJson = gson.fromJson(responseBody, Map::class.java)
            val errors = errJson["errors"] as? List<*>
            val firstError = errors?.firstOrNull() as? Map<*, *>
            firstError?.get("long_message") as? String
                ?: firstError?.get("message") as? String
                ?: fallback
        } catch (e: Exception) {
            fallback
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
