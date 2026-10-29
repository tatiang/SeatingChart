# Seating Chart Builder v2.00 — prepared for review

The redesigned application uses a light three-column layout and a warm classroom workspace, with room/grid/list views, pointer and keyboard seat assignment, swaps, table movement/rotation/duplication, individual seats, zoom/scroll panning, undo/redo, roster management, CSV/Google Sheets import, history, layout templates, class archive/restore and print/export.

Data migration retains existing IDs, notes, assignments, furniture, constraints, unknown fields and history. Legacy overfilled tables expand their visible capacity rather than hiding assigned students. Preferences are saved within each teacher's record; optional gender categories and colors are editable and start off. Notes stay private and are omitted from chart outputs.

Faculty authorization is prepared using explicit administrator-approved accounts and a privileged allowlist verifier and expiring access documents checked by Firestore rules. Clients cannot grant access. Sharing is opt-in, faculty-only, read-only, owner-revocable and expires after seven days. Unsafe legacy shared snapshots and school-wide note paths are denied without deleting their contents.

## Validation
- 11 Node model/policy tests passed; browser bundle compiled.
- Firestore emulator tests passed for authorized access, unauthorized identities, teacher isolation, grant tampering, sharing creation/expiry/revocation and legacy collection denial.
- Synthetic browser checks passed on desktop, iPad-size and phone-size viewports. Actual iPad hardware and authenticated school account tests remain to be performed during rollout.
- Administrator dependency audit: zero reported vulnerabilities. Development-only Firebase CLI dependencies retain six moderate advisories; high-severity gRPC findings were patched. No npm runtime dependency is loaded into the shipped browser bundle.

## Not deployed
Workspace administrator configuration and live authorization validation are required. No production data, security rules, hosted files, or personal Google account settings were changed. Read ADMIN_SETUP.md before any release. Existing whole-document saves retain a 1 MiB limit and last-writer-wins behavior; avoid simultaneous editing across devices. Legacy school-wide notes need an administrator-reviewed migration before their old access is disabled.

## Authorization update
OU checks and Directory delegation are deferred at the user’s request. Approvals name individual school Faculty accounts, expire within 30 days and issue grants lasting at most one hour. Administrators must maintain the allowlist and handle offboarding; Workspace suspension and OU changes are not automatically checked. No production approval list or grants have been created.
