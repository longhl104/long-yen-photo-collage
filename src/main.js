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
		this.testMode = this.loadTestMode();

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

	loadTestMode()
	{
		// Load test mode state from localStorage
		if (this.isDevEnvironment())
		{
			try
			{
				const saved = localStorage.getItem('romantic-game-test-mode');
				if (saved !== null)
				{
					const testMode = JSON.parse(saved);
					console.log(`💾 Test mode loaded: ${testMode ? 'ENABLED' : 'DISABLED'}`);
					return testMode;
				}
			} catch (error)
			{
				console.error('Failed to load test mode:', error);
			}
		}
		return this.isDevEnvironment();
	}

	saveTestMode()
	{
		if (this.isDevEnvironment())
		{
			try
			{
				localStorage.setItem('romantic-game-test-mode', JSON.stringify(this.testMode));
				console.log('💾 Test mode saved');
			} catch (error)
			{
				console.error('Failed to save test mode:', error);
			}
		}
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
			this.saveTestMode();
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

			// Show welcome back message if game was restored
			if (this.gameState.memoryTokens > 0)
			{
				this.showWelcomeBackMessage();
			}

			// Finish loading and let the router handle navigation
			this.router.finishLoading();
		}, 3000);
	}

	showWelcomeBackMessage()
	{
		const message = document.createElement('div');
		message.className = 'save-indicator';
		message.style.bottom = '80px'; // Position above normal save indicator
		message.innerHTML = `Welcome back! Progress restored (${this.gameState.memoryTokens}/5 games completed)`;
		document.body.appendChild(message);

		setTimeout(() =>
		{
			if (message.parentElement)
			{
				message.remove();
			}
		}, 4000);
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

		// Show gallery button if all games completed or in test mode
		if (this.gameState.completedGames.length === 5 || this.testMode)
		{
			const galleryBtn = document.getElementById('view-gallery-btn');
			if (galleryBtn)
			{
				galleryBtn.classList.remove('hidden');
				// Setup click handler if not already done
				if (!galleryBtn.onclick)
				{
					galleryBtn.onclick = () => this.router.navigate('/gallery');
				}
			}
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
		// Confirm before restarting
		if (!confirm('Are you sure you want to restart the game? All progress will be lost.'))
		{
			return;
		}

		this.gameState.reset();
		this.gameState.clearStorage();

		// Clear test mode in dev
		if (this.isDevEnvironment())
		{
			this.testMode = true;
			this.saveTestMode();
		}

		DOMUtils.showScreen('welcome-screen');
		this.gameState.updateLoveLevel();
		this.stopSlideshow();

		// Navigate to home
		this.router.navigate('/');
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
		if (this.slideshowInterval)
		{
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
		this.photos.forEach((photo, index) =>
		{
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
		container.addEventListener('wheel', (e) =>
		{
			e.preventDefault();
			if (this.isScrolling) return;

			if (e.deltaY > 0)
			{
				// Scroll down
				this.navigateToNextPhoto();
			} else
			{
				// Scroll up
				this.navigateToPrevPhoto();
			}
		});

		// Handle touch events for mobile
		let touchStartY = 0;
		let touchEndY = 0;

		container.addEventListener('touchstart', (e) =>
		{
			touchStartY = e.touches[0].clientY;
		});

		container.addEventListener('touchend', (e) =>
		{
			if (this.isScrolling) return;

			touchEndY = e.changedTouches[0].clientY;
			const touchDiff = touchStartY - touchEndY;

			// Minimum swipe distance
			if (Math.abs(touchDiff) > 50)
			{
				if (touchDiff > 0)
				{
					// Swipe up - next photo
					this.navigateToNextPhoto();
				} else
				{
					// Swipe down - previous photo
					this.navigateToPrevPhoto();
				}
			}
		});

		// Handle keyboard navigation
		this.tiktokKeyHandler = (e) =>
		{
			if (document.getElementById('final-slideshow').classList.contains('screen') &&
				!document.getElementById('final-slideshow').style.display === 'none')
			{
				switch (e.key)
				{
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
		if (this.currentPhotoIndex < this.photos.length - 1)
		{
			this.currentPhotoIndex++;
			this.scrollToPhoto(this.currentPhotoIndex);
		}
	}

	navigateToPrevPhoto()
	{
		if (this.currentPhotoIndex > 0)
		{
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

		setTimeout(() =>
		{
			this.isScrolling = false;
		}, 500);
	}

	updateTikTokNavigation()
	{
		const upBtn = document.querySelector('.tiktok-up-btn');
		const downBtn = document.querySelector('.tiktok-down-btn');

		if (upBtn)
		{
			upBtn.style.opacity = this.currentPhotoIndex === 0 ? '0.3' : '1';
			upBtn.disabled = this.currentPhotoIndex === 0;
		}

		if (downBtn)
		{
			downBtn.style.opacity = this.currentPhotoIndex === this.photos.length - 1 ? '0.3' : '1';
			downBtn.disabled = this.currentPhotoIndex === this.photos.length - 1;
		}
	}

	cleanupTikTokScrolling()
	{
		if (this.tiktokKeyHandler)
		{
			document.removeEventListener('keydown', this.tiktokKeyHandler);
			this.tiktokKeyHandler = null;
		}
	}

	// Photo Gallery
	showPhotoGallery()
	{
		DOMUtils.showScreen('photo-gallery-screen');
		this.initializePhotoGallery();
	}

	initializePhotoGallery()
	{
		const galleryGrid = document.getElementById('gallery-grid');
		if (!galleryGrid) return;

		// Clear existing content
		galleryGrid.innerHTML = '';

		// Store current filter
		this.currentGalleryFilter = 'all';
		this.galleryPhotos = [...this.photos];

		// Render all photos
		this.renderGalleryPhotos();

		// Setup filter buttons
		this.setupGalleryFilters();

		// Setup back button
		const backBtn = document.getElementById('back-from-gallery');
		if (backBtn)
		{
			backBtn.onclick = () => this.router.goToGames();
		}
	}

	renderGalleryPhotos()
	{
		const galleryGrid = document.getElementById('gallery-grid');
		if (!galleryGrid) return;

		galleryGrid.innerHTML = '';

		// Filter photos based on current filter
		let filteredPhotos = this.galleryPhotos;
		if (this.currentGalleryFilter !== 'all')
		{
			filteredPhotos = this.galleryPhotos.filter(photo =>
			{
				const year = new Date(photo.date).getFullYear().toString();
				return year === this.currentGalleryFilter;
			});
		}

		// Create gallery items
		filteredPhotos.forEach((photo, index) =>
		{
			const item = document.createElement('div');
			item.className = 'gallery-item';
			item.dataset.index = this.galleryPhotos.indexOf(photo);

			const img = document.createElement('img');
			img.src = photo.src;
			img.alt = photo.moment || 'Memory';
			img.loading = 'lazy';

			const overlay = document.createElement('div');
			overlay.className = 'gallery-item-overlay';

			const info = document.createElement('div');
			info.className = 'gallery-item-info';
			info.innerHTML = `
        <h4>${photo.moment || 'Our Memory'}</h4>
        <p>${new Date(photo.date).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			})}</p>
      `;

			overlay.appendChild(info);
			item.appendChild(img);
			item.appendChild(overlay);

			// Click to open modal
			item.addEventListener('click', () => this.openGalleryModal(this.galleryPhotos.indexOf(photo)));

			galleryGrid.appendChild(item);
		});

		// Show count
		const header = document.querySelector('.gallery-header p');
		if (header)
		{
			if (this.currentGalleryFilter === 'all')
			{
				header.textContent = `Every moment captured, every memory cherished (${filteredPhotos.length} photos)`;
			} else
			{
				header.textContent = `${filteredPhotos.length} photos from ${this.currentGalleryFilter}`;
			}
		}
	}

	setupGalleryFilters()
	{
		const filterButtons = document.querySelectorAll('.filter-btn');
		filterButtons.forEach(btn =>
		{
			btn.addEventListener('click', () =>
			{
				// Update active state
				filterButtons.forEach(b => b.classList.remove('active'));
				btn.classList.add('active');

				// Apply filter
				this.currentGalleryFilter = btn.dataset.filter;
				this.renderGalleryPhotos();
			});
		});
	}

	openGalleryModal(index)
	{
		const modal = document.getElementById('gallery-modal');
		if (!modal) return;

		this.currentGalleryPhotoIndex = index;
		this.updateGalleryModal();
		modal.classList.add('active');
		document.body.style.overflow = 'hidden';

		// Setup modal controls if not already done
		if (!this.galleryModalSetup)
		{
			this.setupGalleryModal();
			this.galleryModalSetup = true;
		}
	}

	setupGalleryModal()
	{
		const modal = document.getElementById('gallery-modal');
		const closeBtn = modal.querySelector('.gallery-modal-close');
		const prevBtn = modal.querySelector('.gallery-modal-prev');
		const nextBtn = modal.querySelector('.gallery-modal-next');

		closeBtn.addEventListener('click', () => this.closeGalleryModal());
		prevBtn.addEventListener('click', () => this.navigateGalleryModal(-1));
		nextBtn.addEventListener('click', () => this.navigateGalleryModal(1));

		// Close on background click
		modal.addEventListener('click', (e) =>
		{
			if (e.target === modal)
			{
				this.closeGalleryModal();
			}
		});

		// Keyboard navigation
		this.galleryModalKeyHandler = (e) =>
		{
			if (!modal.classList.contains('active')) return;

			switch (e.key)
			{
				case 'Escape':
					this.closeGalleryModal();
					break;
				case 'ArrowLeft':
					this.navigateGalleryModal(-1);
					break;
				case 'ArrowRight':
					this.navigateGalleryModal(1);
					break;
			}
		};

		document.addEventListener('keydown', this.galleryModalKeyHandler);
	}

	updateGalleryModal()
	{
		const modal = document.getElementById('gallery-modal');
		const photo = this.galleryPhotos[this.currentGalleryPhotoIndex];

		const img = modal.querySelector('.gallery-modal-image');
		const title = modal.querySelector('.gallery-modal-title');
		const date = modal.querySelector('.gallery-modal-date');
		const emotion = modal.querySelector('.gallery-modal-emotion');

		img.src = photo.src;
		img.alt = photo.moment || 'Memory';
		title.textContent = photo.moment || 'Our Memory';
		date.textContent = new Date(photo.date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
		emotion.textContent = `💕 ${photo.emotion}`;

		// Update navigation buttons visibility
		const prevBtn = modal.querySelector('.gallery-modal-prev');
		const nextBtn = modal.querySelector('.gallery-modal-next');

		prevBtn.style.display = this.currentGalleryPhotoIndex > 0 ? 'flex' : 'none';
		nextBtn.style.display = this.currentGalleryPhotoIndex < this.galleryPhotos.length - 1 ? 'flex' : 'none';
	}

	navigateGalleryModal(direction)
	{
		const newIndex = this.currentGalleryPhotoIndex + direction;
		if (newIndex >= 0 && newIndex < this.galleryPhotos.length)
		{
			this.currentGalleryPhotoIndex = newIndex;
			this.updateGalleryModal();
		}
	}

	closeGalleryModal()
	{
		const modal = document.getElementById('gallery-modal');
		modal.classList.remove('active');
		document.body.style.overflow = '';
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

			// Add save/load commands
			window.gameSave = {
				status: () =>
				{
					const saved = localStorage.getItem(this.gameState.storageKey);
					const route = localStorage.getItem(this.router.routeStorageKey);
					const testMode = localStorage.getItem('romantic-game-test-mode');
					console.log('%c💾 Save Status:', 'font-weight: bold; color: #4CAF50;');
					console.log('Game State:', saved ? JSON.parse(saved) : 'No save data');
					console.log('Last Route:', route || 'None');
					console.log('Test Mode:', testMode ? JSON.parse(testMode) : 'Default');
				},
				clear: () =>
				{
					if (confirm('Clear all saved data? This will reset your progress.'))
					{
						this.gameState.clearStorage();
						localStorage.removeItem(this.router.routeStorageKey);
						localStorage.removeItem('romantic-game-test-mode');
						console.log('💾 All saved data cleared. Refresh the page to start fresh.');
					}
				},
				export: () =>
				{
					const data = {
						gameState: JSON.parse(localStorage.getItem(this.gameState.storageKey) || '{}'),
						route: localStorage.getItem(this.router.routeStorageKey),
						testMode: localStorage.getItem('romantic-game-test-mode'),
						exportedAt: new Date().toISOString()
					};
					console.log('%c💾 Save Data Export:', 'font-weight: bold; color: #2196F3;');
					console.log(JSON.stringify(data, null, 2));
					return data;
				},
				import: (data) =>
				{
					try
					{
						if (data.gameState)
						{
							localStorage.setItem(this.gameState.storageKey, JSON.stringify(data.gameState));
						}
						if (data.route)
						{
							localStorage.setItem(this.router.routeStorageKey, data.route);
						}
						if (data.testMode !== undefined)
						{
							localStorage.setItem('romantic-game-test-mode', data.testMode);
						}
						console.log('💾 Save data imported successfully. Refresh the page to apply.');
					} catch (error)
					{
						console.error('Failed to import save data:', error);
					}
				},
				help: () =>
				{
					console.log('%c💾 Save Management Commands:', 'font-weight: bold; color: #4CAF50;');
					console.log('gameSave.status() - View current save data');
					console.log('gameSave.clear() - Clear all saved data');
					console.log('gameSave.export() - Export save data');
					console.log('gameSave.import(data) - Import save data');
				}
			};

			console.log('%c🧪 Development Mode Active', 'font-weight: bold; color: #ff69b4;');
			console.log('Type gameTestMode.help() for test mode commands');
			console.log('Type gameSave.help() for save management commands');
		}
	}
}
