// Navigation helpers and URL management
export class NavigationHelpers {
  constructor(router) {
    this.router = router;
  }

  // Generate shareable URLs for games
  getShareableURL(gameType = null) {
    const baseURL = window.location.origin + window.location.pathname;
    
    if (!gameType) {
      return baseURL;
    }
    
    return `${baseURL}#/games/${gameType}`;
  }

  // Share functionality
  async shareGame(gameType, title = null) {
    const url = this.getShareableURL(gameType);
    const shareTitle = title || `Check out this romantic game: ${this.router.getGameTitle(gameType)}`;
    const shareText = "Come play our love story game! 💕";

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: url
        });
      } catch (err) {
        console.log('Share failed:', err);
        this.fallbackShare(url, shareTitle);
      }
    } else {
      this.fallbackShare(url, shareTitle);
    }
  }

  fallbackShare(url, title) {
    // Copy to clipboard as fallback
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.showShareNotification('URL copied to clipboard!');
      });
    } else {
      // Even older fallback
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showShareNotification('URL copied to clipboard!');
    }
  }

  showShareNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'share-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  // Add share buttons to game screens
  addShareButtons() {
    const gameScreens = document.querySelectorAll('.game-screen');
    
    gameScreens.forEach(screen => {
      const gameHeader = screen.querySelector('.game-header');
      if (gameHeader && !gameHeader.querySelector('.share-btn')) {
        const shareBtn = document.createElement('button');
        shareBtn.className = 'btn-secondary share-btn';
        shareBtn.innerHTML = '📤 Share';
        shareBtn.onclick = () => {
          const currentRoute = this.router.getCurrentRoute();
          if (currentRoute && currentRoute.startsWith('/games/')) {
            const gameType = currentRoute.split('/')[2];
            this.shareGame(gameType);
          }
        };
        gameHeader.appendChild(shareBtn);
      }
    });
  }

  // Browser back/forward support
  setupHistoryNavigation() {
    window.addEventListener('popstate', (event) => {
      // Router already handles hashchange, but this ensures compatibility
      if (event.state && event.state.path) {
        this.router.navigate(event.state.path, false);
      }
    });
  }

  // Deep linking validation
  validateDeepLink() {
    const hash = window.location.hash.slice(1);
    
    if (hash && hash.startsWith('/games/')) {
      const gameType = hash.split('/')[2];
      const validGames = ['memory-match', 'photo-puzzle', 'guess-moment', 'trivia-quiz', 'timeline', 'mood-match', 'hidden-message', 'scavenger-hunt'];
      
      if (!validGames.includes(gameType)) {
        console.log('Invalid game type in URL:', gameType);
        this.router.navigate('/games');
        return false;
      }
    }
    
    return true;
  }

  // Add keyboard navigation
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
      // ESC key - go back/home
      if (event.key === 'Escape') {
        const currentRoute = this.router.getCurrentRoute();
        if (currentRoute === '/games' || currentRoute.startsWith('/games/')) {
          this.router.goHome();
        } else if (currentRoute.startsWith('/games/')) {
          this.router.goToGames();
        }
      }
      
      // Alt+H - go home
      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        this.router.goHome();
      }
      
      // Alt+G - go to games
      if (event.altKey && event.key === 'g') {
        event.preventDefault();
        this.router.goToGames();
      }
    });
  }
}

// URL parameter helpers
export class URLHelpers {
  static getSearchParams() {
    return new URLSearchParams(window.location.search);
  }

  static getParam(name) {
    return this.getSearchParams().get(name);
  }

  static setParam(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
  }

  static removeParam(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.pushState({}, '', url);
  }

  // Theme support via URL
  static getTheme() {
    return this.getParam('theme') || 'default';
  }

  static setTheme(theme) {
    this.setParam('theme', theme);
  }
}