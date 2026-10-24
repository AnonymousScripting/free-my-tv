---
paths:
  - "app/src/io/freemytv/RemoteKeys.java"
  - "app/src/io/freemytv/RemoteKeyService.java"
  - "app/src/io/freemytv/Prefs.java"
  - "app/src/io/freemytv/SettingsActivity.java"
  - "app/res/xml/remote_key_service.xml"
---

# The remote's app buttons (`RemoteKeys`, `RemoteKeyService`)

- The remote's app buttons use each brand's key codes: they run only on TCL, Vestel, KTC (NextStar), Sony and Xiaomi
  TVs and Formovie projectors, the service is on only in Free My TV mode, and *Original* takes it out of the enabled
  accessibility services. The system waits for the service on every key, so it lives alone in the `:keys` process:
  what it reads is in `remote-keys.txt` (`Prefs.keyApp`), never in SharedPreferences, and `onKeyEvent` does no heavy
  work.
- Vestel (F&U and other store brands; MediaTek, Android TV 14 tested) maps its Netflix button to `KEYCODE_STEM_1`, a
  global key (`dumpsys window policy` lists them) that the key filter sees first; its YouTube, Prime Video and Google
  Play buttons stay with the system. The stock lists needed no Vestel entries.
- KTC (NextStar; MediaTek, Google TV 14 tested) maps its Tabii button to `KEYCODE_BUTTON_8`, also a global key, which
  KTC's own hot-key receiver would open Tabii with; its Netflix, YouTube and Prime Video buttons stay with the system.
- Sony (BRAVIA VH22, Android TV 12 tested) sends `KEYCODE_BUTTON_9` for its BRAVIA CORE, Disney+, Prime Video,
  YouTube and Crunchyroll buttons, `KEYCODE_BUTTON_4` for Netflix and `KEYCODE_BUTTON_8` for the Google Play button of
  older remotes (BRAVIA 4K UR3, Android 10 tested), global keys for `com.sony.dtv.sonyvendorservice`;
  only the scan code tells them apart, so `Prefs` keys them as `SONY_KEY` + scan code. "Sony default" (empty) leaves
  the key to the TV. Sony ships its own Apple TV build, `com.apple.atve.sony.appletv`.
- Xiaomi projectors made by Formovie (Fengmi; L1, MediaTek, Google TV 14 tested) send the same `KEYCODE_STEM_1` for
  Netflix (`RemoteKeys.STEM_NETFLIX`); their YouTube button goes to MediaTek's `GlobalKeyReceiver` and stays with the
  system.
- Some Xiaomi TVs (MiTV-MSSP3, MediaTek, Android TV 9 tested) have no Home button on the remote (`RemoteKeys.XIAOMI`
  matches only the TVs, `MiTV-M…` models, not the Mi Box or Mi TV Stick): the Mi button sends
  `KEYCODE_BUTTON_4`, a global key that `com.xiaomi.android.tvsetup.partnercustomizer`'s `GlobalKeyReceiver` turns into
  PatchWall (`com.mitv.tvhome.atv`), never the home activity, so without the service there is no way back to Free My
  TV, and PatchWall's All Apps opens the disabled `tvlauncher`. `Prefs.KEY_MI` opens our home screen by default
  ("Xiaomi default", empty, leaves it to PatchWall). Leave PatchWall on: it also shows the TV's input picker.
- Xiaomi TVs sold in Russia (MiTV-MOOQ1, MediaTek, Android TV 11 tested) send `KEYCODE_BUTTON_13` for Okko, `_1` for
  VK, `_16` for Rutube, `_11` for KION, `_10` for Wink and `_12` for IVI, global keys for Xiaomi's hot-key receiver
  (`com.xiaomi.android.tvsetup.partnercustomizer`, its log: "dealWithHotkey keycode:199"). "Xiaomi default" (empty)
  leaves the key to the TV.
- `adb shell input keyevent` doesn't test any of these: injected keys skip the accessibility key filter. Test with the
  real remote.
