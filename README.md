# Trading Psychology App

A comprehensive trading psychology and performance tracking application, available as:

- **Web app** - Run `trading-psychology-app.html` in any modern browser
- **macOS desktop app** - Native app with persistent file-based storage (see [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md))

## Features

- Multi-account trading session tracking
- Market prep and post-market review workflows
- Weekly P/L progress tracking with goal settings
- Phase progression system (20 trading days to qualify for Phase 2)
- CSV trade import from broker statements
- Screenshot archival for chart analysis
- Full data export/import with backup versioning
- Voice input for notes and analysis

## Why the macOS App?

The browser version uses localStorage, which has limitations:
- Data is browser-specific (Safari data not visible in Chrome)
- Can be cleared by browser cache cleanups
- Limited to ~5-10MB storage

The macOS app solves these by storing data in a persistent JSON file at:
```
~/Library/Application Support/trading-psychology-app/trading-data.json
```

This gives you reliable, unlimited storage that persists across app updates and system reboots.

## Quick Start (macOS App)

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build production .dmg installer
npm run build:universal
```

See [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) for full details.

## Quick Start (Web App)

Just open `trading-psychology-app.html` in Chrome, Edge, or Safari.
