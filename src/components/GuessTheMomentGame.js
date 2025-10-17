import { BaseGame } from './BaseGame.js';
import { DOMUtils } from '../utils/helpers.js';

export class GuessTheMomentGame extends BaseGame
{
  constructor(gameEngine)
  {
    super(gameEngine, 'guess-moment');
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.totalQuestions = 5;
    this.questions = [];
    this.hasAnswered = false;
  }

  start()
  {
    DOMUtils.showScreen('guess-moment-screen');
    this.generateQuestions();
    this.showCurrentQuestion();
  }

  generateQuestions()
  {
    // Get a shuffled copy of photos for questions
    const availablePhotos = [...this.gameEngine.photos];
    this.shuffleArray(availablePhotos);

    this.questions = [];
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.hasAnswered = false;

    // Generate 5 questions from available photos
    for (let i = 0; i < Math.min(this.totalQuestions, availablePhotos.length); i++)
    {
      const correctPhoto = availablePhotos[i];
      const question = this.createQuestion(correctPhoto, availablePhotos);
      this.questions.push(question);
    }
  }

  createQuestion(correctPhoto, allPhotos)
  {
    // Create different types of questions randomly
    const questionTypes = ['date', 'moment', 'emotion'];
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    let question = {};

    switch (questionType)
    {
      case 'date':
        question = this.createDateQuestion(correctPhoto, allPhotos);
        break;
      case 'moment':
        question = this.createMomentQuestion(correctPhoto, allPhotos);
        break;
      case 'emotion':
        question = this.createEmotionQuestion(correctPhoto, allPhotos);
        break;
    }

    question.type = questionType;
    question.photo = correctPhoto;

    return question;
  }

  createDateQuestion(correctPhoto, allPhotos)
  {
    const correctDate = new Date(correctPhoto.date);
    const correctYear = correctDate.getFullYear();
    const correctMonth = correctDate.toLocaleDateString('en-US', { month: 'long' });

    // Generate wrong dates
    const wrongDates = [];
    const usedYears = new Set([correctYear]);

    // Generate 3 different years around the correct year
    while (wrongDates.length < 3)
    {
      const randomOffset = (Math.random() - 0.5) * 6; // ±3 years
      const wrongYear = correctYear + Math.floor(randomOffset);

      if (!usedYears.has(wrongYear) && wrongYear > 2000 && wrongYear <= new Date().getFullYear())
      {
        wrongDates.push(wrongYear.toString());
        usedYears.add(wrongYear);
      }
    }

    const options = [correctYear.toString(), ...wrongDates];
    this.shuffleArray(options);

    return {
      questionText: `When was this photo taken?`,
      options: options,
      correctAnswer: correctYear.toString(),
      explanation: `This beautiful moment was captured in ${correctMonth} ${correctYear}.`
    };
  }

  createMomentQuestion(correctPhoto, allPhotos)
  {
    const correctMoment = correctPhoto.moment;

    // Generate wrong moments from other photos
    const otherMoments = allPhotos
      .filter(photo => photo.moment !== correctMoment && photo.moment)
      .map(photo => photo.moment);

    this.shuffleArray(otherMoments);
    const wrongMoments = otherMoments.slice(0, 3);

    const options = [correctMoment, ...wrongMoments];
    this.shuffleArray(options);

    return {
      questionText: `What moment does this photo represent?`,
      options: options,
      correctAnswer: correctMoment,
      explanation: `This photo captures our "${correctMoment}" - such a special time! 💕`
    };
  }

  createEmotionQuestion(correctPhoto, allPhotos)
  {
    const correctEmotion = correctPhoto.emotion;

    // Generate wrong emotions from other photos
    const otherEmotions = allPhotos
      .filter(photo => photo.emotion !== correctEmotion && photo.emotion)
      .map(photo => photo.emotion);

    this.shuffleArray(otherEmotions);
    const wrongEmotions = otherEmotions.slice(0, 3);

    const options = [correctEmotion, ...wrongEmotions];
    this.shuffleArray(options);

    return {
      questionText: `What emotion best describes this moment?`,
      options: options,
      correctAnswer: correctEmotion,
      explanation: `You could feel the "${correctEmotion}" energy in this moment! ✨`,
    };
  }

  showCurrentQuestion()
  {
    if (this.currentQuestionIndex >= this.questions.length)
    {
      this.showFinalResults();
      return;
    }

    const question = this.questions[this.currentQuestionIndex];
    this.hasAnswered = false;

    // Update photo
    const guessPhoto = document.getElementById('guess-photo');
    if (guessPhoto)
    {
      guessPhoto.src = question.photo.src;
      guessPhoto.alt = question.questionText;
    }

    // Update question text
    const gameHeader = document.querySelector('#guess-moment-screen .game-header h2');
    if (gameHeader)
    {
      gameHeader.textContent = `${question.questionText}`;
    }

    // Update options
    const optionsContainer = document.getElementById('guess-options');
    if (optionsContainer)
    {
      optionsContainer.innerHTML = '';

      question.options.forEach((option, index) =>
      {
        const optionButton = document.createElement('button');
        optionButton.className = 'guess-option';
        optionButton.textContent = option;
        optionButton.addEventListener('click', () => this.handleAnswer(option, question.correctAnswer));

        optionsContainer.appendChild(optionButton);
      });
    }

    // Update progress
    this.updateProgress();
  }

  handleAnswer(selectedAnswer, correctAnswer)
  {
    if (this.hasAnswered) return;

    this.hasAnswered = true;

    // Determine current question so we can special-case emotion questions.
    const question = this.questions[this.currentQuestionIndex];
    let isCorrect = selectedAnswer === correctAnswer;
    let explanationText = question.explanation;

    // For emotion-type questions, accept any selected answer as correct.
    if (question && question.type === 'emotion')
    {
      isCorrect = true;
      // For consistent visual feedback, treat the selected answer as the "correct" one.
      correctAnswer = selectedAnswer;
      // Update explanation to use the user's selected emotion
      explanationText = `You could feel the "${selectedAnswer}" energy in this moment! ✨`;
    }

    if (isCorrect)
    {
      this.correctAnswers++;
    }

    // Visual feedback
    const optionButtons = document.querySelectorAll('.guess-option');
    optionButtons.forEach(button =>
    {
      button.disabled = true;

      if (button.textContent === correctAnswer)
      {
        button.classList.add('correct');
      } else if (button.textContent === selectedAnswer && !isCorrect)
      {
        button.classList.add('incorrect');
      }
    });

    // Show explanation
    this.showExplanation(explanationText, isCorrect);

    // Move to next question after delay
    setTimeout(() =>
    {
      this.currentQuestionIndex++;
      this.showCurrentQuestion();
    }, 3000);
  }

  showExplanation(explanation, isCorrect)
  {
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation';
    explanationDiv.innerHTML = `
      <div class="explanation-content">
        <h4>${isCorrect ? '✅ Correct!' : '❌ Not quite...'}</h4>
        <p>${explanation}</p>
      </div>
    `;

    const gameContent = document.querySelector('#guess-content');
    if (gameContent)
    {
      gameContent.appendChild(explanationDiv);

      // Remove after showing next question
      setTimeout(() =>
      {
        if (explanationDiv.parentElement)
        {
          explanationDiv.remove();
        }
      }, 3500);
    }
  }

  showFinalResults()
  {
    const percentage = Math.round((this.correctAnswers / this.totalQuestions) * 100);
    const passed = this.correctAnswers >= 2; // Only need 2 points to pass
    let resultMessage = '';

    if (this.correctAnswers >= 4)
    {
      resultMessage = "Amazing! You know our story so well! 💕";
    } else if (this.correctAnswers >= 3)
    {
      resultMessage = "Great job! You remember many of our moments! 😊";
    } else if (this.correctAnswers >= 2)
    {
      resultMessage = "Well done! You've unlocked the next memory game! 💫";
    } else
    {
      resultMessage = "Keep trying! You need at least 2 correct answers to continue. 💝";
    }

    const title = passed ? 'Moment Guessing Complete! 📸' : 'Try Again! 🔄';
    const message = `You got ${this.correctAnswers} out of ${this.totalQuestions} correct (${percentage}%). ${resultMessage}`;

    if (passed)
    {
      this.showCompletionMessage(title, message);
      // Complete the game only if passed
      this.gameEngine.completeGame('guess-moment');
    } else
    {
      this.showCompletionMessage(title, message + '\n\nClick "Back to Games" to try again!');
    }
  }

  updateProgress()
  {
    const gameStats = document.querySelector('#guess-moment-screen .game-stats');
    if (gameStats)
    {
      gameStats.innerHTML = `
        <div>Question: <strong>${this.currentQuestionIndex + 1}/${this.totalQuestions}</strong></div>
        <div>Score: <strong>${this.correctAnswers}/${this.currentQuestionIndex}</strong></div>
      `;
    }
  }

  shuffleArray(array)
  {
    for (let i = array.length - 1; i > 0; i--)
    {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
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
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.hasAnswered = false;
    this.generateQuestions();
    this.showCurrentQuestion();
  }
}