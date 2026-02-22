package codes.afk.sunoh

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.google.android.gms.cast.framework.CastContext

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    // Initialize CastContext early so the Cast SDK starts mDNS device discovery
    // immediately on app launch rather than waiting for the media service to start.
    // Must use the async API (getSharedInstance with Executor) — the sync variant
    // is deprecated in play-services-cast-framework 22.x and doesn't trigger discovery.
    try {
      CastContext.getSharedInstance(this, java.util.concurrent.Executors.newSingleThreadExecutor())
    } catch (_: Exception) {
      // No CastOptionsProvider or Play Services unavailable — Cast simply won't work
    }
  }
}
