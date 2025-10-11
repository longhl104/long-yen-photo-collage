import { GameState } from './components/BaseGame.js';
import { AudioManager, DOMUtils } from './utils/helpers.js';
import { Router } from './utils/router.js';
import { NavigationHelpers } from './utils/navigation.js';
import { photos, memoryTokenMessages, triviaQuestions } from './data/gameData.js';
import { MemoryMatchGame } from './components/MemoryMatchGame.js';
import { PhotoPuzzleGame } from './components/PhotoPuzzleGame.js';
import { GuessTheMomentGame } from './components/GuessTheMomentGame.js';
import { TriviaQuizGame } from './components/TriviaQuizGame.js';
import { TimelineChallengeGame } from './components/TimelineChallengeGame.js';
import { MoodMatchGame } from './components/MoodMatchGame.js';
import { HiddenMessageGame } from './components/HiddenMessageGame.js';
import { PhotoScavengerHuntGame } from './components/PhotoScavengerHuntGame.js';

export class RomanticGameEngine
{
  constructor()
  {
    this.gameState = new GameState();
    this.audioManager = new AudioManager();
    this.router = new Router(this);
    this.navigation = new NavigationHelpers(this.router);
    this.photos = photos;
    this.memoryTokenMessages = memoryTokenMessages;
    this.triviaQuestions = triviaQuestions;

    // Test mode for development - allows bypassing game unlock requirements
    this.testMode = this.isDevEnvironment();

    // Initialize game components
    this.memoryMatchGame = new MemoryMatchGame(this);
    this.photoPuzzleGame = new PhotoPuzzleGame(this);
    this.guessTheMomentGame = new GuessTheMomentGame(this);
    this.triviaQuizGame = new TriviaQuizGame(this);
    this.timelineChallengeGame = new TimelineChallengeGame(this);
    this.moodMatchGame = new MoodMatchGame(this);
    this.hiddenMessageGame = new HiddenMessageGame(this);
    this.photoScavengerHuntGame = new PhotoScavengerHuntGame(this);

    this.init();
  }

  isDevEnvironment()
  {
    // Check if we're in development mode
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('localhost') ||
      window.location.port !== '' ||
      import.meta.env?.DEV === true
    );
  }

  toggleTestMode()
  {
    if (this.isDevEnvironment())
    {
      this.testMode = !this.testMode;
      console.log(`Test mode ${this.testMode ? 'ENABLED' : 'DISABLED'}`);

      // Update game availability immediately
      this.updateGameAvailability();

      // Show notification
      this.showTestModeNotification();

      return this.testMode;
    } else
    {
      console.warn('Test mode is only available in development environment');
      return false;
    }
  }

  init()
  {
    this.setupEventListeners();
    this.audioManager.init();

    // Setup navigation features
    this.navigation.setupHistoryNavigation();
    this.navigation.setupKeyboardNavigation();
    this.navigation.validateDeepLink();

    // Initialize test mode console commands for dev environment
    this.initTestModeConsoleCommands();

    this.showLoadingScreen();
  }

  setupEventListeners()
  {
    // Welcome screen
    document.getElementById('start-game-btn')?.addEventListener('click', () => this.router.goToGames());

    // Game selection - use router for navigation
    document.querySelectorAll('.game-card').forEach(card =>
    {
      card.addEventListener('click', (e) =>
      {
        const gameType = e.currentTarget.dataset.game;
        this.router.goToGame(gameType);
      });
    });

    // Back buttons - use router for navigation
    document.querySelectorAll('[id$="-back-btn"]').forEach(btn =>
    {
      btn.addEventListener('click', () => this.router.goToGames());
    });

    // Final slideshow
    document.getElementById('final-slideshow-btn')?.addEventListener('click', () => this.router.goToSlideshow());
    document.getElementById('restart-game-btn')?.addEventListener('click', () => this.restartGame());

    // Token modal
    document.getElementById('close-token-modal')?.addEventListener('click', () => this.closeTokenModal());

    // Test mode keyboard shortcut (Shift+T)
    if (this.isDevEnvironment())
    {
      document.addEventListener('keydown', (e) =>
      {
        if (e.shiftKey && e.key === 'T' && !e.ctrlKey && !e.altKey && !e.metaKey)
        {
          e.preventDefault();
          this.toggleTestMode();
        }
      });
    }

    // Add route-aware navigation to existing elements
    this.setupRouteNavigation();
  }

  setupRouteNavigation()
  {
    // Add route data attributes to navigable elements
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) startBtn.dataset.route = '/games';

    const finalBtn = document.getElementById('final-slideshow-btn');
    if (finalBtn) finalBtn.dataset.route = '/slideshow';

    // Add navigation classes to game cards
    document.querySelectorAll('.game-card').forEach(card =>
    {
      const gameType = card.dataset.game;
      card.dataset.route = `/games/${gameType}`;
    });
  }

  showLoadingScreen()
  {
    // Simulate loading
    setTimeout(() =>
    {
      DOMUtils.hideScreen('loading-screen');
      this.gameState.updateLoveLevel();

      // Finish loading and let the router handle navigation
      this.router.finishLoading();
    }, 3000);
  }

  showWelcome()
  {
    DOMUtils.showScreen('welcome-screen');
    this.gameState.updateLoveLevel();
  }

  showGameSelection()
  {
    DOMUtils.showScreen('game-selection');
    this.updateGameAvailability();
  }

  updateGameAvailability()
  {
    const games = ['memory-match', 'photo-puzzle', 'guess-moment', 'trivia-quiz', 'timeline'];

    games.forEach((game, index) =>
    {
      const card = document.querySelector(`[data-game="${game}"]`);
      if (!card) return;

      // In test mode, all games are unlocked
      const isUnlocked = this.testMode || this.gameState.isGameUnlocked(index, games);

      if (isUnlocked)
      {
        card.classList.remove('locked');
        const statusElement = card.querySelector('.game-status');
        if (statusElement)
        {
          // Show different status for test mode
          if (this.testMode && !this.gameState.isGameUnlocked(index, games))
          {
            statusElement.textContent = 'Test Mode';
            statusElement.className = 'game-status test-mode';
          } else
          {
            statusElement.textContent = 'Unlocked';
            statusElement.className = 'game-status unlocked';
          }
        }
      }
    });

    // Show final slideshow button if all games completed or in test mode
    if (this.gameState.completedGames.length === 5 || this.testMode)
    {
      document.getElementById('final-slideshow-btn')?.classList.remove('hidden');
    }
  }

  selectGame(gameType)
  {
    const games = ['memory-match', 'photo-puzzle', 'guess-moment', 'trivia-quiz', 'timeline'];
    const gameIndex = games.indexOf(gameType);

    // Check if game is unlocked (allow access in test mode)
    if (!this.testMode && !this.gameState.isGameUnlocked(gameIndex, games))
    {
      console.log(`Game ${gameType} is locked`);
      return;
    }

    this.gameState.currentGame = gameType;
    this.audioManager.playSound('click-sound');

    // Show the appropriate screen based on game type
    switch (gameType)
    {
      case 'memory-match':
        this.memoryMatchGame.start();
        break;
      case 'photo-puzzle':
        this.startPhotoPuzzle();
        break;
      case 'guess-moment':
        this.startGuessTheMoment();
        break;
      case 'trivia-quiz':
        this.startTriviaQuiz();
        break;
      case 'timeline':
        this.startTimeline();
        break;
      case 'mood-match':
        this.startMoodMatch();
        break;
      case 'hidden-message':
        this.startHiddenMessage();
        break;
      case 'scavenger-hunt':
        this.startScavengerHunt();
        break;
      default:
        console.log('Unknown game type:', gameType);
        this.router.goToGames();
    }
  }

  completeGame(gameType)
  {
    if (this.gameState.completeGame(gameType))
    {
      this.audioManager.playSound('success-sound');
      this.showMemoryToken();
    }
  }

  showMemoryToken()
  {
    const modal = document.getElementById('token-modal');
    const content = document.getElementById('token-content');

    if (!modal || !content) return;

    const tokenIndex = this.gameState.memoryTokens - 1;
    const message = this.memoryTokenMessages[tokenIndex];
    const photo = this.photos[tokenIndex];

    content.innerHTML = `
      <div class="token-message">${message}</div>
      <img src="${photo.src}" alt="Memory" class="token-photo">
      <p>Memory Token ${this.gameState.memoryTokens}/5 Unlocked!</p>
    `;

    modal.classList.add('active');
    this.gameState.updateLoveLevel();
  }

  closeTokenModal()
  {
    document.getElementById('token-modal')?.classList.remove('active');
    this.router.goToGames();
  }

  restartGame()
  {
    this.gameState.reset();
    DOMUtils.showScreen('welcome-screen');
    this.gameState.updateLoveLevel();
    this.stopSlideshow();
  }

  // Game implementations
  startPhotoPuzzle()
  {
    this.photoPuzzleGame.start();
  }

  startGuessTheMoment()
  {
    this.guessTheMomentGame.start();
  }

  startTriviaQuiz()
  {
    this.triviaQuizGame.start();
  }

  startTimeline()
  {
    this.timelineChallengeGame.start();
  }

  startMoodMatch()
  {
    this.moodMatchGame.start();
  }

  startHiddenMessage()
  {
    if (this.hiddenMessageGame)
    {
      this.hiddenMessageGame.start();
    }
  }

  startScavengerHunt()
  {
    if (this.photoScavengerHuntGame)
    {
      this.photoScavengerHuntGame.start();
    }
  }

  showFinalSlideshow()
  {
    DOMUtils.showScreen('final-slideshow');
    this.initializePhotoCollage();
  }

  stopSlideshow()
  {
    // Stop any auto-play if implemented
    if (this.slideshowInterval) {
      clearInterval(this.slideshowInterval);
      this.slideshowInterval = null;
    }
  }

  initializePhotoCollage()
  {
    const container = document.getElementById('slideshow-photos');
    if (!container) return;

    // Clear existing content
    container.innerHTML = '';

    // Create TikTok-style vertical scroll container
    container.className = 'tiktok-scroll-container';
    
    // Create scroll wrapper
    const scrollWrapper = document.createElement('div');
    scrollWrapper.className = 'tiktok-scroll-wrapper';
    
    // Add all photos as full-screen items
    this.photos.forEach((photo, index) => {
      const photoItem = document.createElement('div');
      photoItem.className = 'tiktok-photo-item';
      photoItem.dataset.index = index;

      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.moment || `Memory ${index + 1}`;
      img.loading = index < 3 ? 'eager' : 'lazy'; // Load first few immediately

      const overlay = document.createElement('div');
      overlay.className = 'tiktok-photo-overlay';
      
      const info = document.createElement('div');
      info.className = 'tiktok-photo-info';
      
      const title = document.createElement('h2');
      title.className = 'tiktok-photo-title';
      title.textContent = photo.moment || `Memory ${index + 1}`;
      
      const date = document.createElement('p');
      date.className = 'tiktok-photo-date';
      const photoDate = new Date(photo.date);
      date.textContent = photoDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const counter = document.createElement('div');
      counter.className = 'tiktok-photo-counter';
      counter.textContent = `${index + 1} / ${this.photos.length}`;

      info.appendChild(title);
      info.appendChild(date);
      info.appendChild(counter);
      overlay.appendChild(info);

      photoItem.appendChild(img);
      photoItem.appendChild(overlay);

      scrollWrapper.appendChild(photoItem);
    });

    container.appendChild(scrollWrapper);

    // Initialize TikTok-style scrolling
    this.initializeTikTokScrolling(scrollWrapper);
    
    // Add navigation controls
    this.addTikTokControls(container);
  }

  initializeTikTokScrolling(container)
  {
    this.currentPhotoIndex = 0;
    this.isScrolling = false;
    
    // Smooth scroll to first photo
    this.scrollToPhoto(0);

    // Handle wheel events for desktop
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (this.isScrolling) return;
      
      if (e.deltaY > 0) {
        // Scroll down
        this.navigateToNextPhoto();
      } else {
        // Scroll up  
        this.navigateToPrevPhoto();
      }
    });

    // Handle touch events for mobile
    let touchStartY = 0;
    let touchEndY = 0;

    container.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    });

    container.addEventListener('touchend', (e) => {
      if (this.isScrolling) return;
      
      touchEndY = e.changedTouches[0].clientY;
      const touchDiff = touchStartY - touchEndY;
      
      // Minimum swipe distance
      if (Math.abs(touchDiff) > 50) {
        if (touchDiff > 0) {
          // Swipe up - next photo
          this.navigateToNextPhoto();
        } else {
          // Swipe down - previous photo
          this.navigateToPrevPhoto();
        }
      }
    });

    // Handle keyboard navigation
    this.tiktokKeyHandler = (e) => {
      if (document.getElementById('final-slideshow').classList.contains('screen') && 
          !document.getElementById('final-slideshow').style.display === 'none') {
        switch(e.key) {
          case 'ArrowDown':
          case ' ':
            e.preventDefault();
            this.navigateToNextPhoto();
            break;
          case 'ArrowUp':
            e.preventDefault();
            this.navigateToPrevPhoto();
            break;
          case 'Home':
            e.preventDefault();
            this.scrollToPhoto(0);
            break;
          case 'End':
            e.preventDefault();
            this.scrollToPhoto(this.photos.length - 1);
            break;
        }
      }
    };

    document.addEventListener('keydown', this.tiktokKeyHandler);
  }

  addTikTokControls(container)
  {
    const controls = document.createElement('div');
    controls.className = 'tiktok-controls';
    controls.innerHTML = `
      <button class="tiktok-nav-btn tiktok-up-btn" aria-label="Previous photo">↑</button>
      <button class="tiktok-nav-btn tiktok-down-btn" aria-label="Next photo">↓</button>
    `;

    const upBtn = controls.querySelector('.tiktok-up-btn');
    const downBtn = controls.querySelector('.tiktok-down-btn');

    upBtn.addEventListener('click', () => this.navigateToPrevPhoto());
    downBtn.addEventListener('click', () => this.navigateToNextPhoto());

    container.appendChild(controls);
  }

  navigateToNextPhoto()
  {
    if (this.currentPhotoIndex < this.photos.length - 1) {
      this.currentPhotoIndex++;
      this.scrollToPhoto(this.currentPhotoIndex);
    }
  }

  navigateToPrevPhoto()
  {
    if (this.currentPhotoIndex > 0) {
      this.currentPhotoIndex--;
      this.scrollToPhoto(this.currentPhotoIndex);
    }
  }

  scrollToPhoto(index)
  {
    this.isScrolling = true;
    this.currentPhotoIndex = index;
    
    const container = document.querySelector('.tiktok-scroll-wrapper');
    const photoHeight = window.innerHeight;
    
    container.style.transform = `translateY(-${index * photoHeight}px)`;
    
    // Update navigation button states
    this.updateTikTokNavigation();
    
    setTimeout(() => {
      this.isScrolling = false;
    }, 500);
  }

  updateTikTokNavigation()
  {
    const upBtn = document.querySelector('.tiktok-up-btn');
    const downBtn = document.querySelector('.tiktok-down-btn');
    
    if (upBtn) {
      upBtn.style.opacity = this.currentPhotoIndex === 0 ? '0.3' : '1';
      upBtn.disabled = this.currentPhotoIndex === 0;
    }
    
    if (downBtn) {
      downBtn.style.opacity = this.currentPhotoIndex === this.photos.length - 1 ? '0.3' : '1';
      downBtn.disabled = this.currentPhotoIndex === this.photos.length - 1;
    }
  }

  cleanupTikTokScrolling()
  {
    if (this.tiktokKeyHandler) {
      document.removeEventListener('keydown', this.tiktokKeyHandler);
      this.tiktokKeyHandler = null;
    }
  }

  showTestModeNotification()
  {
    // Create test mode notification
    const notification = document.createElement('div');
    notification.className = 'test-mode-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <h3>${this.testMode ? '🧪 Test Mode Enabled' : '🔒 Test Mode Disabled'}</h3>
        <p>${this.testMode ? 'All games are now unlocked for testing!' : 'Games are now locked according to progression.'}</p>
        <p style="font-size: 0.9em; margin-top: 10px;">Press <kbd>Shift+T</kbd> to toggle</p>
        <button onclick="this.parentElement.parentElement.remove()">OK</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() =>
    {
      if (notification.parentElement)
      {
        notification.remove();
      }
    }, 5000);
  }

  // Expose test mode methods to console for easy access
  initTestModeConsoleCommands()
  {
    if (this.isDevEnvironment())
    {
      window.gameTestMode = {
        toggle: () => this.toggleTestMode(),
        enable: () =>
        {
          if (!this.testMode) this.toggleTestMode();
        },
        disable: () =>
        {
          if (this.testMode) this.toggleTestMode();
        },
        status: () => console.log(`Test mode: ${this.testMode ? 'ENABLED' : 'DISABLED'}`),
        help: () =>
        {
          console.log('%c🧪 Test Mode Commands:', 'font-weight: bold; color: #ff69b4;');
          console.log('gameTestMode.toggle() - Toggle test mode');
          console.log('gameTestMode.enable() - Enable test mode');
          console.log('gameTestMode.disable() - Disable test mode');
          console.log('gameTestMode.status() - Check current status');
          console.log('Keyboard shortcut: Shift+T');
        }
      };

      console.log('%c🧪 Development Mode Active', 'font-weight: bold; color: #ff69b4;');
      console.log('Type gameTestMode.help() for test mode commands');
    }
  }
}