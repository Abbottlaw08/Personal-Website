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
    document.getElementById('gamesMenu').style.display = 'none';
    document.getElementById('gamesTitle').style.display = 'none';
    document.getElementById('chessGameContainer').style.display = 'flex';
    
    // Always get a fresh reference to the chess board and initialize it
    chessBoard = document.getElementById('chessBoard');
    if (chessBoard) {
        chessBoard.innerHTML = ''; // Clear any existing content
        initializeChessBoard();
        updateTurnIndicator();
    }
}

function returnToMenuFromChess() {
    document.getElementById('gamesMenu').style.display = 'grid';
    document.getElementById('gamesTitle').style.display = 'block';
    document.getElementById('chessGameContainer').style.display = 'none';
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
        turnIndicator.textContent = `${currentTurn === 'white' ? 'White' : 'Black'}'s Turn`;
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
    let whiteKingFound = false;
    let blackKingFound = false;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (chessPieces[r][c] === PIECES.WHITE.KING) {
                whiteKingFound = true;
            }
            if (chessPieces[r][c] === PIECES.BLACK.KING) {
                blackKingFound = true;
            }
        }
    }

    if (!whiteKingFound) {
        endChessGame('Black');
    } else if (!blackKingFound) {
        endChessGame('White');
    }
}

function endChessGame(winner) {
    const gameOverScreen = document.getElementById('chessGameOver');
    const winnerText = document.getElementById('chessWinner');
    
    if (gameOverScreen && winnerText) {
        winnerText.textContent = `${winner} Wins!`;
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
    
    return moves;
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
