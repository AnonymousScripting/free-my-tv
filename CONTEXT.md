# CONTEXT.md

The vocabulary of Free My TV and a map of how it is put together. Rules are in `CLAUDE.md` and `.claude/rules/`;
decisions and their reasons are in `docs/adr/`.

## Glossary

- **AGSL**: Android 13's GPU shading language. `Shaders` draws the aurora background and the glass with it; Android
  8 to 12 get a bitmap fallback (`Frost`, `Shadows`).
- **All Apps**: the sheet listing every app on the TV as a 16:9 card; `HIDDEN` in `HomeApps` keeps system pieces out.
- **Boot check**: `HomeReceiver` on boot and after an update re-applies the mode in `home-state.json`, so a TV update
  doesn't bring the stock home screen back.
- **Catalogue**: one translation file per language, `app/assets/i18n/<lang>.json`, keyed by the English text in the
  code. `tools/translate.py` keeps them in step with the code.
- **CORE / FACTORY**: lists in `HomeMode` of Android's own pieces and the factory menus that `mayTurnOff` always refuses.
- **DEBLOAT**: the list in `HomeMode` of promo, demo, store-mode and telemetry apps turned off in Free My TV mode, by
  brand, one comment per line.
- **Developer Mode (LG)**: LG's app that lets a TV install unsigned apps for about 40 days; the Key Server inside it
  gives `webos/install.py` its SSH key. **Developer mode (Samsung)**: typed as `1 2 3 4 5` in Apps; opens SDB to one
  Host PC IP.
- **Drawer**: the bottom panel of the home screen (↓ opens it): inputs, shortcuts, the weather and the prices.
- **Free My TV mode**: our home screen and screensaver are set, `DEBLOAT` apps are disabled. **Original**: everything
  as it came from the factory. `HomeMode` switches between the two.
- **Generic build**: `--generic` on `webos/build.py` and `tizen/build.py`: no `config.properties`, no TMDB key, the
  city from the TV's time zone (`web/zones.js`). What GitHub releases carry.
- **Homebrew Channel (webOS)**: a community app store for LG; `docs/webos/apps.json` is Free My TV's repository there,
  written by `tools/homebrew_repo.py` from the released `.ipk`.
- **Home Settings**: Free My TV's own settings screen on the TV (`SettingsActivity`; `web/home.js` on LG and Samsung).
  What is changed there (`Prefs`) wins over `config.properties`.
- **LEGACY**: `Ui.LEGACY`, Android 8 to 11: no GPU layers, cached shadow bitmaps, images rounded with a shader.
- **Luna**: webOS's service bus; `web/tv.js` lists and opens apps through it, as LG's launcher does.
- **ModeJob**: the background job that runs a switch in the main process, so the system keeps the app alive until it
  finishes.
- **My Photos**: the person's own photos, sent with `tools/photos.py` (adb) and imported by `Photos` (cropped to 16:9,
  tags removed) for the screensaver and the home background. `PhotoInbox` is the way in where adb can't reach the
  app's folder (Android 11, Fire OS 8).
- **PatchWall**: Xiaomi's own launcher. The Mi button on some Xiaomi remotes opens it instead of Home; `RemoteKeys`
  redirects that button to Free My TV.
- **Picks**: the three titles per hour on the home screen (`Recs`; `web/data.js`), from what is trending this week and
  recent releases on TMDB, only from streaming apps the TV has.
- **PROTECTED**: the list in `HomeMode` of apps never turned off: picture, sound, inputs, HDMI-CEC, tuner, pairing,
  setup, updates, system UI. `neededByTv` adds, on the TV itself, anything holding `TV_INPUT_HARDWARE` or the Input key.
- **Remote Buttons**: the setting that picks what the remote's app buttons (Netflix, YouTube, Prime, Tabii, Mi…)
  open; `RemoteKeyService` reads those keys through an accessibility service in the `:keys` process.
- **SDB**: Samsung's ADB (port 26101). `tizen/install.py` speaks it directly: `0 vd_appinstall`, `0 was_execute`.
- **setupwraith**: Google TV's setup app (`com.google.android.tungsten.setupwraith`). Its RecoveryActivity takes Home
  when the stock home screen is off and it is on, so it goes off first and comes back last.
- **Shelf**: the glass row of the person's streaming apps on the home screen. First filled from `shelf=` in
  `config.properties` or `SHELF` in `HomeApps`; reordered on the TV (hold OK).
- **TizenBrew Installer**: the community installer for Samsung TVs that installs the first `.wgt` of the latest GitHub
  release and, on 2023+ TVs, signs it with the person's Samsung account.
- **TMDB / `tmdb_region`**: The Movie Database, source of the picks and of which app streams a title in which country.
  The key is the person's own. **Watchmode**: optional second key that lets a pick open the title's page in its app.
- **Watchdog**: the safety net in the main process: on the 3rd crash of `:home` in 5 minutes it restores the stock
  home screen (`files/home-crashes.txt`).
- **Wi-Fi owners**: `wifiOwners` in `HomeMode`: apps that saved a Wi-Fi network. Never turned off, because Android
  deletes their networks with them.

## Architecture map

### Google TV and Android TV (`app/`)

One APK, `io.freemytv`, three processes:

- **main**: `SettingsActivity` (the app's icon: Home Screen, Home Settings, Shelf, Remote Buttons, My Photos),
  `HomeMode` + `ModeJob` (the switches), `Adb` (an ADB client to the TV's own `127.0.0.1:5555`), `Watchdog`,
  `HomeReceiver` (boot, update), `PhotoInbox`; on Android 11 also `ScreensaverAlone`.
- **`:home`**: `HomeActivity` → `HomeView` (one Canvas: tabs, picks, shelf, drawer), `Screensaver` → `DreamView`,
  `Recs` (TMDB), `HomeData` (Open-Meteo every 30 min, Binance every 5 min), `HomeApps` (apps, inputs, shortcuts),
  `Backdrop`, `Scene`/`Shaders`/`Frost`/`Shadows` (background and glass), `Recording`, `Ui` (fonts, text, catalogues),
  `Symbols`, `Glyphs`, `Spring`, `Click`, `Spoken` (TalkBack), `Photos`. `FireHomeActivity` is the app form on Fire TV.
- **`:keys`**: `RemoteKeyService` + `RemoteKeys`, alone, because the system waits for it on every key press.

Data flow of a switch: the person picks *Free My TV* in `SettingsActivity` → `ModeJob` → `HomeMode` runs
`cmd package set-home-activity`, `settings put secure screensaver_components` and `pm disable-user --user 0` over
`Adb` → the result lands in `files/home-state.json` → the settings screen follows it. Nothing listens on the network.

Where state lives: `config.properties` → generated `out/gen/io/freemytv/Config.java` (first values, baked into the
APK); `Prefs` → SharedPreferences `settings` (multi-process) and `files/remote-keys.txt`; `HomeMode` →
`files/home-state.json`; `Watchdog` → `files/home-crashes.txt`; My Photos → `Android/data/io.freemytv/files/photos`;
caches of logos, pick images, weather and prices in the app's cache dir. Build: `build.sh` (aapt2 → javac → d8 →
zipalign → apksigner, signed with the person's `freemytv.keystore`).

### LG and Samsung (`web/`, `webos/`, `tizen/`)

The same screen in ES5: `web/home.js` (layout and behavior, mirrors `HomeView`), `web/data.js` (picks, weather,
prices, in `localStorage`), `web/tv.js` (the TV's side: Luna on LG, `tizen.application`/`tizen.tvwindow` on Samsung, a
stand-in in a desktop browser), `web/strings.js` (text from the catalogues packed into `i18n.js`), `web/zones.js`
(time zone → city, country, currency). `tools/webapp.py` reads the settings and copies the files; `webos/build.py`
makes the `.ipk` (installed by `webos/install.py` over SSH through Developer Mode), `tizen/build.py` the `.wgt`
(signed by Samsung's `tizen`, installed by `tizen/install.py` over SDB). State on the TV: `localStorage` `fmtv.*`.

### Website and CI

`docs/` is freemytv.io on GitHub Pages (`pages.yml`, on a push to `main` touching `docs/**`), with `docs/pt/` in
Portuguese and `docs/webos/apps.json` for the Homebrew Channel. `check.yml` runs `tools/check.sh` on every PR and push
to `main`: the APK with JDK 17 and build-tools 34, `translate.py --check`, the generic LG and Samsung packages, and
ES5 syntax and calls in `web/`.
