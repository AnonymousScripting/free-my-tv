# Architecture decision records

One file per decision that shapes the code and would be expensive to reverse: `NNNN-slug.md`, numbered in order,
never renumbered. Each says what was decided, why, what it costs, and what would make us revisit it. Rules that
follow from a decision live in `CLAUDE.md` or `.claude/rules/`; the vocabulary in `CONTEXT.md`. A superseded ADR
stays, with its status changed and a link to the one that replaced it.

Start from [`0000-template.md`](0000-template.md). Keep it under a page; link the commit or PR that made the change.

| ADR | Decision |
|---|---|
| [0001](0001-plain-android-sdk-build.md) | A plain Android app built by `build.sh`, no Gradle, no libraries |
| [0002](0002-tv-side-adb-for-the-switch.md) | The switch runs through the TV's own ADB, from inside the TV |
| [0003](0003-disable-never-uninstall.md) | Apps are disabled, never uninstalled, so *Original* can undo everything |
| [0004](0004-es5-web-app-for-lg-and-samsung.md) | LG and Samsung get the same screen as a framework-free ES5 web app |
