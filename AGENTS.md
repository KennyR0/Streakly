# Streakly Project Guide

## Product
- Streakly is a Spanish-language, frontend-only daily habit tracker.
- Use React, Vite, TypeScript, custom CSS, and browser `localStorage`; do not add a backend or account flow.
- Preserve the premium dark black and violet visual direction and make all core flows usable on mobile.

## Engineering
- Keep UI components focused and keep habit/date/persistence logic in `src/lib`.
- Use local calendar dates in `YYYY-MM-DD` form for completions and streak calculations.
- Validate persisted data before using it. Invalid data must not crash rendering or silently overwrite a recoverable value.
- Use semantic controls, accessible labels, visible keyboard focus, and reduced-motion preferences.
- Keep this file, `README.md`, and `specs/` aligned when product behavior changes.

## Quality Gates
- Run TypeScript, ESLint, and production build before handoff.
- Verify create/edit/delete, complete/undo, persistence after reload, streaks, corrupt storage recovery, and mobile layout.
