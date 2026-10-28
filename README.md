# Streakly

Streakly is a personal daily habit tracker with a premium dark interface. It runs entirely in the browser and stores data locally on the device.

## Requirements

- Node.js 24 and npm.
- No account, backend, or network connection is required after installation.

## Development

```sh
npm install
npm run dev
```

## Run the production server locally

Run `npm run build`, then `npm start`.

The Node.js server serves the Vite build in `dist/`. It stores no user data; habits remain in the browser's `localStorage`.

## Deploy to Azure App Service

Create a **Linux Web App** with the **Node 24 LTS** runtime stack. In the repository's GitHub settings, add:

- Repository variable `AZURE_WEBAPP_NAME` with the Web App name.
- Repository secret `AZURE_WEBAPP_PUBLISH_PROFILE` with the Web App's downloaded publish profile XML.

The workflow in `.github/workflows/azure-webapp.yml` builds the Vite app and deploys the Node server and `dist/` when changes are pushed to `main`. You can also start a deployment with **Actions → Deploy to Azure App Service → Run workflow**.

## Quality checks

```sh
npm run typecheck
npm run lint
npm run build
```

## Product specification

See [the MVP specification](specs/001-daily-habits/spec.md) and [the interface and data design](specs/001-daily-habits/design.md).

All habit data stays in this browser's `localStorage`. Clearing browser storage removes that data.
