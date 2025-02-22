document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 4;
    let board = [];
    let score = 0;
    const gameBoard = document.getElementById('game-board');
    const scoreDisplay = document.getElementById('score');

    // Initialize the game
    function init() {
        board = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
        addTile();
        addTile();
        renderBoard();
    }

    // Add a new tile (2 or 4, matching 2248's randomness)
    function addTile() {
        let emptyCells = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (board[i][j] === 0) emptyCells.push({ x: i, y: j });
            }
        }
        if (emptyCells.length > 0) {
            let { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            board[x][y] = Math.random() < 0.9 ? 2 : 4; // 90% chance of 2
        }
    }

    // Render the board
    function renderBoard() {
        gameBoard.innerHTML = '';
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                let tile = document.createElement('div');
                tile.className = 'tile';
                if (board[i][j] !== 0) {
                    tile.classList.add(`tile-${board[i][j]}`);
                    tile.textContent = board[i][j];
                }
                gameBoard.appendChild(tile);
            }
        }
        scoreDisplay.textContent = score;
    }

    // Move and merge tiles with chain merging
    function move(direction) {
        let moved = false;
        let newBoard = board.map(row => [...row]);
        const directions = {
            up: { dx: -1, dy: 0 },
            down: { dx: 1, dy: 0 },
            left: { dx: 0, dy: -1 },
            right: { dx: 0, dy: 1 },
            upLeft: { dx: -1, dy: -1 },
            upRight: { dx: -1, dy: 1 },
            downLeft: { dx: 1, dy: -1 },
            downRight: { dx: 1, dy: 1 }
        };
        const { dx, dy } = directions[direction];

        let order = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                order.push({ x: i, y: j });
            }
        }
        if (dx > 0) order.sort((a, b) => b.x - a.x);
        else if (dx < 0) order.sort((a, b) => a.x - b.x);
        if (dy > 0) order.sort((a, b) => b.y - a.y);
        else if (dy < 0) order.sort((a, b) => a.y - b.y);

        for (let { x, y } of order) {
            if (newBoard[x][y] === 0) continue;
            let currentX = x, currentY = y;

            while (true) {
                let nextX = currentX + dx, nextY = currentY + dy;
                if (nextX < 0 || nextX >= gridSize || nextY < 0 || nextY >= gridSize) break;

                if (newBoard[nextX][nextY] === 0) {
                    newBoard[nextX][nextY] = newBoard[currentX][currentY];
                    newBoard[currentX][currentY] = 0;
                    currentX = nextX;
                    currentY = nextY;
                    moved = true;
                } else if (newBoard[nextX][nextY] === newBoard[currentX][currentY]) {
                    newBoard[nextX][nextY] *= 2;
                    score += newBoard[nextX][nextY];
                    newBoard[currentX][currentY] = 0;
                    moved = true;
                    currentX = nextX;
                    currentY = nextY; // Chain merging
                } else break;
            }
        }

        if (moved) {
            board = newBoard;
            addTile();
            renderBoard();
            checkGameOver();
        }
    }

    // Check if game is over
    function checkGameOver() {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                if (board[i][j] === 0) return;
                const neighbors = [
                    [i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1],
                    [i - 1, j - 1], [i - 1, j + 1], [i + 1, j - 1], [i + 1, j + 1]
                ];
                for (let [nx, ny] of neighbors) {
                    if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && board[i][j] === board[nx][ny]) return;
                }
            }
        }
        alert(`Game Over! Final Score: ${score}`);
    }

    // Keyboard controls (laptop)
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp': move('up'); break;
            case 'ArrowDown': move('down'); break;
            case 'ArrowLeft': move('left'); break;
            case 'ArrowRight': move('right'); break;
        }
    });

    // Touch controls (phone)
    let startX = 0, startY = 0;
    gameBoard.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: false });

    gameBoard.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });

    gameBoard.addEventListener('touchend', (e) => {
        e.preventDefault();
        let endX = e.changedTouches[0].clientX;
        let endY = e.changedTouches[0].clientY;
        let dx = endX - startX;
        let dy = endY - startY;
        let absDx = Math.abs(dx), absDy = Math.abs(dy);

        if (absDx > 30 || absDy > 30) {
            if (absDx > absDy) {
                if (dx > 0) move('right');
                else move('left');
            } else if (absDy > absDx) {
                if (dy > 0) move('down');
                else move('up');
            } else {
                if (dx > 0 && dy > 0) move('downRight');
                else if (dx > 0 && dy < 0) move('upRight');
                else if (dx < 0 && dy > 0) move('downLeft');
                else move('upLeft');
            }
        }
    }, { passive: false });

    // Mouse controls (laptop)
    let mouseDown = false;
    gameBoard.addEventListener('mousedown', (e) => {
        mouseDown = true;
        startX = e.clientX;
        startY = e.clientY;
    });
    document.addEventListener('mousemove', (e) => {
        if (!mouseDown) return;
        e.preventDefault();
    });
    document.addEventListener('mouseup', (e) => {
        if (mouseDown) {
            let endX = e.clientX;
            let endY = e.clientY;
            let dx = endX - startX;
            let dy = endY - startY;
            let absDx = Math.abs(dx), absDy = Math.abs(dy);

            if (absDx > 30 || absDy > 30) {
                if (absDx > absDy) {
                    if (dx > 0) move('right');
                    else move('left');
                } else if (absDy > absDx) {
                    if (dy > 0) move('down');
                    else move('up');
                } else {
                    if (dx > 0 && dy > 0) move('downRight');
                    else if (dx > 0 && dy < 0) move('upRight');
                    else if (dx < 0 && dy > 0) move('downLeft');
                    else move('upLeft');
                }
            }
        }
        mouseDown = false;
    });

    // Start the game
    init();
});