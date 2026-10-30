Oct 30, 2026 — 2:30 PM PT — HEAD — Randomizer now balances gender at each table and asks what to do when seats run out
- With gender colors on, Randomize spreads each gender as evenly as possible across tables while keeping table sizes even. "No gender preference" is now an explicit option.
- If there are more students than seats, a prompt offers to add the extra students to the first tables (one seat each, in turn, up to 8 seats) or add new tables of 4. Both can be undone.
- Scripts now carry a version tag so a cached old file cannot mix with a new release.

Oct 30, 2026 — 1:45 PM PT — HEAD — Added quick gender editing for a whole class
- The Students tab has a gender dropdown on every student, plus "Apply to unspecified" and "Clear all" for the class. Changes can be undone.
- Gender stays optional and is never guessed; bulk apply leaves students who already have a value unchanged.

Oct 30, 2026 — 1:20 PM PT — HEAD — Fixed cloud saving failing with an empty-field error
- Saving any change, including an import, failed because the default display colors contained a blank name that the database rejects.
- Removed it and now strip blank names when saved data loads. No student data was affected; the failed save changed nothing.

Oct 30, 2026 — 12:40 PM PT — HEAD — Added class and student imports that work with no classes yet
- The Seats, Students, History, Templates and Settings tabs now each show their own page when an account has no classes, with import and create buttons.
- New import window: CSV files, pasted names or spreadsheet cells, and the two registrar Google Sheets (read-only, choose tabs, review before saving). A Class column in a CSV creates several classes at once.
- Imports add new classes or append to the current one, can be undone, and a registrar class already imported is blocked from importing twice. Teacher and legend rows are never imported as students.

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
