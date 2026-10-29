# Seating Chart Builder v2.00

## Acceptance and preservation
Preserve users/{uid}.d, original class/student/table IDs, assignments, history, notes, and unknown fields. Never deploy rules or modify production records without administrator validation. Match the supplied warm three-column workspace; implement pointer and keyboard seating, room/grid/list, roster, history/templates, privacy preferences, and safe randomized preview. Verify pure data operations with node tests, compile JSX, and exercise synthetic browser scenarios at desktop/iPad/mobile widths. Prepare portfolio card and admin deployment runbook.

## Progress
- [x] Verified both repository remotes and audited the existing single-file app.
- [x] Identified public sharing and unrestricted notes in documented legacy rules (deployed rules unknown).
- [x] Implement additive model and editor.
- [x] Implement expiring, server-provisioned Faculty access and restrictive rules.
- [x] Test and review responsive UI.
- [x] Prepare portfolio, changelog, release summary and commits.
- [ ] Administrator validation, security push approval, PRs and deployment.

## Decisions
Use existing Firebase project and users/{uid} document. Faculty authorization uses an expiring server-managed access document verified against Workspace Directory OU membership; clients cannot grant access. Existing sharedClasses and schoolNotes paths are denied by new rules and not deleted. New opt-in shared snapshots omit notes and gender by default and require authorized faculty. Keep legacy local data untouched; do not import a shared browser cache into a teacher account automatically.

## Surprises / risks
No backend, rules, package manifest or tests exist in the app repository. Domain hint is not authorization. Legacy randomization can exceed table capacity. Cloud load errors must never trigger an empty overwrite. Deployment is blocked until Workspace delegated credentials and the exact Faculty OU path are approved and emulator tests pass. Security changes require explicit push instruction per user rules.

## Validation results
10 Node tests pass. Browser bundle compiles. Expanded Firestore emulator suite passes after the patched gRPC dependency (Java 21 isolated under /private/tmp). Synthetic UI checks passed for roster and seat dragging, swaps by selection, table dragging and keyboard movement, undo/redo, randomized preview/history, named templates, CSV import, student creation, confirmation dialogs, and responsive 1024×768 / 390×844 layouts. No real student records used.

## Delivery boundary
Local implementation is prepared. Production Directory verification, live account access-control checks, deployment and deployed portfolio link verification remain blocked on administrator setup. Security-sensitive push requires the user's explicit instruction. The portfolio card must not be published ahead of the secured app. Six moderate advisories remain in development-only Firebase CLI transitive packages; administrator dependencies report zero advisories. The gRPC high-severity advisory was patched with a compatible override. Self-referential commit hashes cannot be embedded in their own committed changelog; entries use `HEAD`, resolved by Git history.
