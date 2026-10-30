# Account-only deployment
User authorized production deployment and restricted access to tgreenleaf@markdayschool.org.

Acceptance: verified Google provider and exact account required by Firestore; other school accounts denied even with legacy grants; existing private user data retained; model/build and emulator checks pass; deploy rules before publishing Pages; verify published assets and report URL. Real user Google login remains a user action.

Progress: repository and Pages main-root configuration verified. Firebase login present; project access pending.
Decision: replace expiring Faculty grants with exact email rule; no OU, no periodic job, no data migration/deletion. Existing authorization runbook superseded for this owner-only rollout.

Implemented exact-account client/rules checks, removed active grant listener, revised sharing labels. Model/build and owner-only emulator tests pass. Deployment blocked: connected Firebase personal account project list omits seatingchart-a4cae and apps lookup fails. Do not merge Pages before rules deployment.
