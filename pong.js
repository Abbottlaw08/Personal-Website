// Pong Game
let pongCanvas, pongCtx;
let pongGameRunning = false;
let pongGameStarted = false; // New flag to track if game mechanics are active
let pongAnimationId;

// Game objects
let paddle1 = { x: 10, y: 200, width: 10, height: 100, dy: 0 };
let paddle2 = { x: 480, y: 200, width: 10, height: 100, dy: 0 };
let ball = { x: 250, y: 250, width: 10, height: 10, dx: 4, dy: 3 };
let playerScore = 0;
let computerScore = 0;
let maxScore = 5;

// Controls
let keys = {};

function startPongGame() {
    // Hide menu and show game
    hideExpandableSections();
    document.getElementById('pongContainer').style.display = 'block';
    
    // Initialize canvas
    pongCanvas = document.getElementById('pongCanvas');
    pongCtx = pongCanvas.getContext('2d');
    
    // Reset game state
    resetPong();
    
    // Start game loop
    pongGameRunning = true;
    pongGameStarted = true; // Game mechanics are active
    pongGameLoop();
    
    // Add event listeners
    document.addEventListener('keydown', pongKeyDown);
    document.addEventListener('keyup', pongKeyUp);
}

function resetPong() {
    paddle1 = { x: 10, y: 200, width: 10, height: 100, dy: 0 };
    paddle2 = { x: 480, y: 200, width: 10, height: 100, dy: 0 };
    ball = { x: 250, y: 250, width: 10, height: 10, dx: 4, dy: 3 };
    playerScore = 0;
    computerScore = 0;
    keys = {};
    pongGameStarted = false; // Reset game started flag
    
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
    document.getElementById('pongGameOver').style.display = 'none';
    
    // Update score indicator box
    const scoreIndicator = document.getElementById('pongScoreIndicator');
    if (scoreIndicator) {
        scoreIndicator.textContent = `Player: ${playerScore} | Computer: ${computerScore} | First to ${maxScore} wins!`;
    }
}

function pongKeyDown(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!pongGameRunning) {
            restartPong();
        }
    }
    keys[e.code] = true;
}

function pongKeyUp(e) {
    keys[e.code] = false;
}

function updatePongTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    const isRainbow = document.body.classList.contains('rainbow-theme');
    
    // Set canvas background color directly on the canvas element (only if canvas exists)
    if (pongCanvas) {
        if (isRainbow) {
            pongCanvas.style.backgroundColor = '#f0f0f0'; // Light grey for rainbow theme
        } else if (isDark) {
            pongCanvas.style.backgroundColor = '#1a1a2e';
        } else {
            pongCanvas.style.backgroundColor = '#f5f5f5'; // Off-white for light theme
        }
    }
}

// Function to apply current theme to popup elements
function applyThemeToElement(element) {
    // Remove all theme classes first
    element.classList.remove('light-theme-overlay', 'dark-theme-overlay', 'rainbow-theme-overlay');
    
    // Add the appropriate theme class
    if (document.body.classList.contains('dark-theme')) {
        element.classList.add('dark-theme-overlay');
    } else if (document.body.classList.contains('rainbow-theme')) {
        element.classList.add('rainbow-theme-overlay');
    } else {
        element.classList.add('light-theme-overlay');
    }
}

function pongGameLoop() {
    if (!pongGameRunning) return;
    
    // Update theme and clear canvas
    updatePongTheme();
    const isDark = document.body.classList.contains('dark-theme');
    const isRainbow = document.body.classList.contains('rainbow-theme');
    
    // Set fill color for clearing
    if (isRainbow) {
        pongCtx.fillStyle = '#f0f0f0'; // Light grey for rainbow theme
    } else if (isDark) {
        pongCtx.fillStyle = '#1a1a2e';
    } else {
        pongCtx.fillStyle = '#f5f5f5'; // Off-white for light theme
    }
    pongCtx.fillRect(0, 0, pongCanvas.width, pongCanvas.height);
    
    // Only update game mechanics if game is active
    if (pongGameStarted) {
        // Update player paddle (left)
        if (keys['ArrowUp'] || keys['KeyW']) {
            paddle1.y = Math.max(0, paddle1.y - 6);
        }
        if (keys['ArrowDown'] || keys['KeyS']) {
            paddle1.y = Math.min(pongCanvas.height - paddle1.height, paddle1.y + 6);
        }
        
        // Update computer paddle (right) - AI
        let paddleCenter = paddle2.y + paddle2.height / 2;
        let ballCenter = ball.y + ball.height / 2;
        
        if (paddleCenter < ballCenter - 35) {
            paddle2.y = Math.min(pongCanvas.height - paddle2.height, paddle2.y + 4);
        } else if (paddleCenter > ballCenter + 35) {
            paddle2.y = Math.max(0, paddle2.y - 4);
        }
        
        // Update ball
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Ball collision with top and bottom walls
        if (ball.y <= 0 || ball.y + ball.height >= pongCanvas.height) {
            ball.dy = -ball.dy;
        }
        
        // Ball collision with paddles
        if (ball.x <= paddle1.x + paddle1.width && 
            ball.y + ball.height >= paddle1.y && 
            ball.y <= paddle1.y + paddle1.height) {
            ball.dx = -ball.dx;
            ball.x = paddle1.x + paddle1.width;
            
            // Add some angle based on where it hits the paddle
            let hitPos = (ball.y + ball.height / 2) - (paddle1.y + paddle1.height / 2);
            ball.dy = hitPos * 0.1;
        }
        
        if (ball.x + ball.width >= paddle2.x && 
            ball.y + ball.height >= paddle2.y && 
            ball.y <= paddle2.y + paddle2.height) {
            ball.dx = -ball.dx;
            ball.x = paddle2.x - ball.width;
            
            // Add some angle based on where it hits the paddle
            let hitPos = (ball.y + ball.height / 2) - (paddle2.y + paddle2.height / 2);
            ball.dy = hitPos * 0.1;
        }
        
        // Score when ball goes off screen
        if (ball.x < 0) {
            computerScore++;
            document.getElementById('computerScore').textContent = computerScore;
            
            // Update score indicator box
            const scoreIndicator = document.getElementById('pongScoreIndicator');
            if (scoreIndicator) {
                scoreIndicator.textContent = `Player: ${playerScore} | Computer: ${computerScore} | First to ${maxScore} wins!`;
            }
            resetBall();
        } else if (ball.x > pongCanvas.width) {
            playerScore++;
            document.getElementById('playerScore').textContent = playerScore;
            
            // Update score indicator box
            const scoreIndicator = document.getElementById('pongScoreIndicator');
            if (scoreIndicator) {
                scoreIndicator.textContent = `Player: ${playerScore} | Computer: ${computerScore} | First to ${maxScore} wins!`;
            }
            resetBall();
        }
        
        // Check for game over
        if (playerScore >= maxScore || computerScore >= maxScore) {
            gameOverPong();
            // Don't return - let the loop continue for visuals
        }
    }
    
    // Draw everything
    drawPong();
    
    pongAnimationId = requestAnimationFrame(pongGameLoop);
}

function resetBall() {
    ball.x = pongCanvas.width / 2 - ball.width / 2;
    ball.y = pongCanvas.height / 2 - ball.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
    ball.dy = (Math.random() - 0.5) * 6;
}

function drawPong() {
    // Set drawing color based on theme
    const isDark = document.body.classList.contains('dark-theme');
    const isRainbow = document.body.classList.contains('rainbow-theme');
    
    if (isRainbow) {
        pongCtx.fillStyle = '#333'; // Dark grey for paddles/ball on light background
    } else if (isDark) {
        pongCtx.fillStyle = '#fff'; // White for dark theme
    } else {
        pongCtx.fillStyle = '#2c3e50'; // Dark blue-grey for light theme
    }
    
    // Draw paddles
    pongCtx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    pongCtx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
    
    // Draw ball
    pongCtx.fillRect(ball.x, ball.y, ball.width, ball.height);
    
    // Draw center line
    pongCtx.setLineDash([5, 15]);
    pongCtx.beginPath();
    pongCtx.moveTo(pongCanvas.width / 2, 0);
    pongCtx.lineTo(pongCanvas.width / 2, pongCanvas.height);
    pongCtx.strokeStyle = pongCtx.fillStyle;
    pongCtx.stroke();
    pongCtx.setLineDash([]);
}

function gameOverPong() {
    pongGameStarted = false; // Stop game mechanics but keep loop running for visuals
    
    let winner = playerScore >= maxScore ? 'You Win!' : 'Computer Wins!';
    let resultMessage = `Final Score - You: ${playerScore}, Computer: ${computerScore}`;
    
    document.getElementById('pongWinner').textContent = winner;
    document.getElementById('pongResult').textContent = resultMessage;
    
    // Apply current theme to game over screen before showing it
    const gameOverScreen = document.getElementById('pongGameOver');
    if (gameOverScreen) {
        applyThemeToElement(gameOverScreen);
    }
    
    document.getElementById('pongGameOver').style.display = 'block';
}

function restartPong() {
    resetPong();
    pongGameRunning = true;
    pongGameStarted = true; // Restart game mechanics
    pongGameLoop();
}

function stopPong() {
    pongGameRunning = false;
    if (pongAnimationId) {
        cancelAnimationFrame(pongAnimationId);
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', pongKeyDown);
    document.removeEventListener('keyup', pongKeyUp);
}

// Make function available globally for theme switching
window.applyThemeToElement = applyThemeToElement;

// Make theme update function available globally
window.updatePongTheme = updatePongTheme;
