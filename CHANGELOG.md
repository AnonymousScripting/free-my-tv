# Changelog

All notable changes to Free My TV, for the people who use it. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions are the GitHub release tags.

## [Unreleased]

### Added
- My Photos: send your own photos from the computer (`tools/photos.py`) or a USB stick; the screensaver shows them,
  and without picks one is the home screen's background each hour. Up to 100; EXIF tags are removed on import.
- Amazon Fire TV: Free My TV runs as an app (`FireHomeActivity`); the switch refuses Free My TV mode there, since
  Amazon keeps the Home button, and no Amazon package is ever turned off.
- LG: a webOS Homebrew Channel repository at https://freemytv.io/webos/apps.json, so the release installs without a
  computer (#204). On webOS 6 and newer, the known apps show their logos until the TV allows the full app list.
- Xiaomi TVs: the Mi button opens Free My TV instead of PatchWall; on TVs sold in Russia the Okko, VK, Rutube, KION,
  Wink and IVI buttons can open the app you pick.
- HY300 projectors: Keystone and Screen Mirroring shortcuts in the drawer, and HDMI that opens.
- LG and Samsung: `hide_apps` leaves apps out of the shelf, All Apps and the picks; Jellyfin on the shelf.
- Translations: one catalogue per language in `app/assets/i18n/` (24 languages, #52), used by the LG and Samsung app
  too; Thai hand-translated, Turkish `tr.json` as a reference catalogue; a language list in Home Settings.
- CI: `tools/check.sh` builds everything and checks the catalogues on every pull request (`check.yml`).

### Changed
- Shelf: any number of apps, scrolling past what fits; a soft glow on the focused app at night.
- Glass on Android 8 to 12 drawn from bitmaps, with no shader per draw; rounded shapes on whole pixels.
- Picks: Apple TV taken only as TMDB provider 350, "… Amazon Channel" providers skipped (#209); the same rules on LG
  and Samsung.
- Prices: millions as "4.15M"; a failed Binance request no longer moves other currencies to dollars (#185).
- LG and Samsung: open in the night look at night; the pointer reaches the shelf; the clock turns on the minute.
- Home Settings: the list scrolls past ten rows.

### Fixed
- Switch on Android 8 to 10: the TV's ADB answer no longer goes to a computer still connected (#221).
- Samsung: HDMI inputs whose device is on standby open again; Prime Video on 2020 TVs reaches the shelf.
- Screensaver on Android 11 reads the settings again when it starts.

## [1.1.0] - 2026-10-22

### Added
- Samsung: `tizen/install.py` installs straight from a computer, no Samsung tools needed; 2017 TVs (Tizen 3) get
  logos, names and TV Settings.
- LG: TVs that won't let apps list what's installed (webOS 6 and 11) show your apps again.
- Hold OK on a shelf app to move it; 16:9 shelf tiles; navigation sounds can be turned off.
- Picks in your TV's language; Crunchyroll, Oneplay and JioHotstar picks; an optional Watchmode key opens a pick's
  own page in the app.
- More TVs: Xiaomi, Vestel (F&U), KTC (NextStar), Sony BRAVIA, Skyworth (VEON), Philco, Multilaser, Formovie
  projectors and the TCL C825, each with its own protected list; the remote's app buttons on Vestel, KTC, Sony and
  Formovie.
- German and Russian on LG and Samsung too.

### Changed
- Prices in your currency's format, in dollars where Binance has no pairs, from Binance.US in the US.
- Safer switches: Original brings everything back, keeps off what you had turned off yourself, and still remembers
  what Free My TV turned off after a reinstall.

## [1.0.0] - 2026-10-20

### Added
- The Free My TV home screen as an app on Samsung (Tizen, 2017 and newer) and LG (webOS 3 and newer) TVs: the glass
  shelf, the drawer with inputs, weather and prices, day and night, and its own settings. Installed through
  TizenBrew Installer (Samsung) or LG's Developer Mode.
- Google TV and Android TV: the home screen, the screensaver, the switch to and from *Original*, the watchdog.

[Unreleased]: https://github.com/simbasjungles/free-my-tv/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/simbasjungles/free-my-tv/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/simbasjungles/free-my-tv/releases/tag/v1.0.0
