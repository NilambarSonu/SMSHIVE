package app.smshive.gateway.ui.theme

import androidx.compose.ui.graphics.Color
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable

val StaticDarkBg = Color(0xFF0A0A0F)
val StaticDarkSurface = Color(0xFF111118)
val StaticDarkCard = Color(0xFF16161F)
val StaticDarkBorder = Color(0xFF1E1E2E)
val StaticTextPrimary = Color(0xFFF1F5F9)
val StaticTextSecondary = Color(0xFF94A3B8)

val BrandViolet = Color(0xFF6C63FF)
val BrandVioletDark = Color(0xFF5B54E8)
val BrandTeal = Color(0xFF00D4AA)
val BrandMuted = Color(0xFF6B7280)
val BrandAmber = Color(0xFFF59E0B)
val DestructiveRed = Color(0xFFEF4444)
val SuccessGreen = Color(0xFF10B981)

val DarkBg: Color @Composable get() = MaterialTheme.colorScheme.background
val DarkSurface: Color @Composable get() = MaterialTheme.colorScheme.surface
val DarkCard: Color @Composable get() = MaterialTheme.colorScheme.surfaceVariant
val DarkBorder: Color @Composable get() = MaterialTheme.colorScheme.outline
val TextPrimary: Color @Composable get() = MaterialTheme.colorScheme.onBackground
val TextSecondary: Color @Composable get() = MaterialTheme.colorScheme.onSurfaceVariant
