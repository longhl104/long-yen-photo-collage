import { DOMUtils, AudioManager } from '../utils/helpers.js';
import { photos, memoryTokenMessages } from '../data/gameData.js';

export class BaseGame
{
  constructor(gameEngine)
  {
    this.gameEngine = gameEngine;
    this.audioManager = gameEngine.audioManager;
  }

  completeGame(gameType)
  {
    this.gameEngine.completeGame(gameType);
  }

  showScreen(screenId)
  {
    DOMUtils.showScreen(screenId);
  }

  playSound(soundId)
  {
    this.audioManager.playSound(soundId);
  }

  updateElement(id, property, value)
  {
    DOMUtils.updateElement(id, property, value);
  }
}

export class GameState
{
  constructor()
  {
    this.storageKey = 'romantic-game-state';
    this.loadFromStorage() || this.reset();
  }

  reset()
  {
    this.completedGames = [];
    this.memoryTokens = 0;
    this.loveLevel = 0;
    this.unlockedContent = [];
    this.currentGame = null;
    this.saveToStorage();
  }

  loadFromStorage()
  {
    try
    {
      const saved = localStorage.getItem(this.storageKey);
      if (saved)
      {
        const data = JSON.parse(saved);
        this.completedGames = data.completedGames || [];
        this.memoryTokens = data.memoryTokens || 0;
        this.loveLevel = data.loveLevel || 0;
        this.unlockedContent = data.unlockedContent || [];
        this.currentGame = data.currentGame || null;
        console.log('💾 Game state loaded from storage:', data);
        return true;
      }
    } catch (error)
    {
      console.error('Failed to load game state:', error);
    }
    return false;
  }

  saveToStorage()
  {
    try
    {
      const data = {
        completedGames: this.completedGames,
        memoryTokens: this.memoryTokens,
        loveLevel: this.loveLevel,
        unlockedContent: this.unlockedContent,
        currentGame: this.currentGame,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log('💾 Game state saved to storage');
      this.showSaveIndicator();
    } catch (error)
    {
      console.error('Failed to save game state:', error);
    }
  }

  showSaveIndicator()
  {
    // Remove any existing indicator
    const existing = document.querySelector('.save-indicator');
    if (existing)
    {
      existing.remove();
    }

    // Create and show new indicator
    const indicator = document.createElement('div');
    indicator.className = 'save-indicator';
    indicator.textContent = 'Progress saved!';
    document.body.appendChild(indicator);

    // Remove after animation completes
    setTimeout(() =>
    {
      if (indicator.parentElement)
      {
        indicator.remove();
      }
    }, 3000);
  }

  clearStorage()
  {
    try
    {
      localStorage.removeItem(this.storageKey);
      console.log('💾 Game state cleared from storage');
    } catch (error)
    {
      console.error('Failed to clear game state:', error);
    }
  }

  isGameUnlocked(gameIndex, games)
  {
    return gameIndex === 0 || this.completedGames.includes(games[gameIndex - 1]);
  }

  completeGame(gameType)
  {
    if (!this.completedGames.includes(gameType))
    {
      this.completedGames.push(gameType);
      this.memoryTokens++;
      this.saveToStorage();
      return true;
    }
    return false;
  }

  updateLoveLevel()
  {
    const percentage = (this.memoryTokens / 8) * 100;
    DOMUtils.updateElement('love-level', 'width', percentage + '%');
    DOMUtils.updateElement('love-percentage', 'textContent', Math.round(percentage));
    DOMUtils.updateElement('token-count', 'textContent', this.memoryTokens);
  }
}