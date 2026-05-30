package app.smshive.gateway.ui

import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.smshive.gateway.data.AuthManager
import app.smshive.gateway.data.PreferencesManager
import app.smshive.gateway.ui.theme.BrandMuted
import app.smshive.gateway.ui.theme.BrandViolet
import app.smshive.gateway.ui.theme.BrandVioletDark
import app.smshive.gateway.ui.theme.DarkBg
import app.smshive.gateway.ui.theme.DarkBorder
import app.smshive.gateway.ui.theme.DarkCard
import app.smshive.gateway.ui.theme.DarkSurface
import app.smshive.gateway.ui.theme.DestructiveRed
import app.smshive.gateway.ui.theme.TextPrimary
import app.smshive.gateway.ui.theme.TextSecondary
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

data class DeviceRegisterRequest(
    val name: String,
    val model: String,
    val deviceBrand: String,
    val androidVersion: String,
    val appVersion: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ManualSetupScreen(
    prefs: PreferencesManager,
    authManager: AuthManager,
    onSuccess: () -> Unit,
    onBack: () -> Unit
) {
    var serverUrl by remember { mutableStateOf("https://smshive.nilambarsonu.me") }
    var apiKey by remember { mutableStateOf("") }
    var deviceName by remember { mutableStateOf(Build.MODEL) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    val coroutineScope = rememberCoroutineScope()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Manual Setup",
                        color = TextPrimary,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 18.sp
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Go back",
                            tint = TextPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DarkSurface,
                    titleContentColor = TextPrimary,
                    navigationIconContentColor = TextPrimary
                )
            )
        },
        containerColor = DarkBg
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Setup card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(DarkCard)
                    .border(
                        width = 1.dp,
                        color = DarkBorder,
                        shape = RoundedCornerShape(20.dp)
                    )
                    .padding(20.dp)
            ) {
                Text(
                    text = "Device Configuration",
                    color = TextPrimary,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "Enter your SMSHIVE server details to connect this device.",
                    color = TextSecondary,
                    fontSize = 13.sp
                )

                Spacer(modifier = Modifier.height(20.dp))

                // Server URL
                OutlinedTextField(
                    value = serverUrl,
                    onValueChange = { serverUrl = it },
                    label = { Text("Server URL") },
                    singleLine = true,
                    colors = setupTextFieldColors(),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

                // API Key
                OutlinedTextField(
                    value = apiKey,
                    onValueChange = { apiKey = it },
                    label = { Text("API Key") },
                    placeholder = { Text("shv_xxxx...", color = BrandMuted) },
                    singleLine = true,
                    colors = setupTextFieldColors(),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Device Name
                OutlinedTextField(
                    value = deviceName,
                    onValueChange = { deviceName = it },
                    label = { Text("Device Name") },
                    singleLine = true,
                    colors = setupTextFieldColors(),
                    modifier = Modifier.fillMaxWidth()
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Error message
            if (errorMessage.isNotEmpty()) {
                Text(
                    text = errorMessage,
                    color = DestructiveRed,
                    fontSize = 13.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Connect Button
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(
                        brush = Brush.horizontalGradient(
                            colors = listOf(BrandViolet, BrandVioletDark)
                        )
                    ),
                contentAlignment = Alignment.Center
            ) {
                Button(
                    onClick = {
                        if (!isLoading) {
                            errorMessage = ""
                            if (serverUrl.isBlank() || apiKey.isBlank() || deviceName.isBlank()) {
                                errorMessage = "All fields are required."
                                return@Button
                            }
                            isLoading = true
                            coroutineScope.launch {
                                try {
                                    val request = DeviceRegisterRequest(
                                        name = deviceName.trim(),
                                        model = Build.MODEL,
                                        deviceBrand = Build.BRAND,
                                        androidVersion = Build.VERSION.RELEASE,
                                        appVersion = "2.0.0"
                                    )
                                    val result = registerDevice(
                                        serverUrl = serverUrl.trimEnd('/'),
                                        apiKey = apiKey.trim(),
                                        request = request
                                    )
                                    prefs.serverUrl = serverUrl.trimEnd('/')
                                    prefs.apiKey = apiKey.trim()
                                    prefs.deviceName = deviceName.trim()
                                    prefs.deviceId = result.first
                                    onSuccess()
                                } catch (e: Exception) {
                                    errorMessage = e.message ?: "Connection failed. Check server URL and API key."
                                } finally {
                                    isLoading = false
                                }
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                    modifier = Modifier.fillMaxSize()
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            color = Color.White,
                            modifier = Modifier.size(22.dp),
                            strokeWidth = 2.5.dp
                        )
                    } else {
                        Text(
                            text = "Connect",
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun setupTextFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = BrandViolet,
    unfocusedBorderColor = DarkBorder,
    focusedLabelColor = BrandViolet,
    unfocusedLabelColor = BrandMuted,
    cursorColor = BrandViolet,
    focusedTextColor = TextPrimary,
    unfocusedTextColor = TextPrimary
)

private suspend fun registerDevice(
    serverUrl: String,
    apiKey: String,
    request: DeviceRegisterRequest
): Pair<String, String> {
    return kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
        val url = URL("$serverUrl/api/v1/devices/register")
        val connection = url.openConnection() as HttpURLConnection
        try {
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("Authorization", "Bearer $apiKey")
            connection.doOutput = true
            connection.connectTimeout = 15_000
            connection.readTimeout = 15_000

            val body = JSONObject().apply {
                put("name", request.name)
                put("model", request.model)
                put("deviceBrand", request.deviceBrand)
                put("androidVersion", request.androidVersion)
                put("appVersion", request.appVersion)
            }.toString()

            OutputStreamWriter(connection.outputStream, "UTF-8").use { writer ->
                writer.write(body)
                writer.flush()
            }

            val responseCode = connection.responseCode
            val responseBody = if (responseCode in 200..299) {
                connection.inputStream.bufferedReader().readText()
            } else {
                val errBody = connection.errorStream?.bufferedReader()?.readText() ?: ""
                throw Exception("Server error $responseCode: $errBody")
            }

            val json = JSONObject(responseBody)
            val deviceId = json.optString("id", json.optString("deviceId", ""))
            val deviceName = json.optString("name", request.name)
            if (deviceId.isEmpty()) throw Exception("Invalid server response: missing device ID.")
            Pair(deviceId, deviceName)
        } finally {
            connection.disconnect()
        }
    }
}
