---
paths:
  - "web/**"
  - "webos/**"
  - "tizen/**"
  - "tools/webapp.py"
  - "tools/make_zones.py"
  - "tools/homebrew_repo.py"
---

# The LG and Samsung web app (`web/`, `webos/`, `tizen/`)

- Plain ES5 JavaScript and CSS without variables, grid or backdrop-filter, since older TVs (webOS 3 and 4, Tizen 3)
  run a Chromium from 2015 to 2017; only transform and opacity animate. `tools/check.sh web` parses every `web/*.js`
  as ES5 (acorn) and greps for calls those browsers lack (`includes`, `startsWith`, `Object.assign`, `Promise`,
  `fetch`, `Map`…): wrap a feature check in `try`, as `strings.js` does, instead of calling them.
- `web/tv.js` is the TV's side. On LG, Luna (`listLaunchPoints`, `launch`, the inputs); where webOS 6 and newer deny
  `listLaunchPoints` to Developer Mode apps, the list comes from the TV's remote control API on `ws://127.0.0.1:3000`
  once the TV has allowed it (it asks once; a "no" isn't asked again), and until then from `getAppLoadStatus` over a
  list of known app ids, which shows the logo bundled in `web/icons/` where there is one, otherwise the name on the
  brand's color. On Samsung, `tizen.application` (`getAppsInfo`, `launch`), the `VIDEOSOURCE` property and
  `tizen.tvwindow.setSource` for the inputs, then Samsung's viewer (`org.tizen.tv-viewer`) to show them.
- Samsung's own data is unreliable: on Tizen 3 no app's `iconPath` loads (on Tizen 4 and 5, YouTube's and Prime
  Video's are a placeholder), so logos are bundled in `web/icons/` and keyed by app id in `SAMSUNG_ICONS` (SVGs need a
  width and height for old WebKit); some names are empty or long (`SAMSUNG_TITLES`); and Tizen 3 answers no "settings"
  app control, so TV Settings opens `org.tizen.menu`.
- `web/home.js` follows `HomeView`'s layout and behavior, so a design change on Android belongs there too.
- Text: the same catalogues as Android, packed into `i18n.js` by `tools/webapp.py` (only the keys `web/` uses). The
  calls are in `translations.md`.
- Built without a city (`--generic`), `web/zones.js` (`tools/make_zones.py`, from the tz database) turns the TV's time
  zone into the city, the currency and the region. `tools/webapp.py` is what both builds share (settings from
  `config.properties`, `--config PATH` or `--generic`; `hide_apps` becomes `hideApps`).
- What the person changes on the TV lives in `localStorage` under `fmtv.*` (`fmtv.prefs`, `fmtv.night`, the LG
  remote-API key in `fmtv.ssapKey`) and wins over `config.properties`, as `Prefs` does on Android.
- Preview on a computer: `python3 webos/build.py --preview` (or `python3 tizen/build.py --preview`), then open
  `out/webos/index.html` (or `out/tizen/index.html`) in a browser; a stand-in lists sample apps.
- `webos/build.py` must end with `Built FreeMyTV-webos.ipk`; `tizen/build.py --sign <profile>` with
  `Built FreeMyTV-tizen.wgt (..., signed with "<profile>")`.
- `tools/homebrew_repo.py` writes `docs/webos/apps.json`, the webOS Homebrew Channel repository
  (https://freemytv.io/webos/apps.json). Run it only on the exact `.ipk` uploaded to the GitHub release: the Channel
  checks that file's SHA-256 and size, and a JSON that no longer matches only fails the check.
