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
var openBoxButton = document.getElementById("open-box-button");
var desertCarButton = document.getElementById("desert-car-button");

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
// ---------- WHAT IS BURIED IN THE DESERT ----------
// Dig in the sand and these are what you can turn up. The mystery
// dumpling box is the one you are really after.
var BURIED = [
  { picture: "\uD83D\uDC8E", name: "a diamond" },
  { picture: "\uD83C\uDFFA", name: "an old pot" },
  { picture: "\uD83E\uDDB4", name: "a dinosaur bone" },
  { picture: "\uD83E\uDE99", name: "a gold coin" },
  { picture: "\uD83D\uDDDD\uFE0F", name: "a rusty key" },
  { picture: "\uD83D\uDCE6", name: "the MYSTERY DUMPLING BOX", isTheBox: true }
];

// What can be inside the box.
var DUMPLINGS = [
  { name: "GOLD", colour: "gold" },
  { name: "SILVER", colour: "silver" },
  { name: "RED", colour: "red" }
];

var toFind = [];
var holes = [];                  // every hole you have dug
var boxFound = false;
var whatWasInTheBox = null;

// ---------- THE DESERT CAR ----------
// Once you have landed, the rocket can turn into a desert car.
// Press again to change its colour.
// These numbers were picked by rendering the car at lots of different
// hue-rotate angles and looking at which ones really came out green and
// orange. 150 looked red, so orange needed 175.
var DESERT_CAR_COLOURS = [
  { name: "green",  look: "hue-rotate(-100deg) saturate(1.6)" },
  { name: "blue",   look: "" },
  { name: "orange", look: "hue-rotate(175deg) saturate(1.7) brightness(1.05)" }
];
var desertCar = -1;              // -1 means still a rocket
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
  holes = [];
  boxFound = false;
  whatWasInTheBox = null;
  desertCar = -1;
  transformButton.hidden = true;
  exploreButton.hidden = true;
  openBoxButton.hidden = true;
  desertCarButton.hidden = true;
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

// ---------- The journey home ----------
// It happens in three parts: you fly through space towards the Earth,
// the rocket goes into it, and then you come down and land in the desert.

var FLYING_TO_EARTH = 130;     // frames spent flying through space
var GOING_IN = 45;             // frames spent diving into the Earth
var COMING_DOWN = 190;         // frames spent floating down into the desert

function drawStars() {
  pen.fillStyle = "#ffffff";
  for (var i = 0; i < 46; i++) {
    var starX = (i * 137) % road.width;
    var starY = (i * 211) % road.height;
    pen.beginPath();
    pen.arc(starX, starY, 1.5, 0, Math.PI * 2);
    pen.fill();
  }
}

// The rocket, with its flames, drawn wherever you like and however big.
function drawRocket(x, y, howBig, flameSize) {
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  if (flameSize > 0) {
    pen.font = (flameSize + Math.sin(frame * 0.5) * 5) + "px serif";
    pen.fillText("\uD83D\uDD25", x, y + howBig * 0.75);
  }
  pen.font = howBig + "px serif";
  pen.fillText(transformed ? "\uD83D\uDE80" : "\uD83C\uDFCE\uFE0F", x, y);
}

function drawJourneyHome() {
  var howLongFor = frame - endingAt;

  // ---- Part 1: flying through space towards the Earth ----
  if (howLongFor < FLYING_TO_EARTH) {
    var howFar = howLongFor / FLYING_TO_EARTH;

    pen.fillStyle = "#05060f";
    pen.fillRect(0, 0, road.width, road.height);
    drawStars();

    // The Earth, small and far away, growing as you get closer.
    var earthSize = 40 + howFar * 150;
    pen.font = earthSize + "px serif";
    pen.textAlign = "center";
    pen.textBaseline = "middle";
    pen.fillText("\uD83C\uDF0D", road.width / 2, road.height * 0.32);

    // The rocket flying up towards it.
    drawRocket(road.width / 2, road.height * 0.82 - howFar * 120, 52, 30);

    pen.fillStyle = "#ffffff";
    pen.textBaseline = "alphabetic";
    pen.font = "bold 19px 'Trebuchet MS', sans-serif";
    pen.fillText("Flying home to Earth...", road.width / 2, road.height - 40);
    return;
  }

  // ---- Part 2: going into the Earth ----
  if (howLongFor < FLYING_TO_EARTH + GOING_IN) {
    var howDeep = (howLongFor - FLYING_TO_EARTH) / GOING_IN;

    pen.fillStyle = "#05060f";
    pen.fillRect(0, 0, road.width, road.height);
    drawStars();

    pen.font = "190px serif";
    pen.textAlign = "center";
    pen.textBaseline = "middle";
    pen.fillText("\uD83C\uDF0D", road.width / 2, road.height * 0.32);

    // The rocket shrinks away into the planet.
    drawRocket(road.width / 2,
               road.height * 0.7 - howDeep * (road.height * 0.38),
               52 - howDeep * 44,
               26 - howDeep * 26);

    // Everything goes white as it enters.
    if (howDeep > 0.75) {
      pen.fillStyle = "rgba(255, 255, 255, " + ((howDeep - 0.75) * 4) + ")";
      pen.fillRect(0, 0, road.width, road.height);
    }
    return;
  }

  // ---- Part 3: coming down into the desert ----
  var sinceEntering = howLongFor - FLYING_TO_EARTH - GOING_IN;
  var comingDown = Math.min(1, sinceEntering / COMING_DOWN);

  drawDesert();

  var landsAt = road.height * 0.72;
  var rocketY = -60 + (landsAt + 60) * comingDown;

  if (comingDown >= 1) {
    // A puff of dust once it has touched down.
    pen.fillStyle = "rgba(217, 178, 115, 0.85)";
    pen.beginPath();
    pen.ellipse(road.width / 2, landsAt + 34, 62, 12, 0, 0, Math.PI * 2);
    pen.fill();
  }

  // A parachute opens near the top and carries it down, then lets go
  // just before it lands.
  if (comingDown > 0.12 && comingDown < 0.94) {
    pen.font = "62px serif";
    pen.textAlign = "center";
    pen.textBaseline = "middle";
    // It sways gently from side to side as it falls.
    pen.fillText("\uD83E\uDE82",
                 road.width / 2 + Math.sin(frame * 0.06) * 14,
                 rocketY - 56);
  }

  // The rockets only fire before the parachute opens.
  drawRocket(road.width / 2, rocketY, 56, comingDown < 0.12 ? 30 : 0);

  // The white flash fading away, so part 2 joins onto part 3.
  if (sinceEntering < 20) {
    pen.fillStyle = "rgba(255, 255, 255, " + (1 - sinceEntering / 20) + ")";
    pen.fillRect(0, 0, road.width, road.height);
  }

  if (sinceEntering > COMING_DOWN + 20) {
    pen.fillStyle = "rgba(0, 0, 0, 0.55)";
    pen.fillRect(0, road.height - 152, road.width, 122);
    pen.fillStyle = "#ffffff";
    pen.textAlign = "center";
    pen.textBaseline = "alphabetic";
    pen.font = "bold 30px 'Trebuchet MS', sans-serif";
    pen.fillText("WELL DONE!", road.width / 2, road.height - 114);
    pen.font = "bold 17px 'Trebuchet MS', sans-serif";
    pen.fillText("You arrived at the desert.", road.width / 2, road.height - 86);
    pen.fillText("Now you can dig and explore!", road.width / 2, road.height - 62);
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
  openBoxButton.hidden = true;
  desertCarButton.hidden = false;

  // Always leave a way back to the racing, even if you never find
  // the box - otherwise you are stuck in the desert.
  goButton.hidden = false;
  goButton.textContent = "\uD83C\uDFC1 Race again";
  desertCarButton.textContent = "\uD83D\uDE99 Transform into a desert car";

  holes = [];
  boxFound = false;
  whatWasInTheBox = null;

  // Bury everything in random spots under the sand.
  toFind = BURIED.map(function (thing) {
    return {
      picture: thing.picture,
      name: thing.name,
      isTheBox: thing.isTheBox,
      x: 45 + Math.random() * (road.width - 90),
      y: road.height * 0.58 + Math.random() * (road.height * 0.34),
      dugUp: false
    };
  });
}

// Dig a hole wherever you tapped, and see what is in it.
function digHere(x, y) {
  if (!exploring) return;

  holes.push({ x: x, y: y });

  toFind.forEach(function (thing) {
    if (thing.dugUp) return;
    var awayX = thing.x - x;
    var awayY = thing.y - y;
    if (Math.sqrt(awayX * awayX + awayY * awayY) < 46) {
      thing.dugUp = true;
      if (thing.isTheBox) {
        boxFound = true;
        openBoxButton.hidden = false;
      }
    }
  });
}

function drawExploring() {
  drawDesert();

  pen.textAlign = "center";
  pen.textBaseline = "middle";

  // The holes you have dug.
  holes.forEach(function (hole) {
    pen.fillStyle = "#b08a4e";
    pen.beginPath();
    pen.ellipse(hole.x, hole.y, 24, 13, 0, 0, Math.PI * 2);
    pen.fill();
    pen.fillStyle = "#8a6a36";
    pen.beginPath();
    pen.ellipse(hole.x, hole.y + 2, 17, 9, 0, 0, Math.PI * 2);
    pen.fill();
  });

  // Your rocket, or your desert car, parked on the sand.
  pen.save();
  if (desertCar >= 0) {
    pen.filter = DESERT_CAR_COLOURS[desertCar].look || "none";
    pen.font = "48px serif";
    pen.fillText("\uD83D\uDE99", road.width / 2, road.height * 0.72);
  } else {
    pen.font = "48px serif";
    pen.fillText(transformed ? "\uD83D\uDE80" : "\uD83C\uDFCE\uFE0F",
                 road.width / 2, road.height * 0.72);
  }
  pen.restore();

  // Whatever you have dug up sits in its hole.
  toFind.forEach(function (thing) {
    if (!thing.dugUp) return;
    pen.font = (thing.isTheBox ? 40 : 32) + "px serif";
    pen.fillText(thing.picture, thing.x, thing.y - 6);
  });

  // What is inside the box, once it is open.
  if (whatWasInTheBox) {
    pen.fillStyle = "rgba(0, 0, 0, 0.62)";
    pen.fillRect(0, road.height / 2 - 110, road.width, 210);

    pen.save();
    pen.filter = dumplingLook(whatWasInTheBox.colour);
    pen.font = "110px serif";
    pen.fillText("\uD83E\uDD5F", road.width / 2, road.height / 2 - 20);
    pen.restore();

    pen.fillStyle = "#ffffff";
    pen.font = "bold 26px 'Trebuchet MS', sans-serif";
    pen.fillText("A " + whatWasInTheBox.name + " DUMPLING!", road.width / 2, road.height / 2 + 62);
  }

  var dugUp = toFind.filter(function (t) { return t.dugUp; }).length;

  pen.textAlign = "left";
  pen.textBaseline = "alphabetic";
  pen.fillStyle = "#5a3a1c";
  pen.font = "bold 19px 'Trebuchet MS', sans-serif";
  pen.fillText("Dug up " + dugUp + " of " + toFind.length, 12, 32);
  pen.font = "bold 14px 'Trebuchet MS', sans-serif";
  pen.fillText(boxFound ? "You found the mystery box! Open it \u2193"
                        : "Tap the sand anywhere to dig", 12, 54);
  if (desertCar >= 0) {
    pen.fillText("Driving the " + DESERT_CAR_COLOURS[desertCar].name +
                 " desert car \uD83D\uDE99", 12, 74);
  }

}

// Gold, silver or red - done by tinting the dumpling.
function dumplingLook(colour) {
  if (colour === "gold") {
    return "sepia(1) saturate(5) hue-rotate(-18deg) brightness(1.12) " +
           "drop-shadow(0 0 22px rgba(255,200,60,0.95))";
  }
  if (colour === "silver") {
    return "grayscale(1) brightness(1.35) contrast(1.1) " +
           "drop-shadow(0 0 22px rgba(230,230,240,0.95))";
  }
  return "sepia(1) saturate(9) hue-rotate(-50deg) brightness(0.95) " +
         "drop-shadow(0 0 22px rgba(230,60,60,0.95))";
}

desertCarButton.addEventListener("click", function () {
  desertCar = (desertCar + 1) % DESERT_CAR_COLOURS.length;
  desertCarButton.textContent = "\uD83C\uDFA8 Make it " +
    DESERT_CAR_COLOURS[(desertCar + 1) % DESERT_CAR_COLOURS.length].name;
});

openBoxButton.addEventListener("click", function () {
  if (!boxFound || whatWasInTheBox) return;
  whatWasInTheBox = DUMPLINGS[Math.floor(Math.random() * DUMPLINGS.length)];
  openBoxButton.hidden = true;
});

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
    drawExploring();
    requestAnimationFrame(everyFrame);
    return;
  }

  if (showingEarth) {
    frame++;
    drawJourneyHome();
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

road.addEventListener("pointermove", function (event) {
  if (exploring) return;          // in the desert you tap to dig instead
  steerTo(event.clientX);
});
road.addEventListener("touchmove", function (event) { event.preventDefault(); }, { passive: false });

// In the desert, tapping anywhere digs a hole there.
road.addEventListener("pointerdown", function (event) {
  if (!exploring) return;
  var box = road.getBoundingClientRect();
  digHere((event.clientX - box.left) * (road.width / box.width),
          (event.clientY - box.top) * (road.height / box.height));
});


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
