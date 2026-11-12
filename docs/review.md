# Review notes

## Issues addressed

- Replaced hard-coded “LEGIBLE” labels with calculated sRGB contrast and separate normal/large-text AA checks.
- Replaced repeated palette branches with one data model and reusable card rendering.
- Removed unused jQuery, Font Awesome, Google Fonts and the legacy analytics request.
- Replaced clickable divs and paragraphs with buttons and selectable read-only fields.
- Fixed ambiguous light/dark headings and inconsistent navigation swatch values.
- Replaced deprecated clipboard copying with an asynchronous API and a manual fallback.
- Removed fixed-width table layout in favour of responsive cards.
- Added an initial Indigo selection and an explicit reset-to-Indigo action.

## Verification scope

Unit calculations and browser interaction checks are automated. The browser smoke test scans the interface with axe-core except the intentionally failing text samples. It does not establish full WCAG conformance or screen-reader usability. No remote CI run or published deployment is claimed.

The original Git history remains. The owner still needs to choose a license and review the changed design before publishing.

## Local results — 12 November 2026

- JavaScript syntax checks passed.
- Seven unit tests passed.
- Chrome browser smoke checks passed for all five palettes, reset, Enter-key activation and both simulated clipboard branches.
- Page and table overflow checks passed at 375, 820, 840, 1024 and 1440 px widths.
- The axe-core scan reported no violations outside the deliberately excluded contrast-demonstration samples.
- The README screenshot was captured from the implemented app.

No manual screen-reader test, Safari/Firefox run or remote CI run was performed. The browser test uses Chrome and does not modify the system clipboard.
