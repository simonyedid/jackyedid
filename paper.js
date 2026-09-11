// ============================================================
// GOING INTO THE PAPER
// Draw a place, then say or write what it is - "rainbow", "New
// York", "the beach". A magic portal opens in your drawing and
// takes you to THAT place.
// ============================================================

// ---------- SETTINGS - change these! ----------
var PORTAL_OPENING = 90;      // frames the portal takes to open
var GOING_THROUGH = 55;       // frames you spend going through it
var WALKING_SPEED = 0.08;     // how quickly you get to where you tapped
// ----------------------------------------------

// ---------- THE PLACES YOU CAN GO ----------
// Each one knows the words that mean it, who you are while you are
// there, how far down the ground is, and how to draw itself.
// Copy a whole block to invent a new place!

var PLACES = [

  { name: "A RAINBOW", picture: "🌈", who: "🚶",
    words: ["rainbow", "rainbows", "colours", "colors"],
    groundAt: 0.82,
    draw: function () {
      skyFromTo("#bfe6ff", "#eaf8ff", 0.82);
      sun(70, 70, 34, "#ffd166");

      // The rainbow itself, seven stripes in a big arch.
      var stripes = ["#e63946", "#f77f00", "#fcbf49", "#2a9d3f",
                     "#2563eb", "#3ec1d3", "#9d4edd"];
      pen.lineWidth = 16;
      stripes.forEach(function (colour, band) {
        pen.strokeStyle = colour;
        pen.beginPath();
        pen.arc(board.width / 2, board.height * 0.86, 110 + band * 17, Math.PI, 0);
        pen.stroke();
      });

      cloud(board.width / 2 - 190, board.height * 0.72, 1);
      cloud(board.width / 2 + 190, board.height * 0.72, 1);
      cloud(120 + Math.sin(paperFrame * 0.01) * 30, 90, 0.8);
      ground("#5fbf6a", "#4aa456", 0.82);
    } },

  { name: "NEW YORK CITY", picture: "🗽", who: "🚶",
    words: ["ny", "nyc", "newyork", "newyorkcity", "city", "bigapple"],
    groundAt: 0.84,
    draw: function () {
      skyFromTo("#7fc8f0", "#d6ecff", 0.66);
      sun(board.width - 80, 64, 28, "#ffe08a");

      // The sea behind the city, with a bridge over it.
      pen.fillStyle = "#3a7ca5";
      pen.fillRect(0, board.height * 0.6, board.width, board.height * 0.24);

      // Skyscrapers of different heights.
      var heights = [150, 210, 120, 250, 170, 200, 130, 230, 160];
      heights.forEach(function (tall, i) {
        var x = 10 + i * (board.width / heights.length);
        var wide = board.width / heights.length - 12;
        pen.fillStyle = i % 2 ? "#8e99a8" : "#7b8696";
        pen.fillRect(x, board.height * 0.66 - tall, wide, tall);
        pen.fillStyle = "#ffe9a8";                      // lit-up windows
        for (var wy = board.height * 0.66 - tall + 12; wy < board.height * 0.62; wy += 20) {
          pen.fillRect(x + 8, wy, 9, 10);
          pen.fillRect(x + wide - 20, wy, 9, 10);
        }
      });

      // The bridge, with its towers and cables.
      var bridgeY = board.height * 0.72;
      pen.strokeStyle = "#c8322a";
      pen.lineWidth = 5;
      pen.beginPath();
      pen.moveTo(0, bridgeY);
      pen.quadraticCurveTo(board.width / 2, bridgeY - 60, board.width, bridgeY);
      pen.stroke();
      pen.fillStyle = "#8a5a2b";
      pen.fillRect(0, bridgeY, board.width, 12);
      pen.fillStyle = "#c8322a";
      pen.fillRect(board.width * 0.25 - 6, bridgeY - 70, 12, 70);
      pen.fillRect(board.width * 0.75 - 6, bridgeY - 70, 12, 70);

      ground("#4a4f57", "#3a3f46", 0.84);

      // A yellow taxi driving past.
      pen.font = "38px serif";
      pen.textAlign = "center";
      pen.fillText("🚕",
                   (paperFrame * 2.2) % (board.width + 80) - 40,
                   board.height * 0.88);
    } },

  { name: "THE BEACH", picture: "🏖️", who: "🏄",
    words: ["beach", "sea", "seaside", "sand", "ocean", "holiday"],
    groundAt: 0.78,
    draw: function () {
      skyFromTo("#7fc8f0", "#ffe3b0", 0.5);
      sun(board.width - 90, 70, 36, "#ffd166");

      // The sea, with waves rolling in.
      pen.fillStyle = "#2a9db5";
      pen.fillRect(0, board.height * 0.5, board.width, board.height * 0.28);
      pen.strokeStyle = "#ffffff";
      pen.lineWidth = 3;
      for (var wave = 0; wave < 4; wave++) {
        var waveY = board.height * (0.54 + wave * 0.06);
        pen.beginPath();
        for (var x = 0; x <= board.width; x += 20) {
          pen.lineTo(x, waveY + Math.sin((x + paperFrame * 2 + wave * 40) * 0.03) * 4);
        }
        pen.stroke();
      }

      ground("#f2d9a0", "#e6c489", 0.78);

      pen.font = "52px serif";
      pen.textAlign = "center";
      pen.fillText("⛱️", 90, board.height * 0.82);
      pen.font = "34px serif";
      pen.fillText("🍚", board.width - 90, board.height * 0.86);
    } },

  { name: "THE FOREST", picture: "🌲", who: "🚶",
    words: ["forest", "wood", "woods", "trees", "tree", "jungle"],
    groundAt: 0.8,
    draw: function () {
      skyFromTo("#a8d8f0", "#dff1e6", 0.6);

      // Hills behind the trees.
      pen.fillStyle = "#3f8f4a";
      for (var hill = 0; hill < 3; hill++) {
        pen.beginPath();
        pen.arc(board.width * (0.2 + hill * 0.33), board.height * 0.82, 130, Math.PI, 0);
        pen.fill();
      }

      ground("#2f7a3c", "#276433", 0.8);

      // Trees, near ones bigger than far ones.
      pen.textAlign = "center";
      pen.textBaseline = "alphabetic";
      [[40, 0.72, 46], [140, 0.66, 34], [250, 0.74, 52], [360, 0.68, 38],
       [470, 0.73, 48], [560, 0.67, 32]].forEach(function (tree) {
        pen.font = tree[2] + "px serif";
        pen.fillText("🌲", tree[0], board.height * tree[1]);
      });
      pen.textBaseline = "middle";

      // A bird flying over.
      pen.font = "26px serif";
      pen.fillText("🐦",
                   (paperFrame * 1.4) % (board.width + 60) - 30,
                   90 + Math.sin(paperFrame * 0.05) * 14);
    } },

  { name: "OUTER SPACE", picture: "🚀", who: "👨‍🚀",
    words: ["space", "outerspace", "planet", "planets", "stars", "moon", "galaxy", "rocket"],
    groundAt: 0.85,
    draw: function () {
      pen.fillStyle = "#05060f";
      pen.fillRect(0, 0, board.width, board.height);

      pen.fillStyle = "#ffffff";
      for (var star = 0; star < 60; star++) {
        var twinkle = Math.sin(paperFrame * 0.06 + star) * 0.4 + 0.6;
        pen.globalAlpha = twinkle;
        pen.beginPath();
        pen.arc((star * 137) % board.width, (star * 211) % (board.height * 0.85), 2, 0, Math.PI * 2);
        pen.fill();
      }
      pen.globalAlpha = 1;

      // Planets hanging in the sky.
      planet(120, 110, 44, "#c1440e", "#96360b");
      planet(board.width - 140, 90, 30, "#3ec1d3", "#2a9db5");

      // The moon you are standing on.
      pen.fillStyle = "#b9b6ae";
      pen.fillRect(0, board.height * 0.85, board.width, board.height);
      pen.fillStyle = "#a09d95";
      [[80, 0.88, 22], [260, 0.92, 30], [460, 0.87, 18]].forEach(function (hole) {
        pen.beginPath();
        pen.ellipse(hole[0], board.height * hole[1], hole[2], hole[2] * 0.45, 0, 0, Math.PI * 2);
        pen.fill();
      });

      pen.font = "44px serif";
      pen.textAlign = "center";
      pen.fillText("🚀", board.width - 100, board.height * 0.8);
    } },

  { name: "THE SNOW", picture: "❄️", who: "⛷️",
    words: ["snow", "snowman", "winter", "ice", "cold", "arctic", "snowing"],
    groundAt: 0.78,
    draw: function () {
      skyFromTo("#c3ddef", "#eef7ff", 0.6);

      pen.fillStyle = "#e8f4ff";
      for (var hill = 0; hill < 3; hill++) {
        pen.beginPath();
        pen.arc(board.width * (0.15 + hill * 0.35), board.height * 0.8, 120, Math.PI, 0);
        pen.fill();
      }

      ground("#ffffff", "#dcebf7", 0.78);

      pen.textAlign = "center";
      pen.font = "56px serif";
      pen.fillText("⛄", 110, board.height * 0.74);
      pen.font = "40px serif";
      pen.fillText("🎄", board.width - 110, board.height * 0.76);

      // Snow falling.
      pen.fillStyle = "#ffffff";
      for (var flake = 0; flake < 40; flake++) {
        var fallX = (flake * 97 + Math.sin(paperFrame * 0.02 + flake) * 20) % board.width;
        var fallY = (flake * 53 + paperFrame * 1.3) % board.height;
        pen.beginPath();
        pen.arc(fallX, fallY, 3, 0, Math.PI * 2);
        pen.fill();
      }
    } },

  { name: "UNDER THE SEA", picture: "🐠", who: "🏊",
    words: ["underthesea", "fish", "fishes", "shark", "underwater", "mermaid", "whale"],
    groundAt: 0.84,
    draw: function () {
      skyFromTo("#1b6f9e", "#3ec1d3", 1);

      // Sunlight coming down through the water.
      pen.fillStyle = "rgba(255, 255, 255, 0.12)";
      for (var beam = 0; beam < 4; beam++) {
        pen.save();
        pen.translate(80 + beam * 150, 0);
        pen.rotate(0.2);
        pen.fillRect(0, 0, 40, board.height);
        pen.restore();
      }

      ground("#e6c489", "#d9b273", 0.84);

      // Seaweed waving about.
      pen.strokeStyle = "#2a9d3f";
      pen.lineWidth = 8;
      [60, 200, 420, 540].forEach(function (weedX, i) {
        pen.beginPath();
        pen.moveTo(weedX, board.height * 0.86);
        pen.quadraticCurveTo(weedX + Math.sin(paperFrame * 0.04 + i) * 30,
                             board.height * 0.72, weedX, board.height * 0.6);
        pen.stroke();
      });

      // Fish swimming past, and bubbles going up.
      pen.textAlign = "center";
      pen.font = "34px serif";
      pen.fillText("🐠", (paperFrame * 1.8) % (board.width + 60) - 30, board.height * 0.4);
      pen.font = "28px serif";
      pen.fillText("🐡", board.width - (paperFrame * 1.2) % (board.width + 60), board.height * 0.6);

      pen.fillStyle = "rgba(255, 255, 255, 0.6)";
      for (var bubble = 0; bubble < 12; bubble++) {
        var upY = board.height - ((paperFrame * 1.1 + bubble * 60) % board.height);
        pen.beginPath();
        pen.arc((bubble * 149) % board.width, upY, 4 + bubble % 3, 0, Math.PI * 2);
        pen.fill();
      }
    } },

  { name: "THE CASTLE", picture: "🏰", who: "🧙",
    words: ["castle", "king", "queen", "knight", "princess", "palace", "dragon"],
    groundAt: 0.8,
    draw: function () {
      skyFromTo("#8fd0f0", "#ffe3b0", 0.7);
      sun(80, 70, 30, "#ffd166");

      var castleX = board.width / 2;
      var castleBottom = board.height * 0.8;

      // Three towers and a wall between them.
      pen.fillStyle = "#b7b2a8";
      pen.fillRect(castleX - 150, castleBottom - 110, 300, 110);
      [castleX - 150, castleX - 25, castleX + 100].forEach(function (towerX) {
        pen.fillStyle = "#c9c4b9";
        pen.fillRect(towerX, castleBottom - 180, 50, 180);
        // The pointy bits along the top.
        pen.fillStyle = "#b7b2a8";
        for (var bit = 0; bit < 3; bit++) pen.fillRect(towerX + bit * 18, castleBottom - 192, 12, 14);
      });

      // The door.
      pen.fillStyle = "#6b4423";
      pen.beginPath();
      pen.moveTo(castleX - 28, castleBottom);
      pen.lineTo(castleX - 28, castleBottom - 50);
      pen.quadraticCurveTo(castleX, castleBottom - 90, castleX + 28, castleBottom - 50);
      pen.lineTo(castleX + 28, castleBottom);
      pen.fill();

      // Flags flapping on the towers.
      pen.fillStyle = "#e63946";
      [castleX - 125, castleX, castleX + 125].forEach(function (flagX) {
        pen.fillRect(flagX - 1, castleBottom - 230, 3, 40);
        pen.beginPath();
        pen.moveTo(flagX + 2, castleBottom - 230);
        pen.lineTo(flagX + 2 + 26 + Math.sin(paperFrame * 0.1) * 4, castleBottom - 222);
        pen.lineTo(flagX + 2, castleBottom - 212);
        pen.fill();
      });

      ground("#5fbf6a", "#4aa456", 0.8);
    } },

  { name: "THE DESERT", picture: "🏜️", who: "🚶",
    words: ["desert", "sand", "cactus", "dunes", "hot", "egypt", "pyramid"],
    groundAt: 0.72,
    draw: function () {
      skyFromTo("#7fc8f0", "#ffe3b0", 0.55);
      sun(board.width - 70, 66, 38, "#ffcf5c");

      pen.fillStyle = "#e6c489";
      pen.fillRect(0, board.height * 0.72, board.width, board.height);
      pen.fillStyle = "#d9b273";
      for (var dune = 0; dune < 3; dune++) {
        pen.beginPath();
        pen.arc(board.width * (0.2 + dune * 0.32), board.height * (0.78 + dune * 0.04), 110, Math.PI, 0);
        pen.fill();
      }

      pen.textAlign = "center";
      pen.font = "60px serif";
      pen.fillText("🌵", 90, board.height * 0.78);
      pen.font = "44px serif";
      pen.fillText("🐪", board.width - 110, board.height * 0.8);
    } },

  { name: "THE VOLCANO", picture: "🌋", who: "🚶",
    words: ["volcano", "lava", "erupt", "eruption", "fire"],
    groundAt: 0.82,
    draw: function () {
      skyFromTo("#b34700", "#ffb703", 0.7);

      // The mountain.
      pen.fillStyle = "#4a3f3a";
      pen.beginPath();
      pen.moveTo(board.width / 2 - 200, board.height * 0.82);
      pen.lineTo(board.width / 2 - 40, board.height * 0.3);
      pen.lineTo(board.width / 2 + 40, board.height * 0.3);
      pen.lineTo(board.width / 2 + 200, board.height * 0.82);
      pen.fill();

      // Lava coming out of the top and running down.
      pen.fillStyle = "#ff6b2c";
      pen.beginPath();
      pen.moveTo(board.width / 2 - 40, board.height * 0.3);
      pen.lineTo(board.width / 2 + 40, board.height * 0.3);
      pen.lineTo(board.width / 2 + 22, board.height * 0.55);
      pen.lineTo(board.width / 2 - 10, board.height * 0.82);
      pen.lineTo(board.width / 2 - 50, board.height * 0.55);
      pen.fill();

      // Smoke puffing up.
      pen.fillStyle = "rgba(90, 80, 78, 0.55)";
      for (var puff = 0; puff < 5; puff++) {
        var upY = board.height * 0.3 - ((paperFrame * 0.8 + puff * 40) % 160);
        pen.beginPath();
        pen.arc(board.width / 2 + Math.sin(paperFrame * 0.02 + puff) * 26, upY, 22 + puff * 4, 0, Math.PI * 2);
        pen.fill();
      }

      ground("#5a4a42", "#4a3f3a", 0.82);
    } }
];
// -------------------------------------------

var intoThePaperButton = document.getElementById("into-the-paper");
var placeBox = document.getElementById("page-writing");     // what you say it is
var placePicks = document.getElementById("place-picks");
var otherPaperButtons = ["undo-button", "clear-button", "save-button"];

var insideThePaper = false;   // true from the moment the portal opens
var arrived = false;          // true once you are through it
var paperFrame = 0;           // counts up the whole time you are in there
var paperBefore = null;       // your picture, to put back when you come out
var theDrawing = null;        // the same picture with the white paper cut away
var theColors = [];           // the colors you drew with
var whereYouWent = null;      // the place the portal took you to
var you = null;               // where you are standing in there

// ---------- Bits and pieces the places are drawn with ----------

function skyFromTo(topColour, bottomColour, howFarDown) {
  var sky = pen.createLinearGradient(0, 0, 0, board.height * howFarDown);
  sky.addColorStop(0, topColour);
  sky.addColorStop(1, bottomColour);
  pen.fillStyle = sky;
  pen.fillRect(0, 0, board.width, board.height);
}

function ground(topColour, bottomColour, howFarDown) {
  var floor = board.height * howFarDown;
  pen.fillStyle = bottomColour;
  pen.fillRect(0, floor, board.width, board.height - floor);
  pen.fillStyle = topColour;
  pen.fillRect(0, floor, board.width, 14);
}

function sun(x, y, size, colour) {
  pen.fillStyle = colour;
  pen.beginPath();
  pen.arc(x, y, size + Math.sin(paperFrame * 0.04) * 2, 0, Math.PI * 2);
  pen.fill();
}

function cloud(x, y, howBig) {
  pen.fillStyle = "#ffffff";
  [[0, 0, 34], [30, 8, 26], [-30, 8, 24]].forEach(function (puff) {
    pen.beginPath();
    pen.arc(x + puff[0] * howBig, y + puff[1] * howBig, puff[2] * howBig, 0, Math.PI * 2);
    pen.fill();
  });
}

function planet(x, y, size, colour, spots) {
  pen.fillStyle = colour;
  pen.beginPath();
  pen.arc(x, y, size, 0, Math.PI * 2);
  pen.fill();
  pen.fillStyle = spots;
  pen.beginPath();
  pen.arc(x - size * 0.3, y - size * 0.2, size * 0.24, 0, Math.PI * 2);
  pen.arc(x + size * 0.3, y + size * 0.25, size * 0.18, 0, Math.PI * 2);
  pen.fill();
}

// ---------- Which place did you draw? ----------

// Turn what you wrote into plain little letters with nothing else in it,
// so "New York City!" and "newyork" end up the same.
function justTheLetters(words) {
  return String(words || "").toLowerCase().replace(/[^a-z]/g, "");
}

function findThePlace(words) {
  var looking = justTheLetters(words);
  if (!looking) return null;

  var found = null;
  PLACES.forEach(function (place) {
    if (found) return;
    place.words.forEach(function (word) {
      if (found) return;
      // Short words like "ny" have to match exactly, or "funny" would
      // take you to New York.
      if (word.length <= 3 ? looking === word : looking.indexOf(word) >= 0) found = place;
    });
  });
  return found;
}

// ---------- Getting your drawing ready ----------

// Copy the picture and rub out everything white, so what you drew can
// be pulled into the portal without a white square round it.
function cutOutTheDrawing() {
  var cut = document.createElement("canvas");
  cut.width = board.width;
  cut.height = board.height;

  var cutPen = cut.getContext("2d");
  cutPen.drawImage(board, 0, 0);

  var pixels = cutPen.getImageData(0, 0, cut.width, cut.height);
  for (var i = 0; i < pixels.data.length; i += 4) {
    if (pixels.data[i] > 240 && pixels.data[i + 1] > 240 && pixels.data[i + 2] > 240) {
      pixels.data[i + 3] = 0;      // see-through
    }
  }
  cutPen.putImageData(pixels, 0, 0);
  return cut;
}

// Is there actually anything on the paper?
function somethingIsDrawn(cut) {
  var pixels = cut.getContext("2d").getImageData(0, 0, cut.width, cut.height).data;
  var painted = 0;
  for (var i = 3; i < pixels.length; i += 4 * 11) {
    if (pixels[i] > 20) painted++;
    if (painted > 30) return true;
  }
  return false;
}

// Which of your colors did you use the most?
function colorsInTheDrawing(cut) {
  var pixels = cut.getContext("2d").getImageData(0, 0, cut.width, cut.height).data;
  var howMuchOfEach = {};

  for (var i = 0; i < pixels.length; i += 4 * 7) {
    if (pixels[i + 3] < 20) continue;
    var nearest = nearestColor(pixels[i], pixels[i + 1], pixels[i + 2]);
    howMuchOfEach[nearest] = (howMuchOfEach[nearest] || 0) + 1;
  }

  var used = Object.keys(howMuchOfEach).sort(function (a, b) {
    return howMuchOfEach[b] - howMuchOfEach[a];
  });

  if (used.length === 0) return ["#2563eb", "#2a9d3f"];
  if (used.length === 1) return [used[0], used[0]];
  return used;
}

// The color from the paint box that this pixel is closest to.
function nearestColor(r, g, b) {
  var closest = COLORS[0].paint;
  var smallestGap = 999999;

  COLORS.forEach(function (color) {
    if (color.name === "Eraser") return;
    var gap = Math.pow(r - redOf(color.paint), 2) +
              Math.pow(g - greenOf(color.paint), 2) +
              Math.pow(b - blueOf(color.paint), 2);
    if (gap < smallestGap) { smallestGap = gap; closest = color.paint; }
  });

  return closest;
}

// ---------- Playing with colors ----------

function redOf(hex)   { return parseInt(hex.substr(1, 2), 16); }
function greenOf(hex) { return parseInt(hex.substr(3, 2), 16); }
function blueOf(hex)  { return parseInt(hex.substr(5, 2), 16); }

function mixed(hex, towardsWhite, howMuch) {
  var goingTo = towardsWhite ? 255 : 0;
  function bit(was) { return Math.round(was + (goingTo - was) * howMuch); }
  return "rgb(" + bit(redOf(hex)) + "," + bit(greenOf(hex)) + "," + bit(blueOf(hex)) + ")";
}

function lighter(hex, howMuch) { return mixed(hex, true, howMuch); }
function darker(hex, howMuch)  { return mixed(hex, false, howMuch); }

// ---------- The place you made up yourself ----------
// If the word is not one of the places above, the portal still takes you
// somewhere: a place built out of your own drawing and your own colors.

function yourOwnPlace(whatYouCalledIt) {
  return {
    name: String(whatYouCalledIt || "YOUR PLACE").toUpperCase(),
    picture: "✨",
    who: "🚶",
    groundAt: 0.76,
    yourOwn: true,
    draw: function () {
      skyFromTo(lighter(theColors[0], 0.55),
                lighter(theColors[1] || theColors[0], 0.8), 0.76);
      sun(board.width - 80, 74, 34, lighter(theColors[0], 0.25));

      // Little copies of your picture drifting past like clouds.
      if (theDrawing) {
        pen.globalAlpha = 0.3;
        for (var cloudy = 0; cloudy < 3; cloudy++) {
          var driftsAt = (paperFrame * (0.4 + cloudy * 0.3) + cloudy * 320) %
                         (board.width + 300) - 150;
          var cloudBig = 0.2 + cloudy * 0.05;
          pen.drawImage(theDrawing, driftsAt, 30 + cloudy * 46,
                        board.width * cloudBig, board.height * cloudBig);
        }
        pen.globalAlpha = 1;
      }

      ground(darker(theColors[1] || theColors[0], 0.15),
             darker(theColors[1] || theColors[0], 0.35), 0.76);

      // YOUR PICTURE, standing up big in the middle of it.
      if (theDrawing) {
        var bob = Math.sin(paperFrame * 0.03) * 7;
        var standingBig = 0.72;
        pen.drawImage(theDrawing,
                      board.width / 2 - board.width * standingBig / 2,
                      board.height * 0.76 - board.height * standingBig + 30 + bob,
                      board.width * standingBig, board.height * standingBig);
      }
    }
  };
}

// ---------- Going in and coming out ----------

function goIntoThePaper() {
  var whatItIs = placeBox ? placeBox.value : "";

  if (!justTheLetters(whatItIs)) {
    showTheMessage("Say or write what you drew!");
    return;
  }

  var cut = cutOutTheDrawing();
  theDrawing = somethingIsDrawn(cut) ? cut : null;
  theColors = colorsInTheDrawing(cut);
  whereYouWent = findThePlace(whatItIs) || yourOwnPlace(whatItIs);

  paperBefore = board.toDataURL();     // so we can put your picture back
  you = { x: board.width / 2, wantX: board.width / 2 };

  insideThePaper = true;
  arrived = false;
  paperFrame = 0;

  intoThePaperButton.textContent = "🚪 Come back out";
  otherPaperButtons.forEach(function (name) {
    document.getElementById(name).hidden = true;
  });

  everyPaperFrame();
}

function comeBackOut() {
  insideThePaper = false;
  intoThePaperButton.textContent = "🌀 Go into the paper";
  otherPaperButtons.forEach(function (name) {
    document.getElementById(name).hidden = false;
  });

  // Put your picture back exactly as it was.
  var picture = new Image();
  picture.onload = function () {
    startWithBlankPaper();
    pen.drawImage(picture, 0, 0);
  };
  picture.src = paperBefore;
}

// A note written on the paper for a moment. It keeps a copy of the paper
// first, so whatever you had drawn comes straight back afterwards.
function showTheMessage(words) {
  var paperNow = board.toDataURL();

  pen.fillStyle = "rgba(31, 41, 51, 0.8)";
  pen.fillRect(0, board.height / 2 - 34, board.width, 68);
  pen.fillStyle = "#ffffff";
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.font = "bold 26px 'Trebuchet MS', sans-serif";
  pen.fillText(words, board.width / 2, board.height / 2);

  setTimeout(function () {
    if (insideThePaper) return;
    var picture = new Image();
    picture.onload = function () {
      startWithBlankPaper();
      pen.drawImage(picture, 0, 0);
    };
    picture.src = paperNow;
  }, 2200);
}

// ---------- The magic portal ----------
// It spins open in the middle of your drawing, your drawing gets pulled
// into it, and out you come in the place you drew.

function drawThePortal() {
  var howFarOpen = Math.min(1, paperFrame / PORTAL_OPENING);
  var goingThrough = Math.max(0, (paperFrame - PORTAL_OPENING) / GOING_THROUGH);

  pen.fillStyle = "#ffffff";
  pen.fillRect(0, 0, board.width, board.height);

  var middleX = board.width / 2;
  var middleY = board.height / 2;

  // Your drawing, being sucked into the middle.
  if (theDrawing) {
    pen.save();
    pen.translate(middleX, middleY);
    pen.rotate(goingThrough * 4);
    var howBig = 1 - goingThrough * 0.95;
    pen.globalAlpha = Math.max(0, 1 - goingThrough);
    pen.drawImage(theDrawing, -board.width / 2 * howBig, -board.height / 2 * howBig,
                  board.width * howBig, board.height * howBig);
    pen.restore();
  }

  // The portal: rings of your own colors, spinning round.
  var biggest = 40 + howFarOpen * 150 + goingThrough * 420;
  for (var ring = 6; ring >= 0; ring--) {
    var size = biggest * (ring + 1) / 7;
    pen.strokeStyle = theColors[ring % theColors.length];
    pen.lineWidth = 10 + Math.sin(paperFrame * 0.15 + ring) * 4;
    pen.globalAlpha = 0.75;
    pen.beginPath();
    pen.arc(middleX, middleY, size,
            paperFrame * 0.06 + ring, paperFrame * 0.06 + ring + 4.6);
    pen.stroke();
  }
  pen.globalAlpha = 1;

  // The dark middle of the portal, opening up.
  pen.fillStyle = darker(theColors[0], 0.55);
  pen.beginPath();
  pen.arc(middleX, middleY, 20 + howFarOpen * 40 + goingThrough * 460, 0, Math.PI * 2);
  pen.fill();

  // Sparkles round the edge.
  pen.fillStyle = "#ffffff";
  for (var s = 0; s < 14; s++) {
    var turn = paperFrame * 0.04 + s;
    var away = biggest + Math.sin(paperFrame * 0.1 + s * 2) * 16;
    pen.beginPath();
    pen.arc(middleX + Math.cos(turn) * away, middleY + Math.sin(turn) * away, 3, 0, Math.PI * 2);
    pen.fill();
  }

  // What it says while it opens.
  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.font = "bold 26px 'Trebuchet MS', sans-serif";
  if (goingThrough < 0.2) {
    pen.fillStyle = darker(theColors[0], 0.4);
    pen.fillText("A magic portal!", middleX, board.height - 40);
  } else {
    pen.fillStyle = "#ffffff";
    pen.fillText("Going to " + whereYouWent.name + "...", middleX, board.height - 40);
  }
}

// ---------- Being there ----------

function drawWhereYouAre() {
  whereYouWent.draw();

  var groundAt = board.height * whereYouWent.groundAt;

  // You, walking about in there.
  you.x += (you.wantX - you.x) * WALKING_SPEED;
  var walking = Math.abs(you.wantX - you.x) > 2;
  var hop = walking ? Math.abs(Math.sin(paperFrame * 0.25)) * 10 : 0;

  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.font = "46px serif";
  pen.fillText(whereYouWent.who, you.x, groundAt + 18 - hop);

  // The words, with a dark outline so they show up anywhere.
  pen.fillStyle = "#ffffff";
  pen.strokeStyle = "rgba(31, 41, 51, 0.85)";
  pen.lineWidth = 5;
  pen.font = "bold 30px 'Trebuchet MS', sans-serif";
  pen.strokeText("You are in " + whereYouWent.name + "!", board.width / 2, 34);
  pen.fillText("You are in " + whereYouWent.name + "!", board.width / 2, 34);

  pen.font = "bold 19px 'Trebuchet MS', sans-serif";
  var helpLine = whereYouWent.yourOwn
    ? "Your own place, made from your picture"
    : "Tap where you want to walk";
  pen.strokeText(helpLine, board.width / 2, board.height - 22);
  pen.fillText(helpLine, board.width / 2, board.height - 22);
}

// ---------- The loop ----------

function everyPaperFrame() {
  if (!insideThePaper) return;

  paperFrame++;

  if (!arrived) {
    drawThePortal();
    if (paperFrame > PORTAL_OPENING + GOING_THROUGH) {
      arrived = true;
      paperFrame = 0;
    }
  } else {
    drawWhereYouAre();
  }

  requestAnimationFrame(everyPaperFrame);
}

// ---------- The buttons ----------

// A picture button for every place, so you can tap one instead of
// writing it. Tapping it fills in the word and takes you straight there.
PLACES.forEach(function (place) {
  var button = document.createElement("button");
  button.type = "button";
  button.className = "picker-button";
  button.textContent = place.picture + " " + place.name.toLowerCase();
  button.addEventListener("click", function () {
    if (insideThePaper) return;
    placeBox.value = place.name.toLowerCase();
    goIntoThePaper();
  });
  placePicks.appendChild(button);
});

intoThePaperButton.addEventListener("click", function () {
  if (insideThePaper) comeBackOut();
  else goIntoThePaper();
});

// Pressing enter in the box goes too.
placeBox.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !insideThePaper) goIntoThePaper();
});

// Inside the place, tapping walks you over there.
board.addEventListener("pointerdown", function (event) {
  if (!insideThePaper || !arrived) return;
  var box = board.getBoundingClientRect();
  you.wantX = (event.clientX - box.left) * (board.width / box.width);
});

// The arrow keys walk you too.
document.addEventListener("keydown", function (event) {
  if (!insideThePaper || !arrived) return;
  if (event.key === "ArrowLeft")  { you.wantX = Math.max(30, you.x - 90); event.preventDefault(); }
  if (event.key === "ArrowRight") { you.wantX = Math.min(board.width - 30, you.x + 90); event.preventDefault(); }
});
