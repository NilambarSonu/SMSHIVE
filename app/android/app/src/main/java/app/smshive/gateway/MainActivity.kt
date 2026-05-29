package app.smshive.gateway

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import app.smshive.gateway.data.*
import app.smshive.gateway.service.SmsGatewayForegroundService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.UUID

// Colors matching the web dashboard
val DarkBg = Color(0xFF0A0A0F)
val DarkSurface = Color(0xFF111118)
val DarkBorder = Color(0xFF1E1E2E)
val BrandViolet = Color(0xFF6C63FF)
val BrandTeal = Color(0xFF00D4AA)
val BrandMuted = Color(0xFF6B7280)

@OptIn(ExperimentalMaterial3Api::class)
class MainActivity : ComponentActivity() {
    private lateinit var prefs: PreferencesManager
    private lateinit var db: AppDatabase

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.all { it.value }
        if (allGranted) {
            Toast.makeText(this, "Permissions granted successfully", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, "SMS permissions are required for gateway dispatching", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prefs = PreferencesManager(this)
        db = AppDatabase.getDatabase(this)

        // Initialize unique device id if empty
        if (prefs.deviceId.isEmpty()) {
            prefs.deviceId = "device_" + UUID.randomUUID().toString().substring(0, 8)
        }

        checkAndRequestPermissions()

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = DarkBg,
                    surface = DarkSurface,
                    primary = BrandViolet,
                    secondary = BrandTeal,
                    outline = DarkBorder
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = DarkBg
                ) {
                    MainScreen(prefs, db)
                }
            }
        }
    }

    private fun checkAndRequestPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.SEND_SMS,
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.READ_SMS,
            Manifest.permission.READ_PHONE_STATE
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val missing = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missing.isNotEmpty()) {
            requestPermissionLauncher.launch(missing.toTypedArray())
        }
    }
}

@Composable
fun MainScreen(prefs: PreferencesManager, db: AppDatabase) {
    val context = LocalContext.current
    var activeTab by remember { mutableStateOf(0) }
    var gatewayActive by remember { mutableStateOf(prefs.gatewayEnabled) }

    // Start/Stop service handler
    val toggleGateway = {
        val nextState = !gatewayActive
        gatewayActive = nextState
        prefs.gatewayEnabled = nextState
        
        val intent = Intent(context, SmsGatewayForegroundService::class.java).apply {
            action = if (nextState) SmsGatewayForegroundService.ACTION_START else SmsGatewayForegroundService.ACTION_STOP
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent)
        } else {
            context.startService(intent)
        }
    }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = DarkSurface,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = activeTab == 0,
                    onClick = { activeTab = 0 },
                    icon = { Icon(Icons.Default.Home, contentDescription = "Dashboard") },
                    label = { Text("Dashboard", fontWeight = FontWeight.Bold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = BrandViolet,
                        unselectedIconColor = BrandMuted,
                        selectedTextColor = BrandViolet,
                        unselectedTextColor = BrandMuted
                    )
                )
                NavigationBarItem(
                    selected = activeTab == 1,
                    onClick = { activeTab = 1 },
                    icon = { Icon(Icons.Default.MailOutline, contentDescription = "Inbox") },
                    label = { Text("Inbox", fontWeight = FontWeight.Bold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = BrandViolet,
                        unselectedIconColor = BrandMuted,
                        selectedTextColor = BrandViolet,
                        unselectedTextColor = BrandMuted
                    )
                )
                NavigationBarItem(
                    selected = activeTab == 2,
                    onClick = { activeTab = 2 },
                    icon = { Icon(Icons.Default.Settings, contentDescription = "Settings") },
                    label = { Text("Settings", fontWeight = FontWeight.Bold) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = BrandViolet,
                        unselectedIconColor = BrandMuted,
                        selectedTextColor = BrandViolet,
                        unselectedTextColor = BrandMuted
                    )
                )
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(DarkBg)
                .padding(padding)
        ) {
            when (activeTab) {
                0 -> DashboardTab(prefs, db, gatewayActive, { toggleGateway() })
                1 -> InboxTab(db)
                2 -> SettingsTab(prefs)
            }
        }
    }
}

@Composable
fun DashboardTab(
    prefs: PreferencesManager,
    db: AppDatabase,
    gatewayActive: Boolean,
    onToggle: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    val recentSent by db.smsDao().getRecentSent().collectAsState(initial = emptyList())
    val clipboardManager = LocalClipboardManager.current

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Status Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DarkBorder, RoundedCornerShape(20.dp))
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = prefs.deviceName,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    
                    Spacer(modifier = Modifier.height(4.dp))
                    
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clickable {
                            clipboardManager.setText(AnnotatedString(prefs.deviceId))
                            Toast.makeText(context, "Copied Device ID", Toast.LENGTH_SHORT).show()
                        }
                    ) {
                        Text(
                            text = "ID: ${prefs.deviceId}",
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Monospace,
                            color = BrandMuted
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            Icons.Default.Share, 
                            contentDescription = "Copy",
                            tint = BrandViolet,
                            modifier = Modifier.size(12.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Gateway big toggle button
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .size(130.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.radialGradient(
                                    colors = if (gatewayActive) listOf(BrandTeal.copy(alpha = 0.2f), Color.Transparent)
                                    else listOf(BrandViolet.copy(alpha = 0.2f), Color.Transparent)
                                )
                            )
                            .clickable { onToggle() }
                    ) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .size(90.dp)
                                .clip(CircleShape)
                                .background(if (gatewayActive) BrandTeal else BrandViolet)
                        ) {
                            Icon(
                                imageVector = if (gatewayActive) Icons.Default.Check else Icons.Default.Refresh,
                                contentDescription = "Status",
                                tint = Color.White,
                                modifier = Modifier.size(36.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = if (gatewayActive) "GATEWAY ONLINE" else "GATEWAY STOPPED",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (gatewayActive) BrandTeal else Color.White
                    )
                }
            }
        }

        // SIM and delay configs quick view
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Gateway Configuration",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Polling interval: ${prefs.pollingIntervalSeconds} seconds",
                        fontSize = 12.sp,
                        color = BrandMuted
                    )
                    Text(
                        text = "SMS Send Delay: ${prefs.sendDelaySeconds} second",
                        fontSize = 12.sp,
                        color = BrandMuted
                    )
                }
            }
        }

        // Recent Dispatches
        item {
            Text(
                text = "Recent Dispatches",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }

        if (recentSent.isEmpty()) {
            item {
                Text(
                    text = "No dispatches completed yet.",
                    fontSize = 12.sp,
                    color = BrandMuted,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth().padding(24.dp)
                )
            }
        } else {
            items(recentSent) { msg ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = DarkSurface),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(BrandViolet.copy(alpha = 0.1f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Send, contentDescription = "Sent", tint = BrandViolet, modifier = Modifier.size(14.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = msg.recipient, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Text(text = msg.message, fontSize = 11.sp, color = BrandMuted, maxLines = 1)
                        }
                        Text(
                            text = msg.status,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (msg.status == "DELIVERED") BrandTeal else BrandViolet,
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(if (msg.status == "DELIVERED") BrandTeal.copy(alpha = 0.1f) else BrandViolet.copy(alpha = 0.1f))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun InboxTab(db: AppDatabase) {
    val recentReceived by db.smsDao().getRecentReceived().collectAsState(initial = emptyList())

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Inbox Feed (Incoming Messages)",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        if (recentReceived.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(text = "No incoming messages captured.", color = BrandMuted, fontSize = 14.sp)
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(recentReceived) { msg ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = DarkSurface),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = msg.sender,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Text(
                                    text = "FORWARDED",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = BrandTeal,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(BrandTeal.copy(alpha = 0.1f))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(text = msg.message, fontSize = 12.sp, color = BrandMuted)
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsTab(prefs: PreferencesManager) {
    val context = LocalContext.current
    var serverUrl by remember { mutableStateOf(prefs.serverUrl) }
    var apiKey by remember { mutableStateOf(prefs.apiKey) }
    var name by remember { mutableStateOf(prefs.deviceName) }
    var showApiKey by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Gateway Settings",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        // Connection Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = "Connection & API Details",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Color.White
                    )

                    OutlinedTextField(
                        value = serverUrl,
                        onValueChange = { serverUrl = it; prefs.serverUrl = it },
                        label = { Text("Server URL") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandViolet,
                            unfocusedBorderColor = DarkBorder,
                            focusedLabelColor = BrandViolet,
                            unfocusedLabelColor = BrandMuted
                        )
                    )

                    OutlinedTextField(
                        value = apiKey,
                        onValueChange = { apiKey = it; prefs.apiKey = it },
                        label = { Text("API Key") },
                        visualTransformation = if (showApiKey) VisualTransformation.None else PasswordVisualTransformation(),
                        trailingIcon = {
                            IconButton(onClick = { showApiKey = !showApiKey }) {
                                Icon(
                                    imageVector = if (showApiKey) Icons.Default.Lock else Icons.Default.PlayArrow,
                                    contentDescription = "Show",
                                    tint = BrandViolet
                                )
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandViolet,
                            unfocusedBorderColor = DarkBorder,
                            focusedLabelColor = BrandViolet,
                            unfocusedLabelColor = BrandMuted
                        )
                    )

                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it; prefs.deviceName = it },
                        label = { Text("Device Name") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandViolet,
                            unfocusedBorderColor = DarkBorder,
                            focusedLabelColor = BrandViolet,
                            unfocusedLabelColor = BrandMuted
                        )
                    )
                }
            }
        }

        // Intervals Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = DarkSurface),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = "Intervals & Limits",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Color.White
                    )

                    var pollText by remember { mutableStateOf(prefs.pollingIntervalSeconds.toString()) }
                    OutlinedTextField(
                        value = pollText,
                        onValueChange = { 
                            pollText = it
                            it.toIntOrNull()?.let { seconds -> prefs.pollingIntervalSeconds = seconds }
                        },
                        label = { Text("Polling Interval (seconds)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandViolet,
                            unfocusedBorderColor = DarkBorder,
                            focusedLabelColor = BrandViolet,
                            unfocusedLabelColor = BrandMuted
                        )
                    )

                    var delayText by remember { mutableStateOf(prefs.sendDelaySeconds.toString()) }
                    OutlinedTextField(
                        value = delayText,
                        onValueChange = { 
                            delayText = it
                            it.toIntOrNull()?.let { seconds -> prefs.sendDelaySeconds = seconds }
                        },
                        label = { Text("Send SMS Delay (seconds)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandViolet,
                            unfocusedBorderColor = DarkBorder,
                            focusedLabelColor = BrandViolet,
                            unfocusedLabelColor = BrandMuted
                        )
                    )
                }
            }
        }

        // Test Registration
        item {
            Button(
                onClick = {
                    val api = ApiService.create(prefs.serverUrl)
                    CoroutineScope(Dispatchers.IO).launch {
                        try {
                            val res = api.registerDevice(
                                prefs.apiKey,
                                DeviceRegisterRequest(
                                    prefs.deviceId,
                                    prefs.deviceName,
                                    Build.MODEL
                                )
                            )
                            withContext(Dispatchers.Main) {
                                if (res.success) {
                                    Toast.makeText(context, "Registered on Dashboard successfully!", Toast.LENGTH_SHORT).show()
                                } else {
                                    Toast.makeText(context, "Registration failed: ${res.message}", Toast.LENGTH_LONG).show()
                                }
                            }
                        } catch (e: Exception) {
                            withContext(Dispatchers.Main) {
                                Toast.makeText(context, "Connection error: ${e.message}", Toast.LENGTH_LONG).show()
                            }
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = BrandViolet),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Register Device on Web Dashboard", fontWeight = FontWeight.Bold)
            }
        }
    }
}
