// Initialize the game board and state
let chessBoard;
let currentTurn = 'white';
let selectedPiece = null;
let chessPieces = Array(8).fill(null).map(() => Array(8).fill(''));

// Chess piece Unicode values
const PIECES = {
    WHITE: {
        KING: '♔',
        QUEEN: '♕',
        ROOK: '♖',
        BISHOP: '♗',
        KNIGHT: '♘',
        PAWN: '♙'
    },
    BLACK: {
        KING: '♚',
        QUEEN: '♛',
        ROOK: '♜',
        BISHOP: '♝',
        KNIGHT: '♞',
        PAWN: '♟'
    }
};

function showChessGame() {
    hideExpandableSections();
    document.getElementById('chessGameContainer').style.display = 'flex';
    
    // Always get a fresh reference to the chess board and initialize it
    chessBoard = document.getElementById('chessBoard');
    if (chessBoard) {
        chessBoard.innerHTML = ''; // Clear any existing content
        initializeChessBoard();
        updateTurnIndicator();
    }
}

function restartChessGame() {
    // Hide the game over screen and remove the event listener
    const gameOverScreen = document.getElementById('chessGameOver');
    if (gameOverScreen) {
        gameOverScreen.style.display = 'none';
    }
    window.removeEventListener('keydown', handleChessEnter);


    chessPieces = Array(8).fill(null).map(() => Array(8).fill(''));
    currentTurn = 'white';
    selectedPiece = null;
    initializePieces();
    updateBoard();
    updateTurnIndicator();
}

// Initialize the chess board
function initializeChessBoard() {
    // Create board squares
    chessBoard.innerHTML = ''; // Clear existing squares
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `chess-square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            
            // Add position data attributes for easy reference
            square.dataset.row = row;
            square.dataset.col = col;

            square.addEventListener('click', () => handleSquareClick(row, col));
            chessBoard.appendChild(square);
        }
    }

    // Initialize pieces
    initializePieces();
    updateBoard();
}

function initializePieces() {
    // Initialize black pieces
    chessPieces[0] = [
        PIECES.BLACK.ROOK, PIECES.BLACK.KNIGHT, PIECES.BLACK.BISHOP, PIECES.BLACK.QUEEN,
        PIECES.BLACK.KING, PIECES.BLACK.BISHOP, PIECES.BLACK.KNIGHT, PIECES.BLACK.ROOK
    ];
    chessPieces[1] = Array(8).fill(PIECES.BLACK.PAWN);

    // Initialize white pieces
    chessPieces[6] = Array(8).fill(PIECES.WHITE.PAWN);
    chessPieces[7] = [
        PIECES.WHITE.ROOK, PIECES.WHITE.KNIGHT, PIECES.WHITE.BISHOP, PIECES.WHITE.QUEEN,
        PIECES.WHITE.KING, PIECES.WHITE.BISHOP, PIECES.WHITE.KNIGHT, PIECES.WHITE.ROOK
    ];
}

function updateTurnIndicator() {
    const turnIndicator = document.getElementById('turnIndicator');
    if (turnIndicator) {
        const currentPlayer = currentTurn === 'white' ? 'White' : 'Black';
        const inCheck = isInCheck(currentTurn === 'white');
        turnIndicator.textContent = `${currentPlayer}${inCheck ? ' - IN CHECK!' : ''}`;
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

// Function to update chess theme (for any dynamic elements)
function updateChessTheme() {
    // Chess board styling is handled by CSS, but we can update any dynamic elements here
    const turnIndicator = document.getElementById('turnIndicator');
    if (turnIndicator) {
        // Turn indicator styling is handled by CSS theme files
        // This function exists for consistency and future dynamic elements
    }
}

function updateBoard() {
    updateTurnIndicator();
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = chessBoard.children[row * 8 + col];
            const piece = chessPieces[row][col];
            square.textContent = piece;

            // Clear previous piece classes
            square.classList.remove('chess-piece-white', 'chess-piece-black');

            // Add appropriate piece class
            if (piece) {
                if (isWhitePiece(piece)) {
                    square.classList.add('chess-piece-white');
                } else {
                    square.classList.add('chess-piece-black');
                }
            }
        }
    }
}

function handleSquareClick(row, col) {
    const piece = chessPieces[row][col];

    // If clicking on a piece of the current player's color
    if (piece && isCurrentPlayersPiece(piece)) {
        // Clear previous highlights before showing new ones
        clearHighlights();
        // Select the new piece regardless of previous selection
        selectedPiece = { row, col };
        highlightValidMoves(row, col);
    } else if (selectedPiece) {
        // Try to move the selected piece
        if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
            movePiece(selectedPiece.row, selectedPiece.col, row, col);
            currentTurn = currentTurn === 'white' ? 'black' : 'white';
            selectedPiece = null;
            updateTurnIndicator();
        } else {
            // If clicking on an invalid square, clear selection and highlights
            clearHighlights();
            selectedPiece = null;
        }
    } else {
        // Clicking on empty square or opponent's piece with no selection
        clearHighlights();
        selectedPiece = null;
    }
}

function isCurrentPlayersPiece(piece) {
    if (currentTurn === 'white') {
        return piece.charCodeAt(0) >= 0x2654 && piece.charCodeAt(0) <= 0x2659;
    } else {
        return piece.charCodeAt(0) >= 0x265A && piece.charCodeAt(0) <= 0x265F;
    }
}

function clearHighlights() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = chessBoard.children[row * 8 + col];
            // Remove all special classes while preserving piece color classes
            const isWhitePiece = square.classList.contains('chess-piece-white');
            const isBlackPiece = square.classList.contains('chess-piece-black');
            
            // Reset to base classes
            square.className = `chess-square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            
            // Restore piece color classes if they existed
            if (isWhitePiece) square.classList.add('chess-piece-white');
            if (isBlackPiece) square.classList.add('chess-piece-black');
        }
    }
}

function movePiece(fromRow, fromCol, toRow, toCol) {
    chessPieces[toRow][toCol] = chessPieces[fromRow][fromCol];
    chessPieces[fromRow][fromCol] = '';
    clearHighlights();
    updateBoard();

    // Add a subtle animation to the moved piece
    const square = chessBoard.children[toRow * 8 + toCol];
    square.style.transform = 'scale(1.1)';
    setTimeout(() => {
        square.style.transform = '';
    }, 200);

    // Check for game over
    checkGameOver();
}

function checkGameOver() {
    // Check if current player has any legal moves
    const currentPlayerIsWhite = currentTurn === 'white';
    let hasLegalMoves = false;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = chessPieces[row][col];
            if (piece && isWhitePiece(piece) === currentPlayerIsWhite) {
                const validMoves = getValidMoves(row, col);
                if (validMoves.length > 0) {
                    hasLegalMoves = true;
                    break;
                }
            }
        }
        if (hasLegalMoves) break;
    }
    
    if (!hasLegalMoves) {
        const inCheck = isInCheck(currentPlayerIsWhite);
        if (inCheck) {
            // Checkmate - opponent wins
            endChessGame(currentPlayerIsWhite ? 'Black' : 'White');
        } else {
            // Stalemate - draw
            endChessGame('Draw');
        }
    }
}

function endChessGame(winner) {
    const gameOverScreen = document.getElementById('chessGameOver');
    const winnerText = document.getElementById('chessWinner');
    
    if (gameOverScreen && winnerText) {
        if (winner === 'Draw') {
            winnerText.textContent = 'Stalemate - Draw!';
        } else {
            winnerText.textContent = `${winner} Wins!`;
        }
        
        // Apply current theme to game over screen before showing it
        applyThemeToElement(gameOverScreen);
        
        gameOverScreen.style.display = 'block';
        window.addEventListener('keydown', handleChessEnter);
    }
}

function handleChessEnter(event) {
    if (event.key === 'Enter') {
        const gameOverScreen = document.getElementById('chessGameOver');
        if (gameOverScreen && gameOverScreen.style.display === 'block') {
            restartChessGame();
        }
    }
}

function highlightValidMoves(row, col) {
    clearHighlights(); // Clear any existing highlights first
    const validMoves = getValidMoves(row, col);
    
    // Highlight selected piece
    const selectedSquare = chessBoard.children[row * 8 + col];
    selectedSquare.classList.add('selected');

    validMoves.forEach(([r, c]) => {
        const square = chessBoard.children[r * 8 + c];
        if (chessPieces[r][c]) {
            // Highlight captures
            square.classList.add('valid-move');
            square.classList.add('capture');
        } else {
            // Highlight empty squares
            square.classList.add('valid-move');
        }
    });
}

function getValidMoves(row, col) {
    const piece = chessPieces[row][col];
    const moves = [];
    
    if (isPawn(piece)) {
        getPawnMoves(row, col, moves);
    } else if (isRook(piece)) {
        getRookMoves(row, col, moves);
    } else if (isBishop(piece)) {
        getBishopMoves(row, col, moves);
    } else if (isQueen(piece)) {
        getRookMoves(row, col, moves);
        getBishopMoves(row, col, moves);
    } else if (isKing(piece)) {
        getKingMoves(row, col, moves);
    } else if (isKnight(piece)) {
        getKnightMoves(row, col, moves);
    }
    
    // Filter out moves that would leave the king in check
    return moves.filter(([toRow, toCol]) => 
        !wouldBeInCheckAfterMove(row, col, toRow, toCol)
    );
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    return getValidMoves(fromRow, fromCol).some(([r, c]) => r === toRow && c === toCol);
}

function getPawnMoves(row, col, moves) {
    const direction = isWhitePiece(chessPieces[row][col]) ? -1 : 1;
    const startRow = isWhitePiece(chessPieces[row][col]) ? 6 : 1;

    // Forward move
    if (isInBounds(row + direction, col) && !chessPieces[row + direction][col]) {
        moves.push([row + direction, col]);
        // Initial two-square move
        if (row === startRow && !chessPieces[row + 2 * direction][col]) {
            moves.push([row + 2 * direction, col]);
        }
    }

    // Captures
    for (let colOffset of [-1, 1]) {
        const newRow = row + direction;
        const newCol = col + colOffset;
        if (isInBounds(newRow, newCol) && 
            chessPieces[newRow][newCol] && 
            isOpponentPiece(chessPieces[row][col], chessPieces[newRow][newCol])) {
            moves.push([newRow, newCol]);
        }
    }
}

function getRookMoves(row, col, moves) {
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    getLinearMoves(row, col, moves, directions);
}

function getBishopMoves(row, col, moves) {
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    getLinearMoves(row, col, moves, directions);
}

function getKnightMoves(row, col, moves) {
    const offsets = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
    for (let [rowOffset, colOffset] of offsets) {
        const newRow = row + rowOffset;
        const newCol = col + colOffset;
        if (isInBounds(newRow, newCol) && 
            (!chessPieces[newRow][newCol] || 
             isOpponentPiece(chessPieces[row][col], chessPieces[newRow][newCol]))) {
            moves.push([newRow, newCol]);
        }
    }
}

function getKingMoves(row, col, moves) {
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
        for (let colOffset = -1; colOffset <= 1; colOffset++) {
            if (rowOffset === 0 && colOffset === 0) continue;
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            if (isInBounds(newRow, newCol) && 
                (!chessPieces[newRow][newCol] || 
                 isOpponentPiece(chessPieces[row][col], chessPieces[newRow][newCol]))) {
                moves.push([newRow, newCol]);
            }
        }
    }
}

function getLinearMoves(row, col, moves, directions) {
    for (let [rowDir, colDir] of directions) {
        let newRow = row + rowDir;
        let newCol = col + colDir;
        while (isInBounds(newRow, newCol)) {
            if (!chessPieces[newRow][newCol]) {
                moves.push([newRow, newCol]);
            } else {
                if (isOpponentPiece(chessPieces[row][col], chessPieces[newRow][newCol])) {
                    moves.push([newRow, newCol]);
                }
                break;
            }
            newRow += rowDir;
            newCol += colDir;
        }
    }
}

function isInBounds(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isWhitePiece(piece) {
    return piece.charCodeAt(0) >= 0x2654 && piece.charCodeAt(0) <= 0x2659;
}

function isPawn(piece) {
    const code = piece.charCodeAt(0);
    return code === 0x2659 || code === 0x265F;
}

function isRook(piece) {
    const code = piece.charCodeAt(0);
    return code === 0x2656 || code === 0x265C;
}

function isBishop(piece) {
    const code = piece.charCodeAt(0);
    return code === 0x2657 || code === 0x265D;
}

function isQueen(piece) {
    const code = piece.charCodeAt(0);
    return code === 0x2655 || code === 0x265B;
}

function isKing(piece) {
    const code = piece.charCodeAt(0);
    return code === 0x2654 || code === 0x265A;
}

function isKnight(piece) {
    const code = piece.charCodeAt(0);
    return code === 0x2658 || code === 0x265E;
}

function isOpponentPiece(piece1, piece2) {
    return isWhitePiece(piece1) !== isWhitePiece(piece2);
}

// Find the king's position for a given color
function findKing(isWhite) {
    const targetKing = isWhite ? PIECES.WHITE.KING : PIECES.BLACK.KING;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (chessPieces[row][col] === targetKing) {
                return [row, col];
            }
        }
    }
    return null;
}

// Check if a square is under attack by the opponent
function isSquareUnderAttack(row, col, byWhite) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = chessPieces[r][c];
            if (piece && isWhitePiece(piece) === byWhite) {
                // Get all possible moves for this piece (without check validation)
                const moves = getRawValidMoves(r, c);
                if (moves.some(([mr, mc]) => mr === row && mc === col)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Get valid moves without check validation (used for attack detection)
function getRawValidMoves(row, col) {
    const piece = chessPieces[row][col];
    const moves = [];
    
    if (isPawn(piece)) {
        getPawnMoves(row, col, moves);
    } else if (isRook(piece)) {
        getRookMoves(row, col, moves);
    } else if (isBishop(piece)) {
        getBishopMoves(row, col, moves);
    } else if (isQueen(piece)) {
        getRookMoves(row, col, moves);
        getBishopMoves(row, col, moves);
    } else if (isKing(piece)) {
        getKingMoves(row, col, moves);
    } else if (isKnight(piece)) {
        getKnightMoves(row, col, moves);
    }
    
    return moves;
}

// Check if the current player's king is in check
function isInCheck(isWhite) {
    const kingPos = findKing(isWhite);
    if (!kingPos) return false;
    
    return isSquareUnderAttack(kingPos[0], kingPos[1], !isWhite);
}

// Check if a move would leave the king in check
function wouldBeInCheckAfterMove(fromRow, fromCol, toRow, toCol) {
    // Save the original state
    const originalPiece = chessPieces[toRow][toCol];
    const movingPiece = chessPieces[fromRow][fromCol];
    
    // Make the temporary move
    chessPieces[toRow][toCol] = movingPiece;
    chessPieces[fromRow][fromCol] = '';
    
    // Check if this leaves the king in check
    const wouldBeInCheck = isInCheck(isWhitePiece(movingPiece));
    
    // Restore the original state
    chessPieces[fromRow][fromCol] = movingPiece;
    chessPieces[toRow][toCol] = originalPiece;
    
    return wouldBeInCheck;
}

// Make function available globally for theme switching
window.applyThemeToElement = applyThemeToElement;

// Make theme update function available globally
window.updateChessTheme = updateChessTheme;
