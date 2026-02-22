package codes.afk.sunoh

import android.content.Context
import com.google.android.gms.cast.framework.CastOptions
import com.google.android.gms.cast.framework.OptionsProvider
import com.google.android.gms.cast.framework.SessionProvider
import com.google.android.gms.cast.framework.media.CastMediaOptions

class CastOptionsProvider : OptionsProvider {
    override fun getCastOptions(context: Context): CastOptions {
        // Disable the Cast SDK's built-in media notification.
        // Our app manages its own single notification for both local and Cast playback,
        // just like Spotify does.
        val mediaOptions = CastMediaOptions.Builder()
            .setNotificationOptions(null)      // No separate Cast notification
            .build()

        return CastOptions.Builder()
            .setReceiverApplicationId("CC1AD845") // Default Media Receiver
            .setCastMediaOptions(mediaOptions)
            .build()
    }

    override fun getAdditionalSessionProviders(context: Context): List<SessionProvider>? = null
}
