# Owner-only deployment

Current authorized account: `tgreenleaf@markdayschool.org`, verified Google sign-in only. Firestore enforces the exact email, verified-email claim and Google provider; user documents remain scoped to the authenticated UID. Other accounts are denied even if old Faculty grants exist. No OU or periodic approval job is required. Existing admin allowlist scripts are inactive legacy tooling.

Site URL: https://tatiang.github.io/SeatingChart/ . Pages publishes main at repository root.

## Deployment sequence
1. Authenticate Firebase CLI using an account with deployment access to seatingchart-a4cae. The currently connected personal account cannot access this project.
2. Inspect and retain current deployed rules for rollback review. No data deletion or schema migration is needed.
3. Run npm run check and the Firestore emulator tests.
4. Deploy with `npx firebase deploy --only firestore:rules --project seatingchart-a4cae`.
5. Merge the reviewed feature branch into main, verify Pages build and published assets.
6. Sign in as tgreenleaf@markdayschool.org, verify existing classes and save/load. Other accounts must be denied. Ensure tatiang.github.io remains an authorized Firebase Auth domain and Google provider is enabled.

## Current status
Account-only code and emulator verification prepared. Production rules and Pages have not been updated because Firebase project access is unavailable. Never publish just the frontend restriction as a substitute for server-enforced account-only access.

## Data limits
Existing users/{uid}.d documents and unknown migration fields are preserved. Notes stay private; sharing omits notes and now works only for the owner account. One-document Firestore size limit and last-writer-wins multi-device saving still apply. Demo uses fictional in-memory data.
