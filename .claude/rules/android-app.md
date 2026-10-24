---
paths:
  - "app/**"
  - "build.sh"
---

# The Google TV / Android TV app (`app/`)

Rules for the Java code. The flow for installing it on someone's TV is in `CLAUDE.md`; on-screen text and the
catalogues are in `translations.md`; the remote's app buttons are in `remote-buttons.md`.

- Java 8 language level, minSdk 26 (Android 8), targetSdk 33. No Gradle, no libraries: only the Android SDK.
  Android 9 and older have no RenderNode (`Recording` wraps it, with a Picture there) and no `cmd role`. On Android 8 to 11
  (`Ui.LEGACY`) the home screen skips the GPU layers, draws blurred shadows from cached bitmaps (`Shadows`) and
  rounds images with a shader instead of clipPath: their GPUs (a Mi Box 3's Mali-450) choked on those.
  Android 11 runs the screensaver as `ScreensaverAlone`, in the main process (its DreamActivity needs the dream in the
  app's default process, without a home activity); `res/values-v30/bools.xml` picks it, every other version keeps
  `Screensaver` in `:home` (`res/values-v31/bools.xml` sets it back). Keep both in step. `ScreensaverAlone` reads
  `Prefs` from another process than the settings screen's, so it calls `Prefs.reload()` when it starts (which also
  re-applies a new language; `HomeData` fetches the forecast again when the city changed).
  To check for newer APIs, compile against `platforms/android-26/android.jar`: only AGSL (`RuntimeShader`, guarded
  by a try/catch), `BitmapShader.setFilterMode` (guarded), `Recording.Node` and `Ui.Weighted` (the Android 9 font weight) should come up.
- The home screen is drawn by hand on one Canvas (`HomeView`); the glass and the sky are AGSL shaders (`Shaders`,
  Android 13+, with a fallback for 8 to 12). Keep it at 60 fps: no allocations in `onDraw`, no work on the UI thread.
- Some TVs draw their UI at 1280×720 on a 1080p panel (TCL's 1 GB models: `ro.surface_flinger.max_graphics_width`
  and `_height`, `ro.config.low_ram`). There every pixel and every MB counts: `Backdrop` builds its images at the UI's
  size (and the picks use TMDB's w1280), and the shelf logos have a copy at the resting size and one at the focused
  size, so both draw pixel for pixel.
- `HomeMode` runs every switch as a background job (`ModeJob`) in the main process; the UI is in the `:home`
  process. `Watchdog` goes back to the stock home screen after 3 crashes in 5 minutes.
- Settings come from `config.properties` through the generated `out/gen/io/freemytv/Config.java` (never edit that).
  What the person changes on the TV (`Prefs`: Home Settings, Shelf, Remote Buttons) wins over those first values.
- HY300 projectors (Hotack, Allwinner H713, Android 11 tested; the build claims to be an `askey`/`adt3`): the stock
  home screen and screensaver are `com.htc.htclauncherhighenglishd08`, which also carries an ad SDK (`com.zeasn.ad`).
  Keystone, zoom and projection mode live in `com.htc.htcsettings` (`action.htcsettings.prjsettings`), and the Miracast
  receiver is `com.softwinner.miracastReceiver/.Miracast`: `HomeApps.drawerShortcuts` adds both (kind `DEVICE`) where
  they resolve. Opening Miracast moves the Wi-Fi to Wi-Fi Direct: adb drops and asks to be allowed again. Nothing opens
  a passthrough input there; Allwinner's `com.softwinner.awlivetv` does, but always on HDMI 1 (the one real port of
  the three the board lists), so `inputs` keeps only HDMI 1.
- Comments in English, short, only where the why isn't obvious.
- After any change, `./build.sh` must end with `Built FreeMyTV.apk`. Before you push, `tools/check.sh` (CI runs the
  same with build-tools 34, android-34 and JDK 17; `build.sh` takes the newest SDK you have, so a call newer than
  Android 34 can pass here and fail on the pull request).
- Three version numbers move together at a release: `android:versionCode`/`versionName` in `app/AndroidManifest.xml`,
  `version` in `webos/appinfo.json` and `version` in `tizen/config.xml`.
