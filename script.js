let currentPlayer = 'X';
let gameMode = null;
let difficulty = 'easy';
let gameActive = false;
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const board = document.getElementById('board');
const controls = document.getElementById('controls');
const themeCheckbox = document.getElementById('themeCheckbox');

const winCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Game Initialization
// Previous code remains the same until the startGame function

function startGame(mode) {
    gameMode = mode;
    board.classList.add('hidden');
    controls.classList.add('hidden');
    
    if (mode === '1player') {
        document.getElementById('difficulty').classList.remove('hidden');
        status.textContent = 'Choose difficulty level!';
    } else {
        document.getElementById('difficulty').classList.add('hidden');
        initializeBoard();
    }
}

function setDifficulty(level) {
    difficulty = level;
    document.getElementById('difficulty').classList.add('hidden');
    initializeBoard();
}

function initializeBoard() {
    // Reset game state
    currentPlayer = 'X';
    gameActive = true;
    movesMade = 0;
    
    // Clear board
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x-mark', 'o-mark');
    });

    // Show game elements
    board.classList.remove('hidden');
    controls.classList.remove('hidden');
    status.classList.remove('hidden');
    
    // Set status message
    if (gameMode === '1player') {
        status.textContent = `Player X vs Computer (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`;
        if (currentPlayer === 'O') computerMove();
    } else {
        status.textContent = "Player X's turn";
    }
}

// Previous code continues...

// Game Logic
function handleMove(cell, index) {
    if (!gameActive || cell.textContent !== '') return;

    cell.textContent = currentPlayer;
    cell.classList.add(`${currentPlayer.toLowerCase()}-mark`);
    
    if (checkWin()) {
        endGame(gameMode === '1player' && currentPlayer === 'O' ? 
            "Computer wins! 😢" : `Player ${currentPlayer} wins! 🎉`);
        return;
    }

    if (checkTie()) {
        endGame("It's a tie! 🤝");
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();

    if (gameMode === '1player' && currentPlayer === 'O') {
        setTimeout(computerMove, difficulty === 'hard' ? 800 : 400);
    }
}

// Computer AI
function computerMove() {
    if (!gameActive) return;

    let index;
    switch(difficulty) {
        case 'hard':
            index = getBestMove();
            break;
        case 'medium':
            index = getMediumMove();
            break;
        default:
            index = getRandomMove();
    }
    
    handleMove(cells[index], index);
}

function getRandomMove() {
    const emptyCells = [...cells].filter(cell => cell.textContent === '');
    return parseInt(emptyCells[Math.floor(Math.random() * emptyCells.length)].dataset.index);
}

function getMediumMove() {
    let move = findWinningMove('O') || findWinningMove('X');
    if (move !== null) return move;
    if (cells[4].textContent === '') return 4;
    const corners = [0, 2, 6, 8].filter(i => cells[i].textContent === '');
    return corners.length > 0 ? corners[Math.floor(Math.random() * corners.length)] : getRandomMove();
}

function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
        if (cells[i].textContent === '') {
            cells[i].textContent = 'O';
            let score = minimax(false);
            cells[i].textContent = '';
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function minimax(isMaximizing) {
    if (checkWinFor('O')) return 1;
    if (checkWinFor('X')) return -1;
    if (checkTie()) return 0;

    let bestScore = isMaximizing ? -Infinity : Infinity;
    for (let i = 0; i < 9; i++) {
        if (cells[i].textContent === '') {
            cells[i].textContent = isMaximizing ? 'O' : 'X';
            let score = minimax(!isMaximizing);
            cells[i].textContent = '';
            bestScore = isMaximizing ? Math.max(score, bestScore) : Math.min(score, bestScore);
        }
    }
    return bestScore;
}

// Helper Functions
function findWinningMove(player) {
    for (let combo of winCombos) {
        let [a, b, c] = combo;
        const cellsCombo = [cells[a], cells[b], cells[c]];
        const values = cellsCombo.map(cell => cell.textContent);
        
        if (values.filter(v => v === player).length === 2 && values.includes('')) {
            return cellsCombo[values.indexOf('')].dataset.index;
        }
    }
    return null;
}

function checkWin() {
    return winCombos.some(combo => 
        combo.every(index => cells[index].textContent === currentPlayer)
    );
}

function checkWinFor(player) {
    return winCombos.some(combo => 
        combo.every(index => cells[index].textContent === player)
    );
}

function checkTie() {
    return [...cells].every(cell => cell.textContent !== '');
}

function updateStatus() {
    status.textContent = gameMode === '1player' ?
        `Your turn (${currentPlayer})` :
        `Player ${currentPlayer}'s turn`;
}

// Game Flow Control
function endGame(message) {
    gameActive = false;
    showWinnerModal(message);
}

function showWinnerModal(message) {
    document.getElementById('winnerMessage').textContent = message;
    document.getElementById('winnerModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('winnerModal').classList.add('hidden');
    resetGame();
}

function fullReset() {
    document.getElementById('winnerModal').classList.add('hidden');
    board.classList.add('hidden');
    controls.classList.add('hidden');
    status.classList.add('hidden');
    gameMode = null;
    resetGame();
}

function resetGame() {
    gameActive = false;
    currentPlayer = 'X';
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x-mark', 'o-mark');
    });
    
    if (gameMode) {
        gameActive = true;
        if (gameMode === '1player' && currentPlayer === 'O') {
            computerMove();
        }
    }
}

// Event Listeners
themeCheckbox.addEventListener('change', () => {
    document.body.dataset.theme = themeCheckbox.checked ? 'dark' : 'light';
});

cells.forEach(cell => {
    cell.addEventListener('click', () => handleMove(cell, cell.dataset.index));
    cell.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleMove(cell, cell.dataset.index);
    });
});