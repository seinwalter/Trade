/**
 * Electron Storage Adapter
 *
 * This script replaces localStorage with native Electron file-based storage
 * when running as a macOS app. Falls back to localStorage for browser use.
 *
 * Data location on macOS:
 * ~/Library/Application Support/trading-psychology-app/trading-data.json
 */
(function() {
    'use strict';

    // Only activate if running in Electron
    if (typeof window.electronAPI === 'undefined' || !window.electronAPI.isElectron) {
        console.log('[Storage] Running in browser mode - using localStorage');
        return;
    }

    console.log('[Storage] Running in Electron mode - using native file storage');

    // In-memory cache for synchronous access (localStorage is synchronous)
    let storageCache = {};
    let isInitialized = false;
    const pendingWrites = new Map();

    // Save original localStorage for reference
    const originalLocalStorage = window.localStorage;

    // Initialize cache from native storage
    async function initializeCache() {
        try {
            const allData = await window.electronAPI.storage.getAll();
            storageCache = allData || {};

            // Also sync any existing localStorage data to native storage (migration)
            for (let i = 0; i < originalLocalStorage.length; i++) {
                const key = originalLocalStorage.key(i);
                if (key && !(key in storageCache)) {
                    const value = originalLocalStorage.getItem(key);
                    storageCache[key] = value;
                    await window.electronAPI.storage.set(key, value);
                }
            }

            isInitialized = true;
            console.log('[Storage] Initialized with', Object.keys(storageCache).length, 'items');

            // Dispatch event so app knows storage is ready
            window.dispatchEvent(new Event('electron-storage-ready'));
        } catch (error) {
            console.error('[Storage] Failed to initialize:', error);
        }
    }

    // Replace localStorage with our synchronous proxy
    const electronStorage = {
        getItem: function(key) {
            if (!isInitialized) {
                console.warn('[Storage] Access before initialization for key:', key);
                return originalLocalStorage.getItem(key);
            }
            const value = storageCache[key];
            return value !== undefined ? value : null;
        },

        setItem: function(key, value) {
            const stringValue = String(value);
            storageCache[key] = stringValue;

            // Also update original localStorage as backup
            try {
                originalLocalStorage.setItem(key, stringValue);
            } catch (e) {
                // localStorage may be full, that's ok
            }

            // Write to native storage asynchronously
            // Cancel any pending write for the same key
            if (pendingWrites.has(key)) {
                clearTimeout(pendingWrites.get(key));
            }

            const timeoutId = setTimeout(() => {
                window.electronAPI.storage.set(key, stringValue)
                    .catch(err => console.error('[Storage] Write failed for', key, err));
                pendingWrites.delete(key);
            }, 50);

            pendingWrites.set(key, timeoutId);
        },

        removeItem: function(key) {
            delete storageCache[key];
            try {
                originalLocalStorage.removeItem(key);
            } catch (e) {}
            window.electronAPI.storage.remove(key)
                .catch(err => console.error('[Storage] Remove failed for', key, err));
        },

        clear: function() {
            storageCache = {};
            try {
                originalLocalStorage.clear();
            } catch (e) {}
            window.electronAPI.storage.clear()
                .catch(err => console.error('[Storage] Clear failed:', err));
        },

        key: function(index) {
            const keys = Object.keys(storageCache);
            return keys[index] || null;
        },

        get length() {
            return Object.keys(storageCache).length;
        }
    };

    // Replace window.localStorage with our proxy
    try {
        Object.defineProperty(window, 'localStorage', {
            get: function() { return electronStorage; },
            configurable: true
        });
    } catch (e) {
        // If we can't override, at least provide the methods
        console.warn('[Storage] Could not override localStorage, using fallback');
        window.localStorage.getItem = electronStorage.getItem;
        window.localStorage.setItem = electronStorage.setItem;
        window.localStorage.removeItem = electronStorage.removeItem;
        window.localStorage.clear = electronStorage.clear;
    }

    // Listen for menu actions from main process
    if (window.electronAPI.onMenuAction) {
        window.electronAPI.onMenuAction(function(action) {
            if (action === 'export') {
                if (typeof exportAllData === 'function') {
                    exportAllData();
                }
            } else if (action === 'import') {
                if (typeof importAllData === 'function') {
                    importAllData();
                }
            }
        });
    }

    // Enhanced export using native save dialog
    window.electronExportData = async function(defaultName, content) {
        const result = await window.electronAPI.dialog.saveFile(defaultName, content);
        return result;
    };

    // Enhanced import using native open dialog
    window.electronImportData = async function() {
        const result = await window.electronAPI.dialog.openFile();
        return result;
    };

    // Initialize immediately
    initializeCache();
})();
