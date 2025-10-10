import { BaseGame } from './BaseGame.js';
import { DOMUtils } from '../utils/helpers.js';

export class HiddenMessageGame extends BaseGame {
  constructor(gameEngine) {
    super(gameEngine, 'hidden-message');
    this.selectedPhotos = [];
    this.currentPhotoIndex = 0;
    this.currentMessages = [];
    this.foundMessages = [];
    this.totalMessages = 5;
    this.messagesPerPhoto = 1;
    this.isRevealing = false;
    
    // Romantic messages that could be "hidden" in photos
    this.hiddenMessages = [
      "You make every moment magical ✨",
      "Forever grateful for your love 💕",
      "You're my favorite adventure 🌟",
      "Home is wherever you are 🏠",
      "Every day with you is a gift 🎁",
      "You complete my heart 💝",
      "Together we can conquer anything 💪",
      "Your smile lights up my world 🌞",
      "You're my happily ever after 👑",
      "Love you to the moon and back 🌙",
      "You make ordinary moments extraordinary ✨",
      "My heart belongs to you forever 💖"
    ];
  }

  start() {
    DOMUtils.showScreen('hidden-message-game');
    this.setupGame();
  }

  setupGame() {
    this.selectPhotosForGame();
    this.generateHiddenMessages();
    this.setupCurrentPhoto();
    this.updateProgress();
  }

  selectPhotosForGame() {
    // Select 5 diverse photos for the hidden message hunt
    const availablePhotos = [...this.gameEngine.photos];
    this.shuffleArray(availablePhotos);
    
    this.selectedPhotos = availablePhotos.slice(0, this.totalMessages);
    this.shuffleArray(this.selectedPhotos);
  }

  generateHiddenMessages() {
    // Create hidden messages for each photo
    this.foundMessages = [];
    this.currentPhotoIndex = 0;
    
    // Shuffle messages to ensure variety
    const shuffledMessages = [...this.hiddenMessages];
    this.shuffleArray(shuffledMessages);
    
    // Select messages for this game
    this.gameMessages = shuffledMessages.slice(0, this.totalMessages);
  }

  setupCurrentPhoto() {
    if (this.currentPhotoIndex >= this.selectedPhotos.length) {
      this.completeGame();
      return;
    }

    const photo = this.selectedPhotos[this.currentPhotoIndex];
    const photoElement = document.getElementById('hidden-photo');
    const messagesContainer = document.getElementById('hidden-messages');
    
    if (!photoElement || !messagesContainer) return;

    // Set up the photo
    photoElement.src = photo.src;
    photoElement.alt = `Find the hidden message in ${photo.moment}`;
    
    // Clear previous messages
    messagesContainer.innerHTML = '';
    
    // Create message spots for this photo
    this.createMessageSpots(photo, messagesContainer);
    
    // Show photo info
    this.showPhotoInfo(photo);
  }

  createMessageSpots(photo, container) {
    // Create one hidden message spot for this photo
    const messageSpot = document.createElement('div');
    messageSpot.className = 'hidden-spot';
    
    // Random position within the photo area
    const randomX = Math.random() * 70 + 10; // 10-80% from left
    const randomY = Math.random() * 70 + 10; // 10-80% from top
    
    messageSpot.style.left = `${randomX}%`;
    messageSpot.style.top = `${randomY}%`;
    messageSpot.dataset.messageIndex = this.currentPhotoIndex;
    
    // Add click handler
    messageSpot.addEventListener('click', (e) => {
      e.stopPropagation();
      this.revealMessage(messageSpot, this.currentPhotoIndex);
    });
    
    // Add hover effect
    messageSpot.addEventListener('mouseenter', () => {
      if (!messageSpot.classList.contains('found')) {
        messageSpot.style.transform = 'scale(1.2)';
      }
    });
    
    messageSpot.addEventListener('mouseleave', () => {
      if (!messageSpot.classList.contains('found')) {
        messageSpot.style.transform = 'scale(1)';
      }
    });
    
    container.appendChild(messageSpot);
  }

  showPhotoInfo(photo) {
    // Create or update photo info display
    let infoElement = document.querySelector('.hidden-photo-info');
    if (!infoElement) {
      infoElement = document.createElement('div');
      infoElement.className = 'hidden-photo-info';
      const container = document.getElementById('hidden-photo-container');
      if (container) {
        container.appendChild(infoElement);
      }
    }
    
    infoElement.innerHTML = `
      <h3>${photo.moment}</h3>
      <p>${this.formatDate(photo.date)}</p>
      <p class="instruction">Click on the glowing spot to reveal the hidden message! ✨</p>
    `;
  }

  revealMessage(messageSpot, messageIndex) {
    if (this.isRevealing || messageSpot.classList.contains('found')) return;
    
    this.isRevealing = true;
    messageSpot.classList.add('found');
    
    // Get the message for this photo
    const message = this.gameMessages[messageIndex];
    
    // Create message reveal animation
    const messageReveal = document.createElement('div');
    messageReveal.className = 'message-reveal';
    messageReveal.innerHTML = `
      <div class="message-content">
        <div class="message-icon">💌</div>
        <div class="message-text">${message}</div>
        <div class="message-from">Hidden in "${this.selectedPhotos[messageIndex].moment}"</div>
      </div>
    `;
    
    document.body.appendChild(messageReveal);
    
    // Add found message to collection
    this.foundMessages.push({
      message: message,
      photo: this.selectedPhotos[messageIndex]
    });
    
    // Update progress
    this.updateProgress();
    
    // Show reveal animation
    setTimeout(() => {
      messageReveal.classList.add('active');
    }, 100);
    
    // Auto-close and move to next photo
    setTimeout(() => {
      messageReveal.classList.remove('active');
      setTimeout(() => {
        messageReveal.remove();
        this.isRevealing = false;
        this.moveToNextPhoto();
      }, 500);
    }, 3000);
  }

  moveToNextPhoto() {
    this.currentPhotoIndex++;
    
    if (this.currentPhotoIndex < this.selectedPhotos.length) {
      // Show transition message
      this.showTransition();
      setTimeout(() => {
        this.setupCurrentPhoto();
      }, 1500);
    } else {
      // Game complete
      setTimeout(() => {
        this.completeGame();
      }, 1000);
    }
  }

  showTransition() {
    const transition = document.createElement('div');
    transition.className = 'hidden-transition';
    transition.innerHTML = `
      <div class="transition-content">
        <div class="transition-icon">📸</div>
        <div class="transition-text">Searching next memory...</div>
      </div>
    `;
    
    document.body.appendChild(transition);
    
    setTimeout(() => {
      transition.classList.add('active');
    }, 100);
    
    setTimeout(() => {
      transition.remove();
    }, 1500);
  }

  updateProgress() {
    const foundElement = document.getElementById('messages-found');
    if (foundElement) {
      foundElement.textContent = this.foundMessages.length;
    }
  }

  completeGame() {
    let resultMessage = '';
    let resultEmoji = '';
    
    // Always positive since they found all messages
    resultMessage = "Amazing detective work! You found all our hidden love notes! Every message was carefully placed in these precious memories. 💕";
    resultEmoji = "🔍";

    // Show all collected messages
    const allMessages = this.foundMessages.map((item, index) => 
      `${index + 1}. "${item.message}" - ${item.photo.moment}`
    ).join('\n');

    this.showCompletionMessage(
      `${resultEmoji} Hidden Messages Complete! ${resultEmoji}`,
      `You discovered all ${this.totalMessages} hidden messages!\n\nYour collection:\n${allMessages}\n\n${resultMessage}`
    );

    // Complete the game
    this.gameEngine.completeGame('hidden-message');
  }

  showCompletionMessage(title, message) {
    // Create completion modal
    const modal = document.createElement('div');
    modal.className = 'completion-modal';
    modal.innerHTML = `
      <div class="completion-content">
        <h3>${title}</h3>
        <p style="white-space: pre-line; text-align: left; max-height: 300px; overflow-y: auto;">${message}</p>
        <button class="btn-primary" onclick="this.parentElement.parentElement.remove(); window.gameEngine.router.goToGames();">Continue</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-remove after delay
    setTimeout(() => {
      if (modal.parentElement) {
        modal.remove();
        this.gameEngine.router.goToGames();
      }
    }, 12000);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  reset() {
    this.currentPhotoIndex = 0;
    this.foundMessages = [];
    this.isRevealing = false;
    this.setupGame();
  }
}