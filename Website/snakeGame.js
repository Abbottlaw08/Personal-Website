// Game variables
let snake = [];
let food = {};
let direction = 'right';
let gameLoop;
let score = 0;
let gameStarted = false;
let gameSpeed = 100; // Default speed (can be adjusted with difficulty)

// Canvas setup
const canvas = document.getElementById('snakeGame');
const ctx = canvas.getContext('2d');
const gridSize = 25; // Grid is less dense now
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// Colors
const lightThemeColors = {
    background: 'rgba(255, 255, 255, 0.95)',
    snake: {
        body: '#4CAF50',
        head: '#2E7D32',
        outline: '#81C784'
    },
    food: '#FF5252',
    gridLines: '#dcdcdc', // Solid light gray for light mode
    text: '#2c3e50'
};

const darkThemeColors = {
    background: 'rgba(10, 10, 10, 0.95)',
    snake: {
        body: '#4CAF50',
        head: '#2E7D32',
        outline: '#81C784'
    },
    food: '#FF5252',
    gridLines: '#333333',
    text: '#FFFFFF'
};

let colors = lightThemeColors; // Default to light theme colors
let isRainbowTheme = false; // Track rainbow theme state

// Function to generate rainbow color based on time
function getRainbowColor() {
    const time = Date.now() * 0.005; // Slow down the color cycling
    const r = Math.sin(time) * 127 + 128;
    const g = Math.sin(time + 2) * 127 + 128;
    const b = Math.sin(time + 4) * 127 + 128;
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
}


// Initialize game
function initGame() {
    // Create initial snake
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    
    direction = 'right';
    score = 0;
    createFood();
    drawGame();
}

// Create food at random position
function createFood() {
    food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
    };
    
    // Make sure food doesn't appear on snake
    while (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        food = {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight)
        };
    }
}

// Draw game elements
function drawGame() {
    // Clear canvas
    ctx.fillStyle = isRainbowTheme ? 'white' : colors.background; // Solid white background for rainbow theme
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = isRainbowTheme ? '#ffb6c1' : colors.gridLines; // Solid light pink for rainbow theme
    ctx.lineWidth = 0.5;
    
    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        if (isRainbowTheme) {
            // Create pastel rainbow effect - each segment gets a different hue based on its position
            const hue = (index * 360 / snake.length + Date.now() * 0.1) % 360;
            const saturation = 45; // Much lower saturation for pastel effect
            const lightness = index === 0 ? 75 : 70; // Higher lightness for pastel colors
            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        } else {
            // Normal theme colors
            ctx.fillStyle = index === 0 ? colors.snake.head : colors.snake.body;
        }
        
        // Draw segment with rounded corners
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        const size = gridSize - 2; // Slightly smaller than grid for spacing
        
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, size, size, 5);
        ctx.fill();
        
        // Add highlight effect
        ctx.strokeStyle = isRainbowTheme ? 'white' : colors.snake.outline;
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw food with glow effect
    ctx.fillStyle = colors.food;
    ctx.shadowColor = colors.food;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize/2,
        food.y * gridSize + gridSize/2,
        gridSize/2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw score in the indicator box
    const scoreIndicator = document.getElementById('snakeScoreIndicator');
    if (scoreIndicator) {
        scoreIndicator.textContent = `Score: ${score}`;
    }
}

// Update game state
function updateGame() {
    // Create new head position
    const head = { ...snake[0] };
    
    switch(direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Check for collisions with walls
    if (head.x < 0) head.x = gridWidth - 1;
    if (head.x >= gridWidth) head.x = 0;
    if (head.y < 0) head.y = gridHeight - 1;
    if (head.y >= gridHeight) head.y = 0;

    // Check for collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    // Add new head
    snake.unshift(head);

    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        createFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }

    drawGame();
}

// Game over handling
function gameOver() {
    clearInterval(gameLoop);
    gameStarted = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
}

// Reset game
function resetSnakeGame() {
    document.getElementById('gameOver').style.display = 'none';
    initGame();
    startGame();
}

// Start game
function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        gameLoop = setInterval(updateGame, gameSpeed);
    }
}

function updateSnakeTheme() {
    isRainbowTheme = document.body.classList.contains('rainbow-theme');
    
    if (document.body.classList.contains('dark-theme')) {
        colors = darkThemeColors;
    } else {
        colors = lightThemeColors;
    }
    
    // Redraw the game with the new colors if the game has started
    if (gameStarted) {
        drawGame();
    }
}

// Function to be called from the HTML button
function startSnakeGame() {
    document.getElementById('gamesMenu').style.display = 'none';
    document.getElementById('gamesTitle').style.display = 'none';
    document.getElementById('snakeGameContainer').style.display = 'flex';
    
    updateSnakeTheme(); // Set initial theme

    initGame();
    addSnakeKeyListener(); // Add the keyboard event listener
    startGame();
}

// Function to return to menu
function stopSnakeGame() {
    if (gameStarted) {
        clearInterval(gameLoop);
        gameStarted = false;
    }
    removeSnakeKeyListener();
}

// Function to return to menu, called by the back button
function returnToMenuFromSnake() {
    stopSnakeGame();
    document.getElementById('snakeGameContainer').style.display = 'none';
    document.getElementById('gamesTitle').style.display = 'block';
    document.getElementById('gamesMenu').style.display = 'grid';
}

// Set difficulty
function setDifficulty(level) {
    switch(level) {
        case 'easy':
            gameSpeed = 120;
            break;
        case 'medium':
            gameSpeed = 100;
            break;
        case 'hard':
            gameSpeed = 80;
            break;
    }
    
    if (gameStarted) {
        clearInterval(gameLoop);
        gameLoop = setInterval(updateGame, gameSpeed);
    }
}

// Handle keyboard input
const snakeKeyHandler = (event) => {
    // Check for Enter key to restart game when it's over
    if (event.key === 'Enter' && !gameStarted) {
        resetSnakeGame();
        return;
    }

    if (!gameStarted) {
        startGame();
    }

    switch(event.key) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
    }
};

// Add the event listener when game starts
function addSnakeKeyListener() {
    document.addEventListener('keydown', snakeKeyHandler);
}

// Remove the event listener when game stops
function removeSnakeKeyListener() {
    document.removeEventListener('keydown', snakeKeyHandler);
}

// Start the game
initGame();
