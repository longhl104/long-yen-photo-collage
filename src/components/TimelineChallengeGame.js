import { BaseGame } from './BaseGame.js';
import { DOMUtils } from '../utils/helpers.js';

export class TimelineChallengeGame extends BaseGame {
  constructor(gameEngine) {
    super(gameEngine, 'timeline');
    this.selectedPhotos = [];
    this.userOrder = [];
    this.correctOrder = [];
    this.draggedElement = null;
    this.draggedFromDropzone = false;
    this.totalRounds = 3;
    this.currentRound = 1;
    this.correctRounds = 0;
    this.photosPerRound = 4;
  }

  start() {
    DOMUtils.showScreen('timeline-screen');
    this.setupRound();
  }

  setupRound() {
    if (this.currentRound > this.totalRounds) {
      this.showFinalResults();
      return;
    }

    // Select random photos for this round
    this.selectPhotosForRound();
    
    // Setup the UI
    this.renderPhotos();
    this.setupDropZone();
    this.updateProgress();
    
    // Reset state
    this.userOrder = [];
    this.draggedElement = null;
    this.draggedFromDropzone = false;
  }

  selectPhotosForRound() {
    // Get a shuffled copy of all photos
    const availablePhotos = [...this.gameEngine.photos];
    this.shuffleArray(availablePhotos);
    
    // Select photos that have different dates for better challenge
    this.selectedPhotos = [];
    const usedYears = new Set();
    
    for (const photo of availablePhotos) {
      if (this.selectedPhotos.length >= this.photosPerRound) break;
      
      const photoYear = new Date(photo.date).getFullYear();
      
      // Try to get photos from different years if possible
      if (this.selectedPhotos.length < 2 || !usedYears.has(photoYear)) {
        this.selectedPhotos.push(photo);
        usedYears.add(photoYear);
      }
    }
    
    // If we still need more photos, add any remaining ones
    while (this.selectedPhotos.length < this.photosPerRound && availablePhotos.length > 0) {
      const photo = availablePhotos.find(p => !this.selectedPhotos.includes(p));
      if (photo) {
        this.selectedPhotos.push(photo);
      } else {
        break;
      }
    }

    // Create the correct chronological order
    this.correctOrder = [...this.selectedPhotos].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Shuffle the photos for display
    this.shuffleArray(this.selectedPhotos);
  }

  renderPhotos() {
    const photosContainer = document.getElementById('timeline-photos');
    if (!photosContainer) return;

    photosContainer.innerHTML = '';

    this.selectedPhotos.forEach((photo, index) => {
      const photoElement = document.createElement('div');
      photoElement.className = 'timeline-photo';
      photoElement.draggable = true;
      photoElement.dataset.photoId = index;
      
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.moment || 'Memory';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '10px';
      
      const overlay = document.createElement('div');
      overlay.className = 'photo-overlay';
      overlay.innerHTML = `
        <div class="photo-info">
          <strong>${photo.moment}</strong>
          <small>${this.formatDate(photo.date)}</small>
        </div>
      `;
      
      photoElement.appendChild(img);
      photoElement.appendChild(overlay);

      // Add drag event listeners
      this.addDragListeners(photoElement);

      photosContainer.appendChild(photoElement);
    });
  }

  setupDropZone() {
    const dropZone = document.getElementById('timeline-dropzone');
    if (!dropZone) return;

    dropZone.innerHTML = '';

    for (let i = 0; i < this.photosPerRound; i++) {
      const slot = document.createElement('div');
      slot.className = 'drop-slot';
      slot.dataset.slotIndex = i;
      slot.innerHTML = `<span>Drop here<br><small>Position ${i + 1}</small></span>`;

      // Add drop event listeners
      this.addDropListeners(slot);

      dropZone.appendChild(slot);
    }
  }

  addDragListeners(element) {
    element.addEventListener('dragstart', (e) => {
      this.draggedElement = element;
      this.draggedFromDropzone = element.parentElement.id === 'timeline-dropzone';
      element.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    element.addEventListener('dragend', (e) => {
      element.classList.remove('dragging');
      this.draggedElement = null;
      this.draggedFromDropzone = false;
    });
  }

  addDropListeners(slot) {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      slot.classList.add('drag-over');
    });

    slot.addEventListener('dragleave', (e) => {
      slot.classList.remove('drag-over');
    });

    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('drag-over');
      
      if (!this.draggedElement) return;

      const slotIndex = parseInt(slot.dataset.slotIndex);
      const photoId = parseInt(this.draggedElement.dataset.photoId);

      // Check if slot is already occupied
      const existingPhoto = slot.querySelector('.timeline-photo');
      
      if (existingPhoto) {
        // Swap positions if dragging from dropzone
        if (this.draggedFromDropzone) {
          const draggedSlot = this.draggedElement.parentElement;
          draggedSlot.appendChild(existingPhoto);
          this.updateUserOrder();
        } else {
          // Return dragged element to original position and don't allow drop
          return;
        }
      } else if (this.draggedFromDropzone) {
        // Moving within dropzone - update the empty slot text
        const draggedSlot = this.draggedElement.parentElement;
        draggedSlot.innerHTML = `<span>Drop here<br><small>Position ${parseInt(draggedSlot.dataset.slotIndex) + 1}</small></span>`;
        this.addDropListeners(draggedSlot);
      }

      // Place the dragged photo in the slot
      slot.innerHTML = '';
      slot.appendChild(this.draggedElement);
      
      this.updateUserOrder();
      this.checkIfComplete();
    });
  }

  updateUserOrder() {
    this.userOrder = [];
    const dropSlots = document.querySelectorAll('.drop-slot');
    
    dropSlots.forEach(slot => {
      const photo = slot.querySelector('.timeline-photo');
      if (photo) {
        const photoId = parseInt(photo.dataset.photoId);
        this.userOrder.push(this.selectedPhotos[photoId]);
      } else {
        this.userOrder.push(null);
      }
    });
  }

  checkIfComplete() {
    // Check if all slots are filled
    const filledSlots = this.userOrder.filter(photo => photo !== null);
    
    if (filledSlots.length === this.photosPerRound) {
      // All slots filled, check the order
      setTimeout(() => this.evaluateOrder(), 500);
    }
  }

  evaluateOrder() {
    const isCorrect = this.userOrder.every((photo, index) => {
      return photo && photo.src === this.correctOrder[index].src;
    });

    if (isCorrect) {
      this.correctRounds++;
      this.showRoundResult(true);
    } else {
      this.showRoundResult(false);
    }
  }

  showRoundResult(isCorrect) {
    // Visual feedback for all photos
    const dropSlots = document.querySelectorAll('.drop-slot');
    dropSlots.forEach((slot, index) => {
      const photo = slot.querySelector('.timeline-photo');
      if (photo) {
        const correctPhoto = this.correctOrder[index];
        const userPhoto = this.userOrder[index];
        
        if (userPhoto && userPhoto.src === correctPhoto.src) {
          slot.classList.add('correct-position');
        } else {
          slot.classList.add('incorrect-position');
        }
      }
    });

    // Show explanation
    const explanation = this.createOrderExplanation();
    this.showRoundExplanation(isCorrect, explanation);

    // Move to next round after delay
    setTimeout(() => {
      this.currentRound++;
      this.setupRound();
    }, 4000);
  }

  createOrderExplanation() {
    let explanation = "The correct chronological order:\n\n";
    
    this.correctOrder.forEach((photo, index) => {
      const date = new Date(photo.date);
      explanation += `${index + 1}. ${photo.moment} (${date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      })})\n`;
    });
    
    return explanation;
  }

  showRoundExplanation(isCorrect, explanation) {
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'timeline-explanation';
    explanationDiv.innerHTML = `
      <div class="explanation-content">
        <h4>${isCorrect ? '🎉 Perfect Timeline!' : '📅 Learning Opportunity!'}</h4>
        <p style="white-space: pre-line; text-align: left; margin: 15px 0;">${explanation}</p>
        <p><em>${isCorrect ? 'You really know our story! 💕' : 'Every moment is precious in our timeline! ✨'}</em></p>
      </div>
    `;
    
    const timelineContent = document.getElementById('timeline-content');
    if (timelineContent) {
      timelineContent.appendChild(explanationDiv);
      
      // Remove after next round starts
      setTimeout(() => {
        if (explanationDiv.parentElement) {
          explanationDiv.remove();
        }
      }, 4500);
    }
  }

  showFinalResults() {
    const percentage = Math.round((this.correctRounds / this.totalRounds) * 100);
    let resultMessage = '';
    let resultEmoji = '';
    
    if (percentage >= 100) {
      resultMessage = "Perfect! You have our timeline memorized! 💕";
      resultEmoji = "🏆";
    } else if (percentage >= 67) {
      resultMessage = "Excellent! You know our story really well! 😍";
      resultEmoji = "🥇";
    } else if (percentage >= 34) {
      resultMessage = "Good effort! Our timeline has many precious moments! 😊";
      resultEmoji = "🥈";
    } else {
      resultMessage = "Every moment in our timeline is special - keep exploring! 💫";
      resultEmoji = "📅";
    }

    this.showCompletionMessage(
      `${resultEmoji} Timeline Challenge Complete! ${resultEmoji}`,
      `You got ${this.correctRounds} out of ${this.totalRounds} rounds correct (${percentage}%)!\n\n${resultMessage}`
    );

    // Complete the game
    this.gameEngine.completeGame('timeline');
  }

  updateProgress() {
    const gameStats = document.querySelector('#timeline-screen .game-stats');
    if (gameStats) {
      gameStats.innerHTML = `
        <div>Round: <strong>${this.currentRound}/${this.totalRounds}</strong></div>
        <div>Correct: <strong>${this.correctRounds}/${this.currentRound - 1}</strong></div>
      `;
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  reset() {
    this.currentRound = 1;
    this.correctRounds = 0;
    this.userOrder = [];
    this.setupRound();
  }
}