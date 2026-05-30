package app.smshive.gateway.ui.tabs

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.smshive.gateway.data.AppDatabase
import app.smshive.gateway.data.PreferencesManager
import app.smshive.gateway.data.SentMessage
import app.smshive.gateway.ui.theme.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun DashboardTab(
    prefs: PreferencesManager,
    db: AppDatabase,
    gatewayActive: Boolean,
    onToggle: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    // ── Time anchors ──────────────────────────────────────────────
    val startOfDay = remember {
        Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }.timeInMillis
    }
    val startOfMonth = remember {
        Calendar.getInstance().apply {
            set(Calendar.DAY_OF_MONTH, 1); set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }.timeInMillis
    }

    // ── DB flows ──────────────────────────────────────────────────
    val sentToday by db.smsDao().getSentTodayCount(startOfDay).collectAsState(initial = 0)
    val sentMonth by db.smsDao().getSentThisMonthCount(startOfMonth).collectAsState(initial = 0)
    val deliveredToday by db.smsDao().getDeliveredTodayCount(startOfDay).collectAsState(initial = 0)
    val recentMessages by db.smsDao().getRecentSent().collectAsState(initial = emptyList())

    // ── Local prefs state ─────────────────────────────────────────
    var simPref by remember { mutableStateOf(prefs.simPreference) }
    var pollingInterval by remember { mutableStateOf(prefs.pollingIntervalSeconds) }
    var sendDelay by remember { mutableStateOf(prefs.sendDelaySeconds) }
    var autoStart by remember { mutableStateOf(prefs.autoStartOnBoot) }

    // ── Pulsing animation ──────────────────────────────────────────
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseAlpha"
    )
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    // ── Last sync ─────────────────────────────────────────────────
    val lastSyncText = remember(prefs.lastHeartbeatAt) {
        val diff = System.currentTimeMillis() - prefs.lastHeartbeatAt
        when {
            prefs.lastHeartbeatAt == 0L -> "Never"
            diff < 60_000 -> "${diff / 1000}s ago"
            diff < 3_600_000 -> "${diff / 60_000}m ago"
            else -> "${diff / 3_600_000}h ago"
        }
    }

    val successPct = if (sentToday > 0) (deliveredToday * 100) / sentToday else 0

    val isXiaomi = remember {
        val man = android.os.Build.MANUFACTURER.lowercase(java.util.Locale.getDefault())
        man.contains("xiaomi") || man.contains("redmi") || man.contains("poco")
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBg),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {

        // ── Header ─────────────────────────────────────────────
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = prefs.deviceName,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp
                    )
                    val deviceId = prefs.deviceId.take(16)
                    Text(
                        text = if (prefs.deviceId.length > 16) "$deviceId…" else deviceId,
                        color = BrandTeal,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        modifier = Modifier.clickable {
                            val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            cm.setPrimaryClip(ClipData.newPlainText("Device ID", prefs.deviceId))
                        }
                    )
                }
                IconButton(onClick = { /* Settings navigation placeholder */ }) {
                    Icon(Icons.Default.Settings, contentDescription = "Settings", tint = BrandMuted)
                }
            }
        }

        // ── Xiaomi/HyperOS Permission Warning ──────────────────
        if (isXiaomi) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF2C1B1B)),
                    border = BorderStroke(1.dp, Color(0xFFDC2626))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                tint = Color(0xFFF87171),
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Xiaomi/HyperOS Action Required",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                        }
                        Text(
                            text = "MIUI/HyperOS strictly blocks background SMS sending by default. You MUST enable this permission manually to send SMS OTPs.",
                            color = Color(0xFFFCA5A5),
                            fontSize = 11.sp,
                            lineHeight = 15.sp
                        )
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(38.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFFDC2626))
                                .clickable {
                                    try {
                                        val intent = android.content.Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                                            data = android.net.Uri.parse("package:" + context.packageName)
                                        }
                                        context.startActivity(intent)
                                    } catch (e: Exception) {
                                        e.printStackTrace()
                                    }
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Enable 'Other Permissions' -> 'Send SMS'",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }
        }

        // ── Status Card ────────────────────────────────────────
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                border = BorderStroke(1.dp, DarkBorder)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 28.dp, horizontal = 24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Big pulsing button
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .size(130.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.radialGradient(
                                    colors = if (gatewayActive)
                                        listOf(BrandTeal.copy(alpha = 0.25f), Color.Transparent)
                                    else
                                        listOf(BrandViolet.copy(alpha = 0.20f), Color.Transparent)
                                )
                            )
                    ) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .size(90.dp)
                                .scale(if (gatewayActive) pulseScale else 1f)
                                .clip(CircleShape)
                                .background(
                                    if (gatewayActive) BrandTeal.copy(alpha = pulseAlpha)
                                    else BrandViolet.copy(alpha = 0.6f)
                                )
                                .clickable { onToggle() }
                        ) {
                            Icon(
                                imageVector = if (gatewayActive) Icons.Default.CheckCircle else Icons.Default.Circle,
                                contentDescription = "Toggle Gateway",
                                tint = Color.White,
                                modifier = Modifier.size(36.dp)
                            )
                        }
                    }

                    // Status text
                    Text(
                        text = if (gatewayActive) "GATEWAY ONLINE ✓" else "GATEWAY OFFLINE",
                        color = if (gatewayActive) BrandTeal else BrandMuted,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp,
                        letterSpacing = 0.5.sp
                    )

                    // Info chips
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        InfoChip(
                            icon = Icons.Default.BatteryFull,
                            label = "${prefs.lastBatteryLevel}%"
                        )
                        InfoChip(
                            icon = Icons.Default.Wifi,
                            label = prefs.lastNetworkType
                        )
                        InfoChip(
                            icon = Icons.Default.Sync,
                            label = lastSyncText
                        )
                    }
                }
            }
        }

        // ── Stats Row ──────────────────────────────────────────
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "Sent Today",
                    value = sentToday.toString(),
                    subtitle = "messages"
                )
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "This Month",
                    value = sentMonth.toString(),
                    subtitle = "messages"
                )
                StatCard(
                    modifier = Modifier.weight(1f),
                    title = "Success %",
                    value = "$successPct%",
                    subtitle = "delivered"
                )
            }
        }

        // ── SIM Selector Card ──────────────────────────────────
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                border = BorderStroke(1.dp, DarkBorder)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.SimCard, contentDescription = null, tint = BrandViolet, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("SIM Selection", color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("SIM 1" to 0, "SIM 2" to 1, "Auto" to -1).forEach { (label, value) ->
                            val selected = simPref == value
                            Box(
                                contentAlignment = Alignment.Center,
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (selected) BrandViolet else DarkCard)
                                    .border(1.dp, if (selected) BrandViolet else DarkBorder, RoundedCornerShape(10.dp))
                                    .clickable {
                                        simPref = value
                                        prefs.simPreference = value
                                    }
                                    .padding(vertical = 10.dp)
                            ) {
                                Text(
                                    text = label,
                                    color = if (selected) Color.White else BrandMuted,
                                    fontSize = 13.sp,
                                    fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                                )
                            }
                        }
                    }
                }
            }
        }

        // ── Config Card ────────────────────────────────────────
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                border = BorderStroke(1.dp, DarkBorder)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(18.dp)
                ) {
                    // Polling interval
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Polling Interval", color = TextSecondary, fontSize = 12.sp)
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
                                        .padding(vertical = 8.dp)
                                ) {
                                    Text(
                                        text = "${sec}s",
                                        color = if (selected) Color.White else BrandMuted,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }

                    // Send delay
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Send Delay: ${sendDelay}s", color = Color.White, fontSize = 13.sp)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = {
                                    if (sendDelay > 0) {
                                        sendDelay--
                                        prefs.sendDelaySeconds = sendDelay
                                    }
                                },
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(Icons.Default.Remove, contentDescription = "Decrease", tint = BrandMuted)
                            }
                            Text(
                                text = sendDelay.toString(),
                                color = BrandViolet,
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                modifier = Modifier.width(28.dp),
                                textAlign = TextAlign.Center
                            )
                            IconButton(
                                onClick = {
                                    if (sendDelay < 10) {
                                        sendDelay++
                                        prefs.sendDelaySeconds = sendDelay
                                    }
                                },
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = "Increase", tint = BrandMuted)
                            }
                        }
                    }

                    // Auto-start switch
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Auto-start on boot", color = Color.White, fontSize = 13.sp)
                            Text("Restart gateway when device reboots", color = BrandMuted, fontSize = 11.sp)
                        }
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

                    // Big toggle button
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(
                                if (gatewayActive)
                                    Brush.horizontalGradient(listOf(DestructiveRed, Color(0xFFDC2626)))
                                else
                                    Brush.horizontalGradient(listOf(BrandViolet, BrandTeal))
                            )
                            .clickable { onToggle() },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = if (gatewayActive) Icons.Default.Stop else Icons.Default.PlayArrow,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                            Text(
                                text = if (gatewayActive) "STOP GATEWAY" else "START GATEWAY",
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                letterSpacing = 0.5.sp
                            )
                        }
                    }
                }
            }
        }

        // ── Recent Dispatches ──────────────────────────────────
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Recent Dispatches",
                    color = Color.White,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp
                )
                TextButton(onClick = { /* Navigate to logs */ }) {
                    Text("View All", color = BrandViolet, fontSize = 12.sp)
                }
            }
        }

        val displayMessages = recentMessages.take(5)
        if (displayMessages.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No messages yet", color = BrandMuted, fontSize = 13.sp)
                }
            }
        } else {
            items(displayMessages, key = { it.id }) { msg ->
                DispatchItem(msg = msg, onRetry = { /* retry lambda */ })
            }
        }

        item { Spacer(modifier = Modifier.height(8.dp)) }
    }
}

// ── Info Chip ──────────────────────────────────────────────────────
@Composable
private fun InfoChip(icon: ImageVector, label: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(DarkCard)
            .border(1.dp, DarkBorder, RoundedCornerShape(20.dp))
            .padding(horizontal = 10.dp, vertical = 5.dp)
    ) {
        Icon(icon, contentDescription = null, tint = BrandMuted, modifier = Modifier.size(12.dp))
        Text(label, color = TextSecondary, fontSize = 11.sp)
    }
}

// ── Stat Card ──────────────────────────────────────────────────────
@Composable
private fun StatCard(modifier: Modifier = Modifier, title: String, value: String, subtitle: String) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = BorderStroke(1.dp, DarkBorder)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 14.dp, horizontal = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(title, color = BrandMuted, fontSize = 11.sp, textAlign = TextAlign.Center)
            Text(
                value,
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 22.sp,
                textAlign = TextAlign.Center
            )
            Text(subtitle, color = BrandMuted, fontSize = 10.sp, textAlign = TextAlign.Center)
        }
    }
}

// ── Dispatch Item ──────────────────────────────────────────────────
@Composable
private fun DispatchItem(msg: SentMessage, onRetry: (SentMessage) -> Unit) {
    var expanded by remember { mutableStateOf(false) }

    val statusColor = when (msg.status) {
        "DELIVERED" -> BrandTeal
        "FAILED" -> DestructiveRed
        "PENDING" -> BrandAmber
        else -> BrandViolet
    }

    val timeText = remember(msg.sentAt) {
        val diff = System.currentTimeMillis() - msg.sentAt
        when {
            diff < 60_000 -> "${diff / 1000}s ago"
            diff < 3_600_000 -> "${diff / 60_000}m ago"
            else -> "${diff / 3_600_000}h ago"
        }
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { expanded = !expanded },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = DarkCard),
        border = BorderStroke(1.dp, DarkBorder)
    ) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    msg.recipient,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    modifier = Modifier.weight(1f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(statusColor.copy(alpha = 0.15f))
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(msg.status, color = statusColor, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
                    }
                    Text(timeText, color = BrandMuted, fontSize = 10.sp)
                }
            }

            if (expanded) {
                Text(
                    msg.message,
                    color = TextSecondary,
                    fontSize = 12.sp,
                    modifier = Modifier.fillMaxWidth()
                )
                val sdf = remember { SimpleDateFormat("dd MMM yyyy, HH:mm:ss", Locale.getDefault()) }
                Text(
                    sdf.format(Date(msg.sentAt)),
                    color = BrandMuted,
                    fontSize = 10.sp
                )
                if (msg.status == "FAILED") {
                    msg.errorMessage?.let {
                        Text("Error: $it", color = DestructiveRed, fontSize = 11.sp)
                    }
                    OutlinedButton(
                        onClick = { onRetry(msg) },
                        modifier = Modifier.fillMaxWidth(),
                        border = BorderStroke(1.dp, BrandViolet),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null, tint = BrandViolet, modifier = Modifier.size(14.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Retry", color = BrandViolet, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
