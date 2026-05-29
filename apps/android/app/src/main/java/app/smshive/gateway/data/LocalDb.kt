package app.smshive.gateway.data

import android.content.Context
import androidx.room.*
import kotlinx.coroutines.flow.Flow

// Entities
@Entity(tableName = "sent_messages")
data class SentMessage(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val recipient: String,
    val message: String,
    val status: String, // SENT, DELIVERED, FAILED, PENDING
    val sentAt: Long,
    val deliveredAt: Long = 0,
    val simSlot: Int = 0,
    val errorMessage: String? = null
)

@Entity(tableName = "received_messages")
data class ReceivedMessage(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val sender: String,
    val message: String,
    val receivedAt: Long,
    val forwarded: Boolean = false
)

// DAOs
@Dao
interface SmsDao {
    @Query("SELECT * FROM sent_messages ORDER BY sentAt DESC LIMIT 50")
    fun getRecentSent(): Flow<List<SentMessage>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSent(msg: SentMessage): Long

    @Query("UPDATE sent_messages SET status = :status, deliveredAt = :deliveredAt, errorMessage = :error WHERE id = :id")
    suspend fun updateSentStatus(id: Long, status: String, deliveredAt: Long, error: String?)

    @Query("SELECT * FROM received_messages ORDER BY receivedAt DESC LIMIT 100")
    fun getRecentReceived(): Flow<List<ReceivedMessage>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertReceived(msg: ReceivedMessage): Long

    @Query("UPDATE received_messages SET forwarded = :forwarded WHERE id = :id")
    suspend fun updateReceivedForwarded(id: Long, forwarded: Boolean)

    @Query("SELECT COUNT(*) FROM sent_messages WHERE sentAt >= :todayStart")
    fun getSentTodayCount(todayStart: Long): Flow<Int>
}

// Database
@Database(entities = [SentMessage::class, ReceivedMessage::class], version = 1, exportSchema = false)
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
