# Creativity Lab designer

## Acceptance
- Long landscape room with six tables in two rows of three and a screen on the right; current aesthetic retained.
- Room controls available directly from Room view: dimensions, screen position, snap grid, presets, objects.
- Table shapes and dimensions editable; existing layouts remain intact until explicit preset application.
- Layout fields survive templates, history, duplicates and sanitized sharing.
- Core tests and build pass; browser verifies preset, shape, room edits and undo.

## Reference inventory
Observed https://seatplan.io/designer on Oct 29, 2026: rectangular/round/oval/U/serpentine tables; chair rows; classroom rows/pods/U/horseshoe; room objects; zoom/fit; roster import/search; seating shuffle/rules; history; sharing; style. Existing app already covers roster import/search, shuffle/rules, history, share, undo and zoom. This increment adds classroom room design. AI floor-plan import, 3D, meal management and live collaboration require separate services and are not represented as implemented.

## Progress
- [x] Repository guardrails and reference inspection.
- [x] Room model and designer controls.
- [x] Verification and documentation complete; commit and push follow.

## Decisions
Preserve all existing layouts. New classes use Creativity Lab; applying a preset requires confirmation and supports Undo. No external service, student upload, dependency, auth or OU change.

## Surprises
Reference is a JavaScript app; browser inspection required.

Geometry tests initially exposed half-grid preset positions; fixed to full grid. Browser verified presets, Undo, oval shape, resizing, screen side, objects and desktop/phone fit. Fourteen tests, build and rules emulator pass.
