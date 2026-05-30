package app.smshive.gateway.ui

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.smshive.gateway.data.AuthManager
import app.smshive.gateway.ui.theme.BrandMuted
import app.smshive.gateway.ui.theme.BrandViolet
import app.smshive.gateway.ui.theme.BrandVioletDark
import app.smshive.gateway.ui.theme.DarkBg
import app.smshive.gateway.ui.theme.DarkBorder
import app.smshive.gateway.ui.theme.DarkCard
import app.smshive.gateway.ui.theme.DestructiveRed
import app.smshive.gateway.ui.theme.TextPrimary
import app.smshive.gateway.ui.theme.TextSecondary
import androidx.compose.ui.text.style.TextAlign
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    authManager: AuthManager,
    onSuccess: () -> Unit
) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var showVerificationCodeField by remember { mutableStateOf(false) }
    var verificationCode by remember { mutableStateOf("") }
    val coroutineScope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(DarkBg, Color(0xFF0D0D1A))
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 48.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // Logo
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape)
                    .background(
                        brush = Brush.radialGradient(
                            colors = listOf(BrandViolet, BrandVioletDark)
                        )
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.PhoneAndroid,
                    contentDescription = "SMSHive Logo",
                    tint = Color.White,
                    modifier = Modifier.size(44.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "SMSHIVE",
                color = TextPrimary,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 3.sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Send SMS at scale. From your pocket.",
                color = BrandMuted,
                fontSize = 13.sp,
                fontWeight = FontWeight.Normal
            )

            Spacer(modifier = Modifier.height(36.dp))

            // Login Card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(DarkCard)
                    .border(
                        width = 1.dp,
                        color = DarkBorder,
                        shape = RoundedCornerShape(24.dp)
                    )
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = if (showVerificationCodeField) "Verify Your Device" else "Welcome back",
                    color = TextPrimary,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = if (showVerificationCodeField) "A 6-digit verification code has been sent to your email." else "Sign in to your SMSHIVE account",
                    color = TextSecondary,
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(24.dp))

                if (showVerificationCodeField) {
                    // Verification Code Field
                    OutlinedTextField(
                        value = verificationCode,
                        onValueChange = { verificationCode = it },
                        label = { Text("Verification Code", color = BrandMuted) },
                        placeholder = { Text("123456", color = BrandMuted) },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandViolet,
                            unfocusedBorderColor = DarkBorder,
                            focusedLabelColor = BrandViolet,
                            unfocusedLabelColor = BrandMuted,
                            cursorColor = BrandViolet,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                } else {
                    // Email Field
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email", color = BrandMuted) },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandViolet,
                            unfocusedBorderColor = DarkBorder,
                            focusedLabelColor = BrandViolet,
                            unfocusedLabelColor = BrandMuted,
                            cursorColor = BrandViolet,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Password Field
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Password", color = BrandMuted) },
                        singleLine = true,
                        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                    contentDescription = if (passwordVisible) "Hide password" else "Show password",
                                    tint = BrandMuted
                                )
                            }
                        },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandViolet,
                            unfocusedBorderColor = DarkBorder,
                            focusedLabelColor = BrandViolet,
                            unfocusedLabelColor = BrandMuted,
                            cursorColor = BrandViolet,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Error message
                if (errorMessage.isNotEmpty()) {
                    Text(
                        text = errorMessage,
                        color = DestructiveRed,
                        fontSize = 13.sp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp)
                    )
                }

                // Sign In / Verify Button
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp)
                        .clip(RoundedCornerShape(14.dp))
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
                                if (showVerificationCodeField) {
                                    if (verificationCode.isBlank()) {
                                        errorMessage = "Please enter the verification code."
                                        return@Button
                                    }
                                    isLoading = true
                                    coroutineScope.launch {
                                        try {
                                            val verifyResult = authManager.verifyEmailCode(verificationCode)
                                            if (verifyResult.isSuccess) {
                                                onSuccess()
                                            } else {
                                                errorMessage = verifyResult.exceptionOrNull()?.message ?: "Verification failed."
                                            }
                                        } catch (e: Exception) {
                                            errorMessage = e.message ?: "Verification failed. Please try again."
                                        } finally {
                                            isLoading = false
                                        }
                                    }
                                } else {
                                    if (email.isBlank() || password.isBlank()) {
                                        errorMessage = "Email and password are required."
                                        return@Button
                                    }
                                    isLoading = true
                                    coroutineScope.launch {
                                        try {
                                            val successResult = authManager.signIn(email.trim(), password)
                                            if (successResult.isSuccess) {
                                                onSuccess()
                                            } else {
                                                val errMsg = successResult.exceptionOrNull()?.message ?: "Invalid email or password."
                                                if (errMsg == "verification_code_required") {
                                                    showVerificationCodeField = true
                                                } else {
                                                    errorMessage = errMsg
                                                }
                                            }
                                        } catch (e: Exception) {
                                            errorMessage = e.message ?: "Sign in failed. Please try again."
                                        } finally {
                                            isLoading = false
                                        }
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
                                text = if (showVerificationCodeField) "Verify & Sign In" else "Sign In",
                                color = Color.White,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

                if (showVerificationCodeField) {
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    androidx.compose.material3.TextButton(
                        onClick = {
                            showVerificationCodeField = false
                            verificationCode = ""
                            errorMessage = ""
                        }
                    ) {
                        Text(
                            text = "Back to Sign In",
                            color = TextSecondary,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}
