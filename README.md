# Streakly

Streakly is a personal daily habit tracker with a premium dark interface. It runs entirely in the browser and stores data locally on the device.

## Requirements

- Node.js 20.19+ or 22.12+ and npm.
- No account, backend, or network connection is required after installation.

## Development

```sh
npm install
npm run dev
```

## Quality checks

```sh
npm run typecheck
npm run lint
npm run build
```

## Product specification

See [the MVP specification](specs/001-daily-habits/spec.md) and [the interface and data design](specs/001-daily-habits/design.md).

All habit data stays in this browser's `localStorage`. Clearing browser storage removes that data.
