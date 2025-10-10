# Romantic Love Game - AWS Deployment

This romantic web game is containerized and ready for deployment to AWS.

## Prerequisites

- AWS CLI configured with profile `longhl104`
- Docker installed
- AWS ECR repository created
- ECS cluster with Fargate capacity

## Local Development

1. **Build and run locally:**
   ```bash
   docker-compose up --build
   ```
   
2. **Access the game:**
   Open http://localhost in your browser

## AWS Deployment Instructions

### Option 1: AWS ECS with Fargate (Recommended)

1. **Build and push to ECR:**
   ```bash
   # Login to ECR
   aws ecr get-login-password --region ap-southeast-2 --profile longhl104 | docker login --username AWS --password-stdin [ACCOUNT_ID].dkr.ecr.ap-southeast-2.amazonaws.com

   # Build and tag image
   docker build -t romantic-love-game .
   docker tag romantic-love-game:latest [ACCOUNT_ID].dkr.ecr.ap-southeast-2.amazonaws.com/romantic-love-game:latest

   # Push to ECR
   docker push [ACCOUNT_ID].dkr.ecr.ap-southeast-2.amazonaws.com/romantic-love-game:latest
   ```

2. **Deploy using the provided scripts:**
   ```bash
   .\deploy.ps1
   ```

### Option 2: AWS App Runner (Simplified)

1. **Use the App Runner configuration:**
   - Upload your code to a GitHub repository
   - Use the `apprunner.yaml` configuration
   - Deploy through AWS Console or CLI

### Option 3: AWS Amplify (Static Hosting)

Since this is a static web application, you can also deploy to AWS Amplify:

1. **Install Amplify CLI:**
   ```bash
   npm install -g @aws-amplify/cli
   ```

2. **Initialize Amplify:**
   ```bash
   amplify init
   amplify add hosting
   amplify publish
   ```

## Game Features

- **8 Mini Games:** Memory Match, Photo Puzzle, Guess the Moment, Trivia Quiz, Timeline Challenge, Mood Match, Hidden Messages, Photo Scavenger Hunt
- **Progressive Unlocking:** Each game unlocks after completing the previous one
- **Memory Tokens:** Collect romantic messages and photos as rewards
- **Love Level Meter:** Visual progression indicator
- **Final Slideshow:** Beautiful photo montage ending
- **Responsive Design:** Works on mobile and desktop
- **Romantic Theming:** Pink/love-themed UI with animations

## Customization

1. **Add Your Photos:** Replace the photos in `assets/photos/` with your own memories
2. **Update Messages:** Edit the `memoryTokenMessages` array in `game.js`
3. **Customize Trivia:** Modify the `triviaQuestions` array with your personal questions
4. **Add Music:** Place your favorite songs in `assets/audio/`
5. **Personalize Dates:** Update the photo metadata in the `photos` array

## Technical Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Styling:** CSS Grid, Flexbox, CSS Animations
- **Fonts:** Google Fonts (Dancing Script, Poppins)
- **Containerization:** Docker with Nginx
- **Deployment:** AWS ECS/ECR, App Runner, or Amplify

## Performance Optimizations

- Image lazy loading
- CSS and JS minification ready
- Gzip compression enabled
- Browser caching configured
- Responsive images

## Security

- CSP headers configured
- XSS protection enabled
- HTTPS ready
- Input sanitization

Happy International Women's Day! 💕