# Proguard rules for SMSHIVE Gateway
-keepattributes Signature, InnerClasses, EnclosingMethod

# Keep Retrofit models
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep Room entities and DAOs
-keep class * extends androidx.room.RoomDatabase
-dontwarn androidx.room.multitenant.**
