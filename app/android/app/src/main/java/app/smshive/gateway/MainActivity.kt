package app.smshive.gateway

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import android.content.pm.PackageManager
import androidx.navigation.compose.*
import app.smshive.gateway.data.*
import app.smshive.gateway.service.SmsGatewayForegroundService
import app.smshive.gateway.ui.*
import app.smshive.gateway.ui.tabs.*

val DarkBgMain = Color(0xFF0A0A0F)
val DarkSurfaceMain = Color(0xFF111118)
val BrandVioletMain = Color(0xFF6C63FF)
val BrandTealMain = Color(0xFF00D4AA)
val BrandMutedMain = Color(0xFF6B7280)

@OptIn(ExperimentalMaterial3Api::class)
class MainActivity : ComponentActivity() {
    private lateinit var prefs: PreferencesManager
    private lateinit var auth: AuthManager
    private lateinit var db: AppDatabase

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { /* permissions handled per-screen */ }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prefs = PreferencesManager(this)
        auth = AuthManager(this)
        db = AppDatabase.getDatabase(this)

        requestBasePermissions()

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = DarkBgMain,
                    surface = DarkSurfaceMain,
                    primary = BrandVioletMain,
                    secondary = BrandTealMain,
                    outline = Color(0xFF1E1E2E)
                )
            ) {
                Surface(modifier = Modifier.fillMaxSize(), color = DarkBgMain) {
                    SMSHiveApp(prefs = prefs, auth = auth, db = db, activity = this)
                }
            }
        }
    }

    private fun requestBasePermissions() {
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
        if (missing.isNotEmpty()) requestPermissionLauncher.launch(missing.toTypedArray())
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SMSHiveApp(
    prefs: PreferencesManager,
    auth: AuthManager,
    db: AppDatabase,
    activity: ComponentActivity
) {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "splash") {
        composable("splash") {
            SplashScreen(
                authManager = auth,
                prefs = prefs,
                onNavigate = { hasSession ->
                    if (hasSession) {
                        navController.navigate("main") {
                            popUpTo("splash") { inclusive = true }
                        }
                    } else {
                        navController.navigate("login") {
                            popUpTo("splash") { inclusive = true }
                        }
                    }
                }
            )
        }

        composable("login") {
            LoginScreen(
                authManager = auth,
                onSuccess = {
                    if (prefs.isRegistered()) {
                        navController.navigate("main") { popUpTo("login") { inclusive = true } }
                    } else {
                        navController.navigate("onboarding") { popUpTo("login") { inclusive = true } }
                    }
                }
            )
        }

        composable("onboarding") {
            OnboardingScreen(
                onScanQr = { navController.navigate("qr_scanner") },
                onManual = { navController.navigate("manual_setup") }
            )
        }

        composable("qr_scanner") {
            QrScannerScreen(
                prefs = prefs,
                onSuccess = {
                    navController.navigate("success") {
                        popUpTo("onboarding") { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() },
                onManual = { navController.navigate("manual_setup") }
            )
        }

        composable("manual_setup") {
            ManualSetupScreen(
                prefs = prefs,
                authManager = auth,
                onSuccess = {
                    navController.navigate("success") {
                        popUpTo("onboarding") { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable("success") {
            SuccessScreen(
                prefs = prefs,
                onNavigate = {
                    navController.navigate("main") {
                        popUpTo("success") { inclusive = true }
                    }
                }
            )
        }

        composable("main") {
            MainAppScreen(
                prefs = prefs,
                auth = auth,
                db = db,
                activity = activity,
                onDisconnect = {
                    prefs.clearDevice()
                    auth.logout()
                    navController.navigate("login") {
                        popUpTo("main") { inclusive = true }
                    }
                },
                onRescanQr = {
                    navController.navigate("qr_scanner")
                }
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScreen(
    prefs: PreferencesManager,
    auth: AuthManager,
    db: AppDatabase,
    activity: ComponentActivity,
    onDisconnect: () -> Unit,
    onRescanQr: () -> Unit
) {
    var activeTab by remember { mutableStateOf(0) }
    var gatewayActive by remember { mutableStateOf(prefs.gatewayEnabled) }

    val toggleGateway = {
        val next = !gatewayActive
        gatewayActive = next
        prefs.gatewayEnabled = next
        val intent = Intent(activity, SmsGatewayForegroundService::class.java).apply {
            action = if (next) SmsGatewayForegroundService.ACTION_START else SmsGatewayForegroundService.ACTION_STOP
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            activity.startForegroundService(intent)
        } else {
            activity.startService(intent)
        }
    }

    // Auto-start on first enter if prefs say enabled
    LaunchedEffect(Unit) {
        if (prefs.gatewayEnabled && !gatewayActive) {
            gatewayActive = true
            val intent = Intent(activity, SmsGatewayForegroundService::class.java).apply {
                action = SmsGatewayForegroundService.ACTION_START
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                activity.startForegroundService(intent)
            } else {
                activity.startService(intent)
            }
        }
    }

    Scaffold(
        containerColor = DarkBgMain,
        bottomBar = {
            NavigationBar(
                containerColor = DarkSurfaceMain,
                tonalElevation = 0.dp,
                modifier = Modifier.height(70.dp)
            ) {
                val items = listOf(
                    Triple(Icons.Default.Home, "Dashboard", 0),
                    Triple(Icons.Default.Inbox, "Inbox", 1),
                    Triple(Icons.Default.List, "Logs", 2),
                    Triple(Icons.Default.Settings, "Settings", 3)
                )
                items.forEach { (icon, label, index) ->
                    NavigationBarItem(
                        selected = activeTab == index,
                        onClick = { activeTab = index },
                        icon = {
                            Icon(icon, contentDescription = label, modifier = Modifier.size(22.dp))
                        },
                        label = {
                            Text(label, fontSize = 10.sp, fontWeight = if (activeTab == index) FontWeight.Bold else FontWeight.Normal)
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = BrandVioletMain,
                            unselectedIconColor = BrandMutedMain,
                            selectedTextColor = BrandVioletMain,
                            unselectedTextColor = BrandMutedMain,
                            indicatorColor = BrandVioletMain.copy(alpha = 0.15f)
                        )
                    )
                }
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(DarkBgMain)
                .padding(padding)
        ) {
            when (activeTab) {
                0 -> DashboardTab(prefs, db, gatewayActive) { toggleGateway() }
                1 -> InboxTab(db)
                2 -> LogsTab(db, prefs)
                3 -> SettingsTab(
                    prefs = prefs,
                    authManager = auth,
                    db = db,
                    onDisconnect = onDisconnect
                )
            }
        }
    }
}
