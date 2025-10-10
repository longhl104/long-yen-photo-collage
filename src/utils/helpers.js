// Audio utility functions
export class AudioManager {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
  }

  init() {
    this.backgroundMusic = document.getElementById('background-music');
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = 0.3;
    }

    // Start background music when user interacts with the page
    document.addEventListener('click', () => {
      if (this.backgroundMusic && this.backgroundMusic.paused) {
        this.backgroundMusic.play().catch(e => console.log('Audio play failed:', e));
      }
    }, { once: true });
  }

  playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log('Sound play failed:', e));
    }
  }
}

// DOM utility functions
export class DOMUtils {
  static showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  static hideScreen(screenId) {
    document.getElementById(screenId).classList.remove('active');
  }

  static createElement(tag, className = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  static updateElement(id, property, value) {
    const element = document.getElementById(id);
    if (element) {
      if (property === 'textContent') {
        element.textContent = value;
      } else if (property === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element.style[property] = value;
      }
    }
  }
}

// Game utility functions
export class GameUtils {
  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static getRandomElements(array, count) {
    const shuffled = this.shuffleArray(array);
    return shuffled.slice(0, count);
  }

  static generateDateOptions(correctDate) {
    const options = [correctDate];
    const date = new Date(correctDate);

    // Generate 3 random wrong dates
    for (let i = 0; i < 3; i++) {
      const wrongDate = new Date(date);
      wrongDate.setMonth(wrongDate.getMonth() + Math.floor(Math.random() * 24) - 12);
      options.push(wrongDate.toISOString().split('T')[0]);
    }

    return this.shuffleArray(options);
  }

  static formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }
}