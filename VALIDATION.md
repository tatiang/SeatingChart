# Verification record — October 29, 2026

All application and emulator fixtures use synthetic students and identities.

## Commands

- `npm run check` — PASS (11 tests and production browser bundle).
- `node --check admin/sync-faculty.mjs` — PASS.
- `node --check sheets.js` — PASS.
- `git diff --check` — PASS.
- `JAVA_HOME=/private/tmp/seating-jdk21/Contents/Home PATH=/private/tmp/seating-jdk21/Contents/Home/bin:$PATH XDG_CACHE_HOME=/private/tmp/seating-firebase-cache npm run test:rules` — PASS; local `demo-seating-v2` emulator only.
- `python3 -m http.server 4173 --bind 127.0.0.1` — local preview server for browser checks.

The first dependency installation and preview-server start needed network/listening permission, then succeeded. The system Java 8 was insufficient, so a temporary Eclipse Temurin Java 21 runtime was used. An approval-service usage-limit interruption delayed one final emulator rerun; the authorized retry passed.

## Browser checks and expected results

At `http://localhost:4173/?demo=1`:

1. Drag Emma from the roster to an empty seat. The target displays Emma and her prior seat becomes empty. PASS with pointer events.
2. Select a student and then an occupied seat. The assignments swap. Pure-model test PASS; selection-to-seat placement, Undo and Redo browser PASS.
3. Drag a table header; select its header and press an arrow key. Position updates, and Undo reverses it. PASS.
4. Choose Randomize. A modal preview appears before any change. Apply creates a history entry. PASS.
5. Add a student with a private synthetic note. The roster count increases. PASS.
6. Students → Import CSV → enter two fictional records → Preview → Add. Existing roster is retained and count increases by two. PASS.
7. Templates → Save this layout → enter a name → Save. Apply opens a confirmation and clears assignments only after confirmation. PASS.
8. Clear Assignments → Confirm → Undo. Assignments can be restored. PASS.
9. Room, Grid and List display the same class; desktop, 1024×768 and 390×844 layouts fit with responsive sidebars. Phone student drawer opens. PASS.
10. “Show gender colors” is off on initial load. Synthetic model tests verify gender does not affect randomization while off. PASS.

## Rollout-only checks still required

- Real Faculty approval, real Firebase administrator permissions, and administrator job reliability.
- Live Google authentication, authorized cloud save/reload, and unauthorized reads against the deployed rules.
- Actual iPad touch hardware, printer/PDF output and Google Sheets OAuth with school test accounts.
- Current production Firestore rules inspection and backup, legacy note migration, both pull requests, deployment and live portfolio link verification.

These checks were deliberately not represented as completed.

## Creativity Lab increment — Oct 29, 2026
- `npm run check`: PASS, 14 model/policy tests and production build. An initial grid-position test failed and was corrected by placing presets on the snap grid.
- `JAVA_HOME=/private/tmp/seating-jdk21/Contents/Home PATH=/private/tmp/seating-jdk21/Contents/Home/bin:$PATH XDG_CACHE_HOME=/private/tmp/seating-firebase-cache npm run test:rules`: PASS, including shared room metadata.
- `git diff --check`: PASS.
- Browser: Room designer → rows → Apply → Confirm shows 12 desks/24 seats; Undo restores six tables and all 16 fictional students.
- Select Table 1 → Shape → oval changes the table; Room designer → width 1200 → Resize → Screen right moves the screen; Add room object creates editable Supplies note.
- Desktop 1440×900 and phone 390×844 visually show six tables and right-side screen. Room fitting now measures both viewport dimensions before paint.
- Production login/deployment remains outside this local demo verification.
