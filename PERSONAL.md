# Personal MonoCode

This branch follows upstream **stable releases** and includes personal improvements before their upstream PRs merge. The contribution branch `fix/pi-background-lifecycle` remains independent (upstream PR #816).

## Daily use

Use `/Applications/MonoCode.app` as usual. Personal builds keep `com.monocode.desktop`, so existing settings and conversations are reused. The updater checks `https://github.com/Yeman-sker/monocode/releases/latest/download/latest.json` and verifies packages with this fork's public key. It uses the existing update notification and install confirmation; it does not interrupt work to install silently.

The `Personal macOS release` workflow checks upstream every six hours. It merges the latest stable tag into `personal`, runs the Pi/OMP lifecycle, updater and host tests, checks TypeScript, and builds an Apple Silicon macOS app. Only successful builds advance the branch and publish a new release. A merge conflict or failed check leaves the last working release available; the failed Actions run shows what needs fixing. GitHub scheduled runs can be delayed and schedules on inactive repositories can be disabled.

Version format: `0.10.0-personal.<GitHub run ID>`. Run IDs increase, so improvements built against the same upstream version remain eligible for updates. Personal releases use `personal-` tags to avoid the upstream `v*` publishing workflow.

## Contribute and use a new improvement

Keep one feature branch per upstream PR. Merge the desired branch into `personal` and push it to `fork`; this triggers a new build. Publishing a self-use release does not merge or modify the upstream PR. When upstream incorporates an improvement, review the next stable merge and remove any obsolete fork-only code.

To build again without a source change, dispatch `Personal macOS release` from the Actions page. The workflow file also lives on the fork's default branch because GitHub schedules and manual dispatch use that branch.

## Signing and recovery

Updater signatures use `TAURI_SIGNING_PRIVATE_KEY` in the fork's GitHub Actions secrets. The local recovery key is `/Users/yem/.config/monocode-personal/updater.key` (owner-only permissions); never commit it. `src-tauri/tauri.personal.conf.json` contains only the public key. Do not delete or regenerate the key casually: installed builds trust that public key.

macOS code signing remains ad-hoc, as in the previous local build. The fork updater signature verifies release authenticity independently; this is not Apple notarization.

The installation backup and database snapshot are kept in `/Users/yem/Developer/monocode-investigation/personal-install/`. Reinstall its previous app to roll back the application; do not restore an old database over newer conversations. For a move back to official releases, install the official app explicitly; personal builds do not switch update channels automatically.
