package app.smshive.gateway.ui

import android.Manifest
import android.os.Build
import android.widget.Toast
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.OpenInBrowser
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState
import com.google.gson.Gson
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
import app.smshive.gateway.data.*
import kotlinx.coroutines.*

val DarkBgScanner = Color(0xFF0A0A0F)
val BrandVioletScanner = Color(0xFF6C63FF)
val BrandTealScanner = Color(0xFF00D4AA)
val BrandMutedScanner = Color(0xFF6B7280)

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun QrScannerScreen(
    prefs: PreferencesManager,
    onSuccess: () -> Unit,
    onBack: () -> Unit,
    onManual: () -> Unit
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val cameraPermission = rememberPermissionState(Manifest.permission.CAMERA)
    var isProcessing by remember { mutableStateOf(false) }
    var statusMessage by remember { mutableStateOf("") }
    var scanSuccess by remember { mutableStateOf(false) }

    val scanLineAnim = rememberInfiniteTransition(label = "scan")
    val scanLineY by scanLineAnim.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scanLine"
    )

    LaunchedEffect(Unit) {
        if (!cameraPermission.status.isGranted) {
            cameraPermission.launchPermissionRequest()
        }
    }

    fun handleQrResult(rawValue: String) {
        if (isProcessing || scanSuccess) return
        isProcessing = true
        statusMessage = "Connecting to SMSHIVE..."

        try {
            val config = Gson().fromJson(rawValue, QrConfig::class.java)
            if (config.apiKey.isBlank() || config.serverUrl.isBlank()) {
                isProcessing = false
                statusMessage = "Invalid QR code. Please try again."
                return
            }

            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val api = ApiService.create(config.serverUrl)
                    val response = api.registerDevice(
                        config.apiKey,
                        DeviceRegisterRequest(
                            name = Build.MODEL,
                            model = Build.MODEL,
                            qrToken = config.qrToken,
                            deviceBrand = Build.BRAND,
                            androidVersion = Build.VERSION.RELEASE,
                            appVersion = "2.0.0"
                        )
                    )

                    withContext(Dispatchers.Main) {
                        if (response.success && response.data?.deviceId != null) {
                            prefs.apiKey = config.apiKey
                            prefs.serverUrl = config.serverUrl
                            prefs.deviceId = response.data.deviceId
                            prefs.deviceName = response.data.name ?: Build.MODEL
                            prefs.registeredAt = System.currentTimeMillis()
                            scanSuccess = true
                            statusMessage = "Connected!"
                            onSuccess()
                        } else {
                            isProcessing = false
                            statusMessage = response.message ?: "Registration failed"
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        isProcessing = false
                        statusMessage = "Connection failed: ${e.message?.take(60)}"
                    }
                }
            }
        } catch (e: Exception) {
            isProcessing = false
            statusMessage = "Invalid QR format"
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(DarkBgScanner)) {
        if (cameraPermission.status.isGranted && !isProcessing) {
            // Camera Preview
            AndroidView(
                factory = { ctx ->
                    val previewView = PreviewView(ctx)
                    val cameraProviderFuture = ProcessCameraProvider.getInstance(ctx)
                    cameraProviderFuture.addListener({
                        val cameraProvider = cameraProviderFuture.get()
                        val preview = Preview.Builder().build().also {
                            it.setSurfaceProvider(previewView.surfaceProvider)
                        }
                        val barcodeScanner = BarcodeScanning.getClient()
                        var lastScanTime = 0L
                        val imageAnalysis = ImageAnalysis.Builder()
                            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                            .build()
                            .also { analysis ->
                                analysis.setAnalyzer(ContextCompat.getMainExecutor(ctx)) { imageProxy ->
                                    val now = System.currentTimeMillis()
                                    if (now - lastScanTime > 800) {
                                        lastScanTime = now
                                        val mediaImage = imageProxy.image
                                        if (mediaImage != null) {
                                            val image = InputImage.fromMediaImage(
                                                mediaImage, imageProxy.imageInfo.rotationDegrees
                                            )
                                            barcodeScanner.process(image)
                                                .addOnSuccessListener { barcodes ->
                                                    barcodes.firstOrNull()?.rawValue?.let { raw ->
                                                        handleQrResult(raw)
                                                    }
                                                }
                                                .addOnCompleteListener { imageProxy.close() }
                                        } else {
                                            imageProxy.close()
                                        }
                                    } else {
                                        imageProxy.close()
                                    }
                                }
                            }
                        try {
                            cameraProvider.unbindAll()
                            cameraProvider.bindToLifecycle(lifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA, preview, imageAnalysis)
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }, ContextCompat.getMainExecutor(ctx))
                    previewView
                },
                modifier = Modifier.fillMaxSize()
            )

            // Dark overlay with transparent QR frame
            Box(modifier = Modifier.fillMaxSize()) {
                // Top dark overlay
                Box(modifier = Modifier.fillMaxWidth().fillMaxHeight(0.2f).background(Color.Black.copy(alpha = 0.6f)))
                // Bottom dark overlay
                Box(modifier = Modifier.fillMaxWidth().fillMaxHeight(0.3f).align(Alignment.BottomCenter).background(Color.Black.copy(alpha = 0.6f)))

                // QR frame with corner brackets
                Box(
                    modifier = Modifier.size(260.dp).align(Alignment.Center)
                ) {
                    // Animated scan line
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(2.dp)
                            .offset(y = (scanLineY * 256).dp)
                            .background(BrandVioletScanner.copy(alpha = 0.8f))
                    )

                    // Corner bracket decorations
                    val cornerSize = 24.dp
                    val cornerThickness = 3.dp
                    val cornerColor = BrandVioletScanner

                    // Top-left
                    Box(modifier = Modifier.size(cornerSize).border(width = cornerThickness, color = cornerColor, shape = RoundedCornerShape(topStart = 8.dp)).align(Alignment.TopStart))
                    // Top-right
                    Box(modifier = Modifier.size(cornerSize).border(width = cornerThickness, color = cornerColor, shape = RoundedCornerShape(topEnd = 8.dp)).align(Alignment.TopEnd))
                    // Bottom-left
                    Box(modifier = Modifier.size(cornerSize).border(width = cornerThickness, color = cornerColor, shape = RoundedCornerShape(bottomStart = 8.dp)).align(Alignment.BottomStart))
                    // Bottom-right
                    Box(modifier = Modifier.size(cornerSize).border(width = cornerThickness, color = cornerColor, shape = RoundedCornerShape(bottomEnd = 8.dp)).align(Alignment.BottomEnd))
                }
            }
        } else if (!cameraPermission.status.isGranted) {
            // No camera permission state
            Column(
                modifier = Modifier.fillMaxSize().padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text("Camera permission is required to scan QR codes", color = Color.White, textAlign = TextAlign.Center, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = { cameraPermission.launchPermissionRequest() },
                    colors = ButtonDefaults.buttonColors(containerColor = BrandVioletScanner)
                ) { Text("Grant Permission") }
            }
        }

        // Loading overlay
        if (isProcessing) {
            Box(
                modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.85f)),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    CircularProgressIndicator(color = BrandVioletScanner, strokeWidth = 3.dp, modifier = Modifier.size(48.dp))
                    Text(statusMessage.ifEmpty { "Connecting..." }, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Medium)
                }
            }
        }

        // Top bar
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp).statusBarsPadding().align(Alignment.TopStart),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Text("Scan QR Code", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }

        // Bottom instructions + manual link
        Column(
            modifier = Modifier.fillMaxWidth().align(Alignment.BottomCenter)
                .background(Color.Black.copy(alpha = 0.7f)).padding(20.dp).navigationBarsPadding(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            if (statusMessage.isNotEmpty() && !isProcessing) {
                Text(statusMessage, color = if (scanSuccess) BrandTealScanner else Color(0xFFEF4444), fontSize = 13.sp, textAlign = TextAlign.Center)
            } else {
                Text("Point the camera at the QR code on your SMSHIVE dashboard", color = Color.White.copy(alpha = 0.85f), fontSize = 13.sp, textAlign = TextAlign.Center)
                Text("Go to Dashboard → Add Device to show the QR", color = BrandMutedScanner, fontSize = 11.sp, textAlign = TextAlign.Center)
            }
            TextButton(onClick = onManual) {
                Text("Enter manually instead", color = BrandVioletScanner, fontSize = 13.sp)
            }
        }
    }
}
