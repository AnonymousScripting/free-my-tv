# 0001. Build the Android app with the SDK's own tools, no Gradle and no libraries

- Status: accepted
- Date: 2026-10-23 (records a decision in place since the first commit)
- Where: `build.sh`, `app/`

## Context

Free My TV is meant to be built by anyone, on any computer, often by an AI assistant following `CLAUDE.md` for a
person who has never built an app. Gradle brings a daemon, a dependency resolver, hundreds of megabytes and a long
first run; a library brings its own minSdk, its own bugs on old TV chips, and APK size. The home screen also has to
hit 60 fps on 1 GB TVs, where every allocation and every MB counts.

## Decision

`build.sh` runs aapt2 → javac → d8 → zipalign → apksigner directly against the Android SDK (build-tools 34,
android-34, JDK 17+), writes `Config.java` from `config.properties`, and signs with a keystore it creates once. The
code is Java 8 language level on the Android SDK alone: no Gradle, no AndroidX, no third-party library. The UI is
drawn by hand on one Canvas (`HomeView`, `DreamView`, `SettingsActivity`).

## Consequences

- A build needs only a JDK, the SDK command-line tools and adb; it takes seconds and makes a ~2 MB APK.
- Nothing is pulled from the network at build time; CI (`check.yml`) builds with the README's exact versions.
- Cost: no IDE project, no resource shrinking, no library for what Android lacks (`Recording` wraps RenderNode by
  hand, `Shadows` rasterizes blur for old GPUs). Rules in `.claude/rules/android-app.md`.
- Revisit if the app needs a dependency that cannot be reimplemented in a few hundred lines.
