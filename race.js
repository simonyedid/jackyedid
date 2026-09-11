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

// Crash and the whole race starts over again, back on the street.
var CRASH_LASTS = 90;              // frames the crash is shown before you restart

// Get past this many cars in outer space and you fly home to Earth.
var THE_WAY_HOME_STARTS_AT = 50;
// ----------------------------------------------

var road = document.getElementById("road");
var pen = road.getContext("2d");
var goButton = document.getElementById("go-button");
var transformButton = document.getElementById("transform-button");
var exploreButton = document.getElementById("explore-button");
var openBoxButton = document.getElementById("open-box-button");
var desertCarButton = document.getElementById("desert-car-button");
var doorButton = document.getElementById("door-button");
var coreButton = document.getElementById("core-button");
var caveButton = document.getElementById("cave-button");

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
var restartingAt = 0;             // when the crashed race starts over
var station = null;               // the big rocket station hidden in the sand
var goingToMars = false;          // true once you go in the station door
var marsAt = 0;                   // the frame the countdown started
var goingDown = false;            // heading for the center of the Earth
var downAt = 0;                   // the frame you started going down
var inTheCave = false;            // exploring the cave in the middle
var caveCar = null;               // where you are driving in the cave
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
var boxOpenedAt = 0;              // so the big surprise moves out of the way

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
  restartingAt = 0;
  station = null;
  goingToMars = false;
  goingDown = false;
  inTheCave = false;
  transformButton.hidden = true;
  doorButton.hidden = true;
  coreButton.hidden = true;
  caveButton.hidden = true;
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

      // Right out in space, that is the end of the race - time to fly home.
      if (zone.flying && score >= THE_WAY_HOME_STARTS_AT) {
        flyHome();
        return;
      }
    }
  }
}

function crash() {
  racing = false;
  crashed = true;
  transformButton.hidden = true;
  if (typeof giveAStar === "function") giveAStar();   // a star for having a race
  rememberTheScore();
  // Show the crash for a moment, and then the whole race starts over.
  restartingAt = frame + CRASH_LASTS;
}

function rememberTheScore() {
  if (score > best) {
    best = score;
    try { localStorage.setItem("jack-race-best", best); } catch (whoops) {}
  }
}

// You made it all the way through outer space! Now fly home to Earth.
function flyHome() {
  racing = false;
  crashed = false;
  transformButton.hidden = true;
  if (typeof giveAStar === "function") giveAStar();
  rememberTheScore();
  showingEarth = true;
  endingAt = frame;
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

  // The big rocket station is hidden out there too, but you only start
  // looking for it once the mystery box has been opened.
  station = {
    x: 80 + Math.random() * (road.width - 160),
    y: road.height * 0.60 + Math.random() * (road.height * 0.24),
    found: false
  };

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
  if (!exploring || goingToMars) return;

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

  // Keep exploring after your dumpling surprise and you find the
  // BIG ROCKET STATION. Then you can go in its door.
  if (whatWasInTheBox && station && !station.found) {
    var toStationX = station.x - x;
    var toStationY = station.y - y;
    if (Math.sqrt(toStationX * toStationX + toStationY * toStationY) < 70) {
      station.found = true;
      doorButton.hidden = false;
    }
  }
}

// ---------- The big rocket station ----------
// A launch pad with a tall tower, a rocket standing on it, and a door.
function drawStation(x, groundY, howBig) {
  var tall = 150 * howBig;
  var wide = 96 * howBig;

  // The concrete pad it stands on.
  pen.fillStyle = "#9a9a9a";
  pen.fillRect(x - wide / 2, groundY - 10 * howBig, wide, 14 * howBig);

  // The tower, with cross-bars up the side.
  pen.fillStyle = "#6b7280";
  pen.fillRect(x + 20 * howBig, groundY - tall, 12 * howBig, tall);
  pen.strokeStyle = "#6b7280";
  pen.lineWidth = 3 * howBig;
  for (var bar = 1; bar < 7; bar++) {
    var barY = groundY - tall * (bar / 7);
    pen.beginPath();
    pen.moveTo(x + 20 * howBig, barY);
    pen.lineTo(x - 4 * howBig, barY + 10 * howBig);
    pen.stroke();
  }

  // The rocket standing on the pad.
  pen.font = (74 * howBig) + "px serif";
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.fillText("\uD83D\uDE80", x - 8 * howBig, groundY - 46 * howBig);

  // The little building at the bottom, with the door.
  pen.fillStyle = "#cbd5e1";
  pen.fillRect(x - wide / 2, groundY - 46 * howBig, 42 * howBig, 40 * howBig);
  pen.fillStyle = "#8a5a2b";
  pen.fillRect(x - wide / 2 + 12 * howBig, groundY - 34 * howBig, 18 * howBig, 28 * howBig);

  if (howBig > 0.7) {
    pen.fillStyle = "#ffffff";
    pen.fillRect(x - wide / 2 - 4 * howBig, groundY - 60 * howBig, 50 * howBig, 15 * howBig);
    pen.fillStyle = "#1f2933";
    pen.font = "bold " + (11 * howBig) + "px 'Trebuchet MS', sans-serif";
    pen.fillText("STATION", x - wide / 2 + 21 * howBig, groundY - 52 * howBig);
  }
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

  // The big rocket station, once you have found it.
  if (station && station.found) drawStation(station.x, station.y, 1);

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

  // Your dumpling surprise! It fills the screen for a few seconds, and
  // then it sits in the sand so you can carry on exploring.
  if (whatWasInTheBox) {
    var showingOff = frame - boxOpenedAt < 200;

    if (showingOff) {
      pen.fillStyle = "rgba(0, 0, 0, 0.62)";
      pen.fillRect(0, road.height / 2 - 110, road.width, 210);
    }

    pen.save();
    pen.filter = dumplingLook(whatWasInTheBox.colour);
    pen.font = (showingOff ? 110 : 40) + "px serif";
    pen.fillText("\uD83E\uDD5F",
                 showingOff ? road.width / 2 : road.width - 44,
                 showingOff ? road.height / 2 - 20 : road.height * 0.53);
    pen.restore();

    if (showingOff) {
      pen.fillStyle = "#ffffff";
      pen.font = "bold 26px 'Trebuchet MS', sans-serif";
      pen.fillText("A " + whatWasInTheBox.name + " DUMPLING!", road.width / 2, road.height / 2 + 62);
    }
  }

  var dugUp = toFind.filter(function (t) { return t.dugUp; }).length;

  pen.textAlign = "left";
  pen.textBaseline = "alphabetic";
  pen.fillStyle = "#5a3a1c";
  pen.font = "bold 19px 'Trebuchet MS', sans-serif";
  pen.fillText("Dug up " + dugUp + " of " + toFind.length, 12, 32);
  pen.font = "bold 14px 'Trebuchet MS', sans-serif";
  var helpLine = "Tap the sand anywhere to dig";
  if (boxFound && !whatWasInTheBox) helpLine = "You found the mystery box! Open it \u2193";
  else if (whatWasInTheBox && station && !station.found) helpLine = "Keep digging - find the BIG ROCKET STATION!";
  else if (station && station.found) helpLine = "You found the station! Go in the door \u2193";
  pen.fillText(helpLine, 12, 54);
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
  boxOpenedAt = frame;
  openBoxButton.hidden = true;
});


// ---------- Off to Mars! ----------
// Go in the station door and it counts down, blasts off, climbs up and
// up and up, flies to Mars, and lands by the finish line.

var COUNTING_DOWN = 150;      // frames for 3... 2... 1... (50 each)
var BLASTING_OFF = 45;        // frames of fire on the pad
var GOING_UP = 170;           // frames climbing into the sky
var OFF_TO_MARS = 150;        // frames flying across space to Mars
var LANDING_ON_MARS = 90;     // frames coming down onto Mars
var TO_THE_FINISH = 130;      // frames driving to the finish line

function marsSky(howDark) {
  // The sky goes from desert blue to black space as you climb.
  var sky = pen.createLinearGradient(0, 0, 0, road.height);
  sky.addColorStop(0, mix("#7fc8f0", "#05060f", howDark));
  sky.addColorStop(1, mix("#ffe3b0", "#0b0a1a", howDark));
  pen.fillStyle = sky;
  pen.fillRect(0, 0, road.width, road.height);
  if (howDark > 0.35) {
    pen.globalAlpha = (howDark - 0.35) / 0.65;
    drawStars();
    pen.globalAlpha = 1;
  }
}

// Mix two colours together. 0 = all of the first, 1 = all of the second.
function mix(one, two, howMuch) {
  function bit(colour, at) { return parseInt(colour.substr(at, 2), 16); }
  var r = Math.round(bit(one, 1) + (bit(two, 1) - bit(one, 1)) * howMuch);
  var g = Math.round(bit(one, 3) + (bit(two, 3) - bit(one, 3)) * howMuch);
  var b = Math.round(bit(one, 5) + (bit(two, 5) - bit(one, 5)) * howMuch);
  return "rgb(" + r + "," + g + "," + b + ")";
}

// The red planet, with a few craters.
function drawMarsPlanet(x, y, size) {
  pen.fillStyle = "#c1440e";
  pen.beginPath();
  pen.arc(x, y, size, 0, Math.PI * 2);
  pen.fill();
  pen.fillStyle = "#96360b";
  pen.beginPath();
  pen.arc(x - size * 0.3, y - size * 0.2, size * 0.22, 0, Math.PI * 2);
  pen.arc(x + size * 0.35, y + size * 0.25, size * 0.17, 0, Math.PI * 2);
  pen.arc(x + size * 0.1, y - size * 0.45, size * 0.12, 0, Math.PI * 2);
  pen.fill();
}

// The ground on Mars: red sand, black sky, and the Earth far away.
function drawMarsGround() {
  pen.fillStyle = "#120a12";
  pen.fillRect(0, 0, road.width, road.height);
  drawStars();

  pen.font = "22px serif";
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.fillText("\uD83C\uDF0D", 58, 54);          // Earth, tiny and far away

  pen.fillStyle = "#c1440e";
  pen.fillRect(0, road.height * 0.55, road.width, road.height);
  pen.fillStyle = "#a8380c";
  for (var d = 0; d < 3; d++) {
    pen.beginPath();
    pen.arc(road.width * (0.15 + d * 0.35), road.height * (0.6 + d * 0.04), 80, Math.PI, 0);
    pen.fill();
  }
}

// The checkered finish line, stretched across Mars.
function drawFinishLine(y) {
  var squares = 10;
  var wide = road.width / squares;
  for (var row = 0; row < 2; row++) {
    for (var col = 0; col < squares; col++) {
      pen.fillStyle = (row + col) % 2 === 0 ? "#ffffff" : "#1f2933";
      pen.fillRect(col * wide, y + row * 13, wide, 13);
    }
  }
  // A flag on a pole at each end.
  pen.font = "30px serif";
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.fillText("\uD83C\uDFC1", 24, y - 22);
  pen.fillText("\uD83C\uDFC1", road.width - 24, y - 22);
}

// Whatever you are travelling in: the desert car if you made one,
// otherwise the rocket.
function drawMyRide(x, y, howBig, flameSize) {
  pen.save();
  if (desertCar >= 0 && flameSize <= 0) {
    pen.filter = DESERT_CAR_COLOURS[desertCar].look || "none";
    pen.font = howBig + "px serif";
    pen.textAlign = "center";
    pen.textBaseline = "middle";
    pen.fillText("\uD83D\uDE99", x, y);
  } else {
    drawRocket(x, y, howBig, flameSize);
  }
  pen.restore();
}

function goInTheDoor() {
  goingToMars = true;
  transformed = true;              // you are in the station's rocket now
  marsAt = frame;
  doorButton.hidden = true;
  openBoxButton.hidden = true;
  desertCarButton.hidden = true;
  goButton.hidden = true;
}

function drawGoingToMars() {
  var howLongFor = frame - marsAt;
  var groundY = road.height * 0.78;

  pen.textAlign = "center";
  pen.textBaseline = "middle";

  // ---- 3... 2... 1... ----
  if (howLongFor < COUNTING_DOWN) {
    drawDesert();
    drawStation(road.width / 2, groundY, 1.2);

    var number = 3 - Math.floor(howLongFor / 50);
    var intoThisOne = (howLongFor % 50) / 50;

    pen.fillStyle = "rgba(0, 0, 0, 0.45)";
    pen.fillRect(0, 0, road.width, road.height);
    pen.fillStyle = "#ffffff";
    pen.font = "bold " + (130 - intoThisOne * 30) + "px 'Trebuchet MS', sans-serif";
    pen.globalAlpha = 1 - intoThisOne * 0.5;
    pen.fillText(String(number), road.width / 2, road.height / 2);
    pen.globalAlpha = 1;
    pen.font = "bold 20px 'Trebuchet MS', sans-serif";
    pen.fillText("Get ready for MARS!", road.width / 2, road.height - 50);
    return;
  }

  // ---- BLAST OFF! ----
  if (howLongFor < COUNTING_DOWN + BLASTING_OFF) {
    drawDesert();
    drawStation(road.width / 2, groundY, 1.2);
    pen.fillStyle = "rgba(255, 220, 160, 0.35)";
    pen.fillRect(0, 0, road.width, road.height);
    pen.font = "70px serif";
    pen.fillText("\uD83D\uDD25", road.width / 2 - 10, groundY - 6);
    pen.fillStyle = "#ffffff";
    pen.strokeStyle = "#1f2933";
    pen.lineWidth = 4;
    pen.font = "bold 40px 'Trebuchet MS', sans-serif";
    pen.strokeText("BLAST OFF!", road.width / 2, road.height / 2);
    pen.fillText("BLAST OFF!", road.width / 2, road.height / 2);
    return;
  }

  // ---- up... up... up! ----
  if (howLongFor < COUNTING_DOWN + BLASTING_OFF + GOING_UP) {
    var howHigh = (howLongFor - COUNTING_DOWN - BLASTING_OFF) / GOING_UP;
    marsSky(howHigh);

    // The station drops away below you.
    drawStation(road.width / 2, groundY + howHigh * road.height, 1.2 - howHigh);

    drawRocket(road.width / 2 + Math.sin(frame * 0.07) * 8,
               groundY - 60 - howHigh * (road.height * 0.55),
               58, 34);

    pen.fillStyle = "#ffffff";
    pen.textBaseline = "alphabetic";
    pen.font = "bold 22px 'Trebuchet MS', sans-serif";
    pen.fillText(howHigh < 0.33 ? "Up..." : howHigh < 0.66 ? "Up... up..." : "Up... up... UP!",
                 road.width / 2, road.height - 40);
    pen.textBaseline = "middle";
    return;
  }

  // ---- flying across space to Mars ----
  var afterTheClimb = howLongFor - COUNTING_DOWN - BLASTING_OFF - GOING_UP;
  if (afterTheClimb < OFF_TO_MARS) {
    var howFar = afterTheClimb / OFF_TO_MARS;
    pen.fillStyle = "#05060f";
    pen.fillRect(0, 0, road.width, road.height);
    drawStars();
    drawMarsPlanet(road.width / 2, road.height * 0.3, 30 + howFar * 120);
    drawRocket(road.width / 2, road.height * 0.85 - howFar * 110, 52, 30);
    pen.fillStyle = "#ffffff";
    pen.textBaseline = "alphabetic";
    pen.font = "bold 19px 'Trebuchet MS', sans-serif";
    pen.fillText("All the way to MARS...", road.width / 2, road.height - 36);
    pen.textBaseline = "middle";
    return;
  }

  // ---- landing on Mars ----
  var afterTheFlight = afterTheClimb - OFF_TO_MARS;
  drawMarsGround();
  var finishY = road.height * 0.62;
  drawFinishLine(finishY);

  if (afterTheFlight < LANDING_ON_MARS) {
    var comingDown = afterTheFlight / LANDING_ON_MARS;
    drawRocket(road.width / 2, -50 + (road.height * 0.86 + 50) * comingDown, 56,
               comingDown > 0.5 ? 26 : 0);
    pen.fillStyle = "#ffffff";
    pen.font = "bold 19px 'Trebuchet MS', sans-serif";
    pen.fillText("Landing on Mars!", road.width / 2, road.height - 30);
    return;
  }

  // ---- driving up to the finish line ----
  var driving = Math.min(1, (afterTheFlight - LANDING_ON_MARS) / TO_THE_FINISH);
  var drivingY = road.height * 0.86 - (road.height * 0.86 - (finishY + 10)) * driving;
  drawMyRide(road.width / 2, drivingY, 52, 0);

  if (driving >= 1) {
    pen.fillStyle = "rgba(0, 0, 0, 0.6)";
    pen.fillRect(0, road.height - 150, road.width, 120);
    pen.fillStyle = "#ffffff";
    pen.font = "bold 30px 'Trebuchet MS', sans-serif";
    pen.fillText("\uD83C\uDFC1 FINISH!", road.width / 2, road.height - 114);
    pen.font = "bold 17px 'Trebuchet MS', sans-serif";
    pen.fillText("You crossed the finish line on MARS!", road.width / 2, road.height - 84);
    pen.fillText("Nobody has ever raced this far.", road.width / 2, road.height - 60);
    pen.fillText("You got past " + score + " cars \u00B7 Best " + best,
                 road.width / 2, road.height - 36);

    if (goButton.hidden) {
      goButton.hidden = false;
      goButton.textContent = "\uD83C\uDFC1 Race again";
      coreButton.hidden = false;
    }
  } else {
    pen.fillStyle = "#ffffff";
    pen.font = "bold 19px 'Trebuchet MS', sans-serif";
    pen.fillText("To the finish line!", road.width / 2, road.height - 30);
  }
}

// ---------- Down to the center of the Earth ----------
// Past the finish line the ground opens up and you go down, down, down,
// through the rock and the lava, all the way to the middle.

var DIGGING_DOWN = 300;        // frames spent falling through the layers
var AT_THE_MIDDLE = 60;        // frames of arriving before the words come up

// What you fall past on the way down, from the top to the middle.
var LAYERS = [
  { colour: "#c1440e", name: "red sand" },
  { colour: "#8a5a2b", name: "brown rock" },
  { colour: "#6b6b6b", name: "grey rock" },
  { colour: "#3f3f46", name: "deep dark rock" },
  { colour: "#b34700", name: "hot rock" },
  { colour: "#e8590c", name: "LAVA" },
  { colour: "#ffb703", name: "the hot middle" }
];

function goDownToTheMiddle() {
  goingDown = true;
  goingToMars = false;
  downAt = frame;
  coreButton.hidden = true;
  goButton.hidden = true;
}

function drawGoingDown() {
  var howLongFor = frame - downAt;
  var howDeep = Math.min(1, howLongFor / DIGGING_DOWN);

  pen.textAlign = "center";
  pen.textBaseline = "middle";

  // The layers slide up past you as you drop through them.
  var layerTall = road.height / 2.2;
  var fallen = howDeep * (LAYERS.length - 1) * layerTall;
  for (var i = 0; i < LAYERS.length; i++) {
    var top = i * layerTall - fallen;
    pen.fillStyle = LAYERS[i].colour;
    pen.fillRect(0, top, road.width, layerTall + 2);

    // Rocks and bubbles stuck in the layer, so you can see it moving.
    pen.fillStyle = "rgba(0, 0, 0, 0.16)";
    for (var r = 0; r < 5; r++) {
      pen.beginPath();
      pen.arc(((r * 83 + i * 47) % (road.width - 40)) + 20,
              top + ((r * 61 + i * 29) % (layerTall - 30)) + 15,
              9 + (r % 3) * 5, 0, Math.PI * 2);
      pen.fill();
    }

    if (howDeep < 1) {
      pen.fillStyle = "rgba(255, 255, 255, 0.55)";
      pen.font = "bold 13px 'Trebuchet MS', sans-serif";
      pen.fillText(LAYERS[i].name, road.width / 2, top + 22);
    }
  }

  if (howDeep < 1) {
    // Falling: the ride wobbles as it drops.
    drawMyRide(road.width / 2 + Math.sin(frame * 0.12) * 12,
               road.height * 0.42, 52, 0);

    pen.fillStyle = "#ffffff";
    pen.font = "bold 24px 'Trebuchet MS', sans-serif";
    pen.fillText(howDeep < 0.33 ? "Down..."
               : howDeep < 0.66 ? "Down, down..."
                                : "Down, down, DOWN!",
                 road.width / 2, road.height - 40);
    return;
  }

  // ---- the middle of the Earth ----
  var glow = pen.createRadialGradient(road.width / 2, road.height * 0.42, 10,
                                      road.width / 2, road.height * 0.42, 200);
  glow.addColorStop(0, "#fff3b0");
  glow.addColorStop(0.5, "#ffb703");
  glow.addColorStop(1, "#e8590c");
  pen.fillStyle = glow;
  pen.fillRect(0, 0, road.width, road.height);

  // The hot core, beating like a heart.
  var beat = 92 + Math.sin(frame * 0.08) * 8;
  pen.fillStyle = "#fff7d6";
  pen.beginPath();
  pen.arc(road.width / 2, road.height * 0.40, beat, 0, Math.PI * 2);
  pen.fill();

  drawMyRide(road.width / 2, road.height * 0.78, 52, 0);

  if (howLongFor > DIGGING_DOWN + AT_THE_MIDDLE) {
    pen.fillStyle = "rgba(0, 0, 0, 0.6)";
    pen.fillRect(0, road.height - 132, road.width, 104);
    pen.fillStyle = "#ffffff";
    pen.font = "bold 26px 'Trebuchet MS', sans-serif";
    pen.fillText("THE CENTER OF THE EARTH!", road.width / 2, road.height - 98);
    pen.font = "bold 17px 'Trebuchet MS', sans-serif";
    pen.fillText("You went all the way down.", road.width / 2, road.height - 70);
    pen.fillText("There is a big cave down here!", road.width / 2, road.height - 46);

    if (goButton.hidden) {
      goButton.hidden = false;
      goButton.textContent = "\uD83C\uDFC1 Race again";
      caveButton.hidden = false;
    }
  }
}

// ---------- The big cave with the houses ----------
// Right in the middle of the Earth there is a cave, and people live in
// it. Tap anywhere to drive over there, and tap a house to visit it.

var CAVE_HOUSES = [
  { picture: "\uD83C\uDFE0", name: "the red house" },
  { picture: "\uD83C\uDFE1", name: "the garden house" },
  { picture: "\uD83C\uDFF0", name: "the castle" },
  { picture: "\uD83C\uDFEA", name: "the little shop" },
  { picture: "\u26FA", name: "the tent" },
  { picture: "\uD83C\uDFDA\uFE0F", name: "the old house" }
];

var houses = [];
var lastHouse = "";

function startTheCave() {
  inTheCave = true;
  goingDown = false;
  caveButton.hidden = true;
  goButton.hidden = false;
  goButton.textContent = "\uD83C\uDFC1 Race again";
  lastHouse = "";

  // The houses stand in two rows along the cave floor.
  houses = CAVE_HOUSES.map(function (house, i) {
    var acrossTheRow = i % 3;
    return {
      picture: house.picture,
      name: house.name,
      x: road.width * (0.22 + acrossTheRow * 0.28),
      y: road.height * (i < 3 ? 0.52 : 0.72),
      visited: false
    };
  });

  caveCar = { x: road.width / 2, y: road.height * 0.88,
              wantX: road.width / 2, wantY: road.height * 0.88 };
}

// Tap anywhere and you drive there. Tap a house and you visit it.
function driveInCave(x, y) {
  if (!inTheCave || !caveCar) return;
  caveCar.wantX = x;
  caveCar.wantY = y;

  houses.forEach(function (house) {
    var awayX = house.x - x;
    var awayY = house.y - y;
    if (Math.sqrt(awayX * awayX + awayY * awayY) < 44) {
      if (!house.visited) house.visited = true;
      lastHouse = house.name;
    }
  });
}

function drawCave() {
  // The rock all around you.
  pen.fillStyle = "#2b1d16";
  pen.fillRect(0, 0, road.width, road.height);

  // The glowing cave roof, with pointy rocks hanging down.
  var roof = pen.createLinearGradient(0, 0, 0, road.height * 0.42);
  roof.addColorStop(0, "#5b3a22");
  roof.addColorStop(1, "#2b1d16");
  pen.fillStyle = roof;
  pen.fillRect(0, 0, road.width, road.height * 0.42);

  pen.fillStyle = "#4a2f1d";
  for (var i = 0; i < 7; i++) {
    var spikeX = 20 + i * (road.width / 7);
    pen.beginPath();
    pen.moveTo(spikeX - 16, 0);
    pen.lineTo(spikeX + 16, 0);
    pen.lineTo(spikeX, 54 + (i % 3) * 30);
    pen.fill();
  }

  // The cave floor.
  pen.fillStyle = "#3d2a1d";
  pen.fillRect(0, road.height * 0.42, road.width, road.height);

  // Rocks poking up out of the floor at the sides.
  pen.fillStyle = "#4a2f1d";
  [[12, 0.46], [road.width - 14, 0.44], [8, 0.82]].forEach(function (rock) {
    pen.beginPath();
    pen.moveTo(rock[0] - 15, road.height * rock[1]);
    pen.lineTo(rock[0] + 15, road.height * rock[1]);
    pen.lineTo(rock[0], road.height * rock[1] - 46);
    pen.fill();
  });

  // Pools of lava, glowing and wobbling a little.
  [[40, 0.62], [road.width - 42, 0.86], [road.width / 2, 0.44]].forEach(function (pool) {
    var glow = pen.createRadialGradient(pool[0], road.height * pool[1], 2,
                                        pool[0], road.height * pool[1], 60);
    glow.addColorStop(0, "#ffb703");
    glow.addColorStop(0.4, "#e8590c");
    glow.addColorStop(1, "rgba(232, 89, 12, 0)");
    pen.fillStyle = glow;
    pen.beginPath();
    pen.ellipse(pool[0], road.height * pool[1],
                44 + Math.sin(frame * 0.05) * 4, 20, 0, 0, Math.PI * 2);
    pen.fill();
  });

  pen.textAlign = "center";
  pen.textBaseline = "middle";

  // The houses. Dark until you visit them, then their lights come on.
  houses.forEach(function (house) {
    if (house.visited) {
      // A warm light shining out of the windows.
      var lamp = pen.createRadialGradient(house.x, house.y, 6, house.x, house.y, 46);
      lamp.addColorStop(0, "rgba(255, 214, 102, 0.45)");
      lamp.addColorStop(1, "rgba(255, 214, 102, 0)");
      pen.fillStyle = lamp;
      pen.beginPath();
      pen.arc(house.x, house.y, 46, 0, Math.PI * 2);
      pen.fill();
    }

    pen.save();
    if (!house.visited) pen.filter = "brightness(0.45) saturate(0.5)";
    pen.font = "46px serif";
    pen.fillText(house.picture, house.x, house.y);
    pen.restore();
  });

  // Your car, driving over to wherever you tapped.
  caveCar.x += (caveCar.wantX - caveCar.x) * 0.09;
  caveCar.y += (caveCar.wantY - caveCar.y) * 0.09;
  drawMyRide(caveCar.x, caveCar.y, 44, 0);

  // How you are getting on.
  var beenTo = houses.filter(function (h) { return h.visited; }).length;

  pen.textAlign = "left";
  pen.textBaseline = "alphabetic";
  pen.fillStyle = "#ffd166";
  pen.font = "bold 19px 'Trebuchet MS', sans-serif";
  pen.fillText("THE CENTER OF THE EARTH", 12, 30);
  pen.font = "bold 14px 'Trebuchet MS', sans-serif";
  pen.fillText("Visited " + beenTo + " of " + houses.length + " houses", 12, 52);
  pen.fillText(beenTo === houses.length
                 ? "You explored the whole cave!"
                 : "Tap a house to visit it", 12, 72);

  if (lastHouse) {
    pen.textAlign = "center";
    pen.fillStyle = "#ffffff";
    pen.font = "bold 17px 'Trebuchet MS', sans-serif";
    pen.fillText("You visited " + lastHouse + "!", road.width / 2, road.height - 18);
  }
}

caveButton.addEventListener("click", startTheCave);

coreButton.addEventListener("click", goDownToTheMiddle);

doorButton.addEventListener("click", goInTheDoor);

exploreButton.addEventListener("click", startExploring);

// ---------- The game loop ----------

function everyFrame() {
  if (racing) moveEverything();

  // Crash and, after a moment to see it, the whole race starts over again.
  if (crashed) {
    frame++;
    if (frame > restartingAt) {
      newRace();
      goButton.hidden = true;
    }
  }

  if (inTheCave) {
    frame++;
    drawCave();
    requestAnimationFrame(everyFrame);
    return;
  }

  if (goingDown) {
    frame++;
    drawGoingDown();
    requestAnimationFrame(everyFrame);
    return;
  }

  if (goingToMars) {
    frame++;
    drawGoingToMars();
    requestAnimationFrame(everyFrame);
    return;
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

  if (crashed) drawMessage("💥 Crash!", "Starting over again...");
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
  var box = road.getBoundingClientRect();
  var tappedX = (event.clientX - box.left) * (road.width / box.width);
  var tappedY = (event.clientY - box.top) * (road.height / box.height);

  if (inTheCave) { driveInCave(tappedX, tappedY); return; }
  if (!exploring || goingToMars) return;
  digHere(tappedX, tappedY);
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
