// ============================================================
// PONG
// You are the paddle on the LEFT. The computer is on the RIGHT.
// Numbers you can play with are all in the SETTINGS box below.
// ============================================================

// ---------- SETTINGS - change these! ----------
var BALL_SPEED = 5;        // how fast the ball moves
var PADDLE_HEIGHT = 80;    // make this bigger to make the game easier
var COMPUTER_SPEED = 4;    // make this smaller to make the computer worse
var POINTS_TO_WIN = 5;
// ----------------------------------------------

var canvas = document.getElementById("pong");
var pen = canvas.getContext("2d");
var startButton = document.getElementById("start-button");

// Grab the site colors out of style.css so the game matches the website.
var siteColors = getComputedStyle(document.documentElement);
var BLUE = siteColors.getPropertyValue("--accent").trim();
var TEAL = siteColors.getPropertyValue("--accent-2").trim();
var DARK = siteColors.getPropertyValue("--ink").trim();

var PADDLE_WIDTH = 12;

var player = { y: 160, score: 0 };
var computer = { y: 160, score: 0 };
var ball = { x: 300, y: 200, goingX: BALL_SPEED, goingY: BALL_SPEED };

var playing = false;
var winner = "";
var holdingUp = false;
var holdingDown = false;

// ---------- Drawing ----------

function drawEverything() {
  // The playing field.
  pen.fillStyle = DARK;
  pen.fillRect(0, 0, canvas.width, canvas.height);

  // The dashed line down the middle.
  pen.strokeStyle = "rgba(255, 255, 255, 0.25)";
  pen.lineWidth = 4;
  pen.setLineDash([12, 14]);
  pen.beginPath();
  pen.moveTo(canvas.width / 2, 0);
  pen.lineTo(canvas.width / 2, canvas.height);
  pen.stroke();
  pen.setLineDash([]);

  // The two paddles.
  pen.fillStyle = BLUE;
  pen.fillRect(20, player.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  pen.fillStyle = TEAL;
  pen.fillRect(canvas.width - 20 - PADDLE_WIDTH, computer.y, PADDLE_WIDTH, PADDLE_HEIGHT);

  // The ball.
  pen.fillStyle = "#ffffff";
  pen.beginPath();
  pen.arc(ball.x, ball.y, 9, 0, Math.PI * 2);
  pen.fill();

  // The score.
  pen.fillStyle = "#ffffff";
  pen.font = "bold 44px 'Trebuchet MS', sans-serif";
  pen.textAlign = "center";
  pen.fillText(player.score, canvas.width / 2 - 60, 60);
  pen.fillText(computer.score, canvas.width / 2 + 60, 60);

  // A message in the middle when nobody is playing.
  if (!playing) {
    pen.font = "bold 30px 'Trebuchet MS', sans-serif";
    pen.fillText(winner || "Press Start!", canvas.width / 2, canvas.height / 2 + 10);
  }
}

// ---------- Moving things ----------

function keepOnScreen(value) {
  if (value < 0) return 0;
  if (value > canvas.height - PADDLE_HEIGHT) return canvas.height - PADDLE_HEIGHT;
  return value;
}

function putBallInMiddle() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  // Send it off towards whoever just lost the point.
  ball.goingX = -ball.goingX;
  ball.goingY = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED;
}

function hitsPaddle(paddleX, paddleY) {
  return ball.x + 9 > paddleX &&
         ball.x - 9 < paddleX + PADDLE_WIDTH &&
         ball.y > paddleY &&
         ball.y < paddleY + PADDLE_HEIGHT;
}

function moveEverything() {
  // The arrow keys move your paddle.
  if (holdingUp) player.y = keepOnScreen(player.y - 7);
  if (holdingDown) player.y = keepOnScreen(player.y + 7);

  // The computer chases the ball, but only so fast.
  var computerMiddle = computer.y + PADDLE_HEIGHT / 2;
  if (computerMiddle < ball.y - 10) computer.y += COMPUTER_SPEED;
  if (computerMiddle > ball.y + 10) computer.y -= COMPUTER_SPEED;
  computer.y = keepOnScreen(computer.y);

  ball.x += ball.goingX;
  ball.y += ball.goingY;

  // Bounce off the top and the bottom.
  if (ball.y < 9 || ball.y > canvas.height - 9) ball.goingY = -ball.goingY;

  // Bounce off your paddle.
  if (ball.goingX < 0 && hitsPaddle(20, player.y)) {
    ball.goingX = Math.abs(ball.goingX);
    ball.goingY = ((ball.y - (player.y + PADDLE_HEIGHT / 2)) / PADDLE_HEIGHT) * 10;
  }

  // Bounce off the computer's paddle.
  if (ball.goingX > 0 && hitsPaddle(canvas.width - 20 - PADDLE_WIDTH, computer.y)) {
    ball.goingX = -Math.abs(ball.goingX);
    ball.goingY = ((ball.y - (computer.y + PADDLE_HEIGHT / 2)) / PADDLE_HEIGHT) * 10;
  }

  // Somebody scored!
  if (ball.x < 0) {
    computer.score += 1;
    putBallInMiddle();
  }
  if (ball.x > canvas.width) {
    player.score += 1;
    putBallInMiddle();
  }

  if (player.score >= POINTS_TO_WIN) stopGame("You win! 🎉");
  if (computer.score >= POINTS_TO_WIN) stopGame("Computer wins!");
}

function stopGame(message) {
  playing = false;
  winner = message;
  startButton.hidden = false;
  startButton.textContent = "Play again";
}

// ---------- The game loop ----------

function everyFrame() {
  if (playing) moveEverything();
  drawEverything();
  requestAnimationFrame(everyFrame);
}

// ---------- Controls ----------

// Follow the mouse.
canvas.addEventListener("mousemove", function (event) {
  var box = canvas.getBoundingClientRect();
  var mouseY = (event.clientY - box.top) * (canvas.height / box.height);
  player.y = keepOnScreen(mouseY - PADDLE_HEIGHT / 2);
});

// Follow a finger on a phone or tablet.
canvas.addEventListener("touchmove", function (event) {
  event.preventDefault();
  var box = canvas.getBoundingClientRect();
  var touchY = (event.touches[0].clientY - box.top) * (canvas.height / box.height);
  player.y = keepOnScreen(touchY - PADDLE_HEIGHT / 2);
}, { passive: false });

// Arrow keys.
document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowUp") { holdingUp = true; event.preventDefault(); }
  if (event.key === "ArrowDown") { holdingDown = true; event.preventDefault(); }
});
document.addEventListener("keyup", function (event) {
  if (event.key === "ArrowUp") holdingUp = false;
  if (event.key === "ArrowDown") holdingDown = false;
});

startButton.addEventListener("click", function () {
  player.score = 0;
  computer.score = 0;
  winner = "";
  putBallInMiddle();
  playing = true;
  startButton.hidden = true;
});

everyFrame();
