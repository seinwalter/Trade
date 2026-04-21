# Trading Psychology App - macOS Build Instructions

## Overview

This guide explains how to build the Trading Psychology web app as a native macOS application using Electron. The native app solves several issues with the browser version:

- **Persistent storage** - Data is saved to `~/Library/Application Support/trading-psychology-app/` instead of browser localStorage
- **No browser compatibility issues** - Runs as a standalone app
- **Keeps running between sessions** - Data survives app restarts reliably
- **Native file dialogs** - Better export/import experience
- **Keyboard shortcuts** - Cmd+E to export, Cmd+I to import

## Prerequisites

You need a Mac with:

1. **macOS 10.15 (Catalina) or later**
2. **Node.js 18+** - Install from https://nodejs.org/ or use Homebrew:
   ```bash
   brew install node
   ```
3. **Xcode Command Line Tools** (required for native builds):
   ```bash
   xcode-select --install
   ```

## Installation Steps

### 1. Clone the repository

```bash
git clone https://github.com/seinwalter/Trade.git
cd Trade
git checkout claude/fix-phase-day-counter-011CUtmFQvpt6KYFxzn83TDc
```

### 2. Install dependencies

```bash
npm install
```

This will download Electron and all required packages (approximately 300 MB).

### 3. Test the app (development mode)

```bash
npm start
```

This launches the app in development mode so you can verify it works before building.

### 4. Build the macOS app

Choose one of these build options:

**Apple Silicon Macs (M1/M2/M3):**
```bash
npm run build:arm
```

**Intel Macs:**
```bash
npm run build:intel
```

**Universal (works on both Apple Silicon and Intel):**
```bash
npm run build:universal
```

### 5. Install the app

After the build completes, you'll find the installer in the `dist/` folder:

- `Trading Psychology-1.0.0-arm64.dmg` (Apple Silicon)
- `Trading Psychology-1.0.0.dmg` (Intel)

Double-click the DMG file and drag **Trading Psychology** to your Applications folder.

## First Launch

Since the app isn't code-signed with an Apple Developer certificate, macOS will block it on first launch. To open it:

1. Right-click on **Trading Psychology** in Applications
2. Select **Open** from the menu
3. Click **Open** in the security dialog
4. The app will launch and remember this choice for future opens

## Data Location

Your trading data is stored at:

```
~/Library/Application Support/trading-psychology-app/trading-data.json
```

To view this folder quickly, use the menu: **Help → Open Data Folder**

## Keyboard Shortcuts

- **Cmd+E** - Export Data Backup
- **Cmd+I** - Import Data Backup
- **Cmd+R** - Reload the app
- **Cmd+Q** - Quit

## Migrating Data from Browser Version

If you have data in Safari/Chrome that you want to move to the macOS app:

1. In your browser, go to the **Statistics** tab
2. Click **"💾 Export Complete Backup"** to save a JSON file
3. Open the new macOS app
4. Press **Cmd+I** (or use Statistics → Import Backup)
5. Select the JSON file you just exported
6. All your data will be restored

## Troubleshooting

### "App is damaged and can't be opened"

Run this command in Terminal to remove the quarantine flag:

```bash
xattr -cr "/Applications/Trading Psychology.app"
```

### App won't save data

Check permissions on the data folder:

```bash
ls -la ~/Library/Application\ Support/trading-psychology-app/
```

If it doesn't exist or has wrong permissions:

```bash
mkdir -p ~/Library/Application\ Support/trading-psychology-app
chmod 755 ~/Library/Application\ Support/trading-psychology-app
```

### Build fails with "Cannot find module"

Clear caches and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Uninstalling

To completely remove the app and its data:

```bash
# Remove the app
rm -rf /Applications/Trading\ Psychology.app

# Remove data (WARNING: this deletes all your trading records!)
rm -rf ~/Library/Application\ Support/trading-psychology-app
rm -rf ~/Library/Preferences/com.tradingpsychology.app.plist
```
