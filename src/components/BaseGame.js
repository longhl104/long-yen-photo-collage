import { DOMUtils, AudioManager } from '../utils/helpers.js';
import { photos, memoryTokenMessages } from '../data/gameData.js';

export class BaseGame {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.audioManager = gameEngine.audioManager;
  }

  completeGame(gameType) {
    this.gameEngine.completeGame(gameType);
  }

  showScreen(screenId) {
    DOMUtils.showScreen(screenId);
  }

  playSound(soundId) {
    this.audioManager.playSound(soundId);
  }

  updateElement(id, property, value) {
    DOMUtils.updateElement(id, property, value);
  }
}

export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.completedGames = [];
    this.memoryTokens = 0;
    this.loveLevel = 0;
    this.unlockedContent = [];
    this.currentGame = null;
  }

  isGameUnlocked(gameIndex, games) {
    return gameIndex === 0 || this.completedGames.includes(games[gameIndex - 1]);
  }

  completeGame(gameType) {
    if (!this.completedGames.includes(gameType)) {
      this.completedGames.push(gameType);
      this.memoryTokens++;
      return true;
    }
    return false;
  }

  updateLoveLevel() {
    const percentage = (this.memoryTokens / 8) * 100;
    DOMUtils.updateElement('love-level', 'width', percentage + '%');
    DOMUtils.updateElement('love-percentage', 'textContent', Math.round(percentage));
    DOMUtils.updateElement('token-count', 'textContent', this.memoryTokens);
  }
}