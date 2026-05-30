package app.smshive.gateway.ui.tabs

import android.content.Intent
import androidx.compose.foundation.*
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.smshive.gateway.data.AppDatabase
import app.smshive.gateway.data.PreferencesManager
import app.smshive.gateway.data.SentMessage
import app.smshive.gateway.ui.theme.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LogsTab(
    db: AppDatabase,
    prefs: PreferencesManager
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val allMessages by db.smsDao().getAllSent().collectAsState(initial = emptyList())

    var activeFilter by remember { mutableStateOf("All") }
    var searchQuery by remember { mutableStateOf("") }
    var selectedMessage by remember { mutableStateOf<SentMessage?>(null) }
    var showRetryAllDialog by remember { mutableStateOf(false) }

    // ── Filtered list ─────────────────────────────────────────────
    val filteredMessages by remember(allMessages, searchQuery, activeFilter) {
        derivedStateOf {
            allMessages.filter { msg ->
                val matchesSearch = searchQuery.isBlank() ||
                        msg.recipient.contains(searchQuery, ignoreCase = true) ||
                        msg.message.contains(searchQuery, ignoreCase = true)
                val matchesFilter = when (activeFilter) {
                    "Sent" -> msg.status == "SENT"
                    "Delivered" -> msg.status == "DELIVERED"
                    "Failed" -> msg.status == "FAILED"
                    "Pending" -> msg.status == "PENDING"
                    else -> true
                }
                matchesSearch && matchesFilter
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBg)
    ) {
        // ── Top Bar ─────────────────────────────────────────────
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                "Message Logs",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp
            )
            Row {
                // Export CSV
                IconButton(onClick = {
                    scope.launch(Dispatchers.IO) {
                        val csv = buildCsv(allMessages)
                        val intent = Intent(Intent.ACTION_SEND).apply {
                            type = "text/csv"
                            putExtra(Intent.EXTRA_TEXT, csv)
                            putExtra(Intent.EXTRA_SUBJECT, "SMSHive Gateway Logs")
                        }
                        context.startActivity(Intent.createChooser(intent, "Export CSV"))
                    }
                }) {
                    Icon(Icons.Default.FileDownload, contentDescription = "Export CSV", tint = BrandTeal)
                }
                // Retry all failed
                IconButton(onClick = { showRetryAllDialog = true }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Retry All Failed", tint = BrandAmber)
                }
            }
        }

        // ── Filter Chips ───────────────────────────────────────
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(listOf("All", "Sent", "Delivered", "Failed", "Pending")) { filter ->
                val selected = activeFilter == filter
                val chipColor = when (filter) {
                    "Delivered" -> BrandTeal
                    "Failed" -> DestructiveRed
                    "Pending" -> BrandAmber
                    "Sent" -> BrandViolet
                    else -> BrandViolet
                }
                FilterChip(
                    selected = selected,
                    onClick = { activeFilter = filter },
                    label = { Text(filter, fontSize = 12.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = chipColor,
                        selectedLabelColor = Color.White,
                        containerColor = DarkCard,
                        labelColor = BrandMuted
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        enabled = true,
                        selected = selected,
                        borderColor = DarkBorder,
                        selectedBorderColor = chipColor
                    )
                )
            }
        }

        // ── Search Bar ─────────────────────────────────────────
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search recipient or message…", color = BrandMuted, fontSize = 12.sp) },
            leadingIcon = {
                Icon(Icons.Default.Search, contentDescription = null, tint = BrandMuted, modifier = Modifier.size(18.dp))
            },
            trailingIcon = {
                if (searchQuery.isNotEmpty()) {
                    IconButton(onClick = { searchQuery = "" }) {
                        Icon(Icons.Default.Close, contentDescription = "Clear", tint = BrandMuted, modifier = Modifier.size(16.dp))
                    }
                }
            },
            singleLine = true,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .padding(top = 8.dp, bottom = 6.dp),
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

        // ── Message list ───────────────────────────────────────
        if (filteredMessages.isEmpty()) {
            LogsEmptyState()
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                items(filteredMessages, key = { it.id }) { msg ->
                    LogMessageItem(msg = msg, onClick = { selectedMessage = msg })
                }
                item { Spacer(modifier = Modifier.height(8.dp)) }
            }
        }
    }

    // ── Detail Bottom Sheet ────────────────────────────────────────
    selectedMessage?.let { msg ->
        val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
        ModalBottomSheet(
            onDismissRequest = { selectedMessage = null },
            sheetState = sheetState,
            containerColor = DarkSurface,
            dragHandle = {
                Box(
                    modifier = Modifier
                        .padding(top = 12.dp)
                        .size(width = 40.dp, height = 4.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(DarkBorder)
                )
            }
        ) {
            LogDetailSheet(
                msg = msg,
                onRetry = { /* inject retry logic via lambda */ },
                onClose = { selectedMessage = null }
            )
        }
    }

    // ── Retry all dialog ───────────────────────────────────────────
    if (showRetryAllDialog) {
        AlertDialog(
            onDismissRequest = { showRetryAllDialog = false },
            containerColor = DarkSurface,
            title = {
                Text("Retry All Failed", color = Color.White, fontWeight = FontWeight.Bold)
            },
            text = {
                Text(
                    "This will re-queue all failed messages for delivery.",
                    color = TextSecondary
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    showRetryAllDialog = false
                    // retry logic via service/viewmodel
                }) {
                    Text("Retry All", color = BrandAmber)
                }
            },
            dismissButton = {
                TextButton(onClick = { showRetryAllDialog = false }) {
                    Text("Cancel", color = BrandMuted)
                }
            }
        )
    }
}

// ── Log Message Item ───────────────────────────────────────────────
@Composable
private fun LogMessageItem(msg: SentMessage, onClick: () -> Unit) {
    val statusColor = statusColor(msg.status)
    val timeText = remember(msg.sentAt) {
        val diff = System.currentTimeMillis() - msg.sentAt
        when {
            diff < 60_000 -> "${diff / 1000}s ago"
            diff < 3_600_000 -> "${diff / 60_000}m ago"
            diff < 86_400_000 -> "${diff / 3_600_000}h ago"
            else -> SimpleDateFormat("dd MMM", Locale.getDefault()).format(Date(msg.sentAt))
        }
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = DarkCard),
        border = BorderStroke(1.dp, DarkBorder)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Status dot
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(statusColor)
            )

            // Middle content
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    msg.recipient,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    msg.message,
                    color = BrandMuted,
                    fontSize = 11.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            // Right: time + status
            Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(timeText, color = BrandMuted, fontSize = 10.sp)
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(statusColor.copy(alpha = 0.15f))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(msg.status, color = statusColor, fontSize = 9.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}

// ── Log Detail Sheet ───────────────────────────────────────────────
@Composable
private fun LogDetailSheet(
    msg: SentMessage,
    onRetry: (SentMessage) -> Unit,
    onClose: () -> Unit
) {
    val sdf = remember { SimpleDateFormat("dd MMM yyyy, HH:mm:ss", Locale.getDefault()) }
    val statusColor = statusColor(msg.status)

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp)
            .padding(top = 16.dp, bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Message Detail", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(statusColor.copy(alpha = 0.15f))
                    .padding(horizontal = 12.dp, vertical = 5.dp)
            ) {
                Text(msg.status, color = statusColor, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        HorizontalDivider(color = DarkBorder)

        // Recipient
        LogDetailRow(label = "Recipient", value = msg.recipient, copyable = true)

        // SIM slot
        LogDetailRow(label = "SIM Slot", value = "SIM ${msg.simSlot + 1}", copyable = false)

        // Sent at
        LogDetailRow(label = "Sent At", value = sdf.format(Date(msg.sentAt)), copyable = false)

        // Delivered at
        if (msg.deliveredAt > 0) {
            LogDetailRow(label = "Delivered At", value = sdf.format(Date(msg.deliveredAt)), copyable = false)
        }

        // Server SMS ID
        msg.serverSmsId?.let {
            LogDetailRow(label = "Server ID", value = it, copyable = true)
        }

        // Retry count
        if (msg.retryCount > 0) {
            LogDetailRow(label = "Retry Count", value = msg.retryCount.toString(), copyable = false)
        }

        HorizontalDivider(color = DarkBorder)

        // Full message
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Message", color = BrandMuted, fontSize = 12.sp)
            SelectionContainer {
                Text(
                    msg.message,
                    color = Color.White,
                    fontSize = 13.sp,
                    lineHeight = 20.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(DarkCard)
                        .border(1.dp, DarkBorder, RoundedCornerShape(10.dp))
                        .padding(12.dp)
                )
            }
        }

        // Error message
        if (msg.status == "FAILED" && !msg.errorMessage.isNullOrBlank()) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("Error", color = DestructiveRed.copy(alpha = 0.7f), fontSize = 11.sp)
                Text(
                    msg.errorMessage,
                    color = DestructiveRed,
                    fontSize = 12.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(DestructiveRed.copy(alpha = 0.08f))
                        .border(1.dp, DestructiveRed.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
                        .padding(10.dp)
                )
            }
        }

        // Retry button
        if (msg.status == "FAILED") {
            Button(
                onClick = { onRetry(msg) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = BrandViolet)
            ) {
                Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(8.dp))
                Text("Retry Message", fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

// ── Logs Empty State ───────────────────────────────────────────────
@Composable
private fun LogsEmptyState() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(
                Icons.Default.ListAlt,
                contentDescription = null,
                tint = BrandMuted.copy(alpha = 0.35f),
                modifier = Modifier.size(64.dp)
            )
            Text("No messages sent yet", color = BrandMuted, fontSize = 16.sp, fontWeight = FontWeight.Medium)
            Text(
                "Dispatched messages will be logged here",
                color = BrandMuted.copy(alpha = 0.6f),
                fontSize = 13.sp
            )
        }
    }
}

// ── Log Detail Row ─────────────────────────────────────────────────
@Composable
private fun LogDetailRow(label: String, value: String, copyable: Boolean) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(label, color = BrandMuted, fontSize = 11.sp)
            Text(value, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Medium)
        }
        if (copyable) {
            IconButton(onClick = { /* copy */ }, modifier = Modifier.size(32.dp)) {
                Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = BrandMuted, modifier = Modifier.size(15.dp))
            }
        }
    }
}

// ── Helpers ────────────────────────────────────────────────────────
private fun statusColor(status: String): Color = when (status) {
    "DELIVERED" -> BrandTeal
    "FAILED" -> DestructiveRed
    "PENDING" -> BrandAmber
    else -> BrandViolet // SENT
}

private fun buildCsv(messages: List<SentMessage>): String {
    val sdf = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
    val sb = StringBuilder()
    sb.appendLine("ID,Recipient,Status,SIM,Sent At,Delivered At,Retry Count,Error,Message")
    messages.forEach { msg ->
        val deliveredAt = if (msg.deliveredAt > 0) sdf.format(Date(msg.deliveredAt)) else ""
        val error = msg.errorMessage?.replace(",", ";") ?: ""
        val message = msg.message.replace(",", ";").replace("\n", " ")
        sb.appendLine("${msg.id},\"${msg.recipient}\",${msg.status},${msg.simSlot + 1},${sdf.format(Date(msg.sentAt))},\"$deliveredAt\",${msg.retryCount},\"$error\",\"$message\"")
    }
    return sb.toString()
}
