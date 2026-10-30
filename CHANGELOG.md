Oct 30, 2026 — 8:22 AM PT — HEAD — Prepared the verified owner-only production release
- Deployed owner-only Firestore rules after model/build and authorization tests passed.
- Retained previous rules locally; existing student records were not changed.
- Publishing the interface through the existing GitHub Pages main branch.

Oct 29, 2026 — 5:04 PM PT — HEAD — Restricted the site to the owner’s Google account
- Enforced verified Google sign-in for tgreenleaf@markdayschool.org in the app and database rules.
- Removed the active Faculty grant requirement; other accounts cannot open shared charts.
- Deployment awaits Firebase project access.

Oct 29, 2026 — 4:57 PM PT — HEAD — Added the Creativity Lab room designer
- Added six-table landscape layout with a right-side screen, classroom presets, editable room size, table shapes and sizes, snap movement and room objects.
- Preserved room dimensions in templates, history and shared charts; verified responsive fitting and Undo.

Oct 29, 2026 — 4:40 PM PT — HEAD — Approved Faculty accounts without organizational-unit checks
- Replaced the Directory integration with individual, expiring administrator-approved Faculty accounts.
- Removed the Google APIs dependency; school domain alone still cannot grant access.
- Added allowlist validation and policy tests. Production grants are not changed by this commit.

Oct 29, 2026 — 4:35 PM PT — HEAD — Redesigned classroom seating with private Faculty access
- Added a warm responsive room editor, student assignment and swaps, table controls, undo/redo, CSV and Sheets import, history and layout templates.
- Preserved legacy data fields and IDs; gender display defaults off, and notes are excluded from shared charts and exports.
- Added expiring Directory-verified Faculty grants, restrictive Firestore rules, synthetic tests and an administrator deployment gate.

`HEAD` identifies the commit containing this entry; use Git history for its final hash. A commit cannot contain its own hash.
