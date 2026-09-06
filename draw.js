// ============================================================
// DRAWING BOARD
// Hold the mouse down (or your finger) and move it to draw.
// ============================================================

// ---------- THE COLORS - add your own! ----------
// Copy a line and put any color you like in it.
var COLORS = [
  { paint: "#1f2933", name: "Black" },
  { paint: "#2563eb", name: "Blue" },
  { paint: "#3ec1d3", name: "Teal" },
  { paint: "#e63946", name: "Red" },
  { paint: "#f77f00", name: "Orange" },
  { paint: "#fcbf49", name: "Yellow" },
  { paint: "#2a9d3f", name: "Green" },
  { paint: "#9d4edd", name: "Purple" },
  { paint: "#ff8fab", name: "Pink" },
  { paint: "#8b5a2b", name: "Brown" },
  { paint: "#ffffff", name: "Eraser" }
];

var SIZES = [
  { thickness: 4, name: "Thin" },
  { thickness: 12, name: "Medium" },
  { thickness: 28, name: "Fat" }
];
// ------------------------------------------------

var board = document.getElementById("board");
var pen = board.getContext("2d");

var colorButtonsBox = document.getElementById("color-buttons");
var sizeButtonsBox = document.getElementById("size-buttons");

var currentColor = COLORS[0].paint;
var currentThickness = SIZES[1].thickness;
var drawing = false;

// Every finished line gets saved here so Undo can go back a step.
var pictureHistory = [];

// ---------- Setting up the paper ----------

function startWithBlankPaper() {
  pen.fillStyle = "#ffffff";
  pen.fillRect(0, 0, board.width, board.height);
}

startWithBlankPaper();

// ---------- Making the buttons ----------

COLORS.forEach(function (color, position) {
  var button = document.createElement("button");
  button.className = "color-button";
  button.style.background = color.paint;
  button.title = color.name;
  button.setAttribute("aria-label", color.name);
  if (color.name === "Eraser") button.textContent = "🧽";
  if (position === 0) button.classList.add("chosen");

  button.addEventListener("click", function () {
    currentColor = color.paint;
    showChosen(colorButtonsBox, button);
  });
  colorButtonsBox.appendChild(button);
});

SIZES.forEach(function (size, position) {
  var button = document.createElement("button");
  button.className = "size-button";
  button.textContent = size.name;
  if (position === 1) button.classList.add("chosen");

  button.addEventListener("click", function () {
    currentThickness = size.thickness;
    showChosen(sizeButtonsBox, button);
  });
  sizeButtonsBox.appendChild(button);
});

// Only one button in a group can look picked at a time.
function showChosen(box, button) {
  var all = box.querySelectorAll("button");
  for (var i = 0; i < all.length; i++) all[i].classList.remove("chosen");
  button.classList.add("chosen");
}

// ---------- Drawing ----------

// The board on screen can be smaller than the real picture,
// so work out where on the picture the finger actually is.
function findSpot(event) {
  var box = board.getBoundingClientRect();
  return {
    x: (event.clientX - box.left) * (board.width / box.width),
    y: (event.clientY - box.top) * (board.height / box.height)
  };
}

function rememberPicture() {
  pictureHistory.push(board.toDataURL());
  if (pictureHistory.length > 20) pictureHistory.shift();   // keep the last 20
}

board.addEventListener("pointerdown", function (event) {
  rememberPicture();
  drawing = true;
  board.setPointerCapture(event.pointerId);

  var spot = findSpot(event);
  pen.strokeStyle = currentColor;
  pen.lineWidth = currentThickness;
  pen.lineCap = "round";
  pen.lineJoin = "round";
  pen.beginPath();
  pen.moveTo(spot.x, spot.y);
  // A single tap should leave a dot, not nothing.
  pen.lineTo(spot.x, spot.y);
  pen.stroke();
});

board.addEventListener("pointermove", function (event) {
  if (!drawing) return;
  var spot = findSpot(event);
  pen.lineTo(spot.x, spot.y);
  pen.stroke();
});

board.addEventListener("pointerup", function () { drawing = false; });
board.addEventListener("pointerleave", function () { drawing = false; });

// ---------- The buttons at the bottom ----------

document.getElementById("undo-button").addEventListener("click", function () {
  var previous = pictureHistory.pop();
  if (!previous) return;
  var picture = new Image();
  picture.onload = function () {
    pen.clearRect(0, 0, board.width, board.height);
    pen.drawImage(picture, 0, 0);
  };
  picture.src = previous;
});

document.getElementById("clear-button").addEventListener("click", function () {
  rememberPicture();
  startWithBlankPaper();
});

document.getElementById("save-button").addEventListener("click", function () {
  var link = document.createElement("a");
  link.download = "my-drawing.png";
  link.href = board.toDataURL("image/png");
  link.click();
});
