# AGENTS.md

Instructions for AI coding agents (Codex, Cursor, Copilot, Gemini, Aider and others) working in this repo.

**The canonical project instructions are in [`CLAUDE.md`](CLAUDE.md); read it in full before doing anything.** It is
written for any assistant, not only Claude Code: the install flows for Google TV, LG and Samsung, the release steps,
the merge policy and the safety rules. Topic rules are in [`.claude/rules/`](.claude/rules/); `CLAUDE.md` names the
one to read for each area. Vocabulary and the architecture map are in [`CONTEXT.md`](CONTEXT.md), decisions in
[`docs/adr/`](docs/adr/).

## What this is

A fast, ad-free home screen for Google TV and Android TV (a plain Java app, no Gradle), and the same home screen as a
web app for LG (webOS) and Samsung (Tizen) TVs. Most people asking for help are not technical: explain each step
simply, say what you're about to do on their TV, and let them do the taps on the TV.

## Commands

- Android app: `./build.sh` (JDK 17+, Android build-tools 34, android-34, adb) → `FreeMyTV.apk`.
- Everything CI checks: `tools/check.sh` (`android` or `web` for one half).
- LG: `python3 webos/build.py`, `python3 webos/install.py <IP>`. Samsung: `python3 tizen/build.py --sign <profile>`,
  `python3 tizen/install.py <IP>`. Preview in a browser: `python3 webos/build.py --preview` → `out/webos/index.html`.
- Text changed in the code: `python3 tools/translate.py` (then `--check`).

## Code style

- Java 8 language level, Android SDK only, no libraries. Nothing allocated in `onDraw`; the home screen is one Canvas.
- `web/` is ES5 and CSS without variables, grid or backdrop-filter (TVs from 2015-2017); `tools/check.sh web` enforces it.
- Every on-screen string goes through `Ui.tr` / `tr()` and the catalogues in `app/assets/i18n/`; never concatenate words.
- Comments in English, short, only where the why isn't obvious. Commit messages say what changed for the person, as
  the history does ("Samsung: Prime Video on 2020 TVs reaches the shelf").

## Testing

There is no unit test suite. `tools/check.sh` must pass (it is what `.github/workflows/check.yml` runs on every PR).
A change to `HomeMode`, `HomeApps`, `web/tv.js` or an install script also needs a real switch on a TV and a switch
back to *Original*, with `adb logcat -s FreeMyTV` read in between.

## Pull requests and merging

Branch, run `tools/check.sh`, open a PR. Upstream (`simbasjungles/free-my-tv`) is merged by its maintainer with merge
commits. In the AnonymousScripting fork, PRs merge by risk: docs, chores and small fixes squash-merge once `Check`
passes; data deletion, secrets, money or merge-system changes wait for a human. A push to `main` touching `docs/**`
publishes the website.

## Rules that must not be skipped

1. **The TMDB key, the Watchmode key, the keystore and certificate passwords are the person's.** They go in
   `config.properties` or their own terminal, never in the chat, the log, a commit or these files.
2. **Never uninstall or clear the data of a system app.** Only `pm disable-user --user 0` through `HomeMode`, so
   *Original* can bring it back. Never touch an app that saved a Wi-Fi network (Android deletes the network).
3. **Google TV's setup app goes off before the stock home screen and comes back after it,** in every code path;
   the other order left a Xiaomi factory-reset. Fire TV never gets Free My TV mode and no `com.amazon.*` goes off.
4. **Don't switch modes from the computer.** The person switches on the TV, where its ADB prompt reaches them.
5. **Keep the way back working:** *Original* mode, the watchdog (3 crashes in 5 min) and the boot check.
6. **Don't change the TV's picture, sound, network or account settings.**
7. **Run `tools/check.sh` before you push**, and move the three version numbers together at a release
   (`app/AndroidManifest.xml`, `webos/appinfo.json`, `tizen/config.xml`).
