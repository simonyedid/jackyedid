// ============================================================
// RACE
// You are the racing car at the bottom. Dodge the other cars!
// The longer you last, the faster it gets.
// ============================================================

// ---------- SETTINGS - change these! ----------
var MY_CAR = "🏎️";
var OTHER_CARS = ["🚗", "🚙", "🚕", "🚌", "🚚"];

var STARTING_SPEED = 4;     // how fast the road moves at the start
var FASTEST_SPEED = 13;     // it never gets faster than this
var HOW_OFTEN_A_CAR = 90;   // a new car every this many frames (smaller = harder)
var STEERING_SPEED = 7;     // how quickly your car moves left and right
// ----------------------------------------------

var road = document.getElementById("road");
var pen = road.getContext("2d");
var goButton = document.getElementById("go-button");

var siteColors = getComputedStyle(document.documentElement);
var BLUE = siteColors.getPropertyValue("--accent").trim();

var GRASS = 46;                              // how wide the grass edges are
var ROAD_LEFT = GRASS;
var ROAD_RIGHT = road.width - GRASS;
var CAR_WIDTH = 42;
var CAR_HEIGHT = 52;

var myCar, otherCars, speed, score, best, frame, racing, crashed;

// Remember the best score between visits, if the browser lets us.
try { best = Number(localStorage.getItem("jack-race-best")) || 0; }
catch (whoops) { best = 0; }

function newRace() {
  myCar = { x: road.width / 2 - CAR_WIDTH / 2, y: road.height - 110 };
  otherCars = [];
  speed = STARTING_SPEED;
  score = 0;
  frame = 0;
  crashed = false;
  racing = true;
}

// ---------- Drawing ----------

function drawRoad() {
  // Grass down both sides.
  pen.fillStyle = "#3f8f4a";
  pen.fillRect(0, 0, road.width, road.height);

  // The tarmac.
  pen.fillStyle = "#3a3f46";
  pen.fillRect(ROAD_LEFT, 0, ROAD_RIGHT - ROAD_LEFT, road.height);

  // White lines down the middle, moving to make it look like driving.
  pen.strokeStyle = "#ffffff";
  pen.lineWidth = 6;
  pen.setLineDash([30, 34]);
  pen.lineDashOffset = -(frame * speed) % 64;
  pen.beginPath();
  pen.moveTo(road.width / 2, 0);
  pen.lineTo(road.width / 2, road.height);
  pen.stroke();
  pen.setLineDash([]);

  // Edges of the road.
  pen.lineWidth = 4;
  pen.strokeStyle = "#f5f5f5";
  pen.beginPath();
  pen.moveTo(ROAD_LEFT, 0); pen.lineTo(ROAD_LEFT, road.height);
  pen.moveTo(ROAD_RIGHT, 0); pen.lineTo(ROAD_RIGHT, road.height);
  pen.stroke();
}

function drawCar(car, picture) {
  pen.font = "44px serif";
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.fillText(picture, car.x + CAR_WIDTH / 2, car.y + CAR_HEIGHT / 2);
}

function drawScore() {
  pen.textAlign = "left";
  pen.textBaseline = "alphabetic";
  pen.font = "bold 24px 'Trebuchet MS', sans-serif";
  pen.fillStyle = "#ffffff";
  pen.fillText("Score " + score, 12, 34);
  pen.font = "bold 16px 'Trebuchet MS', sans-serif";
  pen.fillText("Best " + best, 12, 58);
}

function drawMessage(bigWords, smallWords) {
  pen.fillStyle = "rgba(0, 0, 0, 0.65)";
  pen.fillRect(0, road.height / 2 - 80, road.width, 160);
  pen.textAlign = "center";
  pen.fillStyle = "#ffffff";
  pen.font = "bold 34px 'Trebuchet MS', sans-serif";
  pen.fillText(bigWords, road.width / 2, road.height / 2 - 10);
  pen.font = "bold 20px 'Trebuchet MS', sans-serif";
  pen.fillText(smallWords, road.width / 2, road.height / 2 + 30);
}

// ---------- Moving ----------

function addCarIfItIsTime() {
  if (frame % HOW_OFTEN_A_CAR !== 0) return;
  var lanes = 3;
  var laneWidth = (ROAD_RIGHT - ROAD_LEFT) / lanes;
  var lane = Math.floor(Math.random() * lanes);
  otherCars.push({
    x: ROAD_LEFT + lane * laneWidth + laneWidth / 2 - CAR_WIDTH / 2,
    y: -CAR_HEIGHT,
    picture: OTHER_CARS[Math.floor(Math.random() * OTHER_CARS.length)]
  });
}

function theyCrashed(a, b) {
  // A little smaller than the cars really are, so near misses are allowed.
  return a.x + 8 < b.x + CAR_WIDTH - 8 &&
         a.x + CAR_WIDTH - 8 > b.x + 8 &&
         a.y + 8 < b.y + CAR_HEIGHT - 8 &&
         a.y + CAR_HEIGHT - 8 > b.y + 8;
}

function moveEverything() {
  frame++;

  if (holdingLeft) myCar.x -= STEERING_SPEED;
  if (holdingRight) myCar.x += STEERING_SPEED;

  // Stay on the road.
  if (myCar.x < ROAD_LEFT) myCar.x = ROAD_LEFT;
  if (myCar.x > ROAD_RIGHT - CAR_WIDTH) myCar.x = ROAD_RIGHT - CAR_WIDTH;

  addCarIfItIsTime();

  for (var i = otherCars.length - 1; i >= 0; i--) {
    otherCars[i].y += speed;

    if (theyCrashed(myCar, otherCars[i])) {
      crash();
      return;
    }

    // Once a car is off the bottom you have got past it.
    if (otherCars[i].y > road.height) {
      otherCars.splice(i, 1);
      score += 1;
      if (speed < FASTEST_SPEED) speed += 0.25;
    }
  }
}

function crash() {
  racing = false;
  crashed = true;
  if (score > best) {
    best = score;
    try { localStorage.setItem("jack-race-best", best); } catch (whoops) {}
  }
  goButton.hidden = false;
  goButton.textContent = "🏁 Race again";
}

// ---------- The game loop ----------

function everyFrame() {
  if (racing) moveEverything();

  drawRoad();
  for (var i = 0; i < otherCars.length; i++) drawCar(otherCars[i], otherCars[i].picture);
  if (myCar) drawCar(myCar, MY_CAR);
  drawScore();

  if (crashed) drawMessage("💥 Crash!", "You passed " + score + " cars");
  else if (!racing) drawMessage("Ready?", "Press Start racing");

  requestAnimationFrame(everyFrame);
}

// ---------- Controls ----------

var holdingLeft = false;
var holdingRight = false;

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") { holdingLeft = true; event.preventDefault(); }
  if (event.key === "ArrowRight") { holdingRight = true; event.preventDefault(); }
});
document.addEventListener("keyup", function (event) {
  if (event.key === "ArrowLeft") holdingLeft = false;
  if (event.key === "ArrowRight") holdingRight = false;
});

// Slide a finger or the mouse across the road to steer.
function steerTo(clientX) {
  if (!racing) return;
  var box = road.getBoundingClientRect();
  var acrossTheRoad = (clientX - box.left) * (road.width / box.width);
  myCar.x = acrossTheRoad - CAR_WIDTH / 2;
}

road.addEventListener("pointermove", function (event) { steerTo(event.clientX); });
road.addEventListener("touchmove", function (event) { event.preventDefault(); }, { passive: false });

goButton.addEventListener("click", function () {
  newRace();
  goButton.hidden = true;
});

// Show the road sitting still until the first race starts.
myCar = { x: road.width / 2 - CAR_WIDTH / 2, y: road.height - 110 };
otherCars = [];
speed = STARTING_SPEED;
score = 0;
frame = 0;
racing = false;
crashed = false;
everyFrame();
