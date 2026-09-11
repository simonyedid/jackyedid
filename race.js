// ============================================================
// RACE
// You are the racing car at the bottom. Dodge the other cars!
// The longer you last, the faster it gets.
// ============================================================

// ---------- SETTINGS - change these! ----------
var MY_CAR = "🏎️";

// ---------- THE PLACES YOU DRIVE THROUGH ----------
// You start on the street. Get past enough cars and the whole world
// changes. "from" is how many cars you need to reach that place.
// Copy a block to invent a new one!
var ZONES = [
  { name: "🌳 The Street", from: 0,
    ground: "#3f8f4a", road: "#3a3f46", lines: "#ffffff", edges: "#f5f5f5",
    scenery: "trees",
    cars: ["🚗", "🚙", "🚕", "🚌", "🚚"] },

  { name: "🗽 New York City", from: 10,
    ground: "#5fb8e0", road: "#3a3f46", lines: "#f2c14e", edges: "#ffffff",
    scenery: "newyork",          // skyscrapers, then a bridge over the sea
    cars: ["🚕", "🚓", "🚌", "🚛", "🛵"] },

  { name: "🛣️ The Highway", from: 20,
    ground: "#b89b5e", road: "#33373d", lines: "#f2c14e", edges: "#ffffff",
    scenery: "signs",
    cars: ["🚚", "🚛", "🚗", "🏍️", "🚙"] },

  { name: "🧊 The Arctic", from: 30,
    ground: "#e8f4ff", road: "#7fb3cc", lines: "#ffffff", edges: "#bfe6f5",
    scenery: "ice",
    cars: ["🛷", "🚙", "🐧", "🦭", "🚜"] },

  { name: "🚀 Outer Space", from: 40,
    ground: "#05060f", road: "#2a1f4a", lines: "#4fe3e8", edges: "#9d4edd",
    scenery: "stars",
    flying: true,                 // no ground in space - your car takes off!
    cars: ["🛸", "🚀", "👾", "☄️", "🛰️"] }
];

var STARTING_SPEED = 7;     // how fast the road moves at the start
var FASTEST_SPEED = 20;     // it never gets faster than this
var SPEEDS_UP_BY = 0.4;     // how much faster after every car you pass
var HOW_OFTEN_A_CAR = 74;   // a new car every this many frames (smaller = harder)
var STEERING_SPEED = 10;    // how quickly your car moves left and right
// ----------------------------------------------

var road = document.getElementById("road");
var pen = road.getContext("2d");
var goButton = document.getElementById("go-button");
var transformButton = document.getElementById("transform-button");
var exploreButton = document.getElementById("explore-button");

var siteColors = getComputedStyle(document.documentElement);
var BLUE = siteColors.getPropertyValue("--accent").trim();

var GRASS = 46;                              // how wide the grass edges are
var ROAD_LEFT = GRASS;
var ROAD_RIGHT = road.width - GRASS;
var CAR_WIDTH = 42;
var CAR_HEIGHT = 52;

var ON_THE_GROUND = 0;      // worked out once the road size is known
var UP_IN_THE_AIR = 0;

var myCar, otherCars, speed, score, best, frame, racing, crashed;
var zone = ZONES[0];              // where you are driving right now
var flyingNow = 0;                // 0 on the ground, 1 fully flying
var transformed = false;          // has the car turned into a rocket?
var endingAt = 0;                 // when the landing starts
var showingEarth = false;         // true once the landing has begun
var exploring = false;            // driving about the desert afterwards
var holdingUp = false;
var holdingDown = false;

// The things hidden in the desert to go and find.
var DESERT_THINGS = ["\uD83C\uDF35", "\uD83D\uDC8E", "\uD83C\uDFFA", "\uD83E\uDD98", "\uD83C\uDFDD\uFE0F"];
var toFind = [];
var explorer = { x: 0, y: 0 };
var bannerUntil = 0;              // keep the "new place!" sign up for a bit

// Remember the best score between visits, if the browser lets us.
try { best = Number(localStorage.getItem("jack-race-best")) || 0; }
catch (whoops) { best = 0; }

// Which place are you in? The last one you have reached enough cars for.
function whichZone() {
  var found = ZONES[0];
  ZONES.forEach(function (place) {
    if (score >= place.from) found = place;
  });
  return found;
}

function checkForANewPlace() {
  var nowIn = whichZone();
  if (nowIn !== zone) {
    zone = nowIn;
    bannerUntil = frame + 110;        // show the sign for about 2 seconds
  }
}

function newRace() {
  ON_THE_GROUND = road.height - 110;
  UP_IN_THE_AIR = road.height - 200;
  flyingNow = 0;
  myCar = { x: road.width / 2 - CAR_WIDTH / 2, y: ON_THE_GROUND };
  otherCars = [];
  speed = STARTING_SPEED;
  score = 0;
  frame = 0;
  crashed = false;
  racing = true;
  zone = ZONES[0];
  bannerUntil = 0;
  transformed = false;
  showingEarth = false;
  exploring = false;
  endingAt = 0;
  transformButton.hidden = true;
  exploreButton.hidden = true;
}

// ---------- Drawing ----------

function drawRoad() {
  // The ground either side, in the colours of this place.
  pen.fillStyle = zone.ground;
  pen.fillRect(0, 0, road.width, road.height);

  drawScenery();

  // The tarmac.
  pen.fillStyle = zone.road;
  pen.fillRect(ROAD_LEFT, 0, ROAD_RIGHT - ROAD_LEFT, road.height);

  // Lines down the middle, moving to make it look like driving.
  pen.strokeStyle = zone.lines;
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
  pen.strokeStyle = zone.edges;
  pen.beginPath();
  pen.moveTo(ROAD_LEFT, 0); pen.lineTo(ROAD_LEFT, road.height);
  pen.moveTo(ROAD_RIGHT, 0); pen.lineTo(ROAD_RIGHT, road.height);
  pen.stroke();
}

// Whatever goes past at the sides. It slides down with the road so it
// looks like you are driving past it.
function drawScenery() {
  var slide = (frame * speed) % 120;

  for (var y = -120; y < road.height + 120; y += 120) {
    var downTo = y + slide;

    if (zone.scenery === "trees") {
      sideBySide(downTo, function (x) {
        pen.font = "30px serif";
        pen.textAlign = "center";
        pen.fillText("\uD83C\uDF33", x, downTo);
      });

    } else if (zone.scenery === "newyork") {
      // New York in the daytime: skyscrapers, then a bridge over the sea,
      // then skyscrapers again, over and over as you drive.
      var bridgeBit = Math.floor((y + 1200) / 120) % 3 === 1;

      if (bridgeBit) {
        sideBySide(downTo, function (x) {
          // The sea is the ground colour here, so just add the bridge.
          pen.fillStyle = "#8a5a2b";
          pen.fillRect(x - GRASS / 2, downTo - 14, GRASS, 14);   // the deck
          pen.fillStyle = "#c8322a";
          pen.fillRect(x - 5, downTo - 86, 10, 72);              // a tower
          pen.strokeStyle = "#c8322a";                            // the cables
          pen.lineWidth = 2;
          pen.beginPath();
          pen.moveTo(x - GRASS / 2, downTo - 14);
          pen.lineTo(x, downTo - 80);
          pen.lineTo(x + GRASS / 2, downTo - 14);
          pen.stroke();
        });
        // A boat on the water now and then.
        if (Math.floor(y / 120) % 2 === 0) {
          pen.font = "20px serif";
          pen.textAlign = "center";
          pen.fillText("\u26F5", GRASS / 2, downTo + 44);
        }

      } else {
        sideBySide(downTo, function (x) {
          pen.fillStyle = "#8e99a8";                 // daytime grey skyscraper
          pen.fillRect(x - 22, downTo - 96, 44, 96);
          pen.fillStyle = "#cfe3f2";                 // windows catching the sun
          for (var wy = downTo - 86; wy < downTo - 8; wy += 16) {
            pen.fillRect(x - 15, wy, 10, 9);
            pen.fillRect(x + 4, wy, 10, 9);
          }
        });
      }

    } else if (zone.scenery === "signs") {
      sideBySide(downTo, function (x) {
        pen.fillStyle = "#8a8f96";
        pen.fillRect(x - 2, downTo - 40, 4, 40);   // the pole
        pen.fillStyle = "#2a9d3f";
        pen.fillRect(x - 18, downTo - 58, 36, 20); // the green sign
      });

    } else if (zone.scenery === "ice") {
      sideBySide(downTo, function (x) {
        pen.font = "28px serif";
        pen.textAlign = "center";
        pen.fillText("\uD83C\uDF32", x, downTo);
        pen.fillStyle = "#bfe6f5";
        pen.beginPath();
        pen.arc(x, downTo + 40, 12, 0, Math.PI * 2);   // a lump of ice
        pen.fill();
      });

    } else if (zone.scenery === "stars") {
      // Stars are scattered about rather than lined up.
      pen.fillStyle = "#ffffff";
      for (var i = 0; i < 4; i++) {
        var starX = ((i * 97 + y * 3) % (GRASS - 8)) + 4;
        pen.beginPath();
        pen.arc(starX, downTo + i * 17, 1.6, 0, Math.PI * 2);
        pen.arc(road.width - starX, downTo + i * 23, 1.6, 0, Math.PI * 2);
        pen.fill();
      }
    }
  }
}

// Draw the same thing on the left and the right of the road.
function sideBySide(downTo, draw) {
  draw(GRASS / 2);
  draw(road.width - GRASS / 2);
}

function drawCar(car, picture, isMine) {
  // Once you have transformed, your car IS a rocket.
  if (isMine && transformed) picture = "\uD83D\uDE80";

  var middleX = car.x + CAR_WIDTH / 2;
  var middleY = car.y + CAR_HEIGHT / 2;

  pen.font = "44px serif";
  pen.textAlign = "center";
  pen.textBaseline = "middle";

  // Just an ordinary car on an ordinary road.
  if (!isMine || flyingNow < 0.02) {
    pen.fillText(picture, middleX, middleY);
    return;
  }

  // Flying! It floats up and down, leans the way it is going, and
  // fires its rockets out of the back.
  var bob = Math.sin(frame * 0.09) * 7 * flyingNow;
  var lean = 0;
  if (holdingLeft) lean = -0.18;
  if (holdingRight) lean = 0.18;

  pen.save();
  pen.translate(middleX, middleY + bob);

  // The rocket flames, out of the back, flickering. A transformed
  // rocket has much bigger ones.
  var flameSize = transformed ? 40 : 26;
  pen.font = (flameSize + Math.sin(frame * 0.5) * 6) + "px serif";
  pen.globalAlpha = flyingNow;
  pen.fillText("\uD83D\uDD25", 0, CAR_HEIGHT / 2 + 10);
  pen.globalAlpha = 1;

  pen.rotate(lean * flyingNow);
  pen.font = "44px serif";
  pen.fillText(picture, 0, 0);
  pen.restore();
}

function drawScore() {
  pen.textAlign = "left";
  pen.textBaseline = "alphabetic";
  pen.font = "bold 24px 'Trebuchet MS', sans-serif";
  pen.fillStyle = "#ffffff";
  pen.fillText("Score " + score, 12, 34);
  pen.font = "bold 16px 'Trebuchet MS', sans-serif";
  pen.fillText("Best " + best, 12, 58);

  // Where you are now, in the top corner.
  pen.textAlign = "right";
  pen.fillText(zone.name, road.width - 12, 34);

  // A big sign when you first arrive somewhere new.
  if (frame < bannerUntil) {
    pen.fillStyle = "rgba(0, 0, 0, 0.6)";
    pen.fillRect(0, road.height / 2 - 46, road.width, 92);
    pen.textAlign = "center";
    pen.fillStyle = "#ffffff";
    pen.font = "bold 17px 'Trebuchet MS', sans-serif";
    pen.fillText(transformed && zone.flying ? "YOU ARE NOW A" : "WELCOME TO",
                 road.width / 2, road.height / 2 - 12);
    pen.font = "bold 27px 'Trebuchet MS', sans-serif";
    pen.fillText(transformed && zone.flying ? "\uD83D\uDE80 ROCKET!" : zone.name,
                 road.width / 2, road.height / 2 + 22);
  }
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
    picture: zone.cars[Math.floor(Math.random() * zone.cars.length)]
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

  // In space the car lifts off and floats higher up the screen.
  // It moves there slowly, so you see it take off.
  // The TRANSFORM button only makes sense where you are flying.
  transformButton.hidden = !(zone.flying && racing && !transformed);

  var wantsToFly = zone.flying ? 1 : 0;
  flyingNow += (wantsToFly - flyingNow) * 0.04;
  myCar.y = ON_THE_GROUND + (UP_IN_THE_AIR - ON_THE_GROUND) * flyingNow;

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
      if (speed < FASTEST_SPEED) speed += SPEEDS_UP_BY;
      checkForANewPlace();
    }
  }
}

function crash() {
  racing = false;
  crashed = true;
  transformButton.hidden = true;
  if (typeof giveAStar === "function") giveAStar();   // a star for finishing a race
  if (score > best) {
    best = score;
    try { localStorage.setItem("jack-race-best", best); } catch (whoops) {}
  }
  // Show the crash for a moment, then land in the desert.
  endingAt = frame + 100;
}

// ---------- Coming home ----------

// A desert on Earth, with the sun and some dunes.
function drawDesert() {
  var sky = pen.createLinearGradient(0, 0, 0, road.height * 0.55);
  sky.addColorStop(0, "#7fc8f0");
  sky.addColorStop(1, "#ffe3b0");
  pen.fillStyle = sky;
  pen.fillRect(0, 0, road.width, road.height);

  pen.font = "46px serif";
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.fillText("\u2600\uFE0F", road.width - 60, 60);

  pen.fillStyle = "#e6c489";
  pen.fillRect(0, road.height * 0.5, road.width, road.height);

  // Dunes rolling across the sand.
  pen.fillStyle = "#d9b273";
  for (var d = 0; d < 3; d++) {
    pen.beginPath();
    pen.arc(road.width * (0.2 + d * 0.32), road.height * (0.56 + d * 0.05), 90, Math.PI, 0);
    pen.fill();
  }
}

// The rocket coming down out of the sky onto the sand.
function drawLanding() {
  var howLongFor = frame - endingAt;
  var comingDown = Math.min(1, howLongFor / 120);

  drawDesert();

  var landsAt = road.height * 0.72;
  var rocketY = -60 + (landsAt + 60) * comingDown;

  pen.textAlign = "center";
  pen.textBaseline = "middle";

  if (comingDown < 1) {
    // Flames underneath while it is still coming down.
    pen.font = (30 + Math.sin(frame * 0.5) * 6) + "px serif";
    pen.fillText("\uD83D\uDD25", road.width / 2, rocketY + 42);
  } else {
    // A puff of dust once it has touched down.
    pen.fillStyle = "rgba(217, 178, 115, 0.85)";
    pen.beginPath();
    pen.ellipse(road.width / 2, landsAt + 34, 62, 12, 0, 0, Math.PI * 2);
    pen.fill();
  }

  pen.font = "56px serif";
  pen.fillText(transformed ? "\uD83D\uDE80" : "\uD83C\uDFCE\uFE0F", road.width / 2, rocketY);

  if (howLongFor > 140) {
    pen.fillStyle = "rgba(0, 0, 0, 0.55)";
    pen.fillRect(0, road.height - 152, road.width, 122);
    pen.fillStyle = "#ffffff";
    pen.textBaseline = "alphabetic";
    pen.font = "bold 30px 'Trebuchet MS', sans-serif";
    pen.fillText("WELL DONE!", road.width / 2, road.height - 114);
    pen.font = "bold 17px 'Trebuchet MS', sans-serif";
    pen.fillText("You arrived at the desert.", road.width / 2, road.height - 86);
    pen.fillText("Now you can explore!", road.width / 2, road.height - 62);
    pen.fillText("You got past " + score + " cars \u00B7 Best " + best,
                 road.width / 2, road.height - 38);

    if (goButton.hidden) {
      goButton.hidden = false;
      goButton.textContent = "\uD83C\uDFC1 Race again";
      exploreButton.hidden = false;
    }
  }
}

// ---------- Exploring the desert ----------

function startExploring() {
  exploring = true;
  showingEarth = false;
  exploreButton.hidden = true;
  goButton.hidden = true;

  explorer.x = road.width / 2;
  explorer.y = road.height * 0.72;

  // Hide things about the sand to go and find.
  toFind = DESERT_THINGS.map(function (picture) {
    return {
      picture: picture,
      x: 40 + Math.random() * (road.width - 80),
      y: road.height * 0.56 + Math.random() * (road.height * 0.36),
      found: false
    };
  });
}

function moveExplorer() {
  if (holdingLeft) explorer.x -= 4;
  if (holdingRight) explorer.x += 4;
  if (holdingUp) explorer.y -= 4;
  if (holdingDown) explorer.y += 4;

  // Stay on the sand.
  if (explorer.x < 24) explorer.x = 24;
  if (explorer.x > road.width - 24) explorer.x = road.width - 24;
  if (explorer.y < road.height * 0.52) explorer.y = road.height * 0.52;
  if (explorer.y > road.height - 30) explorer.y = road.height - 30;

  // Drive into something and you have found it.
  toFind.forEach(function (thing) {
    if (thing.found) return;
    var awayX = thing.x - explorer.x;
    var awayY = thing.y - explorer.y;
    if (Math.sqrt(awayX * awayX + awayY * awayY) < 34) thing.found = true;
  });
}

function drawExploring() {
  drawDesert();

  pen.textAlign = "center";
  pen.textBaseline = "middle";
  toFind.forEach(function (thing) {
    pen.font = "34px serif";
    pen.globalAlpha = thing.found ? 1 : 0.4;      // faint until you find it
    pen.fillText(thing.picture, thing.x, thing.y);
    pen.globalAlpha = 1;
  });

  pen.font = "44px serif";
  pen.fillText(transformed ? "\uD83D\uDE80" : "\uD83C\uDFCE\uFE0F", explorer.x, explorer.y);

  var howManyFound = toFind.filter(function (t) { return t.found; }).length;

  pen.textAlign = "left";
  pen.textBaseline = "alphabetic";
  pen.fillStyle = "#5a3a1c";
  pen.font = "bold 20px 'Trebuchet MS', sans-serif";
  pen.fillText("Found " + howManyFound + " of " + toFind.length, 12, 32);
  pen.font = "bold 14px 'Trebuchet MS', sans-serif";
  pen.fillText("Drive about with the arrow keys or your finger", 12, 54);

  if (howManyFound === toFind.length) {
    pen.textAlign = "center";
    pen.fillStyle = "rgba(0, 0, 0, 0.55)";
    pen.fillRect(0, road.height / 2 - 40, road.width, 80);
    pen.fillStyle = "#ffffff";
    pen.font = "bold 25px 'Trebuchet MS', sans-serif";
    pen.fillText("You explored it all! \uD83C\uDFC6", road.width / 2, road.height / 2 + 8);
    if (goButton.hidden) {
      goButton.hidden = false;
      goButton.textContent = "\uD83C\uDFC1 Race again";
    }
  }
}

exploreButton.addEventListener("click", startExploring);

// ---------- The game loop ----------

function everyFrame() {
  if (racing) moveEverything();

  // Once the crash has been seen, fly home to Earth instead.
  if (crashed && !showingEarth) {
    frame++;
    if (frame > endingAt) { showingEarth = true; endingAt = frame; }   // start landing
  }

  if (exploring) {
    frame++;
    moveExplorer();
    drawExploring();
    requestAnimationFrame(everyFrame);
    return;
  }

  if (showingEarth) {
    frame++;
    drawLanding();
    requestAnimationFrame(everyFrame);
    return;
  }

  drawRoad();
  for (var i = 0; i < otherCars.length; i++) drawCar(otherCars[i], otherCars[i].picture);
  if (myCar) drawCar(myCar, MY_CAR, true);
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
  // Up and down are only used for driving about the desert.
  if (event.key === "ArrowUp") { holdingUp = true; event.preventDefault(); }
  if (event.key === "ArrowDown") { holdingDown = true; event.preventDefault(); }
});
document.addEventListener("keyup", function (event) {
  if (event.key === "ArrowLeft") holdingLeft = false;
  if (event.key === "ArrowRight") holdingRight = false;
  if (event.key === "ArrowUp") holdingUp = false;
  if (event.key === "ArrowDown") holdingDown = false;
});

// Slide a finger or the mouse across the road to steer.
function steerTo(clientX) {
  if (!racing) return;
  var box = road.getBoundingClientRect();
  var acrossTheRoad = (clientX - box.left) * (road.width / box.width);
  myCar.x = acrossTheRoad - CAR_WIDTH / 2;
}

road.addEventListener("pointermove", function (event) {
  if (exploring) {
    // In the desert you can go any direction, so follow the finger.
    var box = road.getBoundingClientRect();
    explorer.x = (event.clientX - box.left) * (road.width / box.width);
    explorer.y = (event.clientY - box.top) * (road.height / box.height);
    return;
  }
  steerTo(event.clientX);
});
road.addEventListener("touchmove", function (event) { event.preventDefault(); }, { passive: false });


transformButton.addEventListener("click", function () {
  if (!zone.flying || transformed) return;
  transformed = true;
  transformButton.hidden = true;
  bannerUntil = frame + 90;          // reuse the big sign to shout about it
});

goButton.addEventListener("click", function () {
  newRace();
  goButton.hidden = true;
  crashed = false;
});

// Show the road sitting still until the first race starts.
ON_THE_GROUND = road.height - 110;
UP_IN_THE_AIR = road.height - 200;
myCar = { x: road.width / 2 - CAR_WIDTH / 2, y: ON_THE_GROUND };
otherCars = [];
speed = STARTING_SPEED;
score = 0;
frame = 0;
racing = false;
crashed = false;
everyFrame();
