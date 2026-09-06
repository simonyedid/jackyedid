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

var HOW_MANY_FIT_IN_THE_ALBUM = 12;

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

var albumBox = document.getElementById("album");
var albumMessage = document.getElementById("album-message");

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

// ---------- My Album ----------
// Every picture you save is kept in this browser, on this device.
// It is not sent anywhere and it does not go on the website.

var album = [];

function loadAlbum() {
  try { album = JSON.parse(localStorage.getItem("jack-album")) || []; }
  catch (whoops) { album = []; }
}

function saveAlbum() {
  try {
    localStorage.setItem("jack-album", JSON.stringify(album));
    return true;
  } catch (whoops) {
    return false;   // the browser ran out of room, or will not remember things
  }
}

function showAlbum() {
  albumBox.innerHTML = "";

  if (album.length === 0) {
    albumMessage.textContent = "Nothing in here yet. Draw something and press Save!";
    return;
  }

  albumMessage.textContent = "You have " + album.length + " picture" +
                             (album.length === 1 ? "" : "s") + " in your album.";

  album.forEach(function (item, position) {
    var frame = document.createElement("div");
    frame.className = "album-item";

    var picture = document.createElement("img");
    picture.src = item.picture;
    picture.alt = "Drawing number " + (position + 1) + " by Jack";
    picture.className = "album-picture";

    var buttons = document.createElement("div");
    buttons.className = "album-buttons";

    var get = document.createElement("a");
    get.className = "album-button";
    get.textContent = "⬇️";
    get.title = "Put this picture on my computer";
    get.download = "jacks-drawing-" + (position + 1) + ".png";
    get.href = item.picture;

    var again = document.createElement("button");
    again.className = "album-button";
    again.textContent = "✏️";
    again.title = "Put this one back on the paper to keep drawing";
    again.addEventListener("click", function () { putBackOnThePaper(item.picture); });

    var bin = document.createElement("button");
    bin.className = "album-button";
    bin.textContent = "🗑️";
    bin.title = "Throw this one away";
    bin.addEventListener("click", function () {
      album.splice(album.indexOf(item), 1);
      saveAlbum();
      showAlbum();
    });

    buttons.appendChild(get);
    buttons.appendChild(again);
    buttons.appendChild(bin);
    frame.appendChild(picture);
    frame.appendChild(buttons);
    albumBox.appendChild(frame);
  });
}

function putBackOnThePaper(address) {
  rememberPicture();
  var picture = new Image();
  picture.onload = function () {
    startWithBlankPaper();
    pen.drawImage(picture, 0, 0);
  };
  picture.src = address;
  board.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.getElementById("save-button").addEventListener("click", function () {
  if (album.length >= HOW_MANY_FIT_IN_THE_ALBUM) {
    albumMessage.textContent = "Your album is full! Throw one away with 🗑️ to make room.";
    return;
  }

  album.push({ picture: board.toDataURL("image/png") });

  if (saveAlbum()) {
    showAlbum();
    albumMessage.textContent = "Saved! You have " + album.length + " picture" +
                               (album.length === 1 ? "" : "s") + " in your album.";
  } else {
    // No room left, so put it back the way it was and say so.
    album.pop();
    showAlbum();
    albumMessage.textContent = "This browser has run out of room. Throw a picture away with 🗑️ and try again.";
  }
});

loadAlbum();
showAlbum();
