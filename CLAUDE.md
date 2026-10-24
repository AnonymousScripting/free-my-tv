# Free My TV: notes for Claude and other assistants

A fast, ad-free home screen for Google TV and Android TV that replaces the stock one, plus a settings app that
switches between Free My TV and the TV's *Original* home screen. A plain Android app in Java, built without Gradle by
`build.sh`. LG TVs (webOS) and Samsung TVs (Tizen) get the same home screen as a web app (`web/`, packed by `webos/`
and `tizen/`). The website (freemytv.io) is `docs/`: static HTML, CSS and JS, no build step.

The person you're helping may not be technical. Keep it short and friendly, say what you're about to do on their TV
before you do it, and let them do the taps on the TV. Most people ask in plain words ("Install Free My TV on my TV at
192.168.1.50. I live in Lisbon.") and don't know what a terminal is.

This file is the canonical guide. `AGENTS.md` is the short version for other tools, `CONTEXT.md` the glossary and
architecture map, `docs/adr/` the decisions, `CHANGELOG.md` what changed. Topic rules live in `.claude/rules/` (Claude
Code loads them by itself; other assistants: read the one named when you touch that area): `android-app.md` (the Java
code), `web-app.md` (LG and Samsung code), `translations.md` (on-screen text), `remote-buttons.md` (the remote's app
buttons per brand), `adapting-a-tv.md` (a new brand or model), `samsung-tizen.md` (Samsung tools, certificates, SDB).

## The repo

| Where | What |
|---|---|
| `app/` | The Android app: `AndroidManifest.xml`, `src/io/freemytv/*.java`, `res/`, `assets/{fonts,i18n,symbols}` |
| `web/` | The LG and Samsung home screen (ES5 JS, CSS, `icons/`) |
| `webos/`, `tizen/` | `build.py` packs `web/` into `.ipk` / `.wgt`; `install.py` installs over Wi-Fi |
| `tools/` | `check.sh` (what CI runs), `translate.py`, `webapp.py`, `photos.py`, `homebrew_repo.py`, art scripts |
| `docs/` | The website (GitHub Pages), `docs/pt/` in Portuguese, `docs/webos/apps.json`, `docs/adr/` |
| `build.sh`, `config.example.properties` | The Android build and the settings template (copied to `config.properties`) |
| `.github/workflows/` | `check.yml` (every PR and push to main), `pages.yml` (publishes `docs/`) |

Stack: Java 8 language level on the Android SDK (minSdk 26, targetSdk 33, build-tools 34, JDK 17+); Python 3 for the
packagers and tools; Node only for the ES5 check. No package manager, no lockfile, no libraries.

| Command | Does |
|---|---|
| `./build.sh` | aapt2 → javac → d8 → zipalign → apksigner → `FreeMyTV.apk`; first run creates `config.properties` |
| `tools/check.sh [all\|android\|web]` | Everything CI checks: the APK, `translate.py --check`, the generic LG and Samsung packages, ES5 in `web/` |
| `python3 tools/translate.py [--check\|--fill\|--prune\|--new xx]` | Rebuild `en.json` from the code and report, fill, prune or start catalogues |
| `python3 webos/build.py [--preview\|--generic\|--config F]` | `FreeMyTV-webos.ipk`; `--preview` leaves `out/webos/index.html` to open in a browser |
| `python3 webos/install.py <IP> [--uninstall]` | Install on an LG TV in Developer Mode |
| `python3 tizen/build.py [--sign PROFILE\|--preview\|--generic\|--config F]` | `FreeMyTV-tizen.wgt` |
| `python3 tizen/install.py <IP> [--uninstall]` | Install on a Samsung TV in Developer Mode, no Samsung tools |
| `python3 tools/photos.py <IP> <photos or folders>` | Send photos for My Photos (Google TV and Android TV, over adb) |
| `adb logcat -s FreeMyTV` | What the app did (it never logs keys) |

There is no unit test suite. The check is `tools/check.sh` before every push, plus a real switch on a TV and a switch
back to *Original* for anything that touches `HomeMode`, `HomeApps` or the install scripts.

## Installing it for someone (Google TV, Android TV)

1. **Ask** for the TV's IP address and their city, if they didn't say.
2. **Tools:** a JDK 17+, the Android SDK command-line tools (build-tools 34+, platform android-34) and adb. Check
   what's already there (`java -version`, `$ANDROID_HOME`, `adb version`) and install only what's missing.
   - macOS: `brew install --cask temurin android-commandlinetools android-platform-tools`, then
     `sdkmanager "build-tools;34.0.0" "platforms;android-34"`.
   - Linux: OpenJDK 17, Android's command-line tools and adb from the package manager, then the same `sdkmanager` line.
   - Windows: Git Bash (what Claude Code runs there; `build.sh` handles it) or WSL, then as on Linux.
3. **Settings:** run `./build.sh` once; it creates `config.properties`. Fill in `latitude` and `longitude` (decimal
   degrees) and `city` for their city, `tmdb_region` (two-letter country), `show_crypto`, `currency` and `temperature` to match.
4. **The TMDB key is theirs and secret.** Ask them to create one (free: themoviedb.org → Settings → API) and paste it
   after `tmdb_key=` in `config.properties` themselves. Don't ask for it in the chat, never print it, never commit
   it. If they paste it in the chat anyway, put it only in `config.properties`.
   Without a key everything works except the picks and the screensaver photos.
   The same goes for the optional `watchmode_key` (free, watchmode.com; makes picks open the title's page): theirs, secret, only in `config.properties`.
5. **Build:** `./build.sh` → `FreeMyTV.apk`. Keep `freemytv.keystore`: updates must be signed with the same key.
6. **Install:** `adb connect <IP>:5555`. The TV asks *Allow USB debugging?*: tell them to accept and tick *Always
   allow*. Then `adb install -r FreeMyTV.apk`. If it hangs, Google Play Protect is asking on the TV (Android 14:
   *Risky app blocked*, "built for an older version of Android", since targetSdk is 33): they choose *More details* →
   *Install anyway* (updates don't ask again). On TCL, also `adb shell "appops set io.freemytv AUTO_START allow || appops set io.freemytv APP_AUTO_START allow"`
   (some firmware calls the operation `APP_AUTO_START`; this tries both):
   TCL's `TclAppBoot` blocks background jobs by default, so the switch (and the watchdog) never run. The log shows
   `forbid bind service ... ModeJob`. Some TCL firmware has neither (a 2024 MediaTek Google TV, Android 14, has no
   `TclAppBoot`): both names answer `Unknown operation string`, and nothing needs allowing.
   Chromecast with Google TV (Android 14) refuses port 5555 even with USB debugging on: have them turn on *Wireless
   debugging*, pair with `adb pair <address:port> <code>` (the code is on the TV), then run `adb tcpip 5555` over that
   connection. It closes again at every restart (Wireless debugging turns itself off; `persist.adb.tcp.port` is
   refused), and until `adb tcpip 5555` runs again *Original*, the watchdog and the boot check can't reach ADB. Tell
   them before the switch (#195). Google TV's voice results for films and shows come from its home app (launcherx),
   which Free My TV mode turns off; ADB can't turn off only its home activities, so tell them before they switch.
   On a Mac, `adb connect` can fail with `No route to host` while the TV answers (`nc -z <IP> 5555` connects): macOS's
   Local Network privacy blocks the adb server that adb starts in the background. Start it from the same terminal
   instead (`adb kill-server; adb nodaemon server &`), or allow the terminal app under System Settings → Privacy &
   Security → Local Network.
7. **Tell them what the switch does** before they make it: the home screen and screensaver change, a short list of
   promo apps is turned off (never uninstalled), and *Original* brings it all back. On TCL, the remote's Netflix,
   YouTube and Prime buttons keep working through a small accessibility service that only reads those buttons
   (*Free My TV* → *Remote Buttons* picks what each opens); *Original* turns it off. On Xiaomi TVs whose remote has no
   Home button, the same service makes its Mi button open Free My TV instead of PatchWall.
8. **They switch on the TV:** *Free My TV* → *Home Screen* → *Free My TV*. The app uses the TV's own ADB on
   127.0.0.1 with its own key, so the TV asks once more to allow debugging. Don't switch modes from the computer.
   Before they switch, run `adb disconnect <IP>:5555` (connect again for step 9): on Android 8 to 10 the TV can hand
   its answer to a computer that's still connected (#221).
   If the TV's Wi-Fi was saved during its first setup, the switch stops before changing anything and asks them to
   forget the network and connect again in Settings (Network & Internet); then the switch goes through. Saved
   networks out of range don't show in Settings: find the ones with `cname=com.google.android.tungsten.setupwraith`
   in `adb shell dumpsys wifi` (each block starts with its `ID:`), and with their OK remove them with
   `adb shell cmd wifi forget-network <id>`.
9. **Check:** `adb logcat -s FreeMyTV` shows what the switch did.

A new brand or model: `.claude/rules/adapting-a-tv.md` (read the TV first, then `HomeMode` and `HomeApps` lists).

## Installing it on an LG TV (webOS)

On LG it's an app, installed through LG's Developer Mode, and it changes nothing else on the TV: LG's home screen
stays, and Free My TV opens with a long press of a number key.

1. **Ask** for the TV's IP address and their city, if they didn't say. Tools: Python 3 and OpenSSH (`ssh`,
   `ssh-keygen`), already on macOS, Linux and Windows 10+.
2. **On the TV** (they do it): LG Content Store → *Developer Mode* → sign in with a free LG developer account
   (webostv.developer.lge.com) → *Dev Mode Status* on (the TV restarts) → *Key Server* on. It shows the IP and a
   passphrase.
3. **Settings:** the same `config.properties` as on Android (the first `python3 webos/build.py` creates it). The
   TMDB key rules above apply.
4. **Build:** `python3 webos/build.py` must end with `Built FreeMyTV-webos.ipk`.
5. **Install:** the first time needs the TV's passphrase, typed by them: ask them to run
   `python3 webos/install.py <IP>` in their own terminal (yours can't answer its prompt, and the passphrase doesn't go
   in the chat). It keeps the unlocked key in `~/.ssh/freemytv_webos_<IP, dots as underscores>`, so later updates run
   from your terminal with the same command.
6. **Tell them:** while Free My TV is open, holding a number key pins it to that key (on a remote without number keys,
   it's in LG's app list on the home screen). Developer Mode lasts about 40 days; *EXTEND* in that app renews it (if
   it runs out, the TV removes developer apps, and installing again brings it back). `--uninstall` removes Free My TV.
   Without a computer, the webOS Homebrew Channel installs the release build from `https://freemytv.io/webos/apps.json`
   (no TMDB key, the city from the time zone); someone with their own build shouldn't update from there.

## Installing it on a Samsung TV (Tizen)

On Samsung it's an app too (2017 and newer, Tizen 3+), installed through Samsung's Developer Mode; Samsung's home
screen stays. Two ways:

- **The release, no tools:** TizenBrew Installer (github.com/reisxd/TizenBrewInstaller) installs the latest GitHub
  release when they type `simbasjungles/free-my-tv`, and on 2023+ TVs signs it with their Samsung account. That build
  has no TMDB key (no picks) and takes the city from the TV's time zone. Walk them through the README's steps.
- **Their own build** (their city, their TMDB key), below.

1. **Ask** for the TV's IP address and their city, if they didn't say.
2. **On the TV** (they do it): *Apps* → type `1 2 3 4 5` on the remote → *Developer mode* on, *Host PC IP* = this
   computer's IP → restart the TV.
3. **Tools:** Samsung's `tizen` command to sign and `python3 tizen/install.py` to install (it speaks SDB itself, so no
   Tizen Studio and no Rosetta). How to get a native `tizen` on Apple Silicon: `.claude/rules/samsung-tizen.md`.
4. **Certificate, once:** 2023+ TVs (Tizen 7+) need a Samsung certificate made with their Samsung account for this
   TV; 2017-2022 TVs take a Tizen certificate. The commands are in `.claude/rules/samsung-tizen.md`. Certificate
   passwords are theirs: they type them in their own terminal, never in the chat.
5. **Settings:** the same `config.properties`; the TMDB key rules above apply.
6. **Build and sign:** `python3 tizen/build.py --sign <profile>` must end with `Built FreeMyTV-tizen.wgt (...,
   signed with "<profile>")`.
7. **Install:** `python3 tizen/install.py <IP>`; it succeeded only when the TV said `install completed`. Updates need
   the same certificate (uninstall first otherwise). `--uninstall`, Samsung's own `sdb`/`tizen` commands and the sdbd
   traps: `.claude/rules/samsung-tizen.md`.
8. **Tell them:** *Autorun Last App* in the TV's settings (under Start Screen Options; where it is changes by year)
   makes the TV turn on into Free My TV.

## Releases

TizenBrew Installer takes the first `.wgt` of the latest GitHub release, so every release carries
`FreeMyTV-tizen.wgt`: built with `--generic` (no config.properties: no key, the city from the time zone) and signed
with a Tizen certificate (`--sign`), which 2017-2022 TVs install as it is; on 2023+ TVs the installer signs it again
with the person's Samsung certificate. Sign every release with the same author certificate: older TVs refuse an
update signed by another. `python3 webos/build.py --generic` makes the LG `.ipk` that goes along. Then
`python3 tools/homebrew_repo.py <the uploaded FreeMyTV-webos.ipk>` writes `docs/webos/apps.json`, the webOS Homebrew
Channel repository (https://freemytv.io/webos/apps.json, with that file's SHA-256): commit it with the release.
Tag `vX.Y.Z`, move the version in `app/AndroidManifest.xml`, `webos/appinfo.json` and `tizen/config.xml` together,
and add the release's section to `CHANGELOG.md`.

## Pull requests, merging, deploying

- Run `tools/check.sh` before you push. `.github/workflows/check.yml` runs it on every pull request and push to
  `main` (JDK 17, build-tools 34, android-34: the README's versions, not the newest).
- Upstream is github.com/simbasjungles/free-my-tv (`origin`, read-only for us): changes meant for everyone go there
  as a pull request, and its maintainer merges them (merge commits) once `Check` is green.
- The AnonymousScripting fork (`fork`) is ours: branch, open the PR there, merge by risk. Docs, chores and small fixes
  squash-merge once `Check` is green (or has no run: the fork's Actions were never enabled); data deletion, secrets,
  money and merge-system changes wait for the fork's owner. Bring upstream in with `git merge origin/main`
  (`gh repo sync` only fast-forwards and fails once the fork has its own commits).
- The website deploys itself: a push to `main` that changes `docs/**` runs `pages.yml` and publishes to GitHub Pages.
  `docs/index.html` (English) and `docs/pt/index.html` (Brazilian Portuguese) are the same page in two languages, so
  change both; visitors from Brazil land on the Portuguese one by themselves, and the PT/EN switch is remembered.
  The apps have no store listing: they reach TVs through a person's own build or a GitHub release.

## Secrets

`config.properties` (`tmdb_key`, `watchmode_key`), `freemytv.keystore` and Tizen certificate passwords stay on the
person's machine: gitignored, never in the chat, never in the log (`AppLog` never logs keys), never in these files.
`tools/translate.py --fill` reads `ANTHROPIC_API_KEY` from the environment and sends only the strings.

## Always

- Google TV's setup app (`setupwraith`) goes off before the stock home screen and comes back after it, everywhere
  (`targets` order, `applyOriginal`, `revertHomeNow`, `verifyNow`): with the home screen off and it on, its
  RecoveryActivity takes Home, and a restart there factory-reset a Xiaomi. If it can't go off, the home screen stays on.
  The Kalley 43G200 (`R3_GTV`) turns it back on at every start and boot-looped without its home screen: the switch
  refuses there. On Amazon Fire TV (Fire OS: `HomeMode.AMAZON`), Amazon's launcher keeps the Home button (`priority=950`
  on `CATEGORY_HOME`), so the switch refuses Free My TV mode while *Original* and the watchdog still run, and no
  `com.amazon.*` package is ever turned off (`mayTurnOff`).
- Never turn off an app that saved a Wi-Fi network: Android deletes its networks and Original can't bring them
  back (`wifiOwners` in `HomeMode`). When the Wi-Fi service doesn't answer, the switch stops on Wi-Fi, and the boot
  check leaves the setup app and the stock home screen for later.
- Never commit `config.properties`, `*.keystore` or any key.
- Never uninstall or clear the data of system apps; only `pm disable-user --user 0`, through `HomeMode`, so
  *Original* can bring it back.
- Don't change the TV's picture, sound, network or account settings.
- Keep the way back working: the *Original* mode and the watchdog.
- Don't switch modes from the computer: the person does it on the TV, so the TV's own ADB prompt reaches them.
