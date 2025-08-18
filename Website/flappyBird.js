// Flappy Bird Game
let flappyCanvas, flappyCtx;
let bird = { x: 50, y: 250, width: 25, height: 20, velocity: 0, gravity: 0.5, jump: -9 };
let pipes = [];
let flappyScore = 0;
let flappyHighScore = localStorage.getItem('flappyHighScore') || 0;
let flappyGameRunning = false;
let flappyGameStarted = false; // New flag to track if game has started
let flappyAnimationId;
let pipeWidth = 60;
let pipeGap = 160;
let pipeSpeed = 1.8;
let clouds = [];

function startFlappyBirdGame() {
    // Hide menu and show game
    document.getElementById('gamesMenu').style.display = 'none';
    document.querySelector('#games h1').style.display = 'none';
    document.getElementById('flappyBirdContainer').style.display = 'block';
    
    // Initialize canvas
    flappyCanvas = document.getElementById('flappyBirdCanvas');
    flappyCtx = flappyCanvas.getContext('2d');
    
    // Update theme colors
    updateFlappyTheme();
    
    // Reset game state
    resetFlappyBird();
    
    // Update high score display
    document.getElementById('flappyHighScore').textContent = flappyHighScore;
    
    // Set up the game but don't start it yet
    flappyGameRunning = true;
    flappyGameStarted = false; // Game is loaded but not started
    
    // Start the initial display loop (shows static scene)
    flappyGameLoop();
    
    // Add event listeners
    document.addEventListener('keydown', flappyKeyHandler);
    flappyCanvas.addEventListener('click', flappyJump);
}

function resetFlappyBird() {
    bird = { x: 50, y: 250, width: 25, height: 20, velocity: 0, gravity: 0.5, jump: -9 };
    pipes = [];
    clouds = [];
    flappyScore = 0;
    flappyGameStarted = false; // Reset the started flag
    document.getElementById('flappyBirdGameOver').style.display = 'none';
    
    // Update score indicator box
    const scoreIndicator = document.getElementById('flappyScoreIndicator');
    if (scoreIndicator) {
        scoreIndicator.textContent = `Score: ${flappyScore}`;
    }
    
    // Add initial pipes
    for (let i = 0; i < 3; i++) {
        pipes.push({
            x: 350 + i * 180,
            height: Math.random() * 120 + 60,
            passed: false
        });
    }
    
    // Add clouds for background
    for (let i = 0; i < 4; i++) {
        clouds.push({
            x: Math.random() * 500,
            y: Math.random() * 150 + 30,
            size: Math.random() * 25 + 15,
            speed: Math.random() * 0.3 + 0.1
        });
    }
}

function flappyKeyHandler(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        if (flappyGameRunning && !flappyGameStarted) {
            // Start the game on first space press
            flappyGameStarted = true;
            flappyJump(); // Also make the bird jump to start
        } else if (flappyGameRunning && flappyGameStarted) {
            // Normal jump during gameplay
            flappyJump();
        } else {
            // Restart game if it's over
            restartFlappyBird();
        }
    }
}

function flappyJump() {
    if (flappyGameRunning && flappyGameStarted) {
        bird.velocity = bird.jump;
    }
}

function updateFlappyTheme() {
    const isDark = document.body.classList.contains('dark-theme');
    const isRainbow = document.body.classList.contains('rainbow-theme');
    
    // Set canvas background color directly on the canvas element
    if (isRainbow) {
        flappyCanvas.style.backgroundColor = '#87CEEB'; // Sky blue for rainbow theme
    } else if (isDark) {
        flappyCanvas.style.backgroundColor = '#1a1a2e';
    } else {
        flappyCanvas.style.backgroundColor = '#87CEEB';
    }
}

function flappyGameLoop() {
    if (!flappyGameRunning) return;
    
    updateFlappyTheme();
    
    // Draw gradient background
    let gradient = flappyCtx.createLinearGradient(0, 0, 0, flappyCanvas.height);
    const isDark = document.body.classList.contains('dark-theme');
    const isRainbow = document.body.classList.contains('rainbow-theme');
    
    if (isRainbow) {
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98D8E8');
    } else if (isDark) {
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
    } else {
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98D8E8');
    }
    
    flappyCtx.fillStyle = gradient;
    flappyCtx.fillRect(0, 0, flappyCanvas.width, flappyCanvas.height);
    
    // Draw rainbow if rainbow theme is active
    if (isRainbow) {
        drawRainbow();
    }
    
    // Update and draw clouds (always animate clouds)
    flappyCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let cloud of clouds) {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.size < 0) {
            cloud.x = flappyCanvas.width + cloud.size;
            cloud.y = Math.random() * 200 + 50;
        }
        
        // Draw cloud (simple circles)
        flappyCtx.beginPath();
        flappyCtx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        flappyCtx.arc(cloud.x + cloud.size * 0.5, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
        flappyCtx.arc(cloud.x + cloud.size, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
        flappyCtx.fill();
    }
    
    // Only update bird and pipes if game has started
    if (flappyGameStarted) {
        // Update bird
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Update pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= pipeSpeed;
            
            // Remove off-screen pipes
            if (pipes[i].x + pipeWidth < 0) {
                pipes.splice(i, 1);
            }
            
            // Check for scoring
            if (!pipes[i].passed && pipes[i].x + pipeWidth < bird.x) {
                pipes[i].passed = true;
                flappyScore++;
                
                // Update score indicator box
                const scoreIndicator = document.getElementById('flappyScoreIndicator');
                if (scoreIndicator) {
                    scoreIndicator.textContent = `Score: ${flappyScore}`;
                }
            }
        }
        
        // Add new pipes
        if (pipes.length === 0 || pipes[pipes.length - 1].x < flappyCanvas.width - 180) {
            pipes.push({
                x: flappyCanvas.width,
                height: Math.random() * 120 + 60,
                passed: false
            });
        }
    }
    
    // Draw pipes with gradient and caps
    for (let pipe of pipes) {
        // Pipe gradient
        let pipeGradient = flappyCtx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
        pipeGradient.addColorStop(0, '#228B22');
        pipeGradient.addColorStop(0.5, '#32CD32');
        pipeGradient.addColorStop(1, '#228B22');
        
        flappyCtx.fillStyle = pipeGradient;
        
        // Top pipe
        flappyCtx.fillRect(pipe.x, 0, pipeWidth, pipe.height);
        // Top pipe cap
        flappyCtx.fillRect(pipe.x - 5, pipe.height - 20, pipeWidth + 10, 20);
        
        // Bottom pipe
        flappyCtx.fillRect(pipe.x, pipe.height + pipeGap, pipeWidth, flappyCanvas.height - pipe.height - pipeGap);
        // Bottom pipe cap
        flappyCtx.fillRect(pipe.x - 5, pipe.height + pipeGap, pipeWidth + 10, 20);
        
        // Pipe highlights
        flappyCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        flappyCtx.fillRect(pipe.x + 5, 0, 3, pipe.height);
        flappyCtx.fillRect(pipe.x + 5, pipe.height + pipeGap, 3, flappyCanvas.height - pipe.height - pipeGap);
    }
    
    // Draw bird with more detail
    drawBird();
    
    // Draw "Press Space to Start" message if game hasn't started yet
    if (!flappyGameStarted) {
        drawStartMessage();
    }
    
    // Only check collisions if game has started
    if (flappyGameStarted) {
        // Check collisions
        if (bird.y <= 0 || bird.y + bird.height >= flappyCanvas.height) {
            gameOverFlappy();
            return;
        }
        
        for (let pipe of pipes) {
            if (bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x) {
                if (bird.y < pipe.height || bird.y + bird.height > pipe.height + pipeGap) {
                    gameOverFlappy();
                    return;
                }
            }
        }
    }
    
    flappyAnimationId = requestAnimationFrame(flappyGameLoop);
}

function drawRainbow() {
    // Rainbow colors in order
    const rainbowColors = [
        '#FF0000', // Red
        '#FF7F00', // Orange
        '#FFFF00', // Yellow
        '#00FF00', // Green
        '#0000FF', // Blue
        '#4B0082', // Indigo
        '#9400D3'  // Violet
    ];
    
    // Rainbow properties
    const centerX = flappyCanvas.width / 2;
    const centerY = flappyCanvas.height + 50; // Start below canvas for arc effect
    const baseRadius = 220;
    const strokeWidth = 12;
    
    // Set up for drawing arcs
    flappyCtx.lineWidth = strokeWidth;
    flappyCtx.lineCap = 'round';
    flappyCtx.globalAlpha = 0.7; // Make rainbow semi-transparent
    
    // Draw each color band of the rainbow
    for (let i = 0; i < rainbowColors.length; i++) {
        flappyCtx.strokeStyle = rainbowColors[i];
        flappyCtx.beginPath();
        flappyCtx.arc(centerX, centerY, baseRadius - (i * strokeWidth), Math.PI, 0, false);
        flappyCtx.stroke();
    }
    
    // Reset alpha for other drawings
    flappyCtx.globalAlpha = 1.0;
}

function drawStartMessage() {
    // Set up text styling
    flappyCtx.save();
    flappyCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    flappyCtx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    flappyCtx.lineWidth = 3;
    flappyCtx.font = 'bold 24px Arial';
    flappyCtx.textAlign = 'center';
    flappyCtx.textBaseline = 'middle';
    
    // Position the message
    const centerX = flappyCanvas.width / 2;
    const centerY = flappyCanvas.height / 2;
    
    // Draw background box for better readability
    const textWidth = flappyCtx.measureText('Press SPACE to Start').width;
    const padding = 20;
    flappyCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    flappyCtx.fillRect(centerX - textWidth/2 - padding, centerY - 20, textWidth + padding*2, 40);
    
    // Draw text with outline
    flappyCtx.strokeText('Press SPACE to Start', centerX, centerY);
    flappyCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    flappyCtx.fillText('Press SPACE to Start', centerX, centerY);
    
    flappyCtx.restore();
}

function drawBird() {
    // Bird body (yellow)
    flappyCtx.fillStyle = '#FFD700';
    flappyCtx.beginPath();
    flappyCtx.ellipse(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2, bird.height/2, 0, 0, Math.PI * 2);
    flappyCtx.fill();
    
    // Bird wing (orange)
    flappyCtx.fillStyle = '#FF8C00';
    flappyCtx.beginPath();
    flappyCtx.ellipse(bird.x + bird.width/2 + 2, bird.y + bird.height/2, bird.width/3, bird.height/3, 0, 0, Math.PI * 2);
    flappyCtx.fill();
    
    // Bird beak (orange triangle)
    flappyCtx.fillStyle = '#FF8C00';
    flappyCtx.beginPath();
    flappyCtx.moveTo(bird.x + bird.width, bird.y + bird.height/2);
    flappyCtx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 - 3);
    flappyCtx.lineTo(bird.x + bird.width + 8, bird.y + bird.height/2 + 3);
    flappyCtx.closePath();
    flappyCtx.fill();
    
    // Bird eye (white circle with black dot)
    flappyCtx.fillStyle = 'white';
    flappyCtx.beginPath();
    flappyCtx.arc(bird.x + bird.width/2 + 5, bird.y + bird.height/2 - 3, 4, 0, Math.PI * 2);
    flappyCtx.fill();
    
    flappyCtx.fillStyle = 'black';
    flappyCtx.beginPath();
    flappyCtx.arc(bird.x + bird.width/2 + 6, bird.y + bird.height/2 - 3, 2, 0, Math.PI * 2);
    flappyCtx.fill();
}

function gameOverFlappy() {
    flappyGameRunning = false;
    
    // Check for high score
    const isNewHighScore = flappyScore > flappyHighScore;
    
    // Update high score
    if (isNewHighScore) {
        flappyHighScore = flappyScore;
        localStorage.setItem('flappyHighScore', flappyHighScore);
        document.getElementById('flappyHighScore').textContent = flappyHighScore;
    }
    
    // Show game over screen with appropriate message
    document.getElementById('finalFlappyScore').textContent = flappyScore;
    
    // Show high score message if applicable
    const highScoreMessage = document.getElementById('flappyHighScoreMessage');
    if (highScoreMessage) {
        highScoreMessage.style.display = isNewHighScore ? 'block' : 'none';
    }
    
    document.getElementById('flappyBirdGameOver').style.display = 'block';
}

function restartFlappyBird() {
    resetFlappyBird();
    flappyGameRunning = true;
    flappyGameStarted = false; // Reset to wait for space press again
    flappyGameLoop();
}

function stopFlappyBird() {
    flappyGameRunning = false;
    
    // Cancel animation frame
    if (flappyAnimationId) {
        cancelAnimationFrame(flappyAnimationId);
        flappyAnimationId = null;
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', flappyKeyHandler);
    if (flappyCanvas) {
        flappyCanvas.removeEventListener('click', flappyJump);
    }
    
    // Hide game over screen if showing
    document.getElementById('flappyBirdGameOver').style.display = 'none';
}
