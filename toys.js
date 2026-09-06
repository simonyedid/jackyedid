// ============================================================
// TOY WORKSHOP
// Pick a head, a body, some legs and a color. Name your toy
// and put it in the toy box. The toy box remembers.
// ============================================================

// ---------- THE PARTS - add your own! ----------
// Copy a line, change the picture and the name, and a new
// button turns up by itself.
var HEADS = [
  { picture: "🤖", name: "Robot" },
  { picture: "🐻", name: "Bear" },
  { picture: "🦖", name: "Dino" },
  { picture: "🐱", name: "Cat" },
  { picture: "👻", name: "Ghost" },
  { picture: "🦄", name: "Unicorn" },
  { picture: "🐸", name: "Frog" },
  { picture: "👽", name: "Alien" }
];

var BODIES = [
  { picture: "🟦", name: "Square", arms: "🦾" },
  { picture: "⚙️", name: "Cog", arms: "🔧" },
  { picture: "🎽", name: "Vest", arms: "🤚" },
  { picture: "🧥", name: "Coat", arms: "🧤" },
  { picture: "🎒", name: "Backpack", arms: "🪃" }
];

var LEGS = [
  { picture: "🦿", name: "Robot legs" },
  { picture: "👟", name: "Trainers" },
  { picture: "🥾", name: "Big boots" },
  { picture: "🛞", name: "Wheels" },
  { picture: "🦵", name: "Just legs" }
];

var COLORS = [
  { paint: "#2563eb", name: "Blue" },
  { paint: "#e63946", name: "Red" },
  { paint: "#2a9d3f", name: "Green" },
  { paint: "#f2c14e", name: "Yellow" },
  { paint: "#9d4edd", name: "Purple" },
  { paint: "#ff8fab", name: "Pink" },
  { paint: "#3ec1d3", name: "Teal" },
  { paint: "#f77f00", name: "Orange" }
];

var HOW_MANY_FIT_IN_THE_TOY_BOX = 12;
// ------------------------------------------------

var toy = document.getElementById("toy");
var headSpot = document.getElementById("toy-head");
var bodySpot = document.getElementById("toy-body");
var leftArm = document.getElementById("toy-left-arm");
var rightArm = document.getElementById("toy-right-arm");
var legsSpot = document.getElementById("toy-legs");
var nameShown = document.getElementById("toy-name-shown");
var nameBox = document.getElementById("name-box");
var toyboxBox = document.getElementById("toybox");
var toyboxMessage = document.getElementById("toybox-message");

var chosen = { head: HEADS[0], body: BODIES[0], legs: LEGS[0], color: COLORS[0] };
var toybox = [];

// ---------- Showing the toy ----------

function showToy() {
  headSpot.textContent = chosen.head.picture;
  bodySpot.textContent = chosen.body.picture;
  leftArm.textContent = chosen.body.arms;
  rightArm.textContent = chosen.body.arms;
  legsSpot.textContent = chosen.legs.picture;
  toy.style.background = chosen.color.paint;
  nameShown.textContent = nameBox.value.trim() || "Nobody yet";
}

nameBox.addEventListener("input", showToy);

// ---------- The picker buttons ----------

function buildPicker(boxId, list, whichOne, startAt) {
  var box = document.getElementById(boxId);
  list.forEach(function (thing, position) {
    var button = document.createElement("button");
    button.className = "picker-button";
    button.textContent = thing.picture + " " + thing.name;
    if (position === startAt) button.classList.add("chosen");

    button.addEventListener("click", function () {
      chosen[whichOne] = thing;
      var all = box.querySelectorAll("button");
      for (var i = 0; i < all.length; i++) all[i].classList.remove("chosen");
      button.classList.add("chosen");
      showToy();
    });
    box.appendChild(button);
  });
}

buildPicker("head-picker", HEADS, "head", 0);
buildPicker("body-picker", BODIES, "body", 0);
buildPicker("legs-picker", LEGS, "legs", 0);

// The colors are round blobs instead of words.
var colorBox = document.getElementById("color-picker");
COLORS.forEach(function (color, position) {
  var button = document.createElement("button");
  button.className = "color-button";
  button.style.background = color.paint;
  button.title = color.name;
  button.setAttribute("aria-label", color.name);
  if (position === 0) button.classList.add("chosen");

  button.addEventListener("click", function () {
    chosen.color = color;
    var all = colorBox.querySelectorAll("button");
    for (var i = 0; i < all.length; i++) all[i].classList.remove("chosen");
    button.classList.add("chosen");
    showToy();
  });
  colorBox.appendChild(button);
});

// ---------- Surprise me ----------

function pickAnyOf(list) {
  return list[Math.floor(Math.random() * list.length)];
}

document.getElementById("surprise-button").addEventListener("click", function () {
  chosen.head = pickAnyOf(HEADS);
  chosen.body = pickAnyOf(BODIES);
  chosen.legs = pickAnyOf(LEGS);
  chosen.color = pickAnyOf(COLORS);
  nameBox.value = chosen.color.name + " " + chosen.head.name;
  markTheChosenButtons();
  showToy();
});

// After a surprise, the rings need to move to the right buttons.
function markTheChosenButtons() {
  ringThese("head-picker", HEADS, chosen.head);
  ringThese("body-picker", BODIES, chosen.body);
  ringThese("legs-picker", LEGS, chosen.legs);
  ringThese("color-picker", COLORS, chosen.color);
}

function ringThese(boxId, list, thing) {
  var all = document.getElementById(boxId).querySelectorAll("button");
  for (var i = 0; i < all.length; i++) {
    all[i].classList.toggle("chosen", list[i] === thing);
  }
}

// ---------- The toy box ----------

function loadToyBox() {
  try { toybox = JSON.parse(localStorage.getItem("jack-toybox")) || []; }
  catch (whoops) { toybox = []; }
}

function saveToyBox() {
  try { localStorage.setItem("jack-toybox", JSON.stringify(toybox)); return true; }
  catch (whoops) { return false; }
}

function showToyBox() {
  toyboxBox.innerHTML = "";

  if (toybox.length === 0) {
    toyboxMessage.textContent = "Empty! Build a toy and put it in here.";
    return;
  }

  toyboxMessage.textContent = "You have made " + toybox.length + " toy" +
                              (toybox.length === 1 ? "" : "s") + ".";

  toybox.forEach(function (made) {
    var card = document.createElement("div");
    card.className = "toybox-toy";
    card.style.background = made.color;

    var pictures = document.createElement("div");
    pictures.className = "toybox-pictures";
    pictures.textContent = made.head + made.body + made.legs;

    var label = document.createElement("div");
    label.className = "toybox-name";
    label.textContent = made.name;

    var bin = document.createElement("button");
    bin.className = "album-button";
    bin.textContent = "🗑️";
    bin.title = "Give this toy away";
    bin.addEventListener("click", function () {
      toybox.splice(toybox.indexOf(made), 1);
      saveToyBox();
      showToyBox();
    });

    card.appendChild(pictures);
    card.appendChild(label);
    card.appendChild(bin);
    toyboxBox.appendChild(card);
  });
}

document.getElementById("keep-button").addEventListener("click", function () {
  if (toybox.length >= HOW_MANY_FIT_IN_THE_TOY_BOX) {
    toyboxMessage.textContent = "Your toy box is full! Give one away with 🗑️ to make room.";
    return;
  }

  toybox.push({
    name: nameBox.value.trim() || "No name",
    head: chosen.head.picture,
    body: chosen.body.picture,
    legs: chosen.legs.picture,
    color: chosen.color.paint
  });

  if (saveToyBox()) {
    showToyBox();
    toyboxMessage.textContent = "Made it! You have " + toybox.length + " toy" +
                                (toybox.length === 1 ? "" : "s") + ".";
  } else {
    toybox.pop();
    showToyBox();
    toyboxMessage.textContent = "This browser has run out of room to remember toys.";
  }
});

loadToyBox();
showToyBox();
showToy();
