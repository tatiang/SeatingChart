# Seating Chart Builder v2.00

A warm, responsive classroom seating editor for verified Mark Day School Faculty.

## Local development

```sh
npm ci
npm run check
python3 -m http.server 4173
```

Open `http://localhost:4173/?demo=1` for fictional, in-memory data. Normal mode requires verified Google sign-in and an unexpired server-provisioned Faculty grant. The demo never loads cloud student data.

The editor supports room/grid/list views, roster-to-seat assignment and swaps, keyboard/touch alternatives, table movement/rotation/duplication, undo/redo, CSV and school Google Sheets import, constraints, randomized previews, history, layout templates, archive/restore, neutral gender defaults and private notes. Use the Help button for interaction instructions.

## Architecture

- `core.js`: additive migration, seating operations, randomized constraints, CSV and sanitized snapshots.
- `app.jsx` → `app.js`: React editor and Firebase integration. Build before committing.
- `styles.css`: responsive layout, warm classroom, focus states and print rules.
- `sheets.js`: retained school roster integration; data is not cached in shared browser storage.
- `firestore.rules`: per-teacher isolation, expiring Faculty grants and restricted sharing.
- `admin/`: privileged Workspace Directory verifier, never invoked by the browser.

Read [ADMIN_SETUP.md](ADMIN_SETUP.md) before deploying. **Deployment is blocked until the exact Faculty OU, delegated Directory access, restrictive rules and authorization tests are validated.** Do not use the old public sharing rules.

## Verification

`npm test` exercises synthetic model data. `npm run build` compiles the browser bundle. `npm run test:rules` tests the Firestore rules in a local emulator and needs Java 21+. No production data is touched.

For UI checks, use demo mode: select a roster student then a seat; drag a table; use Undo/Redo; preview and apply Randomize; open Grid and List; create a student and class; save and restore history/templates; check iPad and mobile drawers. Confirm gender colors are off initially, notes never appear on outputs, and demo sharing is disabled.
