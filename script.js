const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const maxSnakeLength = tileCount * tileCount - 1;
const speed = 120;
const bestScoreKey = "classic-snake-best-score";

let snake;
let food;
let dx;
let dy;
let nextDx;
let nextDy;
let score;
let gameLoop;
let gameRunning;
let gameOver;
let directionQueue;

function getBestScore() {
  return Number(localStorage.getItem(bestScoreKey)) || 0;
}

function setBestScore(value) {
  localStorage.setItem(bestScoreKey, String(value));
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];

  food = createFood();
  dx = 1;
  dy = 0;
  nextDx = 1;
  nextDy = 0;
  score = 0;
  gameRunning = false;
  gameOver = false;
  directionQueue = [];

  scoreEl.textContent = score;
  bestScoreEl.textContent = getBestScore();
  messageEl.textContent = "按「開始遊戲」開始";

  directionQueue = [];
  draw();
}

function startGame() {
  canvas.focus();

  if (gameRunning) return;

  if (gameOver) {
    resetGame();
  }

  gameRunning = true;
  messageEl.textContent = "";

  clearInterval(gameLoop);
  gameLoop = setInterval(update, speed);
}

function endGame() {
  gameRunning = false;
  gameOver = true;
  clearInterval(gameLoop);

  if (score > getBestScore()) {
    setBestScore(score);
  }

  bestScoreEl.textContent = getBestScore();
  messageEl.textContent = "遊戲結束！按重新開始再玩一次";
}

function update() {
  applyQueuedDirection();

  dx = nextDx;
  dy = nextDy;

  const head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  const willEatFood = head.x === food.x && head.y === food.y;

  if (hitWall(head) || hitSelf(head, willEatFood)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (willEatFood) {
    score += 10;
    scoreEl.textContent = score;

    if (snake.length >= maxSnakeLength) {
      snake.pop();
    }

    food = createFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  ctx.fillStyle = "#ff3333";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#b6ff00" : "#7CFC00";
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
  });
}

function drawGrid() {
  ctx.strokeStyle = "#102510";
  ctx.lineWidth = 1;

  for (let i = 0; i <= canvas.width; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
}

function createFood() {
  const emptyCells = [];

  for (let y = 0; y < tileCount; y += 1) {
    for (let x = 0; x < tileCount; x += 1) {
      const occupied = snake && snake.some((part) => part.x === x && part.y === y);

      if (!occupied) {
        emptyCells.push({ x, y });
      }
    }
  }

  if (emptyCells.length === 0) {
    return { x: 0, y: 0 };
  }

  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function hitWall(head) {
  return head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
}

function hitSelf(head, willEatFood) {
  const bodyToCheck = willEatFood ? snake : snake.slice(0, -1);
  return bodyToCheck.some((part) => part.x === head.x && part.y === head.y);
}

function changeDirection(direction) {
  if (!gameRunning) return;

  const requested = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  }[direction];

  if (!requested) return;

  const lastDirection = directionQueue.length
    ? directionQueue[directionQueue.length - 1]
    : { x: nextDx, y: nextDy };

  const isSameDirection = requested.x === lastDirection.x && requested.y === lastDirection.y;
  if (isSameDirection) return;

  const isReverseDirection = requested.x === -lastDirection.x && requested.y === -lastDirection.y;
  if (isReverseDirection) return;

  directionQueue.push(requested);

  if (directionQueue.length > 2) {
    directionQueue.shift();
  }
}

function applyQueuedDirection() {
  if (!directionQueue.length) return;

  const nextDirection = directionQueue.shift();

  nextDx = nextDirection.x;
  nextDy = nextDirection.y;
}

document.addEventListener("keydown", (event) => {
  const code = event.code;
  const key = event.key.toLowerCase();

  const controls = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    KeyW: "up",
    KeyS: "down",
    KeyA: "left",
    KeyD: "right"
  };

  const fallbackControls = {
    w: "up",
    s: "down",
    a: "left",
    d: "right"
  };

  const direction = controls[code] || fallbackControls[key];

  if (direction) {
    event.preventDefault();
    changeDirection(direction);
  }

  if (code === "Space" || key === " ") {
    event.preventDefault();
    startGame();
  }
});

document.querySelectorAll(".mobile-controls button").forEach((button) => {
  button.addEventListener("click", () => {
    changeDirection(button.dataset.dir);
  });
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", () => {
  clearInterval(gameLoop);
  resetGame();
  startGame();
});

resetGame();
