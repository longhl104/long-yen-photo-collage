import { GameState } from './components/BaseGame.js';
import { AudioManager, DOMUtils } from './utils/helpers.js';
import { Router } from './utils/router.js';
import { NavigationHelpers } from './utils/navigation.js';
import { photos, memoryTokenMessages, triviaQuestions } from './data/gameData.js';
import { MemoryMatchGame } from './components/MemoryMatchGame.js';

export class RomanticGameEngine {
  constructor() {
    this.gameState = new GameState();
    this.audioManager = new AudioManager();
    this.router = new Router(this);
    this.navigation = new NavigationHelpers(this.router);
    this.photos = photos;
    this.memoryTokenMessages = memoryTokenMessages;
    this.triviaQuestions = triviaQuestions;
    
    // Initialize game components
    this.memoryMatchGame = new MemoryMatchGame(this);
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.audioManager.init();
    
    // Setup navigation features
    this.navigation.setupHistoryNavigation();
    this.navigation.setupKeyboardNavigation();
    this.navigation.validateDeepLink();
    
    this.showLoadingScreen();
  }

  setupEventListeners() {
    // Welcome screen
    document.getElementById('start-game-btn')?.addEventListener('click', () => this.router.goToGames());

    // Game selection - use router for navigation
    document.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const gameType = e.currentTarget.dataset.game;
        this.router.goToGame(gameType);
      });
    });

    // Back buttons - use router for navigation
    document.querySelectorAll('[id$="-back-btn"]').forEach(btn => {
      btn.addEventListener('click', () => this.router.goToGames());
    });

    // Final slideshow
    document.getElementById('final-slideshow-btn')?.addEventListener('click', () => this.router.goToSlideshow());
    document.getElementById('restart-game-btn')?.addEventListener('click', () => this.restartGame());

    // Token modal
    document.getElementById('close-token-modal')?.addEventListener('click', () => this.closeTokenModal());

    // Add route-aware navigation to existing elements
    this.setupRouteNavigation();
  }

  setupRouteNavigation() {
    // Add route data attributes to navigable elements
    const startBtn = document.getElementById('start-game-btn');
    if (startBtn) startBtn.dataset.route = '/games';

    const finalBtn = document.getElementById('final-slideshow-btn');
    if (finalBtn) finalBtn.dataset.route = '/slideshow';

    // Add navigation classes to game cards
    document.querySelectorAll('.game-card').forEach(card => {
      const gameType = card.dataset.game;
      card.dataset.route = `/games/${gameType}`;
    });
  }

  showLoadingScreen() {
    // Simulate loading
    setTimeout(() => {
      DOMUtils.hideScreen('loading-screen');
      this.gameState.updateLoveLevel();
      
      // Finish loading and let the router handle navigation
      this.router.finishLoading();
    }, 3000);
  }

  showWelcome() {
    DOMUtils.showScreen('welcome-screen');
    this.gameState.updateLoveLevel();
  }

  showGameSelection() {
    DOMUtils.showScreen('game-selection');
    this.updateGameAvailability();
  }

  updateGameAvailability() {
    const games = ['memory-match', 'photo-puzzle', 'guess-moment', 'trivia-quiz', 'timeline', 'mood-match', 'hidden-message', 'scavenger-hunt'];

    games.forEach((game, index) => {
      const card = document.querySelector(`[data-game="${game}"]`);
      if (!card) return;

      const isUnlocked = this.gameState.isGameUnlocked(index, games);

      if (isUnlocked) {
        card.classList.remove('locked');
        const statusElement = card.querySelector('.game-status');
        if (statusElement) {
          statusElement.textContent = 'Unlocked';
          statusElement.className = 'game-status unlocked';
        }
      }
    });

    // Show final slideshow button if all games completed
    if (this.gameState.completedGames.length === 8) {
      document.getElementById('final-slideshow-btn')?.classList.remove('hidden');
    }
  }

  selectGame(gameType) {
    const games = ['memory-match', 'photo-puzzle', 'guess-moment', 'trivia-quiz', 'timeline', 'mood-match', 'hidden-message', 'scavenger-hunt'];
    const gameIndex = games.indexOf(gameType);

    // Check if game is unlocked (router handles this too, but double-check for direct calls)
    if (!this.gameState.isGameUnlocked(gameIndex, games)) {
      console.log(`Game ${gameType} is locked`);
      return;
    }

    this.gameState.currentGame = gameType;
    this.audioManager.playSound('click-sound');

    // Show the appropriate screen based on game type
    switch (gameType) {
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

  completeGame(gameType) {
    if (this.gameState.completeGame(gameType)) {
      this.audioManager.playSound('success-sound');
      this.showMemoryToken();
    }
  }

  showMemoryToken() {
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

  closeTokenModal() {
    document.getElementById('token-modal')?.classList.remove('active');
    this.router.goToGames();
  }

  restartGame() {
    this.gameState.reset();
    DOMUtils.showScreen('welcome-screen');
    this.gameState.updateLoveLevel();
    this.stopSlideshow();
  }

  // Placeholder methods for other games (to be implemented)
  startPhotoPuzzle() {
    console.log('Photo Puzzle game - to be implemented');
  }

  startGuessTheMoment() {
    console.log('Guess the Moment game - to be implemented');
  }

  startTriviaQuiz() {
    console.log('Trivia Quiz game - to be implemented');
  }

  startTimeline() {
    console.log('Timeline game - to be implemented');
  }

  startMoodMatch() {
    console.log('Mood Match game - to be implemented');
  }

  startHiddenMessage() {
    console.log('Hidden Message game - to be implemented');
  }

  startScavengerHunt() {
    console.log('Scavenger Hunt game - to be implemented');
  }

  showFinalSlideshow() {
    console.log('Final Slideshow - to be implemented');
  }

  stopSlideshow() {
    console.log('Stop Slideshow - to be implemented');
  }
}