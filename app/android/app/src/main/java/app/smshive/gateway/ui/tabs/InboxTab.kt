package app.smshive.gateway.ui.tabs

import androidx.compose.animation.*
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import app.smshive.gateway.data.AppDatabase
import app.smshive.gateway.data.ReceivedMessage
import app.smshive.gateway.ui.theme.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InboxTab(db: AppDatabase) {
    val scope = rememberCoroutineScope()
    val allMessages by db.smsDao().getRecentReceived().collectAsState(initial = emptyList())
    val unreadCount by db.smsDao().getUnreadCount().collectAsState(initial = 0)

    var searchQuery by remember { mutableStateOf("") }
    var searchVisible by remember { mutableStateOf(false) }
    var isRefreshing by remember { mutableStateOf(false) }
    var activeFilter by remember { mutableStateOf("All") }
    var selectedMessage by remember { mutableStateOf<ReceivedMessage?>(null) }

    // ── Filtered list ─────────────────────────────────────────────
    val filteredMessages by remember(allMessages, searchQuery, activeFilter) {
        derivedStateOf {
            allMessages.filter { msg ->
                val matchesSearch = searchQuery.isBlank() ||
                        msg.sender.contains(searchQuery, ignoreCase = true) ||
                        msg.message.contains(searchQuery, ignoreCase = true)
                val now = System.currentTimeMillis()
                val todayStart = Calendar.getInstance().apply {
                    set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
                    set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
                }.timeInMillis
                val matchesFilter = when (activeFilter) {
                    "Today" -> msg.receivedAt >= todayStart
                    "Unread" -> !msg.read
                    "Forwarded" -> msg.forwarded
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
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    "Inbox",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp
                )
                if (unreadCount > 0) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .size(22.dp)
                            .clip(CircleShape)
                            .background(BrandViolet)
                    ) {
                        Text(
                            text = if (unreadCount > 99) "99+" else unreadCount.toString(),
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
            Row {
                IconButton(onClick = {
                    isRefreshing = true
                    // Refresh handled by Room flow automatically
                    isRefreshing = false
                }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = BrandMuted)
                }
                IconButton(onClick = { searchVisible = !searchVisible }) {
                    Icon(Icons.Default.Search, contentDescription = "Search", tint = BrandMuted)
                }
                IconButton(onClick = { /* filter menu */ }) {
                    Icon(Icons.Default.FilterList, contentDescription = "Filter", tint = BrandMuted)
                }
            }
        }

        // ── Search Bar ─────────────────────────────────────────
        AnimatedVisibility(
            visible = searchVisible,
            enter = expandVertically() + fadeIn(),
            exit = shrinkVertically() + fadeOut()
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search by sender or message…", color = BrandMuted, fontSize = 13.sp) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = BrandMuted, modifier = Modifier.size(18.dp)) },
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
                    .padding(bottom = 8.dp),
                shape = RoundedCornerShape(12.dp),
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

        // ── Filter Chips ───────────────────────────────────────
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(listOf("All", "Today", "Unread", "Forwarded")) { filter ->
                val selected = activeFilter == filter
                FilterChip(
                    selected = selected,
                    onClick = { activeFilter = filter },
                    label = { Text(filter, fontSize = 12.sp) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = BrandViolet,
                        selectedLabelColor = Color.White,
                        containerColor = DarkCard,
                        labelColor = BrandMuted
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        enabled = true,
                        selected = selected,
                        borderColor = DarkBorder,
                        selectedBorderColor = BrandViolet
                    )
                )
            }
        }

        // ── Messages List ──────────────────────────────────────
        if (filteredMessages.isEmpty()) {
            InboxEmptyState()
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredMessages, key = { it.id }) { msg ->
                    InboxMessageItem(
                        msg = msg,
                        onClick = {
                            selectedMessage = msg
                            scope.launch { db.smsDao().markRead(msg.id) }
                        }
                    )
                }
                item { Spacer(modifier = Modifier.height(8.dp)) }
            }
        }
    }

    // ── Bottom Sheet ───────────────────────────────────────────────
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
            InboxDetailSheet(msg = msg, onClose = { selectedMessage = null })
        }
    }
}

// ── Inbox Message Item ─────────────────────────────────────────────
@Composable
private fun InboxMessageItem(msg: ReceivedMessage, onClick: () -> Unit) {
    val timeText = remember(msg.receivedAt) {
        val diff = System.currentTimeMillis() - msg.receivedAt
        when {
            diff < 60_000 -> "${diff / 1000}s ago"
            diff < 3_600_000 -> "${diff / 60_000}m ago"
            diff < 86_400_000 -> "${diff / 3_600_000}h ago"
            else -> SimpleDateFormat("dd MMM", Locale.getDefault()).format(Date(msg.receivedAt))
        }
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = DarkSurface),
        border = BorderStroke(1.dp, if (!msg.read) BrandViolet.copy(alpha = 0.4f) else DarkBorder)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    msg.sender,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    modifier = Modifier.weight(1f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(timeText, color = BrandMuted, fontSize = 10.sp)
            }
            Text(
                msg.message,
                color = BrandMuted,
                fontSize = 11.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                lineHeight = 16.sp
            )
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (!msg.read) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF3B82F6))
                    )
                }
                if (msg.forwarded) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(BrandTeal.copy(alpha = 0.15f))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text("Forwarded ✓", color = BrandTeal, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

// ── Inbox Empty State ──────────────────────────────────────────────
@Composable
private fun InboxEmptyState() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(
                Icons.Default.Inbox,
                contentDescription = null,
                tint = BrandMuted.copy(alpha = 0.4f),
                modifier = Modifier.size(64.dp)
            )
            Text("No messages yet", color = BrandMuted, fontSize = 16.sp, fontWeight = FontWeight.Medium)
            Text(
                "Incoming SMS messages will appear here",
                color = BrandMuted.copy(alpha = 0.6f),
                fontSize = 13.sp
            )
        }
    }
}

// ── Inbox Detail Sheet ─────────────────────────────────────────────
@Composable
private fun InboxDetailSheet(msg: ReceivedMessage, onClose: () -> Unit) {
    val sdf = remember { SimpleDateFormat("dd MMM yyyy, HH:mm:ss", Locale.getDefault()) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp)
            .padding(top = 16.dp, bottom = 32.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("Message Detail", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)

        // Sender
        DetailRow(label = "From", value = msg.sender, copyable = true)

        // Time
        DetailRow(label = "Received", value = sdf.format(Date(msg.receivedAt)), copyable = false)

        // SIM
        DetailRow(label = "SIM Slot", value = "SIM ${msg.simSlot + 1}", copyable = false)

        // Forwarded
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Forwarded", color = BrandMuted, fontSize = 12.sp)
            if (msg.forwarded) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(BrandTeal.copy(alpha = 0.15f))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text("Yes ✓", color = BrandTeal, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                }
            } else {
                Text("No", color = BrandMuted, fontSize = 12.sp)
            }
        }

        HorizontalDivider(color = DarkBorder)

        // Full message
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Message", color = BrandMuted, fontSize = 12.sp)
            SelectionContainer {
                Text(
                    msg.message,
                    color = Color.White,
                    fontSize = 14.sp,
                    lineHeight = 22.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(DarkCard)
                        .border(1.dp, DarkBorder, RoundedCornerShape(10.dp))
                        .padding(12.dp)
                )
            }
        }
    }
}

// ── Detail Row ─────────────────────────────────────────────────────
@Composable
private fun DetailRow(label: String, value: String, copyable: Boolean) {
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
                Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = BrandMuted, modifier = Modifier.size(16.dp))
            }
        }
    }
}
