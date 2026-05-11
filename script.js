const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("bestScore");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
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

  scoreEl.textContent = score;
  bestScoreEl.textContent = getBestScore();
  messageEl.textContent = "按「開始遊戲」開始";

  draw();
}

function startGame() {
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
  dx = nextDx;
  dy = nextDy;

  const head = {
    x: snake[0].x + dx,
    y: snake[0].y + dy
  };

  if (hitWall(head) || hitSelf(head)) {
    endGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
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
  let newFood;

  do {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake && snake.some((part) => part.x === newFood.x && part.y === newFood.y));

  return newFood;
}

function hitWall(head) {
  return head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
}

function hitSelf(head) {
  return snake.some((part) => part.x === head.x && part.y === head.y);
}

function changeDirection(direction) {
  if (!gameRunning) return;

  if (direction === "up" && dy !== 1) {
    nextDx = 0;
    nextDy = -1;
  }

  if (direction === "down" && dy !== -1) {
    nextDx = 0;
    nextDy = 1;
  }

  if (direction === "left" && dx !== 1) {
    nextDx = -1;
    nextDy = 0;
  }

  if (direction === "right" && dx !== -1) {
    nextDx = 1;
    nextDy = 0;
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") changeDirection("up");
  if (event.key === "ArrowDown") changeDirection("down");
  if (event.key === "ArrowLeft") changeDirection("left");
  if (event.key === "ArrowRight") changeDirection("right");
  if (event.key === " ") startGame();
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
