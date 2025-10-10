import { BaseGame } from './BaseGame.js';
import { DOMUtils } from '../utils/helpers.js';

export class PhotoPuzzleGame extends BaseGame {
  constructor(gameEngine) {
    super(gameEngine, 'photo-puzzle');
    this.gridSize = 3; // 3x3 grid
    this.tiles = [];
    this.emptyTileIndex = 8; // Bottom right corner starts empty
    this.moves = 0;
    this.currentPhotoIndex = 0;
    this.isComplete = false;
  }

  start() {
    DOMUtils.showScreen('photo-puzzle-screen');
    this.setupPuzzle();
    this.updateMoveCounter();
  }

  setupPuzzle() {
    // Select a random photo for the puzzle
    this.currentPhotoIndex = Math.floor(Math.random() * this.gameEngine.photos.length);
    const selectedPhoto = this.gameEngine.photos[this.currentPhotoIndex];

    // Update the reference image
    const referenceImg = document.getElementById('reference-image');
    if (referenceImg) {
      referenceImg.src = selectedPhoto.src;
      referenceImg.alt = selectedPhoto.moment || 'Puzzle Reference';
    }

    // Initialize tiles array (0-8, where 8 is the empty space)
    this.tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    this.emptyTileIndex = 8;
    this.moves = 0;
    this.isComplete = false;

    // Shuffle the puzzle
    this.shufflePuzzle();

    // Render the puzzle grid
    this.renderPuzzle();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  shufflePuzzle() {
    // Perform a series of valid moves to ensure solvability
    const shuffleMoves = 200;
    
    for (let i = 0; i < shuffleMoves; i++) {
      const validMoves = this.getValidMoves();
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        this.swapTiles(this.emptyTileIndex, randomMove);
        this.emptyTileIndex = randomMove;
      }
    }

    // Reset move counter after shuffling
    this.moves = 0;
  }

  getValidMoves() {
    const moves = [];
    const row = Math.floor(this.emptyTileIndex / this.gridSize);
    const col = this.emptyTileIndex % this.gridSize;

    // Check all four directions
    const directions = [
      { row: row - 1, col: col }, // Up
      { row: row + 1, col: col }, // Down
      { row: row, col: col - 1 }, // Left
      { row: row, col: col + 1 }  // Right
    ];

    directions.forEach(dir => {
      if (dir.row >= 0 && dir.row < this.gridSize && 
          dir.col >= 0 && dir.col < this.gridSize) {
        moves.push(dir.row * this.gridSize + dir.col);
      }
    });

    return moves;
  }

  swapTiles(index1, index2) {
    const temp = this.tiles[index1];
    this.tiles[index1] = this.tiles[index2];
    this.tiles[index2] = temp;
  }

  renderPuzzle() {
    const puzzleGrid = document.getElementById('puzzle-grid');
    if (!puzzleGrid) return;

    puzzleGrid.innerHTML = '';
    
    const selectedPhoto = this.gameEngine.photos[this.currentPhotoIndex];

    for (let i = 0; i < 9; i++) {
      const piece = document.createElement('div');
      piece.className = 'puzzle-piece';
      piece.dataset.index = i;

      const tileNumber = this.tiles[i];

      if (tileNumber === 8) {
        // Empty tile
        piece.classList.add('empty');
      } else {
        // Calculate the background position for this tile
        const tileRow = Math.floor(tileNumber / this.gridSize);
        const tileCol = tileNumber % this.gridSize;
        
        piece.style.backgroundImage = `url(${selectedPhoto.src})`;
        piece.style.backgroundPosition = `${-tileCol * 100}% ${-tileRow * 100}%`;
        piece.style.backgroundSize = '300% 300%';
        
        // Add click event listener
        piece.addEventListener('click', () => this.handleTileClick(i));
      }

      puzzleGrid.appendChild(piece);
    }
  }

  handleTileClick(clickedIndex) {
    if (this.isComplete) return;

    const validMoves = this.getValidMoves();
    
    if (validMoves.includes(clickedIndex)) {
      // Valid move - swap with empty tile
      this.swapTiles(this.emptyTileIndex, clickedIndex);
      this.emptyTileIndex = clickedIndex;
      this.moves++;
      
      this.renderPuzzle();
      this.updateMoveCounter();
      
      // Check if puzzle is solved
      if (this.isPuzzleSolved()) {
        this.completePuzzle();
      }
    }
  }

  isPuzzleSolved() {
    for (let i = 0; i < 8; i++) {
      if (this.tiles[i] !== i) {
        return false;
      }
    }
    return this.tiles[8] === 8; // Empty space should be in the last position
  }

  completePuzzle() {
    this.isComplete = true;
    
    // Fill in the last piece to show the complete image
    const lastPiece = document.querySelector('.puzzle-piece.empty');
    if (lastPiece) {
      lastPiece.classList.remove('empty');
      lastPiece.style.backgroundImage = `url(${this.gameEngine.photos[this.currentPhotoIndex].src})`;
      lastPiece.style.backgroundPosition = '-200% -200%'; // Bottom right piece
      lastPiece.style.backgroundSize = '300% 300%';
    }

    // Show completion message
    setTimeout(() => {
      const selectedPhoto = this.gameEngine.photos[this.currentPhotoIndex];
      this.showCompletionMessage(
        'Puzzle Solved! 🧩',
        `You completed the puzzle of "${selectedPhoto.moment}" in ${this.moves} moves!`
      );
    }, 500);

    // Complete the game
    this.gameEngine.completeGame('photo-puzzle');
  }

  updateMoveCounter() {
    const gameStats = document.querySelector('#photo-puzzle-screen .game-stats');
    if (gameStats) {
      gameStats.innerHTML = `
        <div>Moves: <strong>${this.moves}</strong></div>
        <div>Photo: <strong>${this.gameEngine.photos[this.currentPhotoIndex].moment}</strong></div>
      `;
    }
  }

  setupEventListeners() {
    // New puzzle button
    const newPuzzleBtn = document.getElementById('new-puzzle-btn');
    if (newPuzzleBtn) {
      newPuzzleBtn.addEventListener('click', () => this.setupPuzzle());
    }

    // Hint button
    const hintBtn = document.getElementById('puzzle-hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => this.showHint());
    }
  }

  showHint() {
    if (this.isComplete) return;

    // Highlight valid moves briefly
    const validMoves = this.getValidMoves();
    
    validMoves.forEach(moveIndex => {
      const piece = document.querySelector(`[data-index="${moveIndex}"]`);
      if (piece && !piece.classList.contains('empty')) {
        piece.style.boxShadow = '0 0 20px #ffd700';
        piece.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
          piece.style.boxShadow = '';
          piece.style.transform = '';
        }, 1500);
      }
    });

    // Show hint message
    const hintMessage = document.createElement('div');
    hintMessage.className = 'hint-message';
    hintMessage.textContent = 'Highlighted pieces can be moved!';
    hintMessage.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ffd700;
      color: #333;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: 600;
      z-index: 1000;
      animation: fadeIn 0.3s ease-out;
    `;
    
    document.body.appendChild(hintMessage);
    
    setTimeout(() => {
      hintMessage.remove();
    }, 2000);
  }

  reset() {
    this.setupPuzzle();
  }
}