// Simple hash-based router for the romantic game
export class Router {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.routes = new Map();
    this.currentRoute = null;
    this.isLoading = true;
    this.init();
  }

  init() {
    // Define all available routes
    this.defineRoutes();
    
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRouteChange());
    window.addEventListener('load', () => this.handleRouteChange());
    
    // Don't handle initial route during loading - let the game engine handle it after loading
  }

  defineRoutes() {
    // Main screens
    this.routes.set('/', {
      screen: 'welcome-screen',
      title: 'Our Love Story Game 💕',
      handler: () => this.gameEngine.showWelcome()
    });

    this.routes.set('/games', {
      screen: 'game-selection',
      title: 'Choose Your Memory Game',
      handler: () => this.gameEngine.showGameSelection()
    });

    this.routes.set('/slideshow', {
      screen: 'final-slideshow',
      title: 'Our Beautiful Journey',
      handler: () => this.gameEngine.showFinalSlideshow()
    });

    this.routes.set('/gallery', {
      screen: 'photo-gallery-screen',
      title: 'Our Love Story Gallery 💕',
      handler: () => this.gameEngine.showPhotoGallery()
    });

    // Individual games
    this.routes.set('/games/memory-match', {
      screen: 'memory-match-game',
      title: 'Memory Match - Our Love Story Game',
      handler: () => this.gameEngine.selectGame('memory-match'),
      requiresUnlock: false
    });

    this.routes.set('/games/photo-puzzle', {
      screen: 'photo-puzzle-game', 
      title: 'Photo Puzzle - Our Love Story Game',
      handler: () => this.gameEngine.selectGame('photo-puzzle'),
      requiresUnlock: true,
      unlockAfter: 'memory-match'
    });

    this.routes.set('/games/guess-moment', {
      screen: 'guess-moment-game',
      title: 'Guess the Moment - Our Love Story Game', 
      handler: () => this.gameEngine.selectGame('guess-moment'),
      requiresUnlock: true,
      unlockAfter: 'photo-puzzle'
    });

    this.routes.set('/games/trivia-quiz', {
      screen: 'trivia-game',
      title: 'Trivia Quiz - Our Love Story Game',
      handler: () => this.gameEngine.selectGame('trivia-quiz'),
      requiresUnlock: true,
      unlockAfter: 'guess-moment'
    });

    this.routes.set('/games/timeline', {
      screen: 'timeline-game',
      title: 'Timeline Challenge - Our Love Story Game',
      handler: () => this.gameEngine.selectGame('timeline'),
      requiresUnlock: true,
      unlockAfter: 'trivia-quiz'
    });

    this.routes.set('/games/mood-match', {
      screen: 'mood-match-game',
      title: 'Mood Match - Our Love Story Game',
      handler: () => this.gameEngine.selectGame('mood-match'),
      requiresUnlock: true,
      unlockAfter: 'timeline'
    });

    this.routes.set('/games/hidden-message', {
      screen: 'hidden-message-game',
      title: 'Hidden Messages - Our Love Story Game',
      handler: () => this.gameEngine.selectGame('hidden-message'),
      requiresUnlock: true,
      unlockAfter: 'mood-match'
    });

    this.routes.set('/games/scavenger-hunt', {
      screen: 'scavenger-game',
      title: 'Scavenger Hunt - Our Love Story Game',
      handler: () => this.gameEngine.selectGame('scavenger-hunt'),
      requiresUnlock: true,
      unlockAfter: 'hidden-message'
    });
  }

  handleRouteChange() {
    // Don't handle route changes during loading
    if (this.isLoading) {
      return;
    }
    
    const hash = window.location.hash.slice(1) || '/';
    this.navigate(hash, false);
  }

  navigate(path, pushState = true) {
    const route = this.routes.get(path);
    
    if (!route) {
      // Redirect to home for unknown routes
      this.navigate('/', true);
      return;
    }

    // Check if route requires unlock
    if (route.requiresUnlock && !this.isRouteUnlocked(route)) {
      // Redirect to games selection with notification
      this.navigate('/games', true);
      this.showUnlockNotification(route.unlockAfter);
      return;
    }

    // Update URL if needed
    if (pushState && window.location.hash !== '#' + path) {
      window.location.hash = path;
      return; // This will trigger hashchange event
    }

    // Update document title
    document.title = route.title;
    
    // Store current route
    this.currentRoute = path;
    
    // Execute route handler
    route.handler();
    
    // Update navigation state
    this.updateNavigationUI(path);
  }

  isRouteUnlocked(route) {
    if (!route.requiresUnlock) return true;
    
    // Allow access in test mode
    if (this.gameEngine.testMode) return true;
    
    const requiredGame = route.unlockAfter;
    return this.gameEngine.gameState.completedGames.includes(requiredGame);
  }

  showUnlockNotification(requiredGame) {
    const notification = document.createElement('div');
    notification.className = 'route-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <h3>🔒 Game Locked</h3>
        <p>Complete "${this.getGameTitle(requiredGame)}" first to unlock this game!</p>
        <button onclick="this.parentElement.parentElement.remove()">OK</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  }

  getGameTitle(gameKey) {
    const titles = {
      'memory-match': 'Memory Match',
      'photo-puzzle': 'Photo Puzzle', 
      'guess-moment': 'Guess the Moment',
      'trivia-quiz': 'Trivia Quiz',
      'timeline': 'Timeline Challenge',
      'mood-match': 'Mood Match',
      'hidden-message': 'Hidden Messages',
      'scavenger-hunt': 'Scavenger Hunt'
    };
    return titles[gameKey] || gameKey;
  }

  updateNavigationUI(currentPath) {
    // Update active nav items if they exist
    document.querySelectorAll('[data-route]').forEach(link => {
      const linkPath = link.dataset.route;
      if (linkPath === currentPath) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update breadcrumbs if they exist  
    this.updateBreadcrumbs(currentPath);
  }

  updateBreadcrumbs(currentPath) {
    const breadcrumbContainer = document.getElementById('breadcrumbs');
    if (!breadcrumbContainer) return;

    let breadcrumbs = [];
    
    // Hide breadcrumbs for home/welcome screen
    if (currentPath === '/') {
      breadcrumbContainer.classList.add('hidden');
      return;
    } else {
      breadcrumbContainer.classList.remove('hidden');
    }
    
    if (currentPath === '/games') {
      breadcrumbs = [
        { text: 'Home', path: '/' },
        { text: 'Games', path: '/games' }
      ];
    } else if (currentPath.startsWith('/games/')) {
      const gameName = currentPath.split('/')[2];
      breadcrumbs = [
        { text: 'Home', path: '/' },
        { text: 'Games', path: '/games' },
        { text: this.getGameTitle(gameName), path: currentPath }
      ];
    } else if (currentPath === '/slideshow') {
      breadcrumbs = [
        { text: 'Home', path: '/' },
        { text: 'Slideshow', path: '/slideshow' }
      ];
    }

    breadcrumbContainer.innerHTML = breadcrumbs.map((crumb, index) => {
      const isLast = index === breadcrumbs.length - 1;
      if (isLast) {
        return `<span class="breadcrumb-current">${crumb.text}</span>`;
      } else {
        return `<a href="#${crumb.path}" class="breadcrumb-link">${crumb.text}</a>`;
      }
    }).join(' <span class="breadcrumb-separator">›</span> ');
  }

  // Programmatic navigation methods
  goHome() {
    this.navigate('/');
  }

  goToGames() {
    this.navigate('/games');
  }

  goToGame(gameType) {
    this.navigate(`/games/${gameType}`);
  }

  goToSlideshow() {
    this.navigate('/slideshow');
  }

  goBack() {
    window.history.back();
  }

  // Finish loading and enable routing
  finishLoading() {
    this.isLoading = false;
    // Now handle the initial route
    this.handleRouteChange();
  }

  // Get current route info
  getCurrentRoute() {
    return this.currentRoute;
  }

  isCurrentRoute(path) {
    return this.currentRoute === path;
  }
}