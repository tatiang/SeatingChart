# Navigation and roster imports

## Acceptance
- All five navigation tabs have distinct useful empty states with import/create actions; Settings preferences usable without a class.
- Import entry accessible without any class, from class sidebar and Students tab.
- Preview CSV, TSV/pasted names, multi-class CSV, and registrar column layouts before importing into new classes or current class.
- Read the two user-provided Google sheets through read-only OAuth, select tabs first then bounded roster ranges; no silent partial failures.
- Preserve existing data, no overwrite; selected imports append/new classes; duplicate reimport protection.
- Synthetic parser tests cover observed structures (teacher/support metadata, homeroom subject teachers, section/PE, geometry, world languages, repeated mentor blocks); never commit real rosters.
- Browser tests use in-memory demo, including empty-account demo; build/test pass; publish verified fix.

## Progress
- [x] Repo verified and branch based on deployed main.
- [x] Read-only source inspection through Google Drive. Sources are K–4 and 5–8 registrar workbooks supplied by user.
- [x] Parser, import UI and empty states.
- [x] Review pass: fixed CSV Class columns holding section-like values (7A/7B) being misread as a registrar sheet; delimiter now chosen from the header line only.
- [x] Synthetic browser checks: all five tabs, CSV file upload, pasted append + Undo, registrar paste, Google tab selection (stubbed Google calls on a scratch build), reimport protection, 375px phone layout.
- [ ] Real Google consent -> tab list -> import: needs the owner's own sign-in; not performed.
- [ ] Commit/push, PR, Pages deployment and live verification.

## Decisions
No spreadsheet edits, no student names in fixtures/assets. Google import reads only selected tabs and previews before save. Importing same source class twice is blocked; general CSV name collisions are shown and require choosing append/current vs new explicitly. Preserve source spellings and remove mentor grade suffix into metadata only.
