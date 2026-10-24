---
paths:
  - "app/src/io/freemytv/HomeMode.java"
  - "app/src/io/freemytv/HomeApps.java"
---

# Adapting it to another TV

Read first, change after. Read-only commands that tell you what the TV has:

```bash
adb shell getprop ro.product.brand; adb shell getprop ro.product.model; adb shell getprop ro.build.version.release
adb shell cmd package query-activities --brief -a android.intent.action.MAIN -c android.intent.category.HOME
adb shell cmd role get-role-holders android.app.role.HOME
adb shell settings get secure screensaver_components; adb shell settings get secure screensaver_default_component
adb shell pm list packages -s     # system apps (-3 for the ones they installed)
```

Then, in the code:

- `HomeMode.DEBLOAT`: add the brand's promo, demo, store-mode and telemetry apps, one comment per line. Only those.
- `HomeMode.PROTECTED`: add the brand's system pieces: picture, sound, inputs and HDMI-CEC, the tuner and live TV,
  remote and Bluetooth pairing, setup, updates, system UI. When in doubt, protect it. `mayTurnOff` also refuses
  Android's own pieces (`CORE`: with the permission controller or package installer off, a TV may not start again) and
  factory menus (`FACTORY`), and `neededByTv` keeps on, on the TV itself, anything that asks for `TV_INPUT_HARDWARE`
  (the layer under HDMI and the tuner: off, inputs show "No signal") or receives the remote's Input key
  (`fusion.android.tv.demo` does on several MediaTek boards).
- `HomeApps.SHELF`, `LIVE_TV_APPS` and `HIDDEN`: the shelf apps, the brand's live TV app, apps to hide from All Apps.
- Build, install, have them switch on the TV, read `adb logcat -s FreeMyTV`, then have them switch back to
  *Original* once and confirm everything returned.

LG and Samsung: the web app (`web-app.md`). Other TVs that don't run Google TV or Android TV: the way is a Google TV
streamer on HDMI (Chromecast with Google TV, Google TV Streamer, onn 4K, NVIDIA Shield). Set Free My TV up on the
streamer. The onn 4K Streaming Box (Amlogic S905Y4, Google TV 14 tested) ships no promo apps of its own, so `DEBLOAT`
has no onn entries; its system pieces are in `PROTECTED`. USB debugging opens ADB on 5555 there, as the app needs.

Amazon Fire TV (Fire OS: `HomeMode.AMAZON`): Amazon's launcher keeps the Home button (`priority=950` on
`CATEGORY_HOME`), so the switch refuses Free My TV mode while *Original* and the watchdog still run, and no
`com.amazon.*` package is ever turned off (`mayTurnOff`). `FireHomeActivity` is the home screen opened as an app there.

**Uninstalled while in Free My TV mode?** The apps it turned off stay off. Bring them back with
`adb shell pm enable <package>` (the `DEBLOAT` list and the stock home screen), then
`adb shell cmd package set-home-activity <stock home activity>` and
`adb shell settings put secure screensaver_components <stock screensaver>`.
