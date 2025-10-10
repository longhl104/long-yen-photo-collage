import { BaseGame } from './BaseGame.js';
import { DOMUtils } from '../utils/helpers.js';

export class PhotoScavengerHuntGame extends BaseGame {
  constructor(gameEngine) {
    super(gameEngine, 'scavenger-hunt');
    this.selectedPhotos = [];
    this.currentTaskIndex = 0;
    this.foundItems = [];
    this.totalTasks = 5;
    this.isSearching = false;
    this.currentHotspots = [];
    
    // Scavenger hunt tasks - things to find in photos
    this.scavengerTasks = [
      {
        id: 'smile',
        question: 'Find a genuine smile',
        description: 'Look for someone with a beautiful, heartfelt smile',
        keywords: ['smile', 'happy', 'joy', 'laugh', 'grin'],
        emoji: '😊'
      },
      {
        id: 'hands',
        question: 'Find hands holding something',
        description: 'Spot hands holding an object, food, or another hand',
        keywords: ['hand', 'hold', 'grab', 'touch', 'fingers'],
        emoji: '👋'
      },
      {
        id: 'nature',
        question: 'Find something from nature',
        description: 'Look for flowers, trees, water, or natural elements',
        keywords: ['flower', 'tree', 'nature', 'outdoor', 'plant', 'sky', 'water'],
        emoji: '🌸'
      },
      {
        id: 'food',
        question: 'Find food or drinks',
        description: 'Spot any food, beverages, or dining items',
        keywords: ['food', 'eat', 'drink', 'dinner', 'lunch', 'cake', 'meal'],
        emoji: '🍽️'
      },
      {
        id: 'background',
        question: 'Find an interesting background detail',
        description: 'Look for something unique or special in the background',
        keywords: ['background', 'behind', 'detail', 'building', 'room', 'decoration'],
        emoji: '🏞️'
      },
      {
        id: 'clothing',
        question: 'Find a special piece of clothing or accessory',
        description: 'Spot interesting clothing, jewelry, or accessories',
        keywords: ['dress', 'shirt', 'jewelry', 'hat', 'wear', 'clothing'],
        emoji: '👗'
      },
      {
        id: 'emotion',
        question: 'Find an expression of love or joy',
        description: 'Look for moments showing happiness, love, or celebration',
        keywords: ['love', 'happy', 'celebrate', 'kiss', 'hug', 'joy'],
        emoji: '💕'
      },
      {
        id: 'action',
        question: 'Find someone doing an activity',
        description: 'Spot someone in the middle of doing something interesting',
        keywords: ['doing', 'activity', 'action', 'playing', 'moving'],
        emoji: '🎯'
      }
    ];
  }

  start() {
    DOMUtils.showScreen('scavenger-game');
    this.setupGame();
  }

  setupGame() {
    this.selectPhotosAndTasks();
    this.foundItems = [];
    this.currentTaskIndex = 0;
    this.setupCurrentTask();
    this.updateProgress();
  }

  selectPhotosAndTasks() {
    // Get all photos and shuffle tasks
    const availablePhotos = [...this.gameEngine.photos];
    const shuffledTasks = [...this.scavengerTasks];
    this.shuffleArray(shuffledTasks);
    
    // Select 5 tasks for this game
    this.selectedTasks = shuffledTasks.slice(0, this.totalTasks);
    
    // For each task, try to find a good matching photo
    this.selectedPhotos = [];
    
    this.selectedTasks.forEach(task => {
      // Try to find a photo that matches the task keywords
      let bestPhoto = this.findBestPhotoForTask(task, availablePhotos);
      
      // If no good match found, use a random photo
      if (!bestPhoto && availablePhotos.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePhotos.length);
        bestPhoto = availablePhotos[randomIndex];
      }
      
      if (bestPhoto) {
        this.selectedPhotos.push(bestPhoto);
        // Remove from available to avoid duplicates
        const index = availablePhotos.indexOf(bestPhoto);
        if (index > -1) {
          availablePhotos.splice(index, 1);
        }
      }
    });
    
    // If we don't have enough photos, fill with random ones
    while (this.selectedPhotos.length < this.totalTasks && availablePhotos.length > 0) {
      const randomPhoto = availablePhotos.pop();
      this.selectedPhotos.push(randomPhoto);
    }
  }

  findBestPhotoForTask(task, photos) {
    // Score photos based on how well they match the task
    let bestPhoto = null;
    let bestScore = 0;
    
    photos.forEach(photo => {
      let score = 0;
      const photoText = `${photo.moment} ${photo.description || ''}`.toLowerCase();
      
      // Check for keyword matches
      task.keywords.forEach(keyword => {
        if (photoText.includes(keyword)) {
          score += 2;
        }
      });
      
      // Bonus for longer descriptions (more detail to find things in)
      if (photo.description && photo.description.length > 20) {
        score += 1;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestPhoto = photo;
      }
    });
    
    return bestScore > 0 ? bestPhoto : null;
  }

  setupCurrentTask() {
    if (this.currentTaskIndex >= this.selectedTasks.length) {
      this.completeGame();
      return;
    }

    const task = this.selectedTasks[this.currentTaskIndex];
    const photo = this.selectedPhotos[this.currentTaskIndex];
    
    this.displayTask(task);
    this.displayPhoto(photo);
    this.createHotspots(photo);
  }

  displayTask(task) {
    const taskContainer = document.getElementById('scavenger-task');
    if (!taskContainer) return;

    taskContainer.innerHTML = `
      <div class="scavenger-task-card">
        <div class="task-emoji">${task.emoji}</div>
        <h3 class="task-question">${task.question}</h3>
        <p class="task-description">${task.description}</p>
        <div class="task-instruction">Click on the photo when you find it!</div>
      </div>
    `;
  }

  displayPhoto(photo) {
    const photoElement = document.getElementById('scavenger-photo');
    const container = document.getElementById('scavenger-photo-container');
    
    if (!photoElement || !container) return;

    photoElement.src = photo.src;
    photoElement.alt = `Find: ${this.selectedTasks[this.currentTaskIndex].question}`;
    
    // Add photo info
    let infoElement = container.querySelector('.scavenger-photo-info');
    if (!infoElement) {
      infoElement = document.createElement('div');
      infoElement.className = 'scavenger-photo-info';
      container.appendChild(infoElement);
    }
    
    infoElement.innerHTML = `
      <h4>${photo.moment}</h4>
      <p>${this.formatDate(photo.date)}</p>
    `;
  }

  createHotspots(photo) {
    // Remove existing hotspots
    const existingHotspots = document.querySelectorAll('.scavenger-hotspot');
    existingHotspots.forEach(spot => spot.remove());
    
    // Create 3-5 clickable areas on the photo
    const numHotspots = Math.floor(Math.random() * 3) + 3; // 3-5 hotspots
    const container = document.getElementById('scavenger-photo-container');
    if (!container) return;
    
    this.currentHotspots = [];
    
    for (let i = 0; i < numHotspots; i++) {
      const hotspot = document.createElement('div');
      hotspot.className = 'scavenger-hotspot';
      
      // Random position
      const x = Math.random() * 80 + 10; // 10-90%
      const y = Math.random() * 80 + 10; // 10-90%
      
      hotspot.style.left = `${x}%`;
      hotspot.style.top = `${y}%`;
      
      // Only the first hotspot is the "correct" one
      const isCorrect = i === 0;
      hotspot.dataset.correct = isCorrect;
      
      hotspot.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleHotspotClick(hotspot, isCorrect);
      });
      
      container.appendChild(hotspot);
      this.currentHotspots.push(hotspot);
    }
  }

  handleHotspotClick(hotspot, isCorrect) {
    if (this.isSearching) return;
    
    this.isSearching = true;
    
    // Remove all hotspots
    this.currentHotspots.forEach(spot => {
      spot.style.pointerEvents = 'none';
    });
    
    if (isCorrect) {
      // Correct find!
      hotspot.classList.add('found-correct');
      this.showSuccess();
    } else {
      // Wrong spot, but still encouraging
      hotspot.classList.add('found-incorrect');
      this.showEncouragement();
    }
  }

  showSuccess() {
    const task = this.selectedTasks[this.currentTaskIndex];
    const photo = this.selectedPhotos[this.currentTaskIndex];
    
    // Add to found items
    this.foundItems.push({
      task: task,
      photo: photo
    });
    
    // Show success message
    this.showFeedback(
      `Great find! ${task.emoji}`,
      `You found "${task.question}" in "${photo.moment}"! Your attention to detail is amazing!`,
      'success'
    );
    
    this.updateProgress();
    
    // Move to next task
    setTimeout(() => {
      this.currentTaskIndex++;
      this.isSearching = false;
      this.setupCurrentTask();
    }, 2500);
  }

  showEncouragement() {
    const task = this.selectedTasks[this.currentTaskIndex];
    
    // Still count as found - we're being encouraging
    const photo = this.selectedPhotos[this.currentTaskIndex];
    this.foundItems.push({
      task: task,
      photo: photo
    });
    
    // Show encouraging message
    this.showFeedback(
      `Nice try! ${task.emoji}`,
      `You're exploring the photo carefully! That's the spirit of a true detective! ✨`,
      'encouraging'
    );
    
    this.updateProgress();
    
    // Move to next task
    setTimeout(() => {
      this.currentTaskIndex++;
      this.isSearching = false;
      this.setupCurrentTask();
    }, 2500);
  }

  showFeedback(title, message, type) {
    // Create feedback modal
    const feedback = document.createElement('div');
    feedback.className = `scavenger-feedback ${type}`;
    feedback.innerHTML = `
      <div class="feedback-content">
        <h3>${title}</h3>
        <p>${message}</p>
      </div>
    `;
    
    document.body.appendChild(feedback);
    
    // Show with animation
    setTimeout(() => {
      feedback.classList.add('active');
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
      feedback.classList.remove('active');
      setTimeout(() => {
        if (feedback.parentElement) {
          feedback.remove();
        }
      }, 500);
    }, 2000);
  }

  updateProgress() {
    const foundElement = document.getElementById('items-found');
    if (foundElement) {
      foundElement.textContent = this.foundItems.length;
    }
  }

  completeGame() {
    // Game is rigged - player always finds all items
    const resultMessage = "Outstanding detective work! You have an incredible eye for detail! Every photo holds so many special moments and memories, and you found them all! 🔍✨";
    const resultEmoji = "🏆";

    // Show all found items
    const itemsList = this.foundItems.map((item, index) => 
      `${index + 1}. ${item.task.emoji} "${item.task.question}" in "${item.photo.moment}"`
    ).join('\n');

    this.showCompletionMessage(
      `${resultEmoji} Scavenger Hunt Complete! ${resultEmoji}`,
      `You found all ${this.totalTasks} items!\n\nYour discoveries:\n${itemsList}\n\n${resultMessage}`
    );

    // Complete the game
    this.gameEngine.completeGame('scavenger-hunt');
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
    this.currentTaskIndex = 0;
    this.foundItems = [];
    this.isSearching = false;
    this.setupGame();
  }
}