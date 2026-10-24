# Samsung (Tizen): tools, certificates and what `tizen/install.py` does

The install steps are in `CLAUDE.md` ("Installing it on a Samsung TV"). This file holds the tooling detail they point
to. Code rules for `web/` and `tizen/` are in `web-app.md`.

## Tools without Rosetta

Samsung's `tizen` command (Tizen Studio's CLI) signs the package; `python3 tizen/install.py` installs it and speaks
SDB itself. Samsung's Claude Code plugin `tizen-sdk-skills` (github.com/Samsung/tizen-agent-skills) installs the CLI
and makes Samsung certificates. `tizen` runs on Java; Samsung's `sdb`, its new `tz` and Tizen Studio's installer (with
its own JDK) are Intel binaries on macOS. On Apple Silicon without Rosetta, take the CLI from Samsung's package
repository (download.tizen.org/sdk/tizenstudio/official, `pkg_list_macos-64`; check each zip's SHA256 there): unzip
the `data/` of `new-common-cli`, `certificate-generator`, `sdk-utils` and `sdk-utils-core` into `~/tizen-studio`,
then write `~/tizen-studio/sdk.info` with three lines, `TIZEN_SDK_INSTALLED_PATH=<that folder>`,
`TIZEN_SDK_DATA_PATH=<home>/tizen-studio-data` and `JDK_PATH=<a native JDK 17's .jdk folder>` (Homebrew:
`/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk`). That `tizen` signs natively.

## Certificates, once per TV

- 2023+ TVs (Tizen 7+) need a Samsung certificate, made with the person's Samsung account for this TV (its DUID): the
  plugin's Samsung profile opens the browser for them to sign in, or Tizen Studio's Certificate Manager does it.
- 2017-2022 TVs take a Tizen certificate: `tizen certificate`, then `tizen security-profiles add` and
  `tizen cli-config "profiles.path=<home>/tizen-studio-data/profile/profiles.xml"`; on macOS the passwords go to the
  login Keychain.
- Certificate passwords are theirs: they type them in their own terminal, never in the chat.
- Updates need the same certificate: the TV refuses one signed by another (uninstall first). Releases are signed with
  one author certificate for the same reason (`CLAUDE.md`, "Releases").

## What `tizen/install.py <IP>` does

It pushes the app over SDB (port 26101), installs it with the TV's `0 vd_appinstall` and opens it with
`0 was_execute` (tested on 2017 Tizen 3.0 and 2019 Tizen 5.0 TVs). It reports success only when the TV says
`install completed`, because `cmd_ret:0` comes after failures too. `--uninstall` removes it; some TVs' sdbd doesn't
answer that, and then it's removed on the TV (Apps, Settings, Free My TV, Delete).

With Samsung's tools instead: `sdb connect <IP>`, `tizen install -n FreeMyTV-tizen.wgt -t <serial from sdb devices>`
and `tizen run -p FreeMyTVio.FreeMyTV -t <serial>` (the app id is in `tizen/config.xml`).

A retail TV's sdbd only takes files (`filesync_support:push`): nothing can be pulled from it.

## Looking inside the running app

`0 debug FreeMyTVio.FreeMyTV 300` over SDB opens the app with a Web Inspector port (`Runtime.evaluate` works on
Tizen 3; screenshots don't). Caution, seen on a 2022 QN95B (Tizen 6.5) on 2026-10-22: `0 debug` and `0 setRWIAppID`
left a sticky inspector target, and the TV showed a "Fast RWI" dialog on every launch of the app until it was
reinstalled under a new app id. Use them only on a TV you can re-id, and check afterwards that the inspector port
(7011 there) is closed.
