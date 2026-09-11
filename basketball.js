// ============================================================
// BASKETBALL
// Pull the ball back like a catapult and let go. It flies up,
// gravity pulls it down, and if it drops through the hoop you
// score. You get 10 shots a game.
// ============================================================

// ---------- SETTINGS - change these! ----------
var SHOTS_IN_A_GAME = 10;
var GRAVITY = 0.42;          // how hard the ball is pulled down
var HOW_HARD_YOU_SHOOT = 0.19;   // bigger = the ball flies further
var BOUNCINESS = 0.62;       // how much bounce is left after it hits something
var HOOP_SPEED = 1.1;        // how fast the hoop slides about
var MOVES_AFTER = 3;         // the hoop starts moving once you score this many
// ----------------------------------------------

var court = document.getElementById("court");
var pen = court.getContext("2d");
var tipOff = document.getElementById("tip-off");
var message = document.getElementById("message");
var scoreLine = document.getElementById("score");

var BALL_SIZE = 17;
var RIM_WIDTH = 74;
var HOME_X = court.width / 2;
var HOME_Y = court.height - 70;

var ball = { x: HOME_X, y: HOME_Y, goingX: 0, goingY: 0, flying: false, spin: 0 };
var hoop = { x: court.width / 2, y: 150, goingRight: true, moving: false };

var shotsTaken = 0;
var baskets = 0;
var best = 0;
var playing = false;
var aiming = false;
var pullX = 0;
var pullY = 0;

try { best = Number(localStorage.getItem("jack-basketball-best")) || 0; }
catch (whoops) { best = 0; }

// ---------- Drawing ----------

function drawCourt() {
  // The wall behind, then the floor.
  pen.fillStyle = "#3d5a80";
  pen.fillRect(0, 0, court.width, court.height);
  pen.fillStyle = "#c98f52";
  pen.fillRect(0, court.height - 46, court.width, 46);

  // Floorboards.
  pen.strokeStyle = "rgba(0,0,0,0.18)";
  pen.lineWidth = 2;
  for (var x = 0; x < court.width; x += 40) {
    pen.beginPath();
    pen.moveTo(x, court.height - 46);
    pen.lineTo(x, court.height);
    pen.stroke();
  }
}

function drawHoop() {
  // The backboard.
  pen.fillStyle = "#f2f2f2";
  pen.fillRect(hoop.x - 52, hoop.y - 76, 104, 66);
  pen.strokeStyle = "#1f2933";
  pen.lineWidth = 4;
  pen.strokeRect(hoop.x - 52, hoop.y - 76, 104, 66);
  pen.strokeRect(hoop.x - 24, hoop.y - 48, 48, 36);

  // The net, hanging down from the rim.
  pen.strokeStyle = "rgba(255,255,255,0.8)";
  pen.lineWidth = 2;
  for (var i = 0; i <= 6; i++) {
    var acrossTheRim = hoop.x - RIM_WIDTH / 2 + (RIM_WIDTH / 6) * i;
    pen.beginPath();
    pen.moveTo(acrossTheRim, hoop.y);
    pen.lineTo(hoop.x + (acrossTheRim - hoop.x) * 0.5, hoop.y + 34);
    pen.stroke();
  }

  // The rim itself, drawn last so it sits on top.
  pen.strokeStyle = "#e35d1f";
  pen.lineWidth = 7;
  pen.beginPath();
  pen.moveTo(hoop.x - RIM_WIDTH / 2, hoop.y);
  pen.lineTo(hoop.x + RIM_WIDTH / 2, hoop.y);
  pen.stroke();
}

function drawBall() {
  pen.save();
  pen.translate(ball.x, ball.y);
  pen.rotate(ball.spin);
  pen.font = (BALL_SIZE * 2) + "px serif";
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.fillText("🏀", 0, 0);
  pen.restore();
}

// While you are pulling back, show which way it will go.
function drawAimLine() {
  if (!aiming) return;

  pen.strokeStyle = "rgba(255,255,255,0.85)";
  pen.lineWidth = 3;
  pen.setLineDash([7, 7]);
  pen.beginPath();
  pen.moveTo(ball.x, ball.y);
  pen.lineTo(pullX, pullY);
  pen.stroke();
  pen.setLineDash([]);

  // Little dots showing roughly where it will fly.
  var guessX = ball.x, guessY = ball.y;
  var goX = (ball.x - pullX) * HOW_HARD_YOU_SHOOT;
  var goY = (ball.y - pullY) * HOW_HARD_YOU_SHOOT;
  pen.fillStyle = "rgba(255,255,255,0.5)";
  for (var step = 0; step < 22; step++) {
    guessX += goX;
    guessY += goY;
    goY += GRAVITY;
    if (step % 2 === 0) {
      pen.beginPath();
      pen.arc(guessX, guessY, 3, 0, Math.PI * 2);
      pen.fill();
    }
  }
}

function drawScore() {
  pen.textAlign = "left";
  pen.textBaseline = "alphabetic";
  pen.fillStyle = "#fff";
  pen.font = "bold 22px 'Trebuchet MS', sans-serif";
  pen.fillText("Baskets " + baskets, 12, 30);
  pen.font = "bold 15px 'Trebuchet MS', sans-serif";
  pen.fillText("Shot " + Math.min(shotsTaken + 1, SHOTS_IN_A_GAME) +
               " of " + SHOTS_IN_A_GAME, 12, 52);
}

// ---------- Moving ----------

function moveHoop() {
  if (!hoop.moving) return;
  hoop.x += hoop.goingRight ? HOOP_SPEED : -HOOP_SPEED;
  if (hoop.x > court.width - 70) hoop.goingRight = false;
  if (hoop.x < 70) hoop.goingRight = true;
}

function moveBall() {
  if (!ball.flying) return;

  var wasAbove = ball.y;

  ball.goingY += GRAVITY;
  ball.x += ball.goingX;
  ball.y += ball.goingY;
  ball.spin += ball.goingX * 0.03;

  // Bounce off the sides.
  if (ball.x < BALL_SIZE || ball.x > court.width - BALL_SIZE) {
    ball.goingX = -ball.goingX * BOUNCINESS;
    ball.x = ball.x < BALL_SIZE ? BALL_SIZE : court.width - BALL_SIZE;
  }

  // Bounce off the backboard.
  if (ball.x > hoop.x - 56 && ball.x < hoop.x + 56 &&
      ball.y > hoop.y - 80 && ball.y < hoop.y - 8 && ball.goingY < 0) {
    ball.goingY = Math.abs(ball.goingY) * BOUNCINESS;
  }

  // Clang off either end of the rim.
  [hoop.x - RIM_WIDTH / 2, hoop.x + RIM_WIDTH / 2].forEach(function (rimEnd) {
    var awayX = ball.x - rimEnd;
    var awayY = ball.y - hoop.y;
    if (Math.sqrt(awayX * awayX + awayY * awayY) < BALL_SIZE) {
      ball.goingX = awayX * 0.35;
      ball.goingY = -Math.abs(ball.goingY) * BOUNCINESS;
    }
  });

  // Through the hoop! Only counts going downwards.
  if (wasAbove < hoop.y && ball.y >= hoop.y && ball.goingY > 0 &&
      Math.abs(ball.x - hoop.x) < RIM_WIDTH / 2 - 4) {
    scoreABasket();
  }

  // Landed on the floor.
  if (ball.y > court.height - 46 - BALL_SIZE) {
    ball.y = court.height - 46 - BALL_SIZE;
    ball.goingY = -ball.goingY * BOUNCINESS;
    ball.goingX *= 0.8;
    // Once it has stopped bouncing much, the shot is over.
    if (Math.abs(ball.goingY) < 2.5) finishShot();
  }
}

function scoreABasket() {
  baskets++;
  message.textContent = "🏀 SWISH! That is " + baskets + "!";
  if (baskets >= MOVES_AFTER) hoop.moving = true;
}

function finishShot() {
  ball.flying = false;
  shotsTaken++;

  if (shotsTaken >= SHOTS_IN_A_GAME) {
    endTheGame();
  } else {
    resetBall();
    if (!message.textContent.indexOf("SWISH")) message.textContent = "Next shot!";
  }
  showScore();
}

function resetBall() {
  ball.x = HOME_X;
  ball.y = HOME_Y;
  ball.goingX = 0;
  ball.goingY = 0;
  ball.spin = 0;
  ball.flying = false;
}

function endTheGame() {
  playing = false;
  if (baskets > best) {
    best = baskets;
    try { localStorage.setItem("jack-basketball-best", best); } catch (whoops) {}
  }
  message.textContent = "Game over! You got " + baskets + " out of " +
                        SHOTS_IN_A_GAME + ". " + howDidYouDo();
  tipOff.hidden = false;
  tipOff.textContent = "🏀 Play again";

  // A star for playing a whole game.
  if (typeof giveAStar === "function") giveAStar();
}

function howDidYouDo() {
  if (baskets === SHOTS_IN_A_GAME) return "PERFECT GAME! 🏆";
  if (baskets >= 7) return "Amazing shooting!";
  if (baskets >= 4) return "Nice one!";
  if (baskets >= 1) return "Keep practising!";
  return "Try pulling back a bit further!";
}

function showScore() {
  scoreLine.textContent = "Baskets " + baskets + " of " + shotsTaken +
                          " shots · Best " + best;
}

// ---------- The game loop ----------

function everyFrame() {
  moveHoop();
  moveBall();

  drawCourt();
  drawHoop();
  drawAimLine();
  drawBall();
  drawScore();

  requestAnimationFrame(everyFrame);
}

// ---------- Pulling the ball back ----------

function whereOnCourt(event) {
  var box = court.getBoundingClientRect();
  return {
    x: (event.clientX - box.left) * (court.width / box.width),
    y: (event.clientY - box.top) * (court.height / box.height)
  };
}

court.addEventListener("pointerdown", function (event) {
  if (!playing || ball.flying) return;
  aiming = true;
  court.setPointerCapture(event.pointerId);
  var spot = whereOnCourt(event);
  pullX = spot.x;
  pullY = spot.y;
});

court.addEventListener("pointermove", function (event) {
  if (!aiming) return;
  var spot = whereOnCourt(event);
  pullX = spot.x;
  pullY = spot.y;
});

court.addEventListener("pointerup", function () {
  if (!aiming) return;
  aiming = false;

  // The ball goes the opposite way to the way you pulled.
  ball.goingX = (ball.x - pullX) * HOW_HARD_YOU_SHOOT;
  ball.goingY = (ball.y - pullY) * HOW_HARD_YOU_SHOOT;

  // A tiny pull is not a shot.
  if (Math.abs(ball.goingX) < 0.6 && Math.abs(ball.goingY) < 0.6) return;

  ball.flying = true;
  message.textContent = "Up it goes...";
});

tipOff.addEventListener("click", function () {
  shotsTaken = 0;
  baskets = 0;
  hoop.moving = false;
  hoop.x = court.width / 2;
  playing = true;
  tipOff.hidden = true;
  message.textContent = "Pull the ball back and let go!";
  resetBall();
  showScore();
});

showScore();
everyFrame();
