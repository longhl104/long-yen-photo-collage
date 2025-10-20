# Save System Documentation

## Overview

The game now includes a comprehensive **localStorage-based persistence system** that automatically saves game progress, preventing data loss when the page is refreshed or closed.

## What Gets Saved

### 1. **Game State** (`romantic-game-state`)

- ✅ **Completed Games** - List of all completed games
- ✅ **Memory Tokens** - Number of tokens collected (0-5)
- ✅ **Love Level** - Current progress percentage
- ✅ **Unlocked Content** - All unlocked features
- ✅ **Current Game** - Last game being played
- ✅ **Timestamp** - When the state was last saved

### 2. **Last Route** (`romantic-game-last-route`)

- ✅ **Current Page** - Automatically returns to the last visited page
- ✅ **Smart Restoration** - Only restores if user didn't specify a hash URL

### 3. **Test Mode** (`romantic-game-test-mode`) (Development Only)

- ✅ **Test Mode State** - Whether test mode was enabled
- ✅ **Persists Across Sessions** - Maintains test mode preference

## Features

### 🎯 **Automatic Saving**

- Saves automatically when you complete a game
- No manual save button needed
- Visual feedback with "Progress saved!" indicator

### 🔄 **Automatic Restoration**

- Restores progress on page refresh
- Shows "Welcome back!" message with progress
- Returns to the last page you were viewing

### 💾 **Save Indicator**

- Appears in bottom-right corner
- Shows "Progress saved!" message
- Auto-dismisses after 3 seconds
- Non-intrusive animation

### 🎮 **Smart Navigation**

- Remembers your last location
- Bypasses welcome screen if you were in the middle of gameplay
- Respects game unlock requirements

## User Experience

### First Visit

1. User plays through the welcome screen
2. Completes a game
3. ✨ "Progress saved!" appears
4. State is saved to localStorage

### After Refresh

1. Loading screen appears (3 seconds)
2. ✨ "Welcome back! Progress restored (X/5 games completed)" appears
3. Automatically navigates to last visited page
4. All completed games remain completed
5. All unlocked games remain unlocked

### Manual Restart

1. User can click "Restart Game" button
2. Confirmation dialog appears: "Are you sure you want to restart? All progress will be lost."
3. Upon confirmation:
   - Game state is cleared
   - localStorage is wiped
   - Returns to welcome screen
   - Fresh start for the user

## Developer Tools

### Console Commands (Development Mode Only)

#### **Test Mode Commands** (`gameTestMode`)

```javascript
gameTestMode.toggle(); // Toggle test mode on/off
gameTestMode.enable(); // Enable test mode
gameTestMode.disable(); // Disable test mode
gameTestMode.status(); // Check current status
gameTestMode.help(); // Show all commands
```

#### **Save Management Commands** (`gameSave`)

```javascript
gameSave.status(); // View all saved data
gameSave.clear(); // Clear all saved data (with confirmation)
gameSave.export(); // Export save data as JSON
gameSave.import(data); // Import save data from JSON
gameSave.help(); // Show all commands
```

### Keyboard Shortcuts

- **Shift+T** - Toggle test mode (Development only)

## Technical Implementation

### Storage Keys

```javascript
"romantic-game-state"; // Main game progress
"romantic-game-last-route"; // Last visited route
"romantic-game-test-mode"; // Test mode preference (dev)
```

### Data Structure

```javascript
// Game State
{
  completedGames: ['memory-match', 'photo-puzzle'],
  memoryTokens: 2,
  loveLevel: 0,
  unlockedContent: [],
  currentGame: null,
  savedAt: "2025-10-20T12:34:56.789Z"
}

// Last Route
"/games/photo-puzzle"

// Test Mode
true  // or false
```

### Save Triggers

1. **Game Completion** - Automatically saves when user completes a game
2. **Test Mode Toggle** - Saves test mode preference
3. **Route Navigation** - Saves current route on page change

### Restore Logic

1. **On Page Load** - Checks for saved data in localStorage
2. **GameState Constructor** - Calls `loadFromStorage()` before `reset()`
3. **Router.finishLoading()** - Restores last route if no hash specified
4. **Main Constructor** - Loads test mode preference

## Error Handling

### Storage Failures

- **Try-Catch Blocks** - All storage operations wrapped in error handling
- **Console Warnings** - Logs errors without breaking the game
- **Graceful Degradation** - Falls back to default state if load fails

### Invalid Data

- **JSON Parsing** - Safely parses stored data
- **Validation** - Checks for valid data structure
- **Fallback** - Uses fresh state if data is corrupted

## Privacy & Storage

### Storage Size

- Typical save: **< 1KB**
- Maximum: **< 5KB** (well under localStorage limits)

### Data Location

- Stored in **browser's localStorage**
- **Per-domain** storage (not shared across sites)
- **Persistent** until manually cleared or browser cache cleared

### Privacy

- ✅ No server communication
- ✅ All data stored locally
- ✅ No personal information collected
- ✅ User can clear data at any time

## Testing

### Manual Testing Checklist

- [ ] Complete a game → Verify "Progress saved!" appears
- [ ] Refresh page → Verify "Welcome back!" appears
- [ ] Check completed games remain completed
- [ ] Navigate to different pages → Verify route restoration
- [ ] Click "Restart Game" → Verify confirmation dialog
- [ ] Confirm restart → Verify all data cleared
- [ ] Test in incognito/private mode → Verify fresh start

### Developer Testing

```javascript
// Check current save data
gameSave.status();

// Export for backup
const backup = gameSave.export();

// Clear and test fresh start
gameSave.clear();

// Restore from backup
gameSave.import(backup);
```

## Browser Compatibility

### Supported Browsers

- ✅ Chrome/Edge (All versions)
- ✅ Firefox (All versions)
- ✅ Safari (All versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Requirements

- localStorage API support (available in all modern browsers)
- JavaScript enabled

### Fallback Behavior

- If localStorage is unavailable → Game works normally without saving
- If localStorage is full → Console warning, game continues
- If data is corrupted → Fresh start with default state

## Future Enhancements

### Potential Features

- 🔮 **Cloud Save** - Sync across devices
- 🔮 **Multiple Save Slots** - Different save files
- 🔮 **Import/Export UI** - User-friendly save management
- 🔮 **Save Statistics** - Play time, attempts, etc.
- 🔮 **Auto-save Frequency** - Configurable intervals

## Troubleshooting

### Issue: Progress not saving

**Solution:**

1. Check browser console for errors
2. Verify localStorage is enabled
3. Check storage quota (F12 → Application → Storage)
4. Try `gameSave.status()` to diagnose

### Issue: Can't restore progress

**Solution:**

1. Check if data exists: `gameSave.status()`
2. Export data: `const backup = gameSave.export()`
3. Clear and reimport: `gameSave.clear()` then `gameSave.import(backup)`

### Issue: Stuck on old route

**Solution:**

1. Clear route: `localStorage.removeItem('romantic-game-last-route')`
2. Refresh page
3. Or manually navigate: `window.location.hash = '#/'`

## Summary

The save system provides a seamless, automatic persistence layer that enhances user experience by:

- ✅ **Never losing progress** on page refresh
- ✅ **Automatic restoration** without user action
- ✅ **Visual feedback** so users know their progress is safe
- ✅ **Smart navigation** returning to the right page
- ✅ **Developer tools** for testing and debugging

All of this works **silently in the background** with zero configuration required from the user! 🎉
