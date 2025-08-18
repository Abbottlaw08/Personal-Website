function showSection(sectionId) {
    // Hide all main sections
    document.getElementById('about').style.display = 'none';
    document.getElementById('games').style.display = 'none';
    document.getElementById('projects').style.display = 'none';
    document.getElementById('social').style.display = 'none';

    // Hide the budget result box by default
    const budgetResult = document.getElementById('budgetResult');
    if (budgetResult) {
        budgetResult.style.display = 'none';
    }

    // Stop any running games when switching sections
    returnToMenu();

    // Show the requested section
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    }

    // If switching to the games section, ensure the menu is visible
    if (sectionId === 'games') {
        document.querySelector('#games h1').style.display = 'block';
        document.getElementById('gamesMenu').style.display = 'grid';
    }
    
    // If switching to the projects section, ensure the menu is visible
    if (sectionId === 'projects') {
        document.getElementById('projectsMenu').style.display = 'grid';
        document.getElementById('budgetTrackerContainer').style.display = 'none';
    }
}

function returnToMenu() {
    // Stop any running games first (with existence checks)
    if (typeof stopSnakeGame === 'function') {
        try {
            stopSnakeGame();
        } catch(e) {
            console.warn('Error stopping snake game:', e);
        }
    }
    if (typeof stopFlappyBird === 'function') {
        try {
            stopFlappyBird();
        } catch(e) {
            console.warn('Error stopping flappy bird:', e);
        }
    }
    if (typeof stopPong === 'function') {
        try {
            stopPong();
        } catch(e) {
            console.warn('Error stopping pong:', e);
        }
    }
    // For chess, which doesn't have a continuous loop
    const chessContainer = document.getElementById('chessGameContainer');
    if (chessContainer && chessContainer.style.display !== 'none') {
        // No specific stop function needed unless there are listeners to remove
    }

    // Hide all game containers
    const containers = [
        'snakeGameContainer',
        'chessGameContainer',
        'flappyBirdContainer',
        'pongContainer',
        'budgetTrackerContainer'
    ];
    
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
        }
    });
    
    // Show the main games menu if it exists
    const gamesH1 = document.querySelector('#games h1');
    const gamesMenu = document.getElementById('gamesMenu');
    if (gamesH1) gamesH1.style.display = 'block';
    if (gamesMenu) gamesMenu.style.display = 'grid';
    
    // Hide any game over screens that might be showing
    const gameOverScreens = [
        'gameOver', // Snake's game over screen
        'flappyBirdGameOver',
        'pongGameOver',
        'chessGameOver'
    ];
    
    gameOverScreens.forEach(screenId => {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.style.display = 'none';
        }
    });
    
    // Ensure the projects menu is handled correctly
    const projectsMenu = document.getElementById('projectsMenu');
    if (projectsMenu) {
        projectsMenu.style.display = 'grid';
    }
}
