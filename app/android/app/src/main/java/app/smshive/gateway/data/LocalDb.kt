package app.smshive.gateway.data

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

// ── Entities ───────────────────────────────────────────────

@Entity(tableName = "sent_messages")
data class SentMessage(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val recipient: String,
    val message: String,
    val status: String, // PENDING, SENT, DELIVERED, FAILED
    val sentAt: Long,
    val deliveredAt: Long = 0,
    val simSlot: Int = 0,
    val errorMessage: String? = null,
    val retryCount: Int = 0,
    val serverSmsId: String? = null // The backend's _id for status updates
)

@Entity(tableName = "received_messages")
data class ReceivedMessage(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val sender: String,
    val message: String,
    val receivedAt: Long,
    val simSlot: Int = 0,
    val forwarded: Boolean = false,
    val read: Boolean = false
)

// ── DAOs ───────────────────────────────────────────────────

@Dao
interface SmsDao {
    // Sent messages
    @Query("SELECT * FROM sent_messages ORDER BY sentAt DESC LIMIT 50")
    fun getRecentSent(): Flow<List<SentMessage>>

    @Query("SELECT * FROM sent_messages ORDER BY sentAt DESC")
    fun getAllSent(): Flow<List<SentMessage>>

    @Query("SELECT * FROM sent_messages WHERE status = 'FAILED' ORDER BY sentAt DESC")
    fun getFailedMessages(): Flow<List<SentMessage>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSent(msg: SentMessage): Long

    @Query("UPDATE sent_messages SET status = :status, deliveredAt = :deliveredAt, errorMessage = :error WHERE id = :id")
    suspend fun updateSentStatus(id: Long, status: String, deliveredAt: Long, error: String?)

    @Query("UPDATE sent_messages SET retryCount = :retryCount WHERE id = :id")
    suspend fun updateRetryCount(id: Long, retryCount: Int)

    @Query("SELECT COUNT(*) FROM sent_messages WHERE sentAt >= :todayStart")
    fun getSentTodayCount(todayStart: Long): Flow<Int>

    @Query("SELECT COUNT(*) FROM sent_messages WHERE sentAt >= :monthStart")
    fun getSentThisMonthCount(monthStart: Long): Flow<Int>

    @Query("SELECT COUNT(*) FROM sent_messages WHERE status = 'DELIVERED' AND sentAt >= :todayStart")
    fun getDeliveredTodayCount(todayStart: Long): Flow<Int>

    @Query("DELETE FROM sent_messages")
    suspend fun clearAllSent()

    // Received messages
    @Query("SELECT * FROM received_messages ORDER BY receivedAt DESC LIMIT 100")
    fun getRecentReceived(): Flow<List<ReceivedMessage>>

    @Query("SELECT * FROM received_messages ORDER BY receivedAt DESC")
    fun getAllReceived(): Flow<List<ReceivedMessage>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReceived(msg: ReceivedMessage): Long

    @Query("UPDATE received_messages SET forwarded = :forwarded WHERE id = :id")
    suspend fun updateReceivedForwarded(id: Long, forwarded: Boolean)

    @Query("UPDATE received_messages SET read = 1 WHERE id = :id")
    suspend fun markRead(id: Long)

    @Query("SELECT COUNT(*) FROM received_messages WHERE read = 0")
    fun getUnreadCount(): Flow<Int>

    @Query("DELETE FROM received_messages")
    suspend fun clearAllReceived()
}

// ── Database ───────────────────────────────────────────────

@Database(
    entities = [SentMessage::class, ReceivedMessage::class],
    version = 2,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun smsDao(): SmsDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "smshive_gateway_db"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
