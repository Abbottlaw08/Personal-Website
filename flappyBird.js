// Flappy Bird Game
let flappyCanvas, flappyCtx;
let bird = { x: 50, y: 250, width: 25, height: 20, velocity: 0, gravity: 0.5, jump: -9 };
let pipes = [];
let flappyScore = 0;
let flappyHighScore = localStorage.getItem('flappyHighScore') || 0;
let flappyGameRunning = false;
let flappyGameStarted = false; // New flag to track if game has started
let flappyGameOver = false; // Flag to prevent multiple game over calls
let flappyAnimationId;
let pipeWidth = 60;
let pipeGap = 160;
let pipeSpeed = 1.8;
let clouds = [];

function startFlappyBirdGame() {
    // Hide menu and show game
    hideExpandableSections();
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
    flappyAnimationId = requestAnimationFrame(flappyGameLoop);
    
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
    flappyGameOver = false; // Reset the game over flag
    document.getElementById('flappyBirdGameOver').style.display = 'none';
    
    // Update score indicator box
    const scoreIndicator = document.getElementById('flappyCurrentScore');
    if (scoreIndicator) {
        scoreIndicator.textContent = flappyScore;
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
        if (flappyGameRunning && !flappyGameStarted && !flappyGameOver) {
            // Start the game on first space press
            flappyGameStarted = true;
            flappyJump(); // Also make the bird jump to start
        } else if (flappyGameRunning && flappyGameStarted && !flappyGameOver) {
            // Normal jump during gameplay
            flappyJump();
        } else if (flappyGameOver) {
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
    
    // Set canvas background color directly on the canvas element (only if canvas exists)
    if (flappyCanvas) {
        if (isRainbow) {
            flappyCanvas.style.backgroundColor = '#87CEEB'; // Sky blue for rainbow theme
        } else if (isDark) {
            flappyCanvas.style.backgroundColor = '#1a1a2e';
        } else {
            flappyCanvas.style.backgroundColor = '#87CEEB';
        }
    }
    
    // Set theme-based pipe colors
    if (isRainbow) {
        // Rainbow theme: bright colorful pipes
        window.flappyPipeColors = {
            start: '#FF69B4',  // Hot pink
            middle: '#FFB6C1', // Light pink
            end: '#FF69B4',    // Hot pink
            highlight: 'rgba(255, 255, 255, 0.4)'
        };
    } else if (isDark) {
        // Dark theme: darker pipes with blue accent
        window.flappyPipeColors = {
            start: '#2C3E50',  // Dark blue-gray
            middle: '#34495E', // Lighter blue-gray
            end: '#2C3E50',    // Dark blue-gray
            highlight: 'rgba(255, 255, 255, 0.2)'
        };
    } else {
        // Light theme: classic green pipes
        window.flappyPipeColors = {
            start: '#228B22',  // Forest green
            middle: '#32CD32', // Lime green
            end: '#228B22',    // Forest green
            highlight: 'rgba(255, 255, 255, 0.3)'
        };
    }
    
    // Apply theme to start screen popup
    const startScreen = document.getElementById('flappyBirdStart');
    const gameOverScreen = document.getElementById('flappyBirdGameOver');
    
    // Function to apply theme classes to popup elements
    function applyThemeToElement(element) {
        if (element) {
            // Remove existing theme classes
            element.classList.remove('light-theme-overlay', 'dark-theme-overlay', 'rainbow-theme-overlay');
            
            // Apply appropriate theme class
            if (isDark) {
                element.classList.add('dark-theme-overlay');
            } else if (isRainbow) {
                element.classList.add('rainbow-theme-overlay');
            } else {
                element.classList.add('light-theme-overlay');
            }
        }
    }
    
    // Only apply theme if elements exist
    if (startScreen) {
        applyThemeToElement(startScreen);
    }
    if (gameOverScreen) {
        applyThemeToElement(gameOverScreen);
    }
}

function flappyGameLoop() {
    if (!flappyGameRunning) return;
    
    if (!flappyCanvas || !flappyCtx) return;
    
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
        // Let cloud fully scroll off screen before wrapping (account for full cloud width)
        if (cloud.x + cloud.size * 2 < 0) {
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
                const scoreIndicator = document.getElementById('flappyCurrentScore');
                if (scoreIndicator) {
                    scoreIndicator.textContent = flappyScore;
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
        // Get current theme colors (fallback to green if not set)
        const pipeColors = window.flappyPipeColors || {
            start: '#228B22',
            middle: '#32CD32',
            end: '#228B22',
            highlight: 'rgba(255, 255, 255, 0.3)'
        };
        
        // Pipe gradient with theme colors
        let pipeGradient = flappyCtx.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
        pipeGradient.addColorStop(0, pipeColors.start);
        pipeGradient.addColorStop(0.5, pipeColors.middle);
        pipeGradient.addColorStop(1, pipeColors.end);
        
        flappyCtx.fillStyle = pipeGradient;
        
        // Top pipe
        flappyCtx.fillRect(pipe.x, 0, pipeWidth, pipe.height);
        // Top pipe cap
        flappyCtx.fillRect(pipe.x - 5, pipe.height - 20, pipeWidth + 10, 20);
        
        // Bottom pipe
        flappyCtx.fillRect(pipe.x, pipe.height + pipeGap, pipeWidth, flappyCanvas.height - pipe.height - pipeGap);
        // Bottom pipe cap
        flappyCtx.fillRect(pipe.x - 5, pipe.height + pipeGap, pipeWidth + 10, 20);
        
        // Pipe highlights with theme-appropriate opacity
        flappyCtx.fillStyle = pipeColors.highlight;
        flappyCtx.fillRect(pipe.x + 5, 0, 3, pipe.height);
        flappyCtx.fillRect(pipe.x + 5, pipe.height + pipeGap, 3, flappyCanvas.height - pipe.height - pipeGap);
    }
    
    // Draw bird with more detail
    drawBird();
    
    // Show/hide start screen based on game state
    if (!flappyGameStarted) {
        showStartScreen();
    } else {
        hideStartScreen();
    }

    // Only check collisions if game has started and is not over
    if (flappyGameStarted && !flappyGameOver) {
        // Check collisions
        if (bird.y <= 0 || bird.y + bird.height >= flappyCanvas.height) {
            gameOverFlappy();
            // Don't return - let the loop continue for visuals
        } else {
            // Only check pipe collisions if bird hasn't hit ground/ceiling
            for (let pipe of pipes) {
                if (bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x) {
                    if (bird.y < pipe.height || bird.y + bird.height > pipe.height + pipeGap) {
                        gameOverFlappy();
                        // Don't return - let the loop continue for visuals
                        break; // Exit the pipe collision loop
                    }
                }
            }
        }
    }
    
    // Continue the game loop for visuals even after game over
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

function showStartScreen() {
    const startScreen = document.getElementById('flappyBirdStart');
    if (startScreen) {
        startScreen.style.display = 'block';
    }
}

function hideStartScreen() {
    const startScreen = document.getElementById('flappyBirdStart');
    if (startScreen) {
        startScreen.style.display = 'none';
    }
}

function drawBird() {
    const isRainbowTheme = document.body.classList.contains('rainbow-theme');
    const isDarkTheme = document.body.classList.contains('dark-theme');
    
    // Define color schemes for each theme
    let bodyColor, wingColor, beakColor, eyeRimColor;
    
    if (isRainbowTheme) {
        bodyColor = '#FF69B4';    // Hot pink
        wingColor = '#9932CC';    // Dark orchid
        beakColor = '#FF1493';    // Deep pink
        eyeRimColor = '#8A2BE2';  // Blue violet
    } else if (isDarkTheme) {
        bodyColor = '#4169E1';    // Royal blue
        wingColor = '#1E90FF';    // Dodger blue
        beakColor = '#FFD700';    // Gold
        eyeRimColor = '#0000CD';  // Medium blue
    } else {
        bodyColor = '#FFD700';    // Gold
        wingColor = '#FF8C00';    // Dark orange
        beakColor = '#FF6347';    // Tomato
        eyeRimColor = '#FF4500';  // Orange red
    }
    
    // Bird body (more rounded, bird-like shape)
    flappyCtx.fillStyle = bodyColor;
    flappyCtx.beginPath();
    flappyCtx.arc(bird.x + bird.width/2, bird.y + bird.height/2, bird.width/2.2, 0, Math.PI * 2);
    flappyCtx.fill();
    
    // Bird head (slightly overlapping the body)
    flappyCtx.fillStyle = bodyColor;
    flappyCtx.beginPath();
    flappyCtx.arc(bird.x + bird.width/2 + 8, bird.y + bird.height/2 - 5, bird.width/3, 0, Math.PI * 2);
    flappyCtx.fill();
    
    // Wing (single wing visible from side view, animated)
    const wingFlap = Math.sin(Date.now() * 0.015) * 0.3;
    flappyCtx.fillStyle = wingColor;
    flappyCtx.beginPath();
    flappyCtx.ellipse(bird.x + bird.width/2 - 3, bird.y + bird.height/2 + 1, 
                     bird.width/2.5, bird.height/3.5, wingFlap - 0.2, 0, Math.PI * 2);
    flappyCtx.fill();
    
    // Wing tip detail
    flappyCtx.fillStyle = bodyColor;
    flappyCtx.beginPath();
    flappyCtx.ellipse(bird.x + bird.width/2 - 8, bird.y + bird.height/2 + 3, 
                     bird.width/6, bird.height/6, wingFlap - 0.2, 0, Math.PI * 2);
    flappyCtx.fill();
    
    // Bird beak (proper bird beak shape)
    flappyCtx.fillStyle = beakColor;
    flappyCtx.beginPath();
    flappyCtx.moveTo(bird.x + bird.width/2 + 15, bird.y + bird.height/2 - 5);
    flappyCtx.lineTo(bird.x + bird.width/2 + 25, bird.y + bird.height/2 - 3);
    flappyCtx.lineTo(bird.x + bird.width/2 + 15, bird.y + bird.height/2 - 1);
    flappyCtx.closePath();
    flappyCtx.fill();
    
    // Eye rim/outline
    flappyCtx.fillStyle = eyeRimColor;
    flappyCtx.beginPath();
    flappyCtx.arc(bird.x + bird.width/2 + 10, bird.y + bird.height/2 - 5, 7, 0, Math.PI * 2);
    flappyCtx.fill();
    
    // Eye white
    flappyCtx.fillStyle = '#FFFFFF';
    flappyCtx.beginPath();
    flappyCtx.arc(bird.x + bird.width/2 + 10, bird.y + bird.height/2 - 5, 5, 0, Math.PI * 2);
    flappyCtx.fill();
    
    // Eye pupil
    flappyCtx.fillStyle = '#000000';
    flappyCtx.beginPath();
    flappyCtx.arc(bird.x + bird.width/2 + 11, bird.y + bird.height/2 - 4, 2, 0, Math.PI * 2);
    flappyCtx.fill();
    
    // Eye shine
    flappyCtx.fillStyle = '#FFFFFF';
    flappyCtx.beginPath();
    flappyCtx.arc(bird.x + bird.width/2 + 12, bird.y + bird.height/2 - 5, 1, 0, Math.PI * 2);
    flappyCtx.fill();
    
    // Small tail feathers
    flappyCtx.fillStyle = wingColor;
    flappyCtx.beginPath();
    flappyCtx.ellipse(bird.x + bird.width/2 - 12, bird.y + bird.height/2 + 2, 4, 8, 0.5, 0, Math.PI * 2);
    flappyCtx.fill();
    
    flappyCtx.beginPath();
    flappyCtx.ellipse(bird.x + bird.width/2 - 10, bird.y + bird.height/2 + 5, 3, 6, 0.3, 0, Math.PI * 2);
    flappyCtx.fill();
    
    // Add special feminine features in rainbow theme only
    if (isRainbowTheme) {
        // Delicate eyelashes
        flappyCtx.strokeStyle = '#000000';
        flappyCtx.lineWidth = 1;
        flappyCtx.lineCap = 'round';
        
        // Top eyelashes
        flappyCtx.beginPath();
        flappyCtx.moveTo(bird.x + bird.width/2 + 8, bird.y + bird.height/2 - 10);
        flappyCtx.lineTo(bird.x + bird.width/2 + 7, bird.y + bird.height/2 - 12);
        flappyCtx.stroke();
        
        flappyCtx.beginPath();
        flappyCtx.moveTo(bird.x + bird.width/2 + 11, bird.y + bird.height/2 - 11);
        flappyCtx.lineTo(bird.x + bird.width/2 + 10, bird.y + bird.height/2 - 13);
        flappyCtx.stroke();
        
        flappyCtx.beginPath();
        flappyCtx.moveTo(bird.x + bird.width/2 + 14, bird.y + bird.height/2 - 10);
        flappyCtx.lineTo(bird.x + bird.width/2 + 14, bird.y + bird.height/2 - 12);
        flappyCtx.stroke();
        
        // Cute bow on head
        flappyCtx.fillStyle = '#FF1493';
        flappyCtx.beginPath();
        flappyCtx.ellipse(bird.x + bird.width/2 + 5, bird.y + bird.height/2 - 15, 3, 2, -0.3, 0, Math.PI * 2);
        flappyCtx.fill();
        
        flappyCtx.beginPath();
        flappyCtx.ellipse(bird.x + bird.width/2 + 11, bird.y + bird.height/2 - 15, 3, 2, 0.3, 0, Math.PI * 2);
        flappyCtx.fill();
        
        // Bow center
        flappyCtx.fillStyle = '#9932CC';
        flappyCtx.beginPath();
        flappyCtx.ellipse(bird.x + bird.width/2 + 8, bird.y + bird.height/2 - 15, 1.5, 2.5, 0, 0, Math.PI * 2);
        flappyCtx.fill();
    }
}

function gameOverFlappy() {
    flappyGameStarted = false; // Stop game mechanics but keep loop running for visuals
    flappyGameOver = true; // Set game over flag to prevent multiple calls
    
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
    
    // Apply current theme to game over screen before showing it
    const gameOverScreen = document.getElementById('flappyBirdGameOver');
    if (gameOverScreen) {
        // Use the global applyThemeToElement function to ensure it exists
        if (typeof window.applyThemeToElement === 'function') {
            window.applyThemeToElement(gameOverScreen);
        }
        gameOverScreen.style.display = 'block';
    }
}

// Function to redraw just the background (for use when game is paused/over)
function redrawFlappyBackground() {
    if (!flappyCanvas || !flappyCtx) return;
    
    console.log('Redrawing Flappy background');
    
    // Draw gradient background
    let gradient = flappyCtx.createLinearGradient(0, 0, 0, flappyCanvas.height);
    const isDark = document.body.classList.contains('dark-theme');
    const isRainbow = document.body.classList.contains('rainbow-theme');
    
    console.log('Background theme:', { isDark, isRainbow });
    
    if (isRainbow) {
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98D8E8');
        console.log('Using rainbow background');
    } else if (isDark) {
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        console.log('Using dark background');
    } else {
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98D8E8');
        console.log('Using light background');
    }
    
    flappyCtx.fillStyle = gradient;
    flappyCtx.fillRect(0, 0, flappyCanvas.width, flappyCanvas.height);
    
    // Draw rainbow if rainbow theme is active
    if (isRainbow) {
        drawRainbow();
    }
    
    // Redraw clouds in their last position
    if (clouds && clouds.length > 0) {
        flappyCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let cloud of clouds) {
            flappyCtx.beginPath();
            flappyCtx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
            flappyCtx.fill();
            
            flappyCtx.beginPath();
            flappyCtx.arc(cloud.x + cloud.size * 0.7, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
            flappyCtx.fill();
            
            flappyCtx.beginPath();
            flappyCtx.arc(cloud.x + cloud.size * 1.3, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
            flappyCtx.fill();
        }
    }
    
    // Note: Skipping pipe and bird redraw for now to avoid errors
    // The background update is most important for theme switching
}

function restartFlappyBird() {
    // Cancel any existing animation frame first
    if (flappyAnimationId) {
        cancelAnimationFrame(flappyAnimationId);
        flappyAnimationId = null;
    }
    
    resetFlappyBird();
    flappyGameRunning = true;
    flappyGameStarted = false; // Reset to wait for space press again
    flappyGameOver = false; // Reset game over flag
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

// Make function available globally for theme switching (use the one defined in updateFlappyTheme)
window.applyThemeToElement = function(element) {
    if (!element) {
        console.warn('applyThemeToElement called with null/undefined element');
        return;
    }
    
    try {
        // Remove existing theme classes
        element.classList.remove('light-theme-overlay', 'dark-theme-overlay', 'rainbow-theme-overlay');
        
        // Apply appropriate theme class
        const isDark = document.body.classList.contains('dark-theme');
        const isRainbow = document.body.classList.contains('rainbow-theme');
        
        if (isDark) {
            element.classList.add('dark-theme-overlay');
        } else if (isRainbow) {
            element.classList.add('rainbow-theme-overlay');
        } else {
            element.classList.add('light-theme-overlay');
        }
    } catch (error) {
        console.error('Error applying theme to element:', error, element);
    }
};

// Make theme update function available globally
window.updateFlappyTheme = updateFlappyTheme;
