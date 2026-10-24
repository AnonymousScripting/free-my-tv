---
paths:
  - "app/assets/i18n/**"
  - "tools/translate.py"
  - "web/strings.js"
---

# On-screen text and the translation catalogues

One catalogue per language, `app/assets/i18n/<lang>.json`, keyed by the English text in the code. The Android app
reads them directly; the LG and Samsung web app gets the keys it uses packed into `i18n.js` by `tools/webapp.py`.

- Android: `Ui.tr("English")` (one HashMap lookup, English when a language lacks it). Text built at runtime is a
  pattern: `Ui.trf("{n} min ago", "n", 12)`, never concatenated words. A key `"context|Text"` is the same English where
  a language may need another word (`"unit|Automatic"`, `"format|h:mm"` holds a SimpleDateFormat pattern). A count
  with a word is `Ui.plural("plural|one:{n} season|other:{n} seasons", n)`: each catalogue gives one form per CLDR
  plural category of its language (`one`/`few`/`many`/`other` in Russian, Ukrainian, Polish; only `other` in Japanese,
  Chinese…), and ICU's rules pick one. Dates and numbers use `Ui.locale()`. Text drawn every frame is cached and made
  again when `Ui.generation` changes.
- Web (`web/strings.js`): `tr('Live TV')`, `trf('{n} min ago', {n: 12})`, `plural('plural|…', n)` and
  `formatDate('format|h:mm a', at)` (the catalogue's SimpleDateFormat pattern). `tools/translate.py` reads those calls
  too.
- After changing text, run `python3 tools/translate.py`: it rebuilds `en.json` from the code and lists what each
  language lacks. Translate those in every catalogue, or `--fill` with `ANTHROPIC_API_KEY` set (it sends only the
  strings, never code or keys), and keep placeholders as they are. `--prune` drops strings the code no longer uses.
  `python3 tools/translate.py --check` validates every catalogue without writing (CI runs it).
- Portuguese, Spanish, German, Russian, Thai and Turkish are hand translations: the reference, edited by hand, never
  replaced with machine ones. The other catalogues were machine-made; corrections from native speakers go in by hand.
- `python3 tools/translate.py --new ca` starts a catalogue; then fill it by hand or with `--fill --lang ca`.
- No right-to-left languages yet (the layout isn't mirrored); CJK and Devanagari use the system font (Inter has no
  such letters).
