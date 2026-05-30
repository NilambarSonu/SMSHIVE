package app.smshive.gateway.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val SMSHiveDarkColorScheme = darkColorScheme(
    primary = BrandViolet,
    onPrimary = TextPrimary,
    primaryContainer = BrandVioletDark,
    onPrimaryContainer = TextPrimary,
    secondary = BrandTeal,
    onSecondary = DarkBg,
    secondaryContainer = BrandTeal,
    onSecondaryContainer = DarkBg,
    tertiary = BrandAmber,
    onTertiary = DarkBg,
    background = DarkBg,
    onBackground = TextPrimary,
    surface = DarkSurface,
    onSurface = TextPrimary,
    surfaceVariant = DarkCard,
    onSurfaceVariant = TextSecondary,
    outline = DarkBorder,
    outlineVariant = DarkBorder,
    error = DestructiveRed,
    onError = TextPrimary,
    errorContainer = DestructiveRed,
    onErrorContainer = TextPrimary,
    scrim = DarkBg,
    inverseSurface = TextPrimary,
    inverseOnSurface = DarkBg,
    inversePrimary = BrandVioletDark,
)

@Composable
fun SMSHiveTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = SMSHiveDarkColorScheme,
        content = content
    )
}
