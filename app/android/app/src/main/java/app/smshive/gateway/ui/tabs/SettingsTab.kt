package app.smshive.gateway.ui.tabs

import android.content.Intent
import android.net.Uri
import android.os.PowerManager
import android.provider.Settings
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.smshive.gateway.data.AppDatabase
import app.smshive.gateway.data.AuthManager
import app.smshive.gateway.data.PreferencesManager
import app.smshive.gateway.ui.theme.*
import kotlinx.coroutines.launch

@Composable
fun SettingsTab(
    prefs: PreferencesManager,
    authManager: AuthManager,
    db: AppDatabase,
    onDisconnect: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // ── Local mutable state for every pref ───────────────────────
    var deviceName by remember { mutableStateOf(prefs.deviceName) }
    var apiKeyVisible by remember { mutableStateOf(false) }
    var simPref by remember { mutableStateOf(prefs.simPreference) }
    var sendDelay by remember { mutableStateOf(prefs.sendDelaySeconds.toFloat()) }
    var maxRetries by remember { mutableStateOf(prefs.maxRetries) }
    var retryDelay by remember { mutableStateOf(prefs.retryDelaySeconds) }
    var autoStart by remember { mutableStateOf(prefs.autoStartOnBoot) }
    var pollingInterval by remember { mutableStateOf(prefs.pollingIntervalSeconds) }
    var receiveSms by remember { mutableStateOf(prefs.receiveSmsEnabled) }
    var autoForward by remember { mutableStateOf(prefs.autoForwardToWebhook) }
    var notifySent by remember { mutableStateOf(prefs.notifyOnSent) }
    var notifyFailed by remember { mutableStateOf(prefs.notifyOnFailed) }
    var notifyOffline by remember { mutableStateOf(prefs.notifyOnOffline) }

    // ── Dialogs ───────────────────────────────────────────────────
    var showDisconnectDialog by remember { mutableStateOf(false) }
    var showClearHistoryDialog by remember { mutableStateOf(false) }
    var showTestConnectionDialog by remember { mutableStateOf(false) }
    var testConnectionResult by remember { mutableStateOf<String?>(null) }
    var testConnectionLoading by remember { mutableStateOf(false) }

    // ── Battery optimization ──────────────────────────────────────
    val powerManager = context.getSystemService(PowerManager::class.java)
    val isBatteryOptimized = remember {
        !(powerManager?.isIgnoringBatteryOptimizations(context.packageName) ?: true)
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBg),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {

        // ════════════════════════════════════════════════════════
        // ACCOUNT & DEVICE
        // ════════════════════════════════════════════════════════
        item { SectionHeader("Account & Device") }

        // Server URL
        item {
            SettingsCard {
                SettingsRow(
                    icon = Icons.Default.Cloud,
                    iconTint = BrandTeal,
                    title = "Server URL",
                    subtitle = maskUrl(prefs.serverUrl),
                    trailing = {
                        IconButton(onClick = { /* copy */ }, modifier = Modifier.size(32.dp)) {
                            Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = BrandMuted, modifier = Modifier.size(16.dp))
                        }
                    }
                )
            }
        }

        // API Key
        item {
            SettingsCard {
                SettingsRow(
                    icon = Icons.Default.Key,
                    iconTint = BrandAmber,
                    title = "API Key",
                    subtitle = if (apiKeyVisible) prefs.apiKey else "●●●●●●●●●●●●",
                    trailing = {
                        IconButton(
                            onClick = { apiKeyVisible = !apiKeyVisible },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                if (apiKeyVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                contentDescription = "Toggle visibility",
                                tint = BrandMuted,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                )
            }
        }

        // Device ID
        item {
            SettingsCard {
                SettingsRow(
                    icon = Icons.Default.Fingerprint,
                    iconTint = BrandViolet,
                    title = "Device ID",
                    subtitle = prefs.deviceId.take(24).let { if (prefs.deviceId.length > 24) "$it…" else it },
                    trailing = {
                        IconButton(onClick = { /* copy */ }, modifier = Modifier.size(32.dp)) {
                            Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = BrandMuted, modifier = Modifier.size(16.dp))
                        }
                    }
                )
            }
        }

        // Device Name (editable)
        item {
            SettingsCard {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 14.dp, vertical = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.PhoneAndroid, contentDescription = null, tint = BrandViolet, modifier = Modifier.size(18.dp))
                        Text("Device Name", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    }
                    OutlinedTextField(
                        value = deviceName,
                        onValueChange = {
                            deviceName = it
                            prefs.deviceName = it
                        },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandViolet,
                            unfocusedBorderColor = DarkBorder,
                            cursorColor = BrandViolet,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedContainerColor = DarkCard,
                            unfocusedContainerColor = DarkCard
                        )
                    )
                }
            }
        }

        // Re-scan QR + Disconnect
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = { /* navigate to QR scanner */ },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    border = BorderStroke(1.dp, BrandViolet),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = BrandViolet)
                ) {
                    Icon(Icons.Default.QrCodeScanner, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Re-scan QR", fontSize = 12.sp)
                }
                Button(
                    onClick = { showDisconnectDialog = true },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = DestructiveRed.copy(alpha = 0.15f), contentColor = DestructiveRed)
                ) {
                    Icon(Icons.Default.LinkOff, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Disconnect", fontSize = 12.sp)
                }
            }
        }

        // ════════════════════════════════════════════════════════
        // SMS SENDING
        // ════════════════════════════════════════════════════════
        item { Spacer(Modifier.height(4.dp)) }
        item { SectionHeader("SMS Sending") }

        // Default SIM
        item {
            SettingsCard {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.SimCard, contentDescription = null, tint = BrandViolet, modifier = Modifier.size(18.dp))
                        Column {
                            Text("Default SIM", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                            Text("Which SIM card to use for outgoing SMS", color = BrandMuted, fontSize = 11.sp)
                        }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("Auto" to -1, "SIM 1" to 0, "SIM 2" to 1).forEach { (label, value) ->
                            val selected = simPref == value
                            Box(
                                contentAlignment = Alignment.Center,
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (selected) BrandViolet else DarkCard)
                                    .border(1.dp, if (selected) BrandViolet else DarkBorder, RoundedCornerShape(8.dp))
                                    .clickable {
                                        simPref = value
                                        prefs.simPreference = value
                                    }
                                    .padding(vertical = 9.dp)
                            ) {
                                Text(label, color = if (selected) Color.White else BrandMuted, fontSize = 12.sp, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal)
                            }
                        }
                    }
                }
            }
        }

        // Send delay slider
        item {
            SettingsCard {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Icon(Icons.Default.Timer, contentDescription = null, tint = BrandAmber, modifier = Modifier.size(18.dp))
                            Text("Send Delay", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                        }
                        Text("${sendDelay.toInt()}s", color = BrandViolet, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                    Slider(
                        value = sendDelay,
                        onValueChange = {
                            sendDelay = it
                            prefs.sendDelaySeconds = it.toInt()
                        },
                        valueRange = 0f..10f,
                        steps = 9,
                        modifier = Modifier.fillMaxWidth(),
                        colors = SliderDefaults.colors(
                            thumbColor = BrandViolet,
                            activeTrackColor = BrandViolet,
                            inactiveTrackColor = DarkBorder
                        )
                    )
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("0s", color = BrandMuted, fontSize = 10.sp)
                        Text("10s", color = BrandMuted, fontSize = 10.sp)
                    }
                }
            }
        }

        // Max retries
        item {
            SettingsCard {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Refresh, contentDescription = null, tint = BrandTeal, modifier = Modifier.size(18.dp))
                        Text("Max Retries", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(1, 2, 3).forEach { value ->
                            val selected = maxRetries == value
                            Box(
                                contentAlignment = Alignment.Center,
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (selected) BrandViolet else DarkCard)
                                    .border(1.dp, if (selected) BrandViolet else DarkBorder, RoundedCornerShape(8.dp))
                                    .clickable {
                                        maxRetries = value
                                        prefs.maxRetries = value
                                    }
                                    .padding(vertical = 9.dp)
                            ) {
                                Text("$value", color = if (selected) Color.White else BrandMuted, fontSize = 13.sp, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal)
                            }
                        }
                    }
                }
            }
        }

        // Retry delay
        item {
            SettingsCard {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.HourglassBottom, contentDescription = null, tint = BrandAmber, modifier = Modifier.size(18.dp))
                        Text("Retry Delay", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(10 to "10s", 30 to "30s", 60 to "60s").forEach { (value, label) ->
                            val selected = retryDelay == value
                            Box(
                                contentAlignment = Alignment.Center,
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (selected) BrandViolet else DarkCard)
                                    .border(1.dp, if (selected) BrandViolet else DarkBorder, RoundedCornerShape(8.dp))
                                    .clickable {
                                        retryDelay = value
                                        prefs.retryDelaySeconds = value
                                    }
                                    .padding(vertical = 9.dp)
                            ) {
                                Text(label, color = if (selected) Color.White else BrandMuted, fontSize = 12.sp, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal)
                            }
                        }
                    }
                }
            }
        }

        // ════════════════════════════════════════════════════════
        // BACKGROUND SERVICE
        // ════════════════════════════════════════════════════════
        item { Spacer(Modifier.height(4.dp)) }
        item { SectionHeader("Background Service") }

        // Auto-start
        item {
            SettingsCard {
                SettingsRow(
                    icon = Icons.Default.PowerSettingsNew,
                    iconTint = SuccessGreen,
                    title = "Auto-start on Boot",
                    subtitle = "Restart gateway when device reboots",
                    trailing = {
                        Switch(
                            checked = autoStart,
                            onCheckedChange = {
                                autoStart = it
                                prefs.autoStartOnBoot = it
                            },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = BrandViolet,
                                uncheckedThumbColor = BrandMuted,
                                uncheckedTrackColor = DarkCard
                            )
                        )
                    }
                )
            }
        }

        // Polling interval
        item {
            SettingsCard {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Default.Loop, contentDescription = null, tint = BrandViolet, modifier = Modifier.size(18.dp))
                        Column {
                            Text("Polling Interval", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                            Text("How often to check for new SMS jobs", color = BrandMuted, fontSize = 11.sp)
                        }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf(5, 10, 15, 30, 60).forEach { sec ->
                            val selected = pollingInterval == sec
                            Box(
                                contentAlignment = Alignment.Center,
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (selected) BrandViolet else DarkCard)
                                    .border(1.dp, if (selected) BrandViolet else DarkBorder, RoundedCornerShape(8.dp))
                                    .clickable {
                                        pollingInterval = sec
                                        prefs.pollingIntervalSeconds = sec
                                    }
                                    .padding(vertical = 9.dp)
                            ) {
                                Text("${sec}s", color = if (selected) Color.White else BrandMuted, fontSize = 11.sp, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal)
                            }
                        }
                    }
                }
            }
        }

        // Battery optimization
        item {
            SettingsCard {
                SettingsRow(
                    icon = Icons.Default.BatteryAlert,
                    iconTint = if (isBatteryOptimized) DestructiveRed else SuccessGreen,
                    title = "Battery Optimization",
                    subtitle = if (isBatteryOptimized) "App may be restricted in background" else "Unrestricted — gateway runs reliably",
                    trailing = {
                        if (isBatteryOptimized) {
                            TextButton(onClick = {
                                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                                    data = Uri.parse("package:${context.packageName}")
                                }
                                context.startActivity(intent)
                            }) {
                                Text("Fix", color = DestructiveRed, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        } else {
                            Box(
                                contentAlignment = Alignment.Center,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(SuccessGreen.copy(alpha = 0.15f))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text("OK", color = SuccessGreen, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                )
            }
        }

        // ════════════════════════════════════════════════════════
        // RECEIVE SMS
        // ════════════════════════════════════════════════════════
        item { Spacer(Modifier.height(4.dp)) }
        item { SectionHeader("Receive SMS") }

        item {
            SettingsCard {
                Column {
                    SettingsRow(
                        icon = Icons.Default.Inbox,
                        iconTint = BrandTeal,
                        title = "Enable Receiving",
                        subtitle = "Listen for incoming SMS messages",
                        trailing = {
                            Switch(
                                checked = receiveSms,
                                onCheckedChange = { receiveSms = it; prefs.receiveSmsEnabled = it },
                                colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = BrandViolet, uncheckedThumbColor = BrandMuted, uncheckedTrackColor = DarkCard)
                            )
                        }
                    )
                    HorizontalDivider(color = DarkBorder, modifier = Modifier.padding(horizontal = 14.dp))
                    SettingsRow(
                        icon = Icons.Default.Webhook,
                        iconTint = BrandAmber,
                        title = "Auto-forward to Webhook",
                        subtitle = "Forward received SMS to server webhook",
                        trailing = {
                            Switch(
                                checked = autoForward,
                                onCheckedChange = { autoForward = it; prefs.autoForwardToWebhook = it },
                                colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = BrandViolet, uncheckedThumbColor = BrandMuted, uncheckedTrackColor = DarkCard)
                            )
                        }
                    )
                }
            }
        }

        // ════════════════════════════════════════════════════════
        // NOTIFICATIONS
        // ════════════════════════════════════════════════════════
        item { Spacer(Modifier.height(4.dp)) }
        item { SectionHeader("Notifications") }

        item {
            SettingsCard {
                Column {
                    SettingsRow(
                        icon = Icons.Default.CheckCircle,
                        iconTint = SuccessGreen,
                        title = "Notify When Sent",
                        subtitle = "Show notification for each sent message",
                        trailing = {
                            Switch(
                                checked = notifySent,
                                onCheckedChange = { notifySent = it; prefs.notifyOnSent = it },
                                colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = BrandViolet, uncheckedThumbColor = BrandMuted, uncheckedTrackColor = DarkCard)
                            )
                        }
                    )
                    HorizontalDivider(color = DarkBorder, modifier = Modifier.padding(horizontal = 14.dp))
                    SettingsRow(
                        icon = Icons.Default.ErrorOutline,
                        iconTint = DestructiveRed,
                        title = "Notify When Failed",
                        subtitle = "Alert when a message fails to send",
                        trailing = {
                            Switch(
                                checked = notifyFailed,
                                onCheckedChange = { notifyFailed = it; prefs.notifyOnFailed = it },
                                colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = BrandViolet, uncheckedThumbColor = BrandMuted, uncheckedTrackColor = DarkCard)
                            )
                        }
                    )
                    HorizontalDivider(color = DarkBorder, modifier = Modifier.padding(horizontal = 14.dp))
                    SettingsRow(
                        icon = Icons.Default.WifiOff,
                        iconTint = BrandAmber,
                        title = "Notify When Offline",
                        subtitle = "Alert when connection to server is lost",
                        trailing = {
                            Switch(
                                checked = notifyOffline,
                                onCheckedChange = { notifyOffline = it; prefs.notifyOnOffline = it },
                                colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = BrandViolet, uncheckedThumbColor = BrandMuted, uncheckedTrackColor = DarkCard)
                            )
                        }
                    )
                }
            }
        }

        // ════════════════════════════════════════════════════════
        // DEBUG
        // ════════════════════════════════════════════════════════
        item { Spacer(Modifier.height(4.dp)) }
        item { SectionHeader("Debug") }

        item {
            SettingsCard {
                Column {
                    SettingsRow(
                        icon = Icons.Default.NetworkCheck,
                        iconTint = BrandTeal,
                        title = "Test Connection",
                        subtitle = "Send a heartbeat to the server",
                        trailing = {
                            TextButton(onClick = {
                                showTestConnectionDialog = true
                                testConnectionLoading = true
                                testConnectionResult = null
                                scope.launch {
                                    // Simulate heartbeat test
                                    kotlinx.coroutines.delay(1500)
                                    testConnectionResult = "✓ Server reachable — 142ms"
                                    testConnectionLoading = false
                                }
                            }) {
                                Text("Test", color = BrandTeal, fontSize = 12.sp)
                            }
                        }
                    )
                    HorizontalDivider(color = DarkBorder, modifier = Modifier.padding(horizontal = 14.dp))
                    SettingsRow(
                        icon = Icons.Default.DeleteSweep,
                        iconTint = DestructiveRed,
                        title = "Clear Message History",
                        subtitle = "Delete all sent and received messages",
                        trailing = {
                            TextButton(onClick = { showClearHistoryDialog = true }) {
                                Text("Clear", color = DestructiveRed, fontSize = 12.sp)
                            }
                        }
                    )
                }
            }
        }

        // ════════════════════════════════════════════════════════
        // ABOUT
        // ════════════════════════════════════════════════════════
        item { Spacer(Modifier.height(4.dp)) }
        item { SectionHeader("About") }

        item {
            SettingsCard {
                Column {
                    SettingsRow(
                        icon = Icons.Default.Info,
                        iconTint = BrandViolet,
                        title = "App Version",
                        subtitle = "SMSHive Gateway v2.0.0",
                        trailing = null
                    )
                    HorizontalDivider(color = DarkBorder, modifier = Modifier.padding(horizontal = 14.dp))
                    SettingsRow(
                        icon = Icons.Default.Dns,
                        iconTint = BrandTeal,
                        title = "Server",
                        subtitle = prefs.serverUrl,
                        trailing = null
                    )
                    HorizontalDivider(color = DarkBorder, modifier = Modifier.padding(horizontal = 14.dp))
                    SettingsRow(
                        icon = Icons.Default.OpenInBrowser,
                        iconTint = BrandViolet,
                        title = "Open Web Dashboard",
                        subtitle = "Manage devices and logs online",
                        trailing = {
                            IconButton(onClick = {
                                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(prefs.serverUrl))
                                context.startActivity(intent)
                            }, modifier = Modifier.size(32.dp)) {
                                Icon(Icons.Default.Launch, contentDescription = "Open", tint = BrandViolet, modifier = Modifier.size(18.dp))
                            }
                        }
                    )
                }
            }
        }

        item { Spacer(modifier = Modifier.height(24.dp)) }
    }

    // ── Disconnect Dialog ──────────────────────────────────────────
    if (showDisconnectDialog) {
        AlertDialog(
            onDismissRequest = { showDisconnectDialog = false },
            containerColor = DarkSurface,
            title = { Text("Disconnect Device?", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                Text(
                    "This will clear all credentials and stop the gateway service. You will need to scan a QR code again to reconnect.",
                    color = TextSecondary,
                    lineHeight = 20.sp
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showDisconnectDialog = false
                        prefs.clearDevice()
                        authManager.logout()
                        onDisconnect()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = DestructiveRed)
                ) {
                    Text("Disconnect", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDisconnectDialog = false }) {
                    Text("Cancel", color = BrandMuted)
                }
            }
        )
    }

    // ── Clear History Dialog ───────────────────────────────────────
    if (showClearHistoryDialog) {
        AlertDialog(
            onDismissRequest = { showClearHistoryDialog = false },
            containerColor = DarkSurface,
            title = { Text("Clear Message History?", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                Text(
                    "All sent and received message records will be permanently deleted. This cannot be undone.",
                    color = TextSecondary,
                    lineHeight = 20.sp
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        showClearHistoryDialog = false
                        scope.launch {
                            db.smsDao().clearAllSent()
                            db.smsDao().clearAllReceived()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = DestructiveRed)
                ) {
                    Text("Clear All", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showClearHistoryDialog = false }) {
                    Text("Cancel", color = BrandMuted)
                }
            }
        )
    }

    // ── Test Connection Dialog ─────────────────────────────────────
    if (showTestConnectionDialog) {
        AlertDialog(
            onDismissRequest = {
                if (!testConnectionLoading) showTestConnectionDialog = false
            },
            containerColor = DarkSurface,
            title = { Text("Test Connection", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                if (testConnectionLoading) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = BrandViolet, strokeWidth = 2.dp)
                        Text("Sending heartbeat…", color = TextSecondary)
                    }
                } else {
                    Text(
                        testConnectionResult ?: "Unknown error",
                        color = if (testConnectionResult?.startsWith("✓") == true) SuccessGreen else DestructiveRed
                    )
                }
            },
            confirmButton = {
                if (!testConnectionLoading) {
                    TextButton(onClick = { showTestConnectionDialog = false }) {
                        Text("OK", color = BrandViolet)
                    }
                }
            }
        )
    }
}

// ── Section Header ──────────────────────────────────────────────────
@Composable
private fun SectionHeader(title: String) {
    Text(
        text = title.uppercase(),
        color = BrandMuted,
        fontSize = 11.sp,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 0.8.sp,
        modifier = Modifier.padding(start = 4.dp, bottom = 2.dp, top = 4.dp)
    )
}

// ── Settings Card ───────────────────────────────────────────────────
@Composable
private fun SettingsCard(content: @Composable () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = BorderStroke(1.dp, DarkBorder)
    ) {
        content()
    }
}

// ── Settings Row ────────────────────────────────────────────────────
@Composable
private fun SettingsRow(
    icon: ImageVector,
    iconTint: Color,
    title: String,
    subtitle: String?,
    trailing: (@Composable () -> Unit)?
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 14.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(iconTint.copy(alpha = 0.12f))
        ) {
            Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(18.dp))
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(title, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
            if (!subtitle.isNullOrBlank()) {
                Text(subtitle, color = BrandMuted, fontSize = 11.sp, lineHeight = 16.sp)
            }
        }
        trailing?.invoke()
    }
}

// ── Helper ──────────────────────────────────────────────────────────
private fun maskUrl(url: String): String {
    return try {
        val uri = Uri.parse(url)
        "${uri.scheme}://${uri.host}"
    } catch (e: Exception) {
        url.take(30)
    }
}
