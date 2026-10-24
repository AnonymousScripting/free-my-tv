# 0004. LG and Samsung get the same home screen as a framework-free ES5 web app

- Status: accepted
- Date: 2026-10-23 (records the decision behind releases 1.0.0 and 1.1.0, 2026-10-20 to 2026-10-22)
- Where: `web/`, `webos/`, `tizen/`, `tools/webapp.py`, `tools/check.sh`

## Context

webOS and Tizen have no ADB and no Home role an app can take, so the Android approach does not transfer. Both do run
web apps installed through their Developer Modes, but a 2017 Samsung (Tizen 3) or a 2016 LG (webOS 3) runs a
Chromium from 2015 to 2017: no CSS variables, grid or backdrop-filter, no `fetch`, `Promise`, `Object.assign` or
`includes`. A framework or a transpiler would hide those limits until the app failed on the person's TV.

## Decision

`web/` is the Android home screen rewritten in plain ES5 JavaScript and old CSS, with the same layout and behavior as
`HomeView` (`web/home.js` follows it; a design change on Android belongs there too). `web/tv.js` isolates the TV's
side (Luna on LG, Tizen's web APIs on Samsung, a stand-in in a desktop browser). `webos/build.py` and
`tizen/build.py` pack it without LG's or Samsung's SDKs; `webos/install.py` and `tizen/install.py` install it over
SSH and SDB with Python alone. `tools/check.sh web` parses every file as ES5 and greps for the calls those browsers
lack, on every pull request.

## Consequences

- One design on three platforms, installed from any computer with Python 3; the generic build also ships through
  TizenBrew Installer and the webOS Homebrew Channel with no computer at all.
- Cost: two implementations of the home screen to keep in step, and no modern JavaScript in `web/` (feature checks
  wrapped in `try`, as `strings.js` does). Rules in `.claude/rules/web-app.md`.
- Revisit when the oldest supported TVs (Tizen 3, webOS 3 and 4) leave the install base.
