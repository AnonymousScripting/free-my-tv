# 0003. Disable apps, never uninstall them, and protect what the TV needs

- Status: accepted
- Date: 2026-10-23 (records a decision in place since the first commit; guards added through 2026-10)
- Where: `HomeMode.java` (`DEBLOAT`, `PROTECTED`, `CORE`, `FACTORY`, `mayTurnOff`, `neededByTv`, `wifiOwners`)

## Context

Free My TV turns off the stock home screen and a short list of promo, demo and telemetry apps. On a TV, turning off the
wrong package can mean no inputs ("No signal"), no remote, a boot loop or a factory reset, and most people have no
way to recover a TV from a computer. Debloat lists copied from other projects had turned off pieces TVs depended on.

## Decision

Only `pm disable-user --user 0`, never `pm uninstall` or `pm clear`, so *Original* can re-enable everything with one
button and a reinstall still finds the list of what was turned off. `DEBLOAT` holds only promo, demo, store-mode and
telemetry apps, by brand, one comment per line. `PROTECTED`, `CORE` and `FACTORY` are checked before every change;
`neededByTv` asks the TV itself whether a package holds `TV_INPUT_HARDWARE` or receives the Input key; `wifiOwners`
refuses any app that saved a Wi-Fi network, because Android deletes the network with it. Google TV's setup app goes
off before the stock home screen and comes back after it, in every code path, because the other order let its
RecoveryActivity take the Home button and a restart there factory-reset a Xiaomi. A `Watchdog` restores the stock
home screen after three crashes in five minutes.

## Consequences

- Everything is reversible from the TV; nothing the person owns is lost.
- Cost: disabled apps still take storage, and a few TVs (Kalley 43G200, Fire TV) are refused Free My TV mode because
  their firmware re-enables or owns the home screen. The rules live in `CLAUDE.md` ("Always") and
  `.claude/rules/adapting-a-tv.md`.
- Revisit only with a recovery path that works without a computer.
