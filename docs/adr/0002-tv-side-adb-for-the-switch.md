# 0002. Switch home screens through the TV's own ADB, from inside the TV

- Status: accepted
- Date: 2026-10-23 (records a decision in place since the first commit)
- Where: `Adb.java`, `HomeMode.java`, `ModeJob.java`

## Context

Replacing the home screen, the screensaver and disabling promo apps needs `cmd package set-home-activity`,
`settings put secure screensaver_components` and `pm disable-user`: shell-level commands a normal app cannot run. The
alternatives were root (unsafe, voids warranties, impossible on most TVs) or keeping a computer connected for every
change (the person's phone or laptop would have to be there to go back to *Original*).

## Decision

The app carries its own ADB client (`Adb`) and connects to the TV itself at `127.0.0.1:5555` with its own key, which
the TV approves once with the same *Allow USB debugging?* prompt a computer gets. Every switch runs as a background
job (`ModeJob`) in the main process, started only from the settings screen on the TV. Nothing listens on the network.

## Consequences

- No root, nothing uninstalled, and the way back (*Original*, the watchdog, the boot check) works with no computer.
- Cost: USB debugging must stay on, and on devices that close port 5555 at every restart (Chromecast with Google TV,
  Android 14) `Original` and the watchdog cannot reach ADB until `adb tcpip 5555` runs again; `CLAUDE.md` tells the
  person before the switch (#195).
- The person must make the switch on the TV, never from the computer, so the TV's prompt reaches them and (on
  Android 8 to 10) the answer isn't handed to a connected computer (#221).
- Revisit if Android removes local ADB for apps, or a vendor ships a supported API for the Home role.
