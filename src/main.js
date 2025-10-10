import { GameState } from './components/BaseGame.js';
import { AudioManager, DOMUtils } from './utils/helpers.js';
import { Router } from './utils/router.js';
import { NavigationHelpers } from './utils/navigation.js';
import { photos, memoryTokenMessages, triviaQuestions } from './data/gameData.js';
import { MemoryMatchGame } from './components/MemoryMatchGame.js';
import { PhotoPuzzleGame } from './components/PhotoPuzzleGame.js';

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
    const games = ['memory-match', 'photo-puzzle', 'guess-moment', 'trivia-quiz', 'timeline', 'mood-match', 'hidden-message', 'scavenger-hunt'];

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
    if (this.gameState.completedGames.length === 8 || this.testMode)
    {
      document.getElementById('final-slideshow-btn')?.classList.remove('hidden');
    }
  }

  selectGame(gameType)
  {
    const games = ['memory-match', 'photo-puzzle', 'guess-moment', 'trivia-quiz', 'timeline', 'mood-match', 'hidden-message', 'scavenger-hunt'];
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
      <p>Memory Token ${this.gameState.memoryTokens}/8 Unlocked!</p>
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
    console.log('Guess the Moment game - to be implemented');
  }

  startTriviaQuiz()
  {
    console.log('Trivia Quiz game - to be implemented');
  }

  startTimeline()
  {
    console.log('Timeline game - to be implemented');
  }

  startMoodMatch()
  {
    console.log('Mood Match game - to be implemented');
  }

  startHiddenMessage()
  {
    console.log('Hidden Message game - to be implemented');
  }

  startScavengerHunt()
  {
    console.log('Scavenger Hunt game - to be implemented');
  }

  showFinalSlideshow()
  {
    console.log('Final Slideshow - to be implemented');
  }

  stopSlideshow()
  {
    console.log('Stop Slideshow - to be implemented');
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