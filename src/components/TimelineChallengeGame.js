import { BaseGame } from './BaseGame.js';
import { DOMUtils } from '../utils/helpers.js';

export class TimelineChallengeGame extends BaseGame
{
  constructor(gameEngine)
  {
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

  start()
  {
    DOMUtils.showScreen('timeline-screen');
    this.createFullscreenModal();
    this.setupRound();
  }

  setupRound()
  {
    if (this.currentRound > this.totalRounds)
    {
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

  selectPhotosForRound()
  {
    // Get a shuffled copy of all photos
    const availablePhotos = [...this.gameEngine.photos];
    this.shuffleArray(availablePhotos);

    // Select photos that have different dates for better challenge
    this.selectedPhotos = [];
    const usedYears = new Set();

    for (const photo of availablePhotos)
    {
      if (this.selectedPhotos.length >= this.photosPerRound) break;

      const photoYear = new Date(photo.date).getFullYear();

      // Try to get photos from different years if possible
      if (this.selectedPhotos.length < 2 || !usedYears.has(photoYear))
      {
        this.selectedPhotos.push(photo);
        usedYears.add(photoYear);
      }
    }

    // If we still need more photos, add any remaining ones
    while (this.selectedPhotos.length < this.photosPerRound && availablePhotos.length > 0)
    {
      const photo = availablePhotos.find(p => !this.selectedPhotos.includes(p));
      if (photo)
      {
        this.selectedPhotos.push(photo);
      } else
      {
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

  renderPhotos()
  {
    const photosContainer = document.getElementById('timeline-photos');
    if (!photosContainer) return;

    photosContainer.innerHTML = '';

    this.selectedPhotos.forEach((photo, index) =>
    {
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

      // Add fullscreen button
      const fullscreenBtn = document.createElement('button');
      fullscreenBtn.className = 'photo-fullscreen-btn';
      fullscreenBtn.innerHTML = '🔍';
      fullscreenBtn.title = 'View fullscreen';
      fullscreenBtn.style.cssText = `
        position: absolute;
        top: 5px;
        right: 5px;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        transition: all 0.2s ease;
      `;

      fullscreenBtn.addEventListener('click', (e) =>
      {
        e.preventDefault();
        e.stopPropagation();
        this.openFullscreen(photo);
      });

      fullscreenBtn.addEventListener('mouseenter', () =>
      {
        fullscreenBtn.style.background = '#fff';
        fullscreenBtn.style.transform = 'scale(1.1)';
      });

      fullscreenBtn.addEventListener('mouseleave', () =>
      {
        fullscreenBtn.style.background = 'rgba(255, 255, 255, 0.9)';
        fullscreenBtn.style.transform = 'scale(1)';
      });

      photoElement.appendChild(img);
      photoElement.appendChild(overlay);
      photoElement.appendChild(fullscreenBtn);

      // Add drag event listeners
      this.addDragListeners(photoElement);

      photosContainer.appendChild(photoElement);
    });
  }

  setupDropZone()
  {
    const dropZone = document.getElementById('timeline-dropzone');
    if (!dropZone) return;

    dropZone.innerHTML = '';

    for (let i = 0; i < this.photosPerRound; i++)
    {
      const slot = document.createElement('div');
      slot.className = 'drop-slot';
      slot.dataset.slotIndex = i;
      slot.innerHTML = `<span>Drop here<br><small>Position ${i + 1}</small></span>`;

      // Add drop event listeners
      this.addDropListeners(slot);

      dropZone.appendChild(slot);
    }
  }

  addDragListeners(element)
  {
    // Desktop drag and drop
    element.addEventListener('dragstart', (e) =>
    {
      this.draggedElement = element;
      this.draggedFromDropzone = element.parentElement.id === 'timeline-dropzone';
      element.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    element.addEventListener('dragend', (e) =>
    {
      element.classList.remove('dragging');
      this.draggedElement = null;
      this.draggedFromDropzone = false;
    });

    // Mobile touch support
    element.addEventListener('touchstart', (e) =>
    {
      this.touchStartHandler(e, element);
    });

    element.addEventListener('touchmove', (e) =>
    {
      this.touchMoveHandler(e, element);
    });

    element.addEventListener('touchend', (e) =>
    {
      this.touchEndHandler(e, element);
    });
  }

  addDropListeners(slot)
  {
    slot.addEventListener('dragover', (e) =>
    {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      slot.classList.add('drag-over');
    });

    slot.addEventListener('dragleave', (e) =>
    {
      slot.classList.remove('drag-over');
    });

    slot.addEventListener('drop', (e) =>
    {
      e.preventDefault();
      slot.classList.remove('drag-over');
      this.handleDrop(slot);
    });
  }

  handleDrop(slot)
  {
    if (!this.draggedElement) return;

    const slotIndex = parseInt(slot.dataset.slotIndex);
    const photoId = parseInt(this.draggedElement.dataset.photoId);

    // Check if slot is already occupied
    const existingPhoto = slot.querySelector('.timeline-photo');

    if (existingPhoto)
    {
      // Swap positions if dragging from dropzone
      if (this.draggedFromDropzone)
      {
        const draggedSlot = this.draggedElement.parentElement;
        draggedSlot.appendChild(existingPhoto);
        this.updateUserOrder();
      } else
      {
        // Return dragged element to original position and don't allow drop
        return;
      }
    } else if (this.draggedFromDropzone)
    {
      // Moving within dropzone - update the empty slot text
      const draggedSlot = this.draggedElement.parentElement;
      draggedSlot.innerHTML = `<span>Drop here<br><small>Position ${parseInt(draggedSlot.dataset.slotIndex) + 1}</small></span>`;
      this.addDropListeners(draggedSlot);
    }

    // Place the dragged photo in the slot
    slot.innerHTML = '';
    slot.appendChild(this.draggedElement);

    // Ensure fullscreen button still works after moving
    this.ensureFullscreenButton(this.draggedElement);

    this.updateUserOrder();
    this.checkIfComplete();
  }

  updateUserOrder()
  {
    this.userOrder = [];
    const dropSlots = document.querySelectorAll('.drop-slot');

    dropSlots.forEach(slot =>
    {
      const photo = slot.querySelector('.timeline-photo');
      if (photo)
      {
        const photoId = parseInt(photo.dataset.photoId);
        this.userOrder.push(this.selectedPhotos[photoId]);
      } else
      {
        this.userOrder.push(null);
      }
    });
  }

  checkIfComplete()
  {
    // Check if all slots are filled
    const filledSlots = this.userOrder.filter(photo => photo !== null);

    if (filledSlots.length === this.photosPerRound)
    {
      // All slots filled, check the order
      setTimeout(() => this.evaluateOrder(), 500);
    }
  }

  evaluateOrder()
  {
    const isCorrect = this.userOrder.every((photo, index) =>
    {
      return photo && photo.src === this.correctOrder[index].src;
    });

    if (isCorrect)
    {
      this.correctRounds++;
      this.showRoundResult(true);
    } else
    {
      this.showRoundResult(false);
    }
  }

  showRoundResult(isCorrect)
  {
    // Visual feedback for all photos
    const dropSlots = document.querySelectorAll('.drop-slot');
    dropSlots.forEach((slot, index) =>
    {
      const photo = slot.querySelector('.timeline-photo');
      if (photo)
      {
        const correctPhoto = this.correctOrder[index];
        const userPhoto = this.userOrder[index];

        if (userPhoto && userPhoto.src === correctPhoto.src)
        {
          slot.classList.add('correct-position');
        } else
        {
          slot.classList.add('incorrect-position');
        }
      }
    });

    // Show explanation
    const explanation = this.createOrderExplanation();
    this.showRoundExplanation(isCorrect, explanation);

    // Move to next round after delay
    setTimeout(() =>
    {
      this.currentRound++;
      this.setupRound();
    }, 4000);
  }

  createOrderExplanation()
  {
    let explanation = "The correct chronological order:\n\n";

    this.correctOrder.forEach((photo, index) =>
    {
      const date = new Date(photo.date);
      explanation += `${index + 1}. ${photo.moment} (${date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })})\n`;
    });

    return explanation;
  }

  showRoundExplanation(isCorrect, explanation)
  {
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
    if (timelineContent)
    {
      timelineContent.appendChild(explanationDiv);

      // Remove after next round starts
      setTimeout(() =>
      {
        if (explanationDiv.parentElement)
        {
          explanationDiv.remove();
        }
      }, 4500);
    }
  }

  showFinalResults()
  {
    const percentage = Math.round((this.correctRounds / this.totalRounds) * 100);
    let resultMessage = '';
    let resultEmoji = '';

    if (percentage >= 100)
    {
      resultMessage = "Perfect! You have our timeline memorized! 💕";
      resultEmoji = "🏆";
    } else if (percentage >= 67)
    {
      resultMessage = "Excellent! You know our story really well! 😍";
      resultEmoji = "🥇";
    } else if (percentage >= 34)
    {
      resultMessage = "Good effort! Our timeline has many precious moments! 😊";
      resultEmoji = "🥈";
    } else
    {
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

  updateProgress()
  {
    const gameStats = document.querySelector('#timeline-screen .game-stats');
    if (gameStats)
    {
      gameStats.innerHTML = `
        <div>Round: <strong>${this.currentRound}/${this.totalRounds}</strong></div>
        <div>Correct: <strong>${this.correctRounds}/${this.currentRound - 1}</strong></div>
      `;
    }
  }

  formatDate(dateString)
  {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  }

  shuffleArray(array)
  {
    for (let i = array.length - 1; i > 0; i--)
    {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  createFullscreenModal()
  {
    // Remove existing modal if it exists
    const existingModal = document.getElementById('photo-fullscreen-modal');
    if (existingModal)
    {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'photo-fullscreen-modal';
    modal.className = 'photo-fullscreen-modal';
    modal.innerHTML = `
      <div class="photo-fullscreen-content">
        <button class="photo-fullscreen-close" aria-label="Close fullscreen">&times;</button>
        <img class="photo-fullscreen-image" alt="Photo in fullscreen">
        <div class="photo-fullscreen-info">
          <h3 class="photo-fullscreen-title"></h3>
          <p class="photo-fullscreen-date"></p>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    const closeBtn = modal.querySelector('.photo-fullscreen-close');
    const modalContent = modal.querySelector('.photo-fullscreen-content');

    closeBtn.addEventListener('click', () => this.closeFullscreen());

    modal.addEventListener('click', (e) =>
    {
      if (e.target === modal)
      {
        this.closeFullscreen();
      }
    });

    // Store the keydown handler so we can remove it later if needed
    this.escKeyHandler = (e) =>
    {
      if (e.key === 'Escape' && modal.classList.contains('active'))
      {
        e.preventDefault();
        e.stopPropagation();
        this.closeFullscreen();
      }
    };

    document.addEventListener('keydown', this.escKeyHandler);
  }

  openFullscreen(photo)
  {
    const modal = document.getElementById('photo-fullscreen-modal');
    if (!modal) return;

    const img = modal.querySelector('.photo-fullscreen-image');
    const title = modal.querySelector('.photo-fullscreen-title');
    const date = modal.querySelector('.photo-fullscreen-date');

    img.src = photo.src;
    img.alt = photo.moment || 'Memory';
    title.textContent = photo.moment || 'Our Memory';

    const formattedDate = new Date(photo.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    date.textContent = formattedDate;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeFullscreen()
  {
    const modal = document.getElementById('photo-fullscreen-modal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  touchStartHandler(e, element)
  {
    e.preventDefault();
    this.draggedElement = element;
    this.draggedFromDropzone = element.parentElement.id === 'timeline-dropzone';
    this.touchStartPosition = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };

    element.classList.add('dragging');
    element.style.zIndex = '1000';
  }

  touchMoveHandler(e, element)
  {
    if (!this.draggedElement) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = element.getBoundingClientRect();

    // Move the element
    element.style.position = 'fixed';
    element.style.left = (touch.clientX - rect.width / 2) + 'px';
    element.style.top = (touch.clientY - rect.height / 2) + 'px';
    element.style.pointerEvents = 'none';

    // Find drop target
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropSlot = elementBelow?.closest('.drop-slot');

    // Remove previous hover effects
    document.querySelectorAll('.drop-slot').forEach(slot =>
    {
      slot.classList.remove('drag-over');
    });

    // Add hover effect to current target
    if (dropSlot)
    {
      dropSlot.classList.add('drag-over');
    }
  }

  touchEndHandler(e, element)
  {
    if (!this.draggedElement) return;
    e.preventDefault();

    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropSlot = elementBelow?.closest('.drop-slot');

    // Reset element styling
    element.style.position = '';
    element.style.left = '';
    element.style.top = '';
    element.style.zIndex = '';
    element.style.pointerEvents = '';
    element.classList.remove('dragging');

    // Remove all hover effects
    document.querySelectorAll('.drop-slot').forEach(slot =>
    {
      slot.classList.remove('drag-over');
    });

    // Handle drop if valid target
    if (dropSlot)
    {
      this.handleDrop(dropSlot);
    }

    // Reset state
    this.draggedElement = null;
    this.draggedFromDropzone = false;
    this.touchStartPosition = null;
  }

  ensureFullscreenButton(photoElement)
  {
    // Check if fullscreen button already exists
    let fullscreenBtn = photoElement.querySelector('.photo-fullscreen-btn');
    if (fullscreenBtn) return;

    // Get the photo data
    const photoId = parseInt(photoElement.dataset.photoId);
    const photo = this.selectedPhotos[photoId];
    if (!photo) return;

    // Create new fullscreen button
    fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'photo-fullscreen-btn';
    fullscreenBtn.innerHTML = '🔍';
    fullscreenBtn.title = 'View fullscreen';
    fullscreenBtn.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      width: 25px;
      height: 25px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: all 0.2s ease;
    `;

    fullscreenBtn.addEventListener('click', (e) =>
    {
      e.preventDefault();
      e.stopPropagation();
      this.openFullscreen(photo);
    });

    fullscreenBtn.addEventListener('mouseenter', () =>
    {
      fullscreenBtn.style.background = '#fff';
      fullscreenBtn.style.transform = 'scale(1.1)';
    });

    fullscreenBtn.addEventListener('mouseleave', () =>
    {
      fullscreenBtn.style.background = 'rgba(255, 255, 255, 0.9)';
      fullscreenBtn.style.transform = 'scale(1)';
    });

    photoElement.appendChild(fullscreenBtn);
  }

  showCompletionMessage(title, message)
  {
    // Create completion modal
    const modal = document.createElement('div');
    modal.className = 'completion-modal';
    modal.innerHTML = `
      <div class="completion-content">
        <h3>${title}</h3>
        <p style="white-space: pre-line;">${message}</p>
        <button class="btn-primary" onclick="this.parentElement.parentElement.remove(); window.gameEngine.router.goToGames();">Continue</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Auto-remove after delay
    setTimeout(() =>
    {
      if (modal.parentElement)
      {
        modal.remove();
        this.gameEngine.router.goToGames();
      }
    }, 8000);
  }

  reset()
  {
    this.currentRound = 1;
    this.correctRounds = 0;
    this.userOrder = [];
    this.closeFullscreen();

    // Clean up event listener
    if (this.escKeyHandler)
    {
      document.removeEventListener('keydown', this.escKeyHandler);
    }

    this.setupRound();
  }
}