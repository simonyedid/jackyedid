// ============================================================
// BARBECUE
// Put food on the grill. Wait for it to cook. Take it off at
// the right moment — leave it too long and it burns!
// ============================================================

// ---------- THE FOOD - add your own! ----------
// Copy a line, change the picture and the name, and it turns
// up as a new button by itself.
var FOODS = [
  { picture: "🍔", name: "Burger" },
  { picture: "🌭", name: "Sausage" },
  { picture: "🍗", name: "Chicken" },
  { picture: "🥩", name: "Steak" },
  { picture: "🌽", name: "Corn" },
  { picture: "🍤", name: "Prawn" },
  { picture: "🍕", name: "Pizza slice" },
  { picture: "🍡", name: "Marshmallow" }
];

var HOW_MANY_SPOTS = 6;
var COOKING_SPEED = 1.1;   // bigger = everything cooks faster
var READY_AT = 55;         // it is perfect from here...
var BURNT_AT = 85;         // ...until here, then it is ruined
// ----------------------------------------------

var grillBox = document.getElementById("grill");
var foodBox = document.getElementById("food-picker");
var message = document.getElementById("message");
var scoreLine = document.getElementById("score");
var lunchBoxBox = document.getElementById("lunch");
var lunchMessage = document.getElementById("lunch-message");

var spots = [];            // one for each place on the grill
var holdingFood = FOODS[0];
var served = 0;
var perfect = 0;
var best = 0;

try { best = Number(localStorage.getItem("jack-bbq-best")) || 0; }
catch (whoops) { best = 0; }

// ---------- Building the grill ----------

for (var i = 0; i < HOW_MANY_SPOTS; i++) {
  spots.push({ food: null, cooked: 0 });
}

spots.forEach(function (spot, position) {
  var place = document.createElement("button");
  place.className = "grill-spot";
  place.addEventListener("click", function () { tapSpot(spot); });
  spot.button = place;

  var picture = document.createElement("div");
  picture.className = "grill-food";

  var barOutside = document.createElement("div");
  barOutside.className = "cook-bar";
  var barInside = document.createElement("div");
  barInside.className = "cook-bar-fill";
  barOutside.appendChild(barInside);

  var label = document.createElement("div");
  label.className = "cook-label";

  place.appendChild(picture);
  place.appendChild(barOutside);
  place.appendChild(label);
  grillBox.appendChild(place);

  spot.picture = picture;
  spot.bar = barInside;
  spot.label = label;
});

// ---------- The food buttons ----------

FOODS.forEach(function (food, position) {
  var button = document.createElement("button");
  button.className = "picker-button";
  button.textContent = food.picture + " " + food.name;
  if (position === 0) button.classList.add("chosen");

  button.addEventListener("click", function () {
    holdingFood = food;
    var all = foodBox.querySelectorAll("button");
    for (var i = 0; i < all.length; i++) all[i].classList.remove("chosen");
    button.classList.add("chosen");
    message.textContent = "Holding a " + food.name.toLowerCase() +
                          ". Tap an empty spot on the grill!";
  });
  foodBox.appendChild(button);
});

// ---------- Putting food on and taking it off ----------

function tapSpot(spot) {
  if (spot.food === null) {
    spot.food = holdingFood;
    spot.cooked = 0;
    message.textContent = holdingFood.name + " is on! Watch it carefully.";
  } else {
    takeItOff(spot);
  }
  showGrill();
}

function takeItOff(spot) {
  var name = spot.food.name;
  served++;

  if (spot.cooked < READY_AT) {
    message.textContent = "🥶 That " + name.toLowerCase() + " is still raw! Leave it longer.";
  } else if (spot.cooked < BURNT_AT) {
    perfect++;
    message.textContent = "😋 Perfect " + name.toLowerCase() + "! Into the lunch box it goes.";
    putInLunchBox(spot.food);
    if (perfect > best) {
      best = perfect;
      try { localStorage.setItem("jack-bbq-best", best); } catch (whoops) {}
    }
  } else {
    message.textContent = "🔥 Oh no, the " + name.toLowerCase() + " is burnt to a crisp!";
  }

  spot.food = null;
  spot.cooked = 0;
  showScore();
}

// ---------- How cooked is it? ----------

function howCookedIsIt(spot) {
  if (spot.cooked < READY_AT) return { word: "Raw", color: "#e35d6a" };
  if (spot.cooked < BURNT_AT) return { word: "Ready!", color: "#2a9d3f" };
  return { word: "Burnt!", color: "#3a3f46" };
}

function showGrill() {
  spots.forEach(function (spot) {
    if (spot.food === null) {
      spot.picture.textContent = "";
      spot.label.textContent = "";
      spot.bar.style.width = "0%";
      spot.button.classList.remove("has-food");
      return;
    }

    var state = howCookedIsIt(spot);
    spot.picture.textContent = spot.food.picture;
    spot.label.textContent = state.word;
    spot.label.style.color = state.color;
    spot.bar.style.width = Math.min(spot.cooked, 100) + "%";
    spot.bar.style.background = state.color;
    spot.button.classList.add("has-food");
  });
}

function showScore() {
  scoreLine.textContent = "Served " + served + " · Perfect " + perfect + " · Best " + best;
}

// ---------- Time passing ----------

// Every tick, anything on the grill cooks a little bit more.
setInterval(function () {
  var somethingChanged = false;
  spots.forEach(function (spot) {
    if (spot.food !== null && spot.cooked < 100) {
      spot.cooked += COOKING_SPEED;
      somethingChanged = true;
    }
  });
  if (somethingChanged) showGrill();
}, 100);

document.getElementById("clear-grill").addEventListener("click", function () {
  spots.forEach(function (spot) { spot.food = null; spot.cooked = 0; });
  message.textContent = "Grill cleared. Ready when you are!";
  showGrill();
});

// ---------- My Lunch Box ----------
// Everything you cook perfectly is kept here, in this browser.

var lunchBox = [];

function loadLunchBox() {
  try { lunchBox = JSON.parse(localStorage.getItem("jack-lunch-box")) || []; }
  catch (whoops) { lunchBox = []; }
}

function saveLunchBox() {
  try { localStorage.setItem("jack-lunch-box", JSON.stringify(lunchBox)); }
  catch (whoops) {}
}

function putInLunchBox(food) {
  if (typeof giveAStar === "function") giveAStar();   // a star for cooking one right
  lunchBox.push({ picture: food.picture, name: food.name });
  saveLunchBox();
  showLunchBox();
}

function showLunchBox() {
  lunchBoxBox.innerHTML = "";

  if (lunchBox.length === 0) {
    lunchMessage.textContent = "Empty! Cook something perfectly and it lands in here.";
    return;
  }

  lunchMessage.textContent = "You have cooked " + lunchBox.length + " thing" +
                             (lunchBox.length === 1 ? "" : "s") + " perfectly.";

  lunchBox.forEach(function (kept) {
    var card = document.createElement("div");
    card.className = "food-box-item";

    var picture = document.createElement("div");
    picture.className = "lunch-picture";
    picture.textContent = kept.picture;

    var label = document.createElement("div");
    label.className = "food-box-name";
    label.textContent = kept.name;

    var bin = document.createElement("button");
    bin.className = "album-button";
    bin.textContent = "🗑️";
    bin.title = "Eat this one";
    bin.addEventListener("click", function () {
      lunchBox.splice(lunchBox.indexOf(kept), 1);
      saveLunchBox();
      showLunchBox();
    });

    card.appendChild(picture);
    card.appendChild(label);
    card.appendChild(bin);
    lunchBoxBox.appendChild(card);
  });
}

document.getElementById("empty-lunch").addEventListener("click", function () {
  lunchBox = [];
  saveLunchBox();
  showLunchBox();
});

loadLunchBox();
showLunchBox();
showGrill();
showScore();
