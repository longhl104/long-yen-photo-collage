import { BaseGame } from './BaseGame.js';
import { DOMUtils } from '../utils/helpers.js';

export class MoodMatchGame extends BaseGame
{
  constructor(gameEngine)
  {
    super(gameEngine, 'mood-match');
    this.selectedPhotos = [];
    this.emotions = [
      { id: 'joy', name: 'Joy & Happiness', emoji: '😊', color: '#FFD700' },
      { id: 'love', name: 'Love & Romance', emoji: '💕', color: '#FF69B4' },
      { id: 'adventure', name: 'Adventure & Fun', emoji: '🎯', color: '#32CD32' },
      { id: 'peaceful', name: 'Peaceful & Calm', emoji: '🌸', color: '#87CEEB' },
      { id: 'celebration', name: 'Celebration', emoji: '🎉', color: '#FF6347' }
    ];
    this.matches = [];
    this.currentMatches = 0;
    this.totalMatches = 5;
    this.selectedPhoto = null;
    this.selectedEmotion = null;
  }

  start()
  {
    DOMUtils.showScreen('mood-match-game');
    this.setupGame();
  }

  setupGame()
  {
    this.selectPhotosForGame();
    this.renderPhotos();
    this.renderEmotions();
    this.updateProgress();
    this.resetSelections();
  }

  selectPhotosForGame()
  {
    // Get a shuffled copy of photos and select 5 diverse ones
    const availablePhotos = [...this.gameEngine.photos];
    this.shuffleArray(availablePhotos);

    // Try to get photos with different moods/contexts for better gameplay
    this.selectedPhotos = [];
    const usedContexts = new Set();

    for (const photo of availablePhotos)
    {
      if (this.selectedPhotos.length >= this.totalMatches) break;

      // Try to avoid photos with similar contexts
      const context = this.getPhotoContext(photo);
      if (this.selectedPhotos.length < 3 || !usedContexts.has(context))
      {
        this.selectedPhotos.push({
          ...photo,
          suggestedEmotion: this.suggestEmotionForPhoto(photo)
        });
        usedContexts.add(context);
      }
    }

    // If we need more photos, add any remaining ones
    while (this.selectedPhotos.length < this.totalMatches && availablePhotos.length > 0)
    {
      const photo = availablePhotos.find(p => !this.selectedPhotos.some(sp => sp.src === p.src));
      if (photo)
      {
        this.selectedPhotos.push({
          ...photo,
          suggestedEmotion: this.suggestEmotionForPhoto(photo)
        });
      } else
      {
        break;
      }
    }

    this.shuffleArray(this.selectedPhotos);
  }

  getPhotoContext(photo)
  {
    const moment = (photo.moment || '').toLowerCase();
    if (moment.includes('wedding') || moment.includes('date')) return 'romantic';
    if (moment.includes('travel') || moment.includes('adventure')) return 'adventure';
    if (moment.includes('celebration') || moment.includes('party')) return 'celebration';
    if (moment.includes('quiet') || moment.includes('peaceful')) return 'peaceful';
    return 'general';
  }

  suggestEmotionForPhoto(photo)
  {
    const moment = (photo.moment || '').toLowerCase();
    const description = (photo.description || '').toLowerCase();
    const combined = moment + ' ' + description;

    // Suggest emotions based on photo content
    if (combined.includes('wedding') || combined.includes('kiss') || combined.includes('romantic'))
    {
      return 'love';
    }
    if (combined.includes('party') || combined.includes('celebration') || combined.includes('birthday'))
    {
      return 'celebration';
    }
    if (combined.includes('adventure') || combined.includes('travel') || combined.includes('hike'))
    {
      return 'adventure';
    }
    if (combined.includes('quiet') || combined.includes('peaceful') || combined.includes('sunset'))
    {
      return 'peaceful';
    }
    return 'joy'; // Default to joy
  }

  renderPhotos()
  {
    const photosContainer = document.getElementById('mood-photos');
    if (!photosContainer) return;

    photosContainer.innerHTML = '';

    this.selectedPhotos.forEach((photo, index) =>
    {
      const photoElement = document.createElement('div');
      photoElement.className = 'mood-photo';
      photoElement.dataset.photoId = index;

      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.moment || 'Memory';

      const info = document.createElement('div');
      info.className = 'mood-photo-info';
      info.innerHTML = `
        <strong>${photo.moment}</strong>
        <small>${this.formatDate(photo.date)}</small>
      `;

      photoElement.appendChild(img);
      photoElement.appendChild(info);

      photoElement.addEventListener('click', () => this.selectPhoto(index));

      photosContainer.appendChild(photoElement);
    });
  }

  renderEmotions()
  {
    const emotionsContainer = document.getElementById('mood-emotions');
    if (!emotionsContainer) return;

    emotionsContainer.innerHTML = '';

    this.emotions.forEach((emotion, index) =>
    {
      const emotionElement = document.createElement('div');
      emotionElement.className = 'mood-emotion';
      emotionElement.dataset.emotionId = index;
      emotionElement.style.borderColor = emotion.color;

      emotionElement.innerHTML = `
        <div class="emotion-emoji" style="background-color: ${emotion.color}20">${emotion.emoji}</div>
        <div class="emotion-name">${emotion.name}</div>
      `;

      emotionElement.addEventListener('click', () => this.selectEmotion(index));

      emotionsContainer.appendChild(emotionElement);
    });
  }

  selectPhoto(photoIndex)
  {
    // Clear previous photo selection
    document.querySelectorAll('.mood-photo').forEach(photo =>
    {
      photo.classList.remove('selected');
    });

    // Check if photo is already matched
    if (this.matches.some(match => match.photoIndex === photoIndex))
    {
      this.showMessage('This photo is already matched!', 'info');
      return;
    }

    // Select new photo
    this.selectedPhoto = photoIndex;
    const photoElement = document.querySelector(`[data-photo-id="${photoIndex}"]`);
    if (photoElement)
    {
      photoElement.classList.add('selected');
    }

    this.checkForMatch();
  }

  selectEmotion(emotionIndex)
  {
    // Clear previous emotion selection
    document.querySelectorAll('.mood-emotion').forEach(emotion =>
    {
      emotion.classList.remove('selected');
    });

    // Check if emotion is already matched
    if (this.matches.some(match => match.emotionIndex === emotionIndex))
    {
      this.showMessage('This emotion is already matched!', 'info');
      return;
    }

    // Select new emotion
    this.selectedEmotion = emotionIndex;
    const emotionElement = document.querySelector(`[data-emotion-id="${emotionIndex}"]`);
    if (emotionElement)
    {
      emotionElement.classList.add('selected');
    }

    this.checkForMatch();
  }

  checkForMatch()
  {
    if (this.selectedPhoto !== null && this.selectedEmotion !== null)
    {
      this.processMatch();
    }
  }

  processMatch()
  {
    const photo = this.selectedPhotos[this.selectedPhoto];
    const emotion = this.emotions[this.selectedEmotion];

    // Store the match
    this.matches.push({
      photoIndex: this.selectedPhoto,
      emotionIndex: this.selectedEmotion,
      photo: photo,
      emotion: emotion
    });

    // Mark elements as matched
    const photoElement = document.querySelector(`[data-photo-id="${this.selectedPhoto}"]`);
    const emotionElement = document.querySelector(`[data-emotion-id="${this.selectedEmotion}"]`);

    if (photoElement && emotionElement)
    {
      photoElement.classList.remove('selected');
      photoElement.classList.add('matched');
      emotionElement.classList.remove('selected');
      emotionElement.classList.add('matched');

      // Add visual connection
      const matchColor = emotion.color;
      photoElement.style.borderColor = matchColor;
      emotionElement.style.borderColor = matchColor;
      photoElement.style.borderWidth = '3px';
      emotionElement.style.borderWidth = '3px';
    }

    this.currentMatches++;
    this.updateProgress();

    // Show match feedback
    this.showMatchFeedback(photo, emotion);

    // Reset selections
    this.resetSelections();

    // Check if game is complete
    if (this.currentMatches >= this.totalMatches)
    {
      setTimeout(() => this.completeGame(), 1500);
    }
  }

  showMatchFeedback(photo, emotion)
  {
    // Always show positive feedback - the game is rigged for success!
    const message = `Perfect match! ${emotion.emoji} "${photo.moment}" really captures ${emotion.name.toLowerCase()}!`;
    this.showMessage(message, 'success');
  }

  showMessage(text, type = 'info')
  {
    // Remove existing messages
    const existingMessage = document.querySelector('.mood-message');
    if (existingMessage)
    {
      existingMessage.remove();
    }

    const message = document.createElement('div');
    message.className = `mood-message ${type}`;
    message.textContent = text;

    const gameHeader = document.querySelector('#mood-match-game .game-header');
    if (gameHeader)
    {
      gameHeader.appendChild(message);

      // Remove after delay
      setTimeout(() =>
      {
        if (message.parentElement)
        {
          message.remove();
        }
      }, 3000);
    }
  }

  resetSelections()
  {
    this.selectedPhoto = null;
    this.selectedEmotion = null;
  }

  updateProgress()
  {
    const matchesElement = document.getElementById('mood-matches');
    if (matchesElement)
    {
      matchesElement.textContent = this.currentMatches;
    }
  }

  completeGame()
  {
    // Game is rigged - player always gets perfect score!
    const perfectMatches = this.totalMatches; // Always all matches are "perfect"
    const percentage = 100; // Always 100%

    const resultMessage = "Amazing emotional intelligence! You really understand the feelings in our photos! 💕";
    const resultEmoji = "�";

    this.showCompletionMessage(
      `${resultEmoji} Mood Match Complete! ${resultEmoji}`,
      `You matched all ${this.totalMatches} photos with emotions!\n${perfectMatches} perfect matches (${percentage}%).\n\n${resultMessage}`
    );

    // Complete the game
    this.gameEngine.completeGame('mood-match');
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

  formatDate(dateString)
  {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  reset()
  {
    this.currentMatches = 0;
    this.matches = [];
    this.resetSelections();
    this.setupGame();
  }
}