// ============================================================
// PENALTY SHOOTOUT
// Click where you want to shoot. The keeper dives to guess.
// ============================================================

// ---------- SETTINGS - change these! ----------
var HOW_MANY_SHOTS = 5;
var KEEPER_REACH = 50;      // bigger = the keeper saves more
var KEEPER_SPEED = 0.09;    // how fast the keeper dives across the goal
var FLIGHT_LENGTH = 34;     // how many frames the ball takes to get there
var BALL_ROLL_SPEED = 4.5;  // how fast the ball rolls while you are aiming
var BALL_ROLL_WIDTH = 120;  // how far it rolls each way
// ----------------------------------------------

var pitch = document.getElementById("pitch");
var pen = pitch.getContext("2d");
var kickOffButton = document.getElementById("kick-off-button");

// Where the goal sits on the picture.
var GOAL_LEFT = 70;
var GOAL_RIGHT = 430;
var GOAL_TOP = 60;
var GOAL_LINE = 215;        // the ground inside the goal

var BALL_HOME_X = 250;
var BALL_HOME_Y = 345;

var KEEPER_WIDTH = 54;
var KEEPER_HEIGHT = 74;

var ball, keeper, shotsTaken, goalsScored, flying, flightStep, aimX, aimY;
var shotFrom;               // where the ball was when you kicked it
var message = "";
var playing = false;
var best;

try { best = Number(localStorage.getItem("jack-penalty-best")) || 0; }
catch (whoops) { best = 0; }

function newShootout() {
  shotsTaken = 0;
  goalsScored = 0;
  playing = true;
  message = "Shot 1 of " + HOW_MANY_SHOTS + " - take aim!";
  resetBall();
}

function resetBall() {
  // The ball rolls from side to side, and spins as it goes.
  ball = { x: BALL_HOME_X, y: BALL_HOME_Y, rollingRight: true, spin: 0 };
  keeper = { x: (GOAL_LEFT + GOAL_RIGHT) / 2 - KEEPER_WIDTH / 2, divingTo: null };
  flying = false;
  flightStep = 0;
}

// ---------- Drawing ----------

function drawPitch() {
  // Grass, with a lighter stripe so it looks like a mown pitch.
  pen.fillStyle = "#3f8f4a";
  pen.fillRect(0, 0, pitch.width, pitch.height);
  pen.fillStyle = "#48a055";
  pen.fillRect(0, GOAL_LINE, pitch.width, 60);

  // The penalty box and the spot.
  pen.strokeStyle = "rgba(255,255,255,0.85)";
  pen.lineWidth = 3;
  pen.strokeRect(30, GOAL_LINE, pitch.width - 60, 120);
  pen.fillStyle = "#ffffff";
  pen.beginPath();
  pen.arc(BALL_HOME_X, BALL_HOME_Y + 18, 4, 0, Math.PI * 2);
  pen.fill();
}

function drawGoal() {
  // The net.
  pen.strokeStyle = "rgba(255,255,255,0.35)";
  pen.lineWidth = 1;
  for (var x = GOAL_LEFT; x <= GOAL_RIGHT; x += 18) {
    pen.beginPath(); pen.moveTo(x, GOAL_TOP); pen.lineTo(x, GOAL_LINE); pen.stroke();
  }
  for (var y = GOAL_TOP; y <= GOAL_LINE; y += 18) {
    pen.beginPath(); pen.moveTo(GOAL_LEFT, y); pen.lineTo(GOAL_RIGHT, y); pen.stroke();
  }

  // The posts and the crossbar.
  pen.strokeStyle = "#ffffff";
  pen.lineWidth = 8;
  pen.beginPath();
  pen.moveTo(GOAL_LEFT, GOAL_LINE);
  pen.lineTo(GOAL_LEFT, GOAL_TOP);
  pen.lineTo(GOAL_RIGHT, GOAL_TOP);
  pen.lineTo(GOAL_RIGHT, GOAL_LINE);
  pen.stroke();
}

function drawKeeper() {
  var middleX = keeper.x + KEEPER_WIDTH / 2;
  var topY = GOAL_LINE - KEEPER_HEIGHT;

  pen.fillStyle = "#fcbf49";                       // shirt
  pen.fillRect(keeper.x, topY + 18, KEEPER_WIDTH, KEEPER_HEIGHT - 18);
  pen.fillStyle = "#f0c9a0";                       // head
  pen.beginPath();
  pen.arc(middleX, topY + 10, 12, 0, Math.PI * 2);
  pen.fill();
  pen.font = "22px serif";                          // gloves
  pen.textAlign = "center";
  pen.fillText("🧤", keeper.x + 4, topY + 34);
  pen.fillText("🧤", keeper.x + KEEPER_WIDTH - 4, topY + 34);
}

function drawBall() {
  // Turn the whole picture a little, draw the ball, then turn it back.
  // That is how you make something spin.
  pen.save();
  pen.translate(ball.x, ball.y);
  pen.rotate(ball.spin);
  pen.font = "30px serif";
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.fillText("⚽", 0, 0);
  pen.restore();
  pen.textBaseline = "alphabetic";
}

function drawScoreboard() {
  pen.textAlign = "left";
  pen.font = "bold 20px 'Trebuchet MS', sans-serif";
  pen.fillStyle = "#ffffff";
  pen.fillText("Goals " + goalsScored + " / " + HOW_MANY_SHOTS, 12, 28);
  pen.font = "bold 15px 'Trebuchet MS', sans-serif";
  pen.fillText("Best " + best, 12, 48);

  pen.textAlign = "center";
  pen.font = "bold 20px 'Trebuchet MS', sans-serif";
  pen.fillText(message, pitch.width / 2, pitch.height - 12);
}

// ---------- Taking a shot ----------

function shootAt(x, y) {
  if (!playing || flying) return;

  // Keep the shot inside the goal.
  aimX = Math.max(GOAL_LEFT + 16, Math.min(GOAL_RIGHT - 16, x));
  aimY = Math.max(GOAL_TOP + 16, Math.min(GOAL_LINE - 10, y));

  // The keeper guesses a spot. Usually near where you aimed, sometimes not.
  var guess = Math.random() < 0.38
      ? aimX                                              // good guess
      : GOAL_LEFT + Math.random() * (GOAL_RIGHT - GOAL_LEFT);   // wild guess
  keeper.divingTo = Math.max(GOAL_LEFT, Math.min(GOAL_RIGHT - KEEPER_WIDTH, guess - KEEPER_WIDTH / 2));

  shotFrom = { x: ball.x, y: ball.y };
  flying = true;
  flightStep = 0;
}

function rollBall() {
  ball.x += ball.rollingRight ? BALL_ROLL_SPEED : -BALL_ROLL_SPEED;

  // Turn around at the edges so it stays in front of the goal.
  if (ball.x > BALL_HOME_X + BALL_ROLL_WIDTH) ball.rollingRight = false;
  if (ball.x < BALL_HOME_X - BALL_ROLL_WIDTH) ball.rollingRight = true;

  // A rolling ball spins the way it is travelling.
  ball.spin += ball.rollingRight ? 0.09 : -0.09;
}

function moveBall() {
  flightStep++;
  var howFar = flightStep / FLIGHT_LENGTH;

  ball.x = shotFrom.x + (aimX - shotFrom.x) * howFar;
  ball.y = shotFrom.y + (aimY - shotFrom.y) * howFar;
  ball.spin += 0.3;

  // The keeper dives towards their guess.
  if (keeper.divingTo !== null) {
    keeper.x += (keeper.divingTo - keeper.x) * KEEPER_SPEED * 2;
  }

  if (flightStep >= FLIGHT_LENGTH) finishShot();
}

function finishShot() {
  flying = false;
  shotsTaken++;

  var keeperMiddle = keeper.x + KEEPER_WIDTH / 2;
  var saved = Math.abs(keeperMiddle - ball.x) < KEEPER_REACH;

  if (saved) {
    message = "🧤 Saved! Bad luck.";
  } else {
    goalsScored++;
    message = "⚽ GOAL! 🎉";
  }

  if (shotsTaken >= HOW_MANY_SHOTS) {
    setTimeout(endShootout, 1200);
  } else {
    setTimeout(function () {
      resetBall();
      message = "Shot " + (shotsTaken + 1) + " of " + HOW_MANY_SHOTS + " - take aim!";
    }, 1200);
  }
}

function endShootout() {
  playing = false;
  if (goalsScored > best) {
    best = goalsScored;
    try { localStorage.setItem("jack-penalty-best", best); } catch (whoops) {}
  }
  message = "You scored " + goalsScored + " out of " + HOW_MANY_SHOTS + "! " + howDidYouDo();
  kickOffButton.hidden = false;
  kickOffButton.textContent = "⚽ Shoot again";
}

function howDidYouDo() {
  if (goalsScored === HOW_MANY_SHOTS) return "PERFECT! 🏆";
  if (goalsScored >= 3) return "Great shooting!";
  if (goalsScored >= 1) return "Keep practising!";
  return "The keeper was on fire!";
}

// ---------- The game loop ----------

function everyFrame() {
  if (flying) moveBall();
  else if (playing) rollBall();
  drawPitch();
  drawGoal();
  drawKeeper();
  drawBall();
  drawScoreboard();
  requestAnimationFrame(everyFrame);
}

// ---------- Controls ----------

pitch.addEventListener("click", function (event) {
  var box = pitch.getBoundingClientRect();
  shootAt(
    (event.clientX - box.left) * (pitch.width / box.width),
    (event.clientY - box.top) * (pitch.height / box.height)
  );
});

kickOffButton.addEventListener("click", function () {
  newShootout();
  kickOffButton.hidden = true;
});

// Show the goal sitting there until the first shot.
shotsTaken = 0;
goalsScored = 0;
message = "Press Start shooting!";
resetBall();
everyFrame();
