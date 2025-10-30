# Data Management Guide

## How to Clear Trades and Start Fresh

The app now has a comprehensive **Data Management** section in the **Settings** tab that gives you full control over clearing your data.

### Where to Find It

1. Open `trading-psychology-app.html` in your browser
2. Click on the **⚙️ Settings** tab
3. Scroll down to the **🗑️ Data Management** section

### What You Can Clear

#### 1. Clear Last Import (Orange Button)
- **What it does:** Removes only the most recently imported trades
- **Use when:** You just imported the wrong CSV file and want to undo it
- **Keeps:** All other trades and all sessions
- **Note:** Only available if you've recently imported trades

#### 2. Clear All Trades (Red Button)
- **What it does:** Deletes ALL trades from ALL sessions
- **Use when:** You want to remove all trading data but keep your session metadata
- **Keeps:** Trading sessions (dates, emotional state, sleep data, etc.)
- **Deletes:** Every single trade

#### 3. Clear All Sessions (Dark Red Button)
- **What it does:** Deletes all trading sessions
- **Use when:** You want to clean up session history
- **Keeps:** All trades (they'll exist without being tied to sessions)
- **Deletes:** All session metadata

#### 4. DELETE EVERYTHING (Darkest Red Button)
- **What it does:** Wipes ALL data including trades, sessions, settings, everything
- **Use when:** You want a completely fresh start
- **Deletes:** EVERYTHING - it's like reinstalling the app
- **Reloads:** The page automatically after clearing

### Safety Features

- **Double confirmation:** Most delete actions require 2 confirmations
- **Clear stats display:** Shows current counts of trades, sessions, and last import
- **Visual warnings:** Color-coded from orange (safest) to dark red (most destructive)
- **Backup reminder:** Always suggests exporting a backup first

### Before Clearing - Export a Backup

**IMPORTANT:** Always export your data before clearing!

1. Go to the **Statistics** tab
2. Click **💾 Export Complete Backup**
3. Save the JSON file to your computer
4. You can re-import it later using **📥 Import Backup** on the same tab

### Quick Clear for Starting Fresh

If you just want to test the import with the provided `test_trades.csv`:

1. Go to **Settings** → **Data Management**
2. Click **🗑️ Clear All Trades** (the red button)
3. Confirm twice
4. Go to **History** tab
5. Import `test_trades.csv`
6. Check **Statistics** tab to see your clean data

### Other Clear Options

#### In the History Tab
- **Clear Last Import:** Button appears after any import
- **Clear ALL Trades:** Always available in the clear trades section

#### In the Statistics Tab
- **Clear All Data:** The nuclear option - deletes everything

### Tips

- Start with the **least destructive option** that meets your needs
- Use **Clear Last Import** first if you just made a mistake
- Use **Clear All Trades** when you want to start tracking fresh
- Only use **DELETE EVERYTHING** when you truly want to reset the entire app

### Example: Testing the Import Fix

To test the import fixes with clean data:

```
1. Settings → Data Management → Clear All Trades
2. Dashboard → Start Trading Day
3. History → Import test_trades.csv
4. Statistics → Verify win rate, P&L, etc.
```

All clear! 🎯
