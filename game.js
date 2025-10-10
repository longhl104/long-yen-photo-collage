class RomanticGameEngine
{
  constructor()
  {
    this.gameState = {
      completedGames: [],
      memoryTokens: 0,
      loveLevel: 0,
      unlockedContent: [],
      currentGame: null
    };

    // Initialize photo data - you can customize these with your specific memories
    this.photos = [
      // Early relationship - 2018-2019
      { src: 'assets/photos/Screenshot_20181012-001213_Messenger.jpg', date: '2018-10-12', moment: 'First Messages', emotion: 'Nervous' },
      { src: 'assets/photos/20190205_103221.jpg', date: '2019-02-05', moment: 'Early Days', emotion: 'Excited' },
      { src: 'assets/photos/20190207_132906.jpg', date: '2019-02-07', moment: 'First Adventure', emotion: 'Happy' },
      
      // Growing closer - 2020
      { src: 'assets/photos/20200308_150822.jpg', date: '2020-03-08', moment: 'Spring Together', emotion: 'Peaceful' },
      { src: 'assets/photos/20200502_150640.jpg', date: '2020-05-02', moment: 'Quarantine Love', emotion: 'Cozy' },
      { src: 'assets/photos/20200516_133559.jpg', date: '2020-05-16', moment: 'Nature Walk', emotion: 'Adventurous' },
      { src: 'assets/photos/20200531_151333.jpg', date: '2020-05-31', moment: 'Weekend Fun', emotion: 'Playful' },
      { src: 'assets/photos/20200614_152857.jpg', date: '2020-06-14', moment: 'Summer Vibes', emotion: 'Joyful' },
      { src: 'assets/photos/20200728_164237.jpg', date: '2020-07-28', moment: 'Beach Day', emotion: 'Relaxed' },
      { src: 'assets/photos/20200809_155240.jpg', date: '2020-08-09', moment: 'City Exploration', emotion: 'Curious' },
      { src: 'assets/photos/20200809_164023.jpg', date: '2020-08-09', moment: 'Evening Walk', emotion: 'Content' },
      { src: 'assets/photos/20200813_142756.jpg', date: '2020-08-13', moment: 'Romantic Dinner', emotion: 'Romantic' },
      { src: 'assets/photos/20200903_171445.jpg', date: '2020-09-03', moment: 'September Joy', emotion: 'Cheerful' },
      { src: 'assets/photos/20200904_185940.jpg', date: '2020-09-04', moment: 'Golden Hour', emotion: 'Dreamy' },
      { src: 'assets/photos/20200912_155629.jpg', date: '2020-09-12', moment: 'Weekend Bliss', emotion: 'Carefree' },
      { src: 'assets/photos/IMG-20201116-WA0020.jpg', date: '2020-11-16', moment: 'Candid Moment', emotion: 'Natural' },
      { src: 'assets/photos/20201220_133225.jpg', date: '2020-12-20', moment: 'Holiday Magic', emotion: 'Magical' },
      
      // Deeper connection - 2021
      { src: 'assets/photos/20211016_142756.jpg', date: '2021-10-16', moment: 'Autumn Love', emotion: 'Warm' },
      { src: 'assets/photos/20211217_135936.jpg', date: '2021-12-17', moment: 'Winter Together', emotion: 'Intimate' },
      { src: 'assets/photos/20211224_225150.jpg', date: '2021-12-24', moment: 'Christmas Eve', emotion: 'Festive' },
      
      // Stronger bond - 2022
      { src: 'assets/photos/20220129_154103.jpg', date: '2022-01-29', moment: 'New Year Together', emotion: 'Hopeful' },
      { src: 'assets/photos/20220921_183900.jpg', date: '2022-09-21', moment: 'Autumn Memories', emotion: 'Nostalgic' },
      
      // Love deepening - 2023
      { src: 'assets/photos/20230217_140251.jpg', date: '2023-02-17', moment: 'Valentine\'s Special', emotion: 'Loving' },
      { src: 'assets/photos/20231005_210616.jpg', date: '2023-10-05', moment: 'Evening Date', emotion: 'Romantic' },
      { src: 'assets/photos/20231223_220128.jpg', date: '2023-12-23', moment: 'Holiday Spirit', emotion: 'Joyful' },
      
      // Recent adventures - 2024
      { src: 'assets/photos/20240531_094710.jpg', date: '2024-05-31', moment: 'Adventure Continues', emotion: 'Excited' },
      { src: 'assets/photos/20240531_122749.jpg', date: '2024-05-31', moment: 'Same Day Magic', emotion: 'Blissful' },
      { src: 'assets/photos/20241030_181747.jpg', date: '2024-10-30', moment: 'Recent Fun', emotion: 'Happy' },
      
      // Latest memories - 2025
      { src: 'assets/photos/20250214_192530.jpg', date: '2025-02-14', moment: 'Valentine\'s 2025', emotion: 'Passionate' },
      { src: 'assets/photos/20250425_181231.jpg', date: '2025-04-25', moment: 'Spring Adventures', emotion: 'Energetic' },
      { src: 'assets/photos/PXL_20250819_143827778.jpg', date: '2025-08-19', moment: 'Summer Love', emotion: 'Grateful' },
      { src: 'assets/photos/PXL_20250828_071558656.PORTRAIT.jpg', date: '2025-08-28', moment: 'Portrait Perfect', emotion: 'Beautiful' },
      { src: 'assets/photos/PXL_20250911_065521786.jpg', date: '2025-09-11', moment: 'Morning Light', emotion: 'Serene' },
      { src: 'assets/photos/PXL_20250912_110349029.jpg', date: '2025-09-12', moment: 'Recent Memories', emotion: 'Cherished' },
      
      // Special moments (dates inferred from context)
      { src: 'assets/photos/FACE_RC_1545220878374.jpg', date: '2018-12-19', moment: 'First Selfie', emotion: 'Sweet' },
      { src: 'assets/photos/FACE_SC_1548767691867.jpg', date: '2019-01-29', moment: 'Silly Faces', emotion: 'Playful' },
      { src: 'assets/photos/FWP030814173_1327.jpg', date: '2020-08-03', moment: 'Professional Shot', emotion: 'Elegant' },
      { src: 'assets/photos/Duv long50.JPG', date: '2021-06-15', moment: 'Portrait Session', emotion: 'Sophisticated' },
      { src: 'assets/photos/HAVA0453 (1).jpg', date: '2022-03-20', moment: 'Special Occasion', emotion: 'Glamorous' },
      { src: 'assets/photos/HAVA0536 (1).jpg', date: '2022-03-20', moment: 'Same Event', emotion: 'Radiant' },
      { src: 'assets/photos/rtc-snapshot-852595009696049486.jpg', date: '2023-05-10', moment: 'Video Call', emotion: 'Connected' }
    ];

    this.memoryTokenMessages = [
      "Remember our first messages? From that moment, I knew you were special! 💕",
      "The way you laugh at my terrible jokes still makes my heart skip a beat! 😍",
      "Thank you for being my adventure buddy through all of life's journeys! 🌟",
      "Your kindness and compassion inspire me every single day! ❤️",
      "I love how we can be completely silly together and it feels so natural! 🤪",
      "You make even the ordinary moments feel extraordinary! ✨",
      "Your strength and determination motivate me to be a better person! 💪",
      "Happy International Women's Day to the most amazing woman in my life! 🌸"
    ];

    this.triviaQuestions = [
      {
        question: "Where did we go on our first official date?",
        options: ["Coffee shop", "Restaurant", "Park", "Movies"],
        correct: 0
      },
      {
        question: "What's my favorite thing about you?",
        options: ["Your smile", "Your laugh", "Your kindness", "Everything!"],
        correct: 3
      },
      {
        question: "What was the first movie we watched together?",
        options: ["Romantic Comedy", "Action Movie", "Horror Film", "Disney Movie"],
        correct: 0
      },
      {
        question: "What's our song?",
        options: ["Love Story", "Perfect", "All of Me", "A Thousand Years"],
        correct: 1
      },
      {
        question: "What do I love most about our relationship?",
        options: ["We never fight", "We laugh together", "We grow together", "All of the above"],
        correct: 3
      }
    ];

    this.init();
  }

  init()
  {
    this.setupEventListeners();
    this.showLoadingScreen();
  }

  setupEventListeners()
  {
    // Welcome screen
    document.getElementById('start-game-btn').addEventListener('click', () => this.showGameSelection());

    // Game selection
    document.querySelectorAll('.game-card').forEach(card =>
    {
      card.addEventListener('click', (e) => this.selectGame(e.currentTarget.dataset.game));
    });

    // Back buttons
    document.querySelectorAll('[id$="-back-btn"]').forEach(btn =>
    {
      btn.addEventListener('click', () => this.showGameSelection());
    });

    // Final slideshow
    document.getElementById('final-slideshow-btn').addEventListener('click', () => this.showFinalSlideshow());
    document.getElementById('restart-game-btn').addEventListener('click', () => this.restartGame());

    // Token modal
    document.getElementById('close-token-modal').addEventListener('click', () => this.closeTokenModal());

    // Audio
    this.setupAudio();
  }

  setupAudio()
  {
    const bgMusic = document.getElementById('background-music');
    bgMusic.volume = 0.3;

    // Start background music when user interacts with the page
    document.addEventListener('click', () =>
    {
      if (bgMusic.paused)
      {
        bgMusic.play().catch(e => console.log('Audio play failed:', e));
      }
    }, { once: true });
  }

  playSound(soundId)
  {
    const sound = document.getElementById(soundId);
    if (sound)
    {
      sound.currentTime = 0;
      sound.play().catch(e => console.log('Sound play failed:', e));
    }
  }

  showLoadingScreen()
  {
    // Simulate loading
    setTimeout(() =>
    {
      this.hideScreen('loading-screen');
      this.showScreen('welcome-screen');
      this.updateLoveLevel();
    }, 3000);
  }

  showScreen(screenId)
  {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  }

  hideScreen(screenId)
  {
    document.getElementById(screenId).classList.remove('active');
  }

  showGameSelection()
  {
    this.showScreen('game-selection');
    this.updateGameAvailability();
  }

  updateGameAvailability()
  {
    const games = ['memory-match', 'photo-puzzle', 'guess-moment', 'trivia-quiz', 'timeline', 'mood-match', 'hidden-message', 'scavenger-hunt'];

    games.forEach((game, index) =>
    {
      const card = document.querySelector(`[data-game="${game}"]`);
      const isUnlocked = index === 0 || this.gameState.completedGames.includes(games[index - 1]);

      if (isUnlocked)
      {
        card.classList.remove('locked');
        card.querySelector('.game-status').textContent = 'Unlocked';
        card.querySelector('.game-status').className = 'game-status unlocked';
      }
    });

    // Show final slideshow button if all games completed
    if (this.gameState.completedGames.length === 8)
    {
      document.getElementById('final-slideshow-btn').classList.remove('hidden');
    }
  }

  updateLoveLevel()
  {
    const percentage = (this.gameState.memoryTokens / 8) * 100;
    document.getElementById('love-level').style.width = percentage + '%';
    document.getElementById('love-percentage').textContent = Math.round(percentage);
    document.getElementById('token-count').textContent = this.gameState.memoryTokens;
  }

  selectGame(gameType)
  {
    const games = ['memory-match', 'photo-puzzle', 'guess-moment', 'trivia-quiz', 'timeline', 'mood-match', 'hidden-message', 'scavenger-hunt'];
    const gameIndex = games.indexOf(gameType);

    // Check if game is unlocked
    if (gameIndex > 0 && !this.gameState.completedGames.includes(games[gameIndex - 1]))
    {
      return;
    }

    this.gameState.currentGame = gameType;
    this.playSound('click-sound');

    switch (gameType)
    {
      case 'memory-match':
        this.startMemoryMatch();
        break;
      case 'photo-puzzle':
        this.startPhotoPuzzle();
        break;
      case 'guess-moment':
        this.startGuessTheMoment();
        break;
      case 'trivia-quiz':
        this.startTriviaQuiz();
        break;
      case 'timeline':
        this.startTimeline();
        break;
      case 'mood-match':
        this.startMoodMatch();
        break;
      case 'hidden-message':
        this.startHiddenMessage();
        break;
      case 'scavenger-hunt':
        this.startScavengerHunt();
        break;
    }
  }

  completeGame(gameType)
  {
    if (!this.gameState.completedGames.includes(gameType))
    {
      this.gameState.completedGames.push(gameType);
      this.gameState.memoryTokens++;
      this.playSound('success-sound');
      this.showMemoryToken();
    }
  }

  showMemoryToken()
  {
    const modal = document.getElementById('token-modal');
    const content = document.getElementById('token-content');

    const tokenIndex = this.gameState.memoryTokens - 1;
    const message = this.memoryTokenMessages[tokenIndex];
    const photo = this.photos[tokenIndex];

    content.innerHTML = `
            <div class="token-message">${message}</div>
            <img src="${photo.src}" alt="Memory" class="token-photo">
            <p>Memory Token ${this.gameState.memoryTokens}/8 Unlocked!</p>
        `;

    modal.classList.add('active');
    this.updateLoveLevel();
  }

  closeTokenModal()
  {
    document.getElementById('token-modal').classList.remove('active');
    this.showGameSelection();
  }

  // Memory Match Game
  startMemoryMatch()
  {
    this.showScreen('memory-match-game');
    this.initMemoryMatch();
  }

  initMemoryMatch()
  {
    const grid = document.getElementById('memory-grid');
    const selectedPhotos = this.photos.slice(0, 6);
    const gamePhotos = [...selectedPhotos, ...selectedPhotos].sort(() => Math.random() - 0.5);

    this.memoryGame = {
      cards: [],
      flippedCards: [],
      matches: 0,
      moves: 0
    };

    grid.innerHTML = '';

    gamePhotos.forEach((photo, index) =>
    {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.photo = photo.src;
      card.innerHTML = `
                <div class="card-front">💕</div>
                <div class="card-back"><img src="${photo.src}" alt="Memory"></div>
            `;

      card.addEventListener('click', () => this.flipCard(card, index));
      grid.appendChild(card);
      this.memoryGame.cards.push(card);
    });

    document.getElementById('matches-count').textContent = '0';
    document.getElementById('moves-count').textContent = '0';
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
      document.getElementById('moves-count').textContent = this.memoryGame.moves;

      setTimeout(() => this.checkMatch(), 1000);
    }
  }

  checkMatch()
  {
    const [card1, card2] = this.memoryGame.flippedCards;

    if (card1.card.dataset.photo === card2.card.dataset.photo)
    {
      this.memoryGame.matches++;
      document.getElementById('matches-count').textContent = this.memoryGame.matches;

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

  // Photo Puzzle Game
  startPhotoPuzzle()
  {
    this.showScreen('photo-puzzle-game');
    this.initPhotoPuzzle();
  }

  initPhotoPuzzle()
  {
    const photo = this.photos[Math.floor(Math.random() * this.photos.length)];
    const referenceImg = document.getElementById('reference-image');
    const grid = document.getElementById('puzzle-grid');

    referenceImg.src = photo.src;

    this.puzzleGame = {
      pieces: [],
      emptyIndex: 8,
      moves: 0,
      solved: false
    };

    // Create puzzle pieces
    for (let i = 0; i < 9; i++)
    {
      const piece = document.createElement('div');
      piece.className = 'puzzle-piece';

      if (i < 8)
      {
        const row = Math.floor(i / 3);
        const col = i % 3;
        piece.style.backgroundImage = `url(${photo.src})`;
        piece.style.backgroundPosition = `${-col * 133}px ${-row * 133}px`;
        piece.dataset.correctIndex = i;
        piece.addEventListener('click', () => this.movePuzzlePiece(i));
      } else
      {
        piece.classList.add('empty');
      }

      grid.appendChild(piece);
      this.puzzleGame.pieces.push(piece);
    }

    // Shuffle puzzle
    this.shufflePuzzle();

    document.getElementById('puzzle-moves').textContent = '0';
  }

  shufflePuzzle()
  {
    // Simple shuffle by making random valid moves
    for (let i = 0; i < 100; i++)
    {
      const validMoves = this.getValidMoves();
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      this.swapPieces(randomMove, this.puzzleGame.emptyIndex);
    }
  }

  getValidMoves()
  {
    const empty = this.puzzleGame.emptyIndex;
    const moves = [];

    if (empty % 3 > 0) moves.push(empty - 1); // Left
    if (empty % 3 < 2) moves.push(empty + 1); // Right
    if (empty >= 3) moves.push(empty - 3); // Up
    if (empty < 6) moves.push(empty + 3); // Down

    return moves;
  }

  movePuzzlePiece(index)
  {
    const validMoves = this.getValidMoves();

    if (validMoves.includes(index))
    {
      this.swapPieces(index, this.puzzleGame.emptyIndex);
      this.puzzleGame.moves++;
      document.getElementById('puzzle-moves').textContent = this.puzzleGame.moves;

      if (this.isPuzzleSolved())
      {
        setTimeout(() => this.completeGame('photo-puzzle'), 500);
      }
    }
  }

  swapPieces(index1, index2)
  {
    const temp = this.puzzleGame.pieces[index1].innerHTML;
    const tempClass = this.puzzleGame.pieces[index1].className;
    const tempStyle = this.puzzleGame.pieces[index1].style.cssText;
    const tempData = this.puzzleGame.pieces[index1].dataset.correctIndex;

    this.puzzleGame.pieces[index1].innerHTML = this.puzzleGame.pieces[index2].innerHTML;
    this.puzzleGame.pieces[index1].className = this.puzzleGame.pieces[index2].className;
    this.puzzleGame.pieces[index1].style.cssText = this.puzzleGame.pieces[index2].style.cssText;
    this.puzzleGame.pieces[index1].dataset.correctIndex = this.puzzleGame.pieces[index2].dataset.correctIndex;

    this.puzzleGame.pieces[index2].innerHTML = temp;
    this.puzzleGame.pieces[index2].className = tempClass;
    this.puzzleGame.pieces[index2].style.cssText = tempStyle;
    this.puzzleGame.pieces[index2].dataset.correctIndex = tempData;

    this.puzzleGame.emptyIndex = index1;
  }

  isPuzzleSolved()
  {
    for (let i = 0; i < 8; i++)
    {
      if (this.puzzleGame.pieces[i].dataset.correctIndex != i)
      {
        return false;
      }
    }
    return true;
  }

  // Guess the Moment Game
  startGuessTheMoment()
  {
    this.showScreen('guess-moment-game');
    this.initGuessTheMoment();
  }

  initGuessTheMoment()
  {
    this.guessGame = {
      currentPhoto: 0,
      score: 0,
      questions: this.photos.slice(0, 5).map(photo => ({
        photo: photo,
        options: this.generateDateOptions(photo.date),
        correct: 0
      }))
    };

    this.showGuessQuestion();
    document.getElementById('guess-score').textContent = '0';
  }

  generateDateOptions(correctDate)
  {
    const options = [correctDate];
    const date = new Date(correctDate);

    // Generate 3 random wrong dates
    for (let i = 0; i < 3; i++)
    {
      const wrongDate = new Date(date);
      wrongDate.setMonth(wrongDate.getMonth() + Math.floor(Math.random() * 24) - 12);
      options.push(wrongDate.toISOString().split('T')[0]);
    }

    return options.sort(() => Math.random() - 0.5);
  }

  showGuessQuestion()
  {
    const question = this.guessGame.questions[this.guessGame.currentPhoto];
    const photoImg = document.getElementById('guess-photo');
    const optionsContainer = document.getElementById('guess-options');

    photoImg.src = question.photo.src;
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) =>
    {
      const button = document.createElement('button');
      button.className = 'guess-option';
      button.textContent = new Date(option).toLocaleDateString();
      button.addEventListener('click', () => this.checkGuess(option, question.photo.date, button));
      optionsContainer.appendChild(button);
    });
  }

  checkGuess(selected, correct, button)
  {
    const isCorrect = selected === correct;

    if (isCorrect)
    {
      button.classList.add('correct');
      this.guessGame.score++;
      document.getElementById('guess-score').textContent = this.guessGame.score;
    } else
    {
      button.classList.add('incorrect');
      // Highlight correct answer
      document.querySelectorAll('.guess-option').forEach(btn =>
      {
        if (btn.textContent === new Date(correct).toLocaleDateString())
        {
          btn.classList.add('correct');
        }
      });
    }

    setTimeout(() =>
    {
      this.guessGame.currentPhoto++;
      if (this.guessGame.currentPhoto < this.guessGame.questions.length)
      {
        this.showGuessQuestion();
      } else
      {
        this.completeGame('guess-moment');
      }
    }, 2000);
  }

  // Trivia Quiz Game
  startTriviaQuiz()
  {
    this.showScreen('trivia-game');
    this.initTriviaQuiz();
  }

  initTriviaQuiz()
  {
    this.triviaGame = {
      currentQuestion: 0,
      score: 0
    };

    this.showTriviaQuestion();
    document.getElementById('trivia-score').textContent = '0';
    document.getElementById('question-number').textContent = '1';
  }

  showTriviaQuestion()
  {
    const question = this.triviaQuestions[this.triviaGame.currentQuestion];
    const questionContainer = document.getElementById('trivia-question');
    const optionsContainer = document.getElementById('trivia-options');

    questionContainer.textContent = question.question;
    optionsContainer.innerHTML = '';

    question.options.forEach((option, index) =>
    {
      const button = document.createElement('button');
      button.className = 'trivia-option';
      button.textContent = option;
      button.addEventListener('click', () => this.checkTriviaAnswer(index, question.correct, button));
      optionsContainer.appendChild(button);
    });
  }

  checkTriviaAnswer(selected, correct, button)
  {
    const isCorrect = selected === correct;

    if (isCorrect)
    {
      button.style.background = '#28a745';
      button.style.color = 'white';
      this.triviaGame.score++;
      document.getElementById('trivia-score').textContent = this.triviaGame.score;
    } else
    {
      button.style.background = '#dc3545';
      button.style.color = 'white';
    }

    setTimeout(() =>
    {
      this.triviaGame.currentQuestion++;
      document.getElementById('question-number').textContent = this.triviaGame.currentQuestion + 1;

      if (this.triviaGame.currentQuestion < this.triviaQuestions.length)
      {
        this.showTriviaQuestion();
      } else
      {
        this.completeGame('trivia-quiz');
      }
    }, 2000);
  }

  // Timeline Challenge Game
  startTimeline()
  {
    this.showScreen('timeline-game');
    this.initTimeline();
  }

  initTimeline()
  {
    const selectedPhotos = this.photos.slice(0, 6).sort(() => Math.random() - 0.5);
    const photosContainer = document.getElementById('timeline-photos');
    const dropzone = document.getElementById('timeline-dropzone');

    photosContainer.innerHTML = '';
    dropzone.innerHTML = '';

    this.timelineGame = {
      photos: selectedPhotos,
      correctOrder: selectedPhotos.sort((a, b) => new Date(a.date) - new Date(b.date)),
      droppedPhotos: []
    };

    // Create draggable photos
    selectedPhotos.sort(() => Math.random() - 0.5).forEach(photo =>
    {
      const img = document.createElement('img');
      img.src = photo.src;
      img.className = 'timeline-photo';
      img.draggable = true;
      img.dataset.date = photo.date;

      img.addEventListener('dragstart', (e) =>
      {
        e.dataTransfer.setData('text/plain', photo.date);
      });

      photosContainer.appendChild(img);
    });

    // Create drop slots
    for (let i = 0; i < 6; i++)
    {
      const slot = document.createElement('div');
      slot.className = 'drop-slot';
      slot.textContent = `${i + 1}`;
      slot.dataset.position = i;

      slot.addEventListener('dragover', (e) => e.preventDefault());
      slot.addEventListener('drop', (e) => this.handleTimelineDrop(e, slot));

      dropzone.appendChild(slot);
    }

    document.getElementById('timeline-progress').textContent = '0';
  }

  handleTimelineDrop(e, slot)
  {
    e.preventDefault();
    const date = e.dataTransfer.getData('text/plain');
    const photo = this.timelineGame.photos.find(p => p.date === date);
    const position = parseInt(slot.dataset.position);

    if (slot.classList.contains('filled')) return;

    // Remove photo from draggable area
    const photoElement = document.querySelector(`[data-date="${date}"]`);
    photoElement.remove();

    // Add photo to slot
    slot.innerHTML = `<img src="${photo.src}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
    slot.classList.add('filled');
    slot.dataset.date = date;

    this.timelineGame.droppedPhotos[position] = photo;

    // Check if timeline is complete
    const filledSlots = this.timelineGame.droppedPhotos.filter(p => p).length;
    document.getElementById('timeline-progress').textContent = filledSlots;

    if (filledSlots === 6)
    {
      setTimeout(() => this.checkTimelineOrder(), 1000);
    }
  }

  checkTimelineOrder()
  {
    const isCorrect = this.timelineGame.droppedPhotos.every((photo, index) =>
    {
      return photo && photo.date === this.timelineGame.correctOrder[index].date;
    });

    if (isCorrect)
    {
      this.completeGame('timeline');
    } else
    {
      alert('Not quite right! The photos should be in chronological order. Try again!');
      this.initTimeline();
    }
  }

  // Mood Match Game
  startMoodMatch()
  {
    this.showScreen('mood-match-game');
    this.initMoodMatch();
  }

  initMoodMatch()
  {
    const selectedPhotos = this.photos.slice(0, 5);
    const photosContainer = document.getElementById('mood-photos');
    const emotionsContainer = document.getElementById('mood-emotions');

    photosContainer.innerHTML = '';
    emotionsContainer.innerHTML = '';

    this.moodGame = {
      matches: 0,
      selectedPhoto: null,
      selectedEmotion: null
    };

    // Create photo elements
    selectedPhotos.forEach(photo =>
    {
      const photoDiv = document.createElement('div');
      photoDiv.className = 'mood-photo';
      photoDiv.dataset.emotion = photo.emotion;
      photoDiv.innerHTML = `<img src="${photo.src}" alt="${photo.moment}">`;
      photoDiv.addEventListener('click', () => this.selectMoodItem(photoDiv, 'photo'));
      photosContainer.appendChild(photoDiv);
    });

    // Create emotion elements (shuffled)
    const emotions = selectedPhotos.map(p => p.emotion).sort(() => Math.random() - 0.5);
    emotions.forEach(emotion =>
    {
      const emotionDiv = document.createElement('div');
      emotionDiv.className = 'mood-emotion';
      emotionDiv.dataset.emotion = emotion;
      emotionDiv.textContent = emotion;
      emotionDiv.addEventListener('click', () => this.selectMoodItem(emotionDiv, 'emotion'));
      emotionsContainer.appendChild(emotionDiv);
    });

    document.getElementById('mood-matches').textContent = '0';
  }

  selectMoodItem(element, type)
  {
    // Remove previous selections
    document.querySelectorAll('.mood-photo, .mood-emotion').forEach(el =>
    {
      el.style.border = '3px solid #ff69b4';
    });

    element.style.border = '3px solid #28a745';

    if (type === 'photo')
    {
      this.moodGame.selectedPhoto = element;
    } else
    {
      this.moodGame.selectedEmotion = element;
    }

    // Check for match
    if (this.moodGame.selectedPhoto && this.moodGame.selectedEmotion)
    {
      if (this.moodGame.selectedPhoto.dataset.emotion === this.moodGame.selectedEmotion.dataset.emotion)
      {
        // Match found!
        this.moodGame.selectedPhoto.style.opacity = '0.5';
        this.moodGame.selectedEmotion.style.opacity = '0.5';
        this.moodGame.matches++;
        document.getElementById('mood-matches').textContent = this.moodGame.matches;

        if (this.moodGame.matches === 5)
        {
          setTimeout(() => this.completeGame('mood-match'), 500);
        }
      }

      // Reset selections
      this.moodGame.selectedPhoto = null;
      this.moodGame.selectedEmotion = null;
    }
  }

  // Hidden Message Game
  startHiddenMessage()
  {
    this.showScreen('hidden-message-game');
    this.initHiddenMessage();
  }

  initHiddenMessage()
  {
    const photo = this.photos[Math.floor(Math.random() * this.photos.length)];
    const photoImg = document.getElementById('hidden-photo');
    const container = document.getElementById('hidden-photo-container');

    photoImg.src = photo.src;

    this.hiddenGame = {
      messages: [
        { x: 20, y: 30, text: "You are beautiful!" },
        { x: 60, y: 50, text: "I love your smile!" },
        { x: 30, y: 70, text: "Forever yours ❤️" },
        { x: 70, y: 20, text: "My sunshine ☀️" },
        { x: 50, y: 80, text: "Happy Women's Day!" }
      ],
      found: 0
    };

    // Remove existing spots
    container.querySelectorAll('.hidden-spot').forEach(spot => spot.remove());

    // Add hidden spots
    this.hiddenGame.messages.forEach((message, index) =>
    {
      const spot = document.createElement('div');
      spot.className = 'hidden-spot';
      spot.style.left = message.x + '%';
      spot.style.top = message.y + '%';
      spot.addEventListener('click', () => this.revealMessage(index, spot, message.text));
      container.appendChild(spot);
    });

    document.getElementById('messages-found').textContent = '0';
  }

  revealMessage(index, spot, message)
  {
    spot.innerHTML = `<div style="background: white; padding: 5px; border-radius: 5px; font-size: 12px; white-space: nowrap; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);">${message}</div>`;
    spot.style.animation = 'none';
    spot.style.background = 'rgba(40, 167, 69, 0.8)';

    this.hiddenGame.found++;
    document.getElementById('messages-found').textContent = this.hiddenGame.found;

    if (this.hiddenGame.found === 5)
    {
      setTimeout(() => this.completeGame('hidden-message'), 1000);
    }
  }

  // Scavenger Hunt Game
  startScavengerHunt()
  {
    this.showScreen('scavenger-game');
    this.initScavengerHunt();
  }

  initScavengerHunt()
  {
    this.scavengerGame = {
      tasks: [
        { item: "Find a smile in this photo", target: { x: 50, y: 40, tolerance: 10 } },
        { item: "Spot something red", target: { x: 30, y: 60, tolerance: 15 } },
        { item: "Find where we're holding hands", target: { x: 45, y: 75, tolerance: 12 } },
        { item: "Look for something that sparkles", target: { x: 60, y: 30, tolerance: 10 } },
        { item: "Find the happiest moment", target: { x: 40, y: 50, tolerance: 20 } }
      ],
      currentTask: 0,
      found: 0
    };

    this.showScavengerTask();
  }

  showScavengerTask()
  {
    const task = this.scavengerGame.tasks[this.scavengerGame.currentTask];
    const photo = this.photos[Math.floor(Math.random() * this.photos.length)];

    document.getElementById('scavenger-task').textContent = task.item;

    const photoImg = document.getElementById('scavenger-photo');
    photoImg.src = photo.src;

    // Remove existing click handler
    const newPhotoImg = photoImg.cloneNode(true);
    photoImg.parentNode.replaceChild(newPhotoImg, photoImg);

    newPhotoImg.addEventListener('click', (e) => this.checkScavengerClick(e, task));

    document.getElementById('items-found').textContent = this.scavengerGame.found;
  }

  checkScavengerClick(e, task)
  {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const distance = Math.sqrt(
      Math.pow(x - task.target.x, 2) + Math.pow(y - task.target.y, 2)
    );

    if (distance <= task.target.tolerance)
    {
      // Success!
      this.scavengerGame.found++;
      this.scavengerGame.currentTask++;

      // Show success indicator
      const indicator = document.createElement('div');
      indicator.style.position = 'absolute';
      indicator.style.left = e.clientX - rect.left + 'px';
      indicator.style.top = e.clientY - rect.top + 'px';
      indicator.style.background = '#28a745';
      indicator.style.color = 'white';
      indicator.style.padding = '5px';
      indicator.style.borderRadius = '50%';
      indicator.style.fontSize = '20px';
      indicator.innerHTML = '✓';
      indicator.style.zIndex = '1000';
      e.target.parentNode.appendChild(indicator);

      setTimeout(() =>
      {
        indicator.remove();
        if (this.scavengerGame.currentTask < this.scavengerGame.tasks.length)
        {
          this.showScavengerTask();
        } else
        {
          this.completeGame('scavenger-hunt');
        }
      }, 1000);
    }
  }

  // Final Slideshow
  showFinalSlideshow()
  {
    this.showScreen('final-slideshow');
    this.initSlideshow();
  }

  initSlideshow()
  {
    const container = document.getElementById('slideshow-photos');
    container.innerHTML = '';

    this.slideshow = {
      currentSlide: 0,
      isPlaying: true,
      interval: null
    };

    this.photos.forEach((photo, index) =>
    {
      const slide = document.createElement('div');
      slide.className = `slide ${index === 0 ? 'active' : ''}`;
      slide.innerHTML = `<img src="${photo.src}" alt="${photo.moment}">`;
      container.appendChild(slide);
    });

    // Setup controls
    document.getElementById('prev-slide').addEventListener('click', () => this.prevSlide());
    document.getElementById('next-slide').addEventListener('click', () => this.nextSlide());
    document.getElementById('play-pause').addEventListener('click', () => this.toggleSlideshow());

    this.startSlideshow();
  }

  startSlideshow()
  {
    this.slideshow.interval = setInterval(() =>
    {
      this.nextSlide();
    }, 3000);
  }

  stopSlideshow()
  {
    clearInterval(this.slideshow.interval);
  }

  toggleSlideshow()
  {
    if (this.slideshow.isPlaying)
    {
      this.stopSlideshow();
      document.getElementById('play-pause').textContent = '▶️';
    } else
    {
      this.startSlideshow();
      document.getElementById('play-pause').textContent = '⏸️';
    }
    this.slideshow.isPlaying = !this.slideshow.isPlaying;
  }

  nextSlide()
  {
    const slides = document.querySelectorAll('.slide');
    slides[this.slideshow.currentSlide].classList.remove('active');
    this.slideshow.currentSlide = (this.slideshow.currentSlide + 1) % slides.length;
    slides[this.slideshow.currentSlide].classList.add('active');
  }

  prevSlide()
  {
    const slides = document.querySelectorAll('.slide');
    slides[this.slideshow.currentSlide].classList.remove('active');
    this.slideshow.currentSlide = (this.slideshow.currentSlide - 1 + slides.length) % slides.length;
    slides[this.slideshow.currentSlide].classList.add('active');
  }

  restartGame()
  {
    this.gameState = {
      completedGames: [],
      memoryTokens: 0,
      loveLevel: 0,
      unlockedContent: [],
      currentGame: null
    };

    this.showScreen('welcome-screen');
    this.updateLoveLevel();
    this.stopSlideshow();
  }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () =>
{
  new RomanticGameEngine();
});