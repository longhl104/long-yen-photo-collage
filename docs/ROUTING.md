# Routing System Documentation 🛣️

## Overview
The romantic game now includes a comprehensive routing system that provides:

- **Hash-based routing** for SPA navigation
- **Deep linking** support for direct game access
- **Browser history** integration (back/forward buttons)
- **Breadcrumb navigation** 
- **URL sharing** capabilities
- **Keyboard shortcuts** for navigation
- **Route protection** (unlock system integration)

## Available Routes

### Main Routes
```
/                    → Welcome/Home screen
/games              → Game selection screen  
/slideshow          → Final slideshow
```

### Game Routes
```
/games/memory-match     → Memory Match game
/games/photo-puzzle     → Photo Puzzle game
/games/guess-moment     → Guess the Moment game
/games/trivia-quiz      → Trivia Quiz game
/games/timeline         → Timeline Challenge game
/games/mood-match       → Mood Match game
/games/hidden-message   → Hidden Messages game
/games/scavenger-hunt   → Scavenger Hunt game
```

## Features

### 🔗 Deep Linking
Users can directly access any unlocked game via URL:
```
https://yourdomain.com/#/games/memory-match
https://yourdomain.com/#/games/trivia-quiz
```

### 🔒 Route Protection  
Games that aren't unlocked yet will redirect to the games page with a notification.

### 🧭 Breadcrumb Navigation
Shows current location and allows quick navigation:
```
Home › Games › Memory Match
```

### ⌨️ Keyboard Shortcuts
- `ESC` - Go back/home
- `Alt + H` - Go to home
- `Alt + G` - Go to games

### 📤 Share Functionality
Each game screen includes a share button that:
- Uses native Web Share API when available
- Falls back to clipboard copy
- Shows confirmation notifications

### 🔄 Browser Integration
- Back/forward buttons work correctly
- Page refresh maintains current route
- URL updates reflect current screen

## Technical Implementation

### Router Class
Located in `src/utils/router.js`, handles:
- Route definitions and matching
- Navigation logic
- URL updates
- Route protection

### Navigation Helpers
Located in `src/utils/navigation.js`, provides:
- Share functionality
- Keyboard shortcuts
- History management
- URL parameter handling

### Integration
The router is integrated into the main game engine and automatically:
- Updates document titles
- Shows/hides breadcrumbs
- Manages active states
- Handles unlocked game logic

## Usage Examples

### Programmatic Navigation
```javascript
// Navigate to games
this.router.goToGames();

// Navigate to specific game
this.router.goToGame('memory-match');

// Navigate home
this.router.goHome();

// Navigate to slideshow
this.router.goToSlideshow();
```

### Share a Game
```javascript
// Share current game
this.navigation.shareGame('memory-match');

// Share with custom title
this.navigation.shareGame('trivia-quiz', 'Test your relationship knowledge!');
```

### Check Current Route
```javascript
// Get current route
const route = this.router.getCurrentRoute();

// Check if on specific route
if (this.router.isCurrentRoute('/games/memory-match')) {
    // Do something specific to memory match
}
```

## SEO and Sharing Benefits

### Meta Tags Update
Document titles automatically update based on route:
- "Our Love Story Game 💕"
- "Memory Match - Our Love Story Game"
- "Choose Your Memory Game"

### Shareable URLs
Each game has its own shareable URL, making it easy to:
- Bookmark favorite games
- Share specific games with friends
- Create direct links in social media

### Analytics Friendly
Hash-based routing allows tracking:
- Which games are most popular
- User navigation patterns  
- Completion rates by entry point

## Browser Support

- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Progressive Web App compatible
- ✅ Works offline (cached routes)

The routing system enhances the user experience while maintaining the romantic game's simplicity and charm! 💕