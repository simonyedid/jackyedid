// ============================================================
// GOING INTO THE PAPER
// Press the button and a magic portal opens in your drawing.
// Go through the portal and you are inside the place you drew:
// your picture is the scenery, and your colors are the sky.
// ============================================================

// ---------- SETTINGS - change these! ----------
var PORTAL_OPENING = 90;      // frames the portal takes to open
var GOING_THROUGH = 55;       // frames you spend going through it
var YOU_ARE = "🚶"; // who walks about in there
var WALKING_SPEED = 0.08;     // how quickly you get to where you tapped
// ----------------------------------------------

var intoThePaperButton = document.getElementById("into-the-paper");
var otherPaperButtons = ["undo-button", "clear-button", "save-button"];

var insideThePaper = false;   // true from the moment the portal opens
var arrived = false;          // true once you are through it
var paperFrame = 0;           // counts up the whole time you are in there
var paperBefore = null;       // your picture, to put back when you come out
var theDrawing = null;        // the same picture with the white paper cut away
var theColors = [];           // the colors you drew with
var you = null;               // where you are standing in the place

// ---------- Getting your drawing ready ----------

// Copy the picture and rub out everything white, so what you drew can
// float in the sky instead of sitting on a white square.
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

// Which of your colors did you use the most? Those are the colors the
// place is made of.
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

// Mix a color towards white (lighter) or towards black (darker).
function mixed(hex, towardsWhite, howMuch) {
  var goingTo = towardsWhite ? 255 : 0;
  function bit(was) { return Math.round(was + (goingTo - was) * howMuch); }
  return "rgb(" + bit(redOf(hex)) + "," + bit(greenOf(hex)) + "," + bit(blueOf(hex)) + ")";
}

function lighter(hex, howMuch) { return mixed(hex, true, howMuch); }
function darker(hex, howMuch)  { return mixed(hex, false, howMuch); }

// ---------- Going in and coming out ----------

function goIntoThePaper() {
  var cut = cutOutTheDrawing();

  if (!somethingIsDrawn(cut)) {
    showTheMessage("Draw something first, then go into it!");
    return;
  }

  paperBefore = board.toDataURL();     // so we can put your picture back
  theDrawing = cut;
  theColors = colorsInTheDrawing(cut);
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
// It spins open in the middle of your drawing, and then your drawing
// gets pulled into it and you go through.

function drawThePortal() {
  var howFarOpen = Math.min(1, paperFrame / PORTAL_OPENING);
  var goingThrough = Math.max(0, (paperFrame - PORTAL_OPENING) / GOING_THROUGH);

  pen.fillStyle = "#ffffff";
  pen.fillRect(0, 0, board.width, board.height);

  var middleX = board.width / 2;
  var middleY = board.height / 2;

  // Your drawing, being sucked into the middle.
  pen.save();
  pen.translate(middleX, middleY);
  pen.rotate(goingThrough * 4);
  var howBig = 1 - goingThrough * 0.95;
  pen.globalAlpha = Math.max(0, 1 - goingThrough);
  pen.drawImage(theDrawing, -board.width / 2 * howBig, -board.height / 2 * howBig,
                board.width * howBig, board.height * howBig);
  pen.restore();

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

  pen.textAlign = "center";
  pen.textBaseline = "middle";
  pen.fillStyle = darker(theColors[0], 0.4);
  pen.font = "bold 26px 'Trebuchet MS', sans-serif";
  if (goingThrough < 0.2) {
    pen.fillText("A magic portal!", middleX, board.height - 40);
  } else {
    pen.fillStyle = "#ffffff";
    pen.fillText("Going in...", middleX, board.height - 40);
  }
}

// ---------- The place you drew ----------

function drawThePlace() {
  var groundAt = board.height * 0.76;

  // The sky, made out of the two colors you used the most.
  var sky = pen.createLinearGradient(0, 0, 0, groundAt);
  sky.addColorStop(0, lighter(theColors[0], 0.55));
  sky.addColorStop(1, lighter(theColors[1] || theColors[0], 0.8));
  pen.fillStyle = sky;
  pen.fillRect(0, 0, board.width, board.height);

  pen.textAlign = "center";
  pen.textBaseline = "middle";

  // A sun in your brightest color.
  pen.fillStyle = lighter(theColors[0], 0.25);
  pen.beginPath();
  pen.arc(board.width - 80, 74, 34 + Math.sin(paperFrame * 0.04) * 3, 0, Math.PI * 2);
  pen.fill();

  // Little copies of your drawing drifting past like clouds.
  pen.globalAlpha = 0.3;
  for (var cloud = 0; cloud < 3; cloud++) {
    var driftsAt = (paperFrame * (0.4 + cloud * 0.3) + cloud * 320) % (board.width + 300) - 150;
    var cloudBig = 0.2 + cloud * 0.05;
    pen.drawImage(theDrawing, driftsAt, 30 + cloud * 46,
                  board.width * cloudBig, board.height * cloudBig);
  }
  pen.globalAlpha = 1;

  // The ground, in a darker shade of your color.
  pen.fillStyle = darker(theColors[1] || theColors[0], 0.35);
  pen.fillRect(0, groundAt, board.width, board.height - groundAt);
  pen.fillStyle = darker(theColors[1] || theColors[0], 0.15);
  pen.fillRect(0, groundAt, board.width, 12);

  // YOUR PICTURE, standing up big in the middle of the place.
  var bob = Math.sin(paperFrame * 0.03) * 7;
  var standingBig = 0.72;
  pen.drawImage(theDrawing,
                board.width / 2 - board.width * standingBig / 2,
                groundAt - board.height * standingBig + 30 + bob,
                board.width * standingBig, board.height * standingBig);

  // You, walking about in there.
  you.x += (you.wantX - you.x) * WALKING_SPEED;
  var walking = Math.abs(you.wantX - you.x) > 2;
  var hop = walking ? Math.abs(Math.sin(paperFrame * 0.25)) * 10 : 0;
  pen.font = "46px serif";
  pen.fillText(YOU_ARE, you.x, groundAt + 22 - hop);

  // Sparkles, because it is a magic place.
  pen.fillStyle = "#ffffff";
  for (var s = 0; s < 9; s++) {
    var twinkle = Math.sin(paperFrame * 0.08 + s * 1.7);
    if (twinkle < 0.4) continue;
    pen.globalAlpha = twinkle;
    pen.beginPath();
    pen.arc((s * 137) % board.width, (s * 211) % (board.height * 0.7), 3, 0, Math.PI * 2);
    pen.fill();
  }
  pen.globalAlpha = 1;

  // The words.
  pen.fillStyle = "#ffffff";
  pen.strokeStyle = darker(theColors[0], 0.6);
  pen.lineWidth = 4;
  pen.font = "bold 30px 'Trebuchet MS', sans-serif";
  pen.strokeText("You are inside your picture!", board.width / 2, 34);
  pen.fillText("You are inside your picture!", board.width / 2, 34);

  pen.font = "bold 19px 'Trebuchet MS', sans-serif";
  pen.strokeText("Tap where you want to walk", board.width / 2, board.height - 22);
  pen.fillText("Tap where you want to walk", board.width / 2, board.height - 22);
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
    drawThePlace();
  }

  requestAnimationFrame(everyPaperFrame);
}

// ---------- The buttons ----------

intoThePaperButton.addEventListener("click", function () {
  if (insideThePaper) comeBackOut();
  else goIntoThePaper();
});

// Inside the place, tapping the paper walks you over there.
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
