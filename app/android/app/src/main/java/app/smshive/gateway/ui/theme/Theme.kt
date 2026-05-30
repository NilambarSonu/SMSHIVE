package app.smshive.gateway.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val SMSHiveDarkColorScheme = darkColorScheme(
    primary = BrandViolet,
    onPrimary = StaticTextPrimary,
    primaryContainer = BrandVioletDark,
    onPrimaryContainer = StaticTextPrimary,
    secondary = BrandTeal,
    onSecondary = StaticDarkBg,
    secondaryContainer = BrandTeal,
    onSecondaryContainer = StaticDarkBg,
    tertiary = BrandAmber,
    onTertiary = StaticDarkBg,
    background = StaticDarkBg,
    onBackground = StaticTextPrimary,
    surface = StaticDarkSurface,
    onSurface = StaticTextPrimary,
    surfaceVariant = StaticDarkCard,
    onSurfaceVariant = StaticTextSecondary,
    outline = StaticDarkBorder,
    outlineVariant = StaticDarkBorder,
    error = DestructiveRed,
    onError = StaticTextPrimary,
    errorContainer = DestructiveRed,
    onErrorContainer = StaticTextPrimary,
    scrim = StaticDarkBg,
    inverseSurface = StaticTextPrimary,
    inverseOnSurface = StaticDarkBg,
    inversePrimary = BrandVioletDark,
)

private val SMSHiveLightColorScheme = lightColorScheme(
    primary = BrandViolet,
    onPrimary = Color.White,
    primaryContainer = BrandVioletDark,
    onPrimaryContainer = Color.White,
    secondary = BrandTeal,
    onSecondary = Color(0xFF0F172A),
    secondaryContainer = BrandTeal,
    onSecondaryContainer = Color(0xFF0F172A),
    tertiary = BrandAmber,
    onTertiary = Color.White,
    background = Color(0xFFF8FAFC), // Neutral Palette Light Mode Background
    onBackground = Color(0xFF0F172A), // Light Mode Foreground
    surface = Color.White,
    onSurface = Color(0xFF0F172A),
    surfaceVariant = Color(0xFFF1F5F9), // Muted light surface background
    onSurfaceVariant = Color(0xFF6B7280),
    outline = Color(0xFFE2E8F0), // Border light mode
    outlineVariant = Color(0xFFE2E8F0),
    error = DestructiveRed,
    onError = Color.White,
    errorContainer = DestructiveRed,
    onErrorContainer = Color.White,
    scrim = Color(0xFFF8FAFC),
    inverseSurface = Color(0xFF0F172A),
    inverseOnSurface = Color.White,
    inversePrimary = BrandVioletDark,
)

@Composable
fun SMSHiveTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        SMSHiveDarkColorScheme
    } else {
        SMSHiveLightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
