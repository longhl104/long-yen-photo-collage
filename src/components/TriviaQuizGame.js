import { BaseGame } from './BaseGame.js';
import { DOMUtils } from '../utils/helpers.js';

export class TriviaQuizGame extends BaseGame {
  constructor(gameEngine) {
    super(gameEngine, 'trivia-quiz');
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.totalQuestions = 8;
    this.questions = [];
    this.hasAnswered = false;
  }

  start() {
    DOMUtils.showScreen('trivia-screen');
    this.setupTrivia();
    this.showCurrentQuestion();
  }

  setupTrivia() {
    // Use predefined trivia questions from game data, or generate from photos
    let questions = [];
    
    if (this.gameEngine.triviaQuestions && this.gameEngine.triviaQuestions.length > 0) {
      // Convert existing trivia questions to our format
      questions = this.gameEngine.triviaQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correct: q.options[q.correct], // Convert index to actual answer
        explanation: q.explanation || `Great question! The answer is "${q.options[q.correct]}" 💕`
      }));
    }
    
    // Add generated questions from photos to supplement
    const generatedQuestions = this.generateQuestionsFromPhotos();
    questions = [...questions, ...generatedQuestions];

    // Shuffle and limit to totalQuestions
    this.shuffleArray(questions);
    this.questions = questions.slice(0, this.totalQuestions);

    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.hasAnswered = false;
  }

  generateQuestionsFromPhotos() {
    // Fallback: Generate questions from photo data if no trivia questions exist
    const photos = this.gameEngine.photos;
    const questions = [];

    // Generate different types of questions
    questions.push(...this.generateDateQuestions(photos));
    questions.push(...this.generateLocationQuestions(photos));
    questions.push(...this.generateMomentQuestions(photos));
    questions.push(...this.generateCountingQuestions(photos));

    return questions;
  }

  generateDateQuestions(photos) {
    const questions = [];
    const years = [...new Set(photos.map(p => new Date(p.date).getFullYear()))].sort();
    
    if (years.length > 0) {
      const firstYear = Math.min(...years);
      const lastYear = Math.max(...years);
      
      questions.push({
        question: "In which year did we first meet?",
        options: this.generateYearOptions(firstYear),
        correct: firstYear.toString(),
        explanation: `Our beautiful journey began in ${firstYear}! 💕`
      });

      if (years.length > 1) {
        questions.push({
          question: "How many years have we been creating memories together?",
          options: this.generateCountOptions(lastYear - firstYear + 1),
          correct: (lastYear - firstYear + 1).toString(),
          explanation: `We've been making beautiful memories for ${lastYear - firstYear + 1} amazing years! ✨`
        });
      }
    }

    return questions;
  }

  generateLocationQuestions(photos) {
    const questions = [];
    
    // Example location-based questions (you can customize these)
    questions.push({
      question: "Where did we take our first photo together?",
      options: ["At home", "In a park", "At a restaurant", "On a trip"],
      correct: "At home",
      explanation: "Our first captured moment was in the comfort of home! 🏠"
    });

    return questions;
  }

  generateMomentQuestions(photos) {
    const questions = [];
    const uniqueMoments = [...new Set(photos.map(p => p.moment).filter(Boolean))];
    
    if (uniqueMoments.length >= 4) {
      const randomMoment = uniqueMoments[Math.floor(Math.random() * uniqueMoments.length)];
      const otherMoments = uniqueMoments.filter(m => m !== randomMoment).slice(0, 3);
      
      questions.push({
        question: "Which of these was one of our special moments?",
        options: this.shuffleArray([randomMoment, ...otherMoments]),
        correct: randomMoment,
        explanation: `"${randomMoment}" - such a precious memory! 💖`
      });
    }

    return questions;
  }

  generateCountingQuestions(photos) {
    const questions = [];
    const photoCount = photos.length;
    
    questions.push({
      question: "How many photos do we have in our love story collection?",
      options: this.generateCountOptions(photoCount),
      correct: photoCount.toString(),
      explanation: `We have ${photoCount} beautiful photos capturing our journey! 📸`
    });

    return questions;
  }

  generateYearOptions(correctYear) {
    const options = [correctYear.toString()];
    
    // Add 3 nearby years
    for (let i = 1; i <= 3; i++) {
      const offset = Math.random() > 0.5 ? i : -i;
      const wrongYear = correctYear + offset;
      if (wrongYear > 2000 && wrongYear <= new Date().getFullYear()) {
        options.push(wrongYear.toString());
      }
    }
    
    // Fill with more options if needed
    while (options.length < 4) {
      const randomYear = correctYear + Math.floor((Math.random() - 0.5) * 10);
      if (randomYear > 2000 && randomYear <= new Date().getFullYear() && !options.includes(randomYear.toString())) {
        options.push(randomYear.toString());
      }
    }
    
    return this.shuffleArray(options.slice(0, 4));
  }

  generateCountOptions(correctCount) {
    const options = [correctCount.toString()];
    
    // Add some close numbers
    const variations = [correctCount - 2, correctCount - 1, correctCount + 1, correctCount + 2];
    
    variations.forEach(num => {
      if (num > 0 && num !== correctCount && options.length < 4) {
        options.push(num.toString());
      }
    });
    
    return this.shuffleArray(options);
  }

  showCurrentQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.showFinalResults();
      return;
    }

    const question = this.questions[this.currentQuestionIndex];
    this.hasAnswered = false;

    // Update question text
    const questionElement = document.getElementById('trivia-question');
    if (questionElement) {
      questionElement.innerHTML = `
        <h3>Question ${this.currentQuestionIndex + 1}</h3>
        <p>${question.question}</p>
      `;
    }

    // Update options
    const optionsContainer = document.getElementById('trivia-options');
    if (optionsContainer) {
      optionsContainer.innerHTML = '';
      
      question.options.forEach((option, index) => {
        const optionButton = document.createElement('button');
        optionButton.className = 'trivia-option';
        optionButton.textContent = option;
        optionButton.addEventListener('click', () => this.handleAnswer(option, question.correct, question.explanation));
        
        optionsContainer.appendChild(optionButton);
      });
    }

    // Update progress
    this.updateProgress();
  }

  handleAnswer(selectedAnswer, correctAnswer, explanation) {
    if (this.hasAnswered) return;
    
    this.hasAnswered = true;
    const isCorrect = selectedAnswer === correctAnswer;
    
    if (isCorrect) {
      this.correctAnswers++;
    }

    // Visual feedback
    const optionButtons = document.querySelectorAll('.trivia-option');
    optionButtons.forEach(button => {
      button.disabled = true;
      
      if (button.textContent === correctAnswer) {
        button.classList.add('correct');
      } else if (button.textContent === selectedAnswer && !isCorrect) {
        button.classList.add('incorrect');
      }
    });

    // Show explanation
    this.showExplanation(explanation, isCorrect);

    // Move to next question after delay
    setTimeout(() => {
      this.currentQuestionIndex++;
      this.showCurrentQuestion();
    }, 3500);
  }

  showExplanation(explanation, isCorrect) {
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'trivia-explanation';
    explanationDiv.innerHTML = `
      <div class="explanation-content">
        <h4>${isCorrect ? '🎉 Correct!' : '💡 Good try!'}</h4>
        <p>${explanation}</p>
      </div>
    `;
    
    const triviaContent = document.getElementById('trivia-content');
    if (triviaContent) {
      triviaContent.appendChild(explanationDiv);
      
      // Remove after showing next question
      setTimeout(() => {
        if (explanationDiv.parentElement) {
          explanationDiv.remove();
        }
      }, 4000);
    }
  }

  showFinalResults() {
    const percentage = Math.round((this.correctAnswers / this.questions.length) * 100);
    let resultMessage = '';
    let resultEmoji = '';
    
    if (percentage >= 90) {
      resultMessage = "Outstanding! You're a true expert on our love story! 💕";
      resultEmoji = "🏆";
    } else if (percentage >= 75) {
      resultMessage = "Excellent! You know us so well! 😍";
      resultEmoji = "🥇";
    } else if (percentage >= 60) {
      resultMessage = "Great job! You've been paying attention to our journey! 😊";
      resultEmoji = "🥈";
    } else if (percentage >= 40) {
      resultMessage = "Not bad! There's still more to learn about our story! 💫";
      resultEmoji = "🥉";
    } else {
      resultMessage = "We have so many wonderful stories to share with you! 💝";
      resultEmoji = "📖";
    }

    this.showCompletionMessage(
      `${resultEmoji} Quiz Complete! ${resultEmoji}`,
      `You scored ${this.correctAnswers}/${this.questions.length} (${percentage}%)!\n\n${resultMessage}`
    );

    // Complete the game
    this.gameEngine.completeGame('trivia-quiz');
  }

  updateProgress() {
    const gameStats = document.querySelector('#trivia-screen .game-stats');
    if (gameStats) {
      gameStats.innerHTML = `
        <div>Question: <strong>${this.currentQuestionIndex + 1}/${this.questions.length}</strong></div>
        <div>Score: <strong>${this.correctAnswers}/${this.currentQuestionIndex}</strong></div>
      `;
    }
  }

  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  reset() {
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.hasAnswered = false;
    this.setupTrivia();
    this.showCurrentQuestion();
  }
}