import { BaseGame } from './BaseGame.js';
import { GameUtils, DOMUtils } from '../utils/helpers.js';
import { photos } from '../data/gameData.js';

export class MemoryMatchGame extends BaseGame
{
  constructor(gameEngine)
  {
    super(gameEngine);
    this.memoryGame = null;
  }

  start()
  {
    this.showScreen('memory-match-game');
    this.init();
  }

  init()
  {
    const grid = document.getElementById('memory-grid');
    let shuffledPhotos = [...photos];
    shuffledPhotos = GameUtils.shuffleArray(shuffledPhotos);
    const selectedPhotos = shuffledPhotos.slice(0, 6);
    let gamePhotos = [...selectedPhotos, ...selectedPhotos];
    gamePhotos = GameUtils.shuffleArray(gamePhotos);

    this.memoryGame = {
      cards: [],
      flippedCards: [],
      matches: 0,
      moves: 0
    };

    grid.innerHTML = '';

    gamePhotos.forEach((photo, index) =>
    {
      const card = this.createMemoryCard(photo, index);
      grid.appendChild(card);
      this.memoryGame.cards.push(card);
    });

    this.updateElement('matches-count', 'textContent', '0');
    this.updateElement('moves-count', 'textContent', '0');
  }

  createMemoryCard(photo, index)
  {
    const card = DOMUtils.createElement('div', 'memory-card');
    card.dataset.photo = photo.src;
    card.innerHTML = `
      <div class="card-front">
        <img src="assets/images/heart.svg" alt="Heart" class="heart-image">
      </div>
      <div class="card-back">
        <img src="${photo.src}" alt="Memory">
      </div>
    `;

    card.addEventListener('click', () => this.flipCard(card, index));
    return card;
  }

  flipCard(card, index)
  {
    if (card.classList.contains('flipped') || this.memoryGame.flippedCards.length >= 2)
    {
      return;
    }

    card.classList.add('flipped');
    this.memoryGame.flippedCards.push({ card, index });

    if (this.memoryGame.flippedCards.length === 2)
    {
      this.memoryGame.moves++;
      this.updateElement('moves-count', 'textContent', this.memoryGame.moves);
      setTimeout(() => this.checkMatch(), 1000);
    }
  }

  checkMatch()
  {
    const [card1, card2] = this.memoryGame.flippedCards;

    if (card1.card.dataset.photo === card2.card.dataset.photo)
    {
      this.memoryGame.matches++;
      this.updateElement('matches-count', 'textContent', this.memoryGame.matches);

      if (this.memoryGame.matches === 6)
      {
        setTimeout(() => this.completeGame('memory-match'), 500);
      }
    } else
    {
      card1.card.classList.remove('flipped');
      card2.card.classList.remove('flipped');
    }

    this.memoryGame.flippedCards = [];
  }
}