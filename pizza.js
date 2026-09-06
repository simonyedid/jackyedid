// ============================================================
// MAKE YOUR OWN PIZZA
// Click a topping to sprinkle it on. Then bake it!
// ============================================================

// ---------- THE TOPPINGS - add your own! ----------
// Copy a line, change the picture and the name, and it appears
// as a new button on the page all by itself.
var TOPPINGS = [
  { picture: "🍅", name: "Tomato" },
  { picture: "🍄", name: "Mushroom" },
  { picture: "🫒", name: "Olive" },
  { picture: "🌶️", name: "Chilli" },
  { picture: "🧀", name: "Extra cheese" },
  { picture: "🥓", name: "Bacon" },
  { picture: "🍍", name: "Pineapple" },
  { picture: "🌽", name: "Sweetcorn" }
];

var HOW_MANY_EACH_CLICK = 5;   // how many appear per click
var HOW_MANY_FIT_IN_THE_BOX = 12;
var HOW_LONG_IT_BAKES = 5000;   // milliseconds in the oven
var HOW_MANY_SLICES = 8;
// --------------------------------------------------

var pizza = document.getElementById("pizza");
var toppingsLayer = document.getElementById("toppings");
var buttonsBox = document.getElementById("topping-buttons");
var message = document.getElementById("message");
var bakeButton = document.getElementById("bake-button");
var clearButton = document.getElementById("clear-button");
var keepButton = document.getElementById("keep-button");
var boxBox = document.getElementById("box");
var boxMessage = document.getElementById("box-message");
var cutButton = document.getElementById("cut-button");
var ovenDoor = document.getElementById("oven-door");
var bakeBar = document.getElementById("bake-bar");
var slices = document.getElementById("slices");

var whatIsOnTop = [];   // the names of everything added so far
var isBaked = false;
var isCut = false;
var inTheOven = false;

// ---------- Making the topping buttons ----------

TOPPINGS.forEach(function (topping) {
  var button = document.createElement("button");
  button.className = "topping-button";
  button.textContent = topping.picture + " " + topping.name;
  button.addEventListener("click", function () {
    sprinkle(topping);
  });
  buttonsBox.appendChild(button);
});

// ---------- Putting toppings on the pizza ----------

function sprinkle(topping) {
  if (inTheOven) {
    message.textContent = "It is in the oven! Wait for the ding. 🔥";
    return;
  }
  if (isBaked) {
    message.textContent = "That one is already baked! Press Start over.";
    return;
  }

  for (var i = 0; i < HOW_MANY_EACH_CLICK; i++) {
    var piece = document.createElement("span");
    piece.className = "topping";
    piece.textContent = topping.picture;

    // Pick a random spot, but keep it on the cheese and off the crust.
    var turn = Math.random() * Math.PI * 2;
    var howFarOut = Math.sqrt(Math.random()) * 36;   // percent from the middle
    piece.style.left = (50 + Math.cos(turn) * howFarOut) + "%";
    piece.style.top = (50 + Math.sin(turn) * howFarOut) + "%";
    piece.style.transform = "translate(-50%, -50%) rotate(" + (Math.random() * 360) + "deg)";

    toppingsLayer.appendChild(piece);
  }

  if (whatIsOnTop.indexOf(topping.name) === -1) {
    whatIsOnTop.push(topping.name);
  }
  message.textContent = "Added " + topping.name.toLowerCase() + "!";
}

// ---------- Baking ----------

bakeButton.addEventListener("click", function () {
  if (inTheOven) return;
  if (isBaked) {
    message.textContent = "Already baked! Press Start over to make another one.";
    return;
  }
  if (whatIsOnTop.length === 0) {
    message.textContent = "Put something on it first!";
    return;
  }

  // Shut the door, start it spinning, and fill up the timer bar.
  inTheOven = true;
  ovenDoor.classList.add("shut");
  pizza.classList.add("spinning");
  message.textContent = "🔥 In the oven... it is going round and round!";

  bakeBar.style.transition = "none";
  bakeBar.style.width = "0%";
  // Waiting one frame makes the bar start from empty every time.
  requestAnimationFrame(function () {
    bakeBar.style.transition = "width " + HOW_LONG_IT_BAKES + "ms linear";
    bakeBar.style.width = "100%";
  });

  setTimeout(comeOutOfTheOven, HOW_LONG_IT_BAKES);
});

function comeOutOfTheOven() {
  inTheOven = false;
  isBaked = true;
  ovenDoor.classList.remove("shut");
  pizza.classList.remove("spinning");
  pizza.classList.add("baked");

  ding();

  message.textContent = "🔔 DING! Your " + whatIsOnTop.join(" and ").toLowerCase() +
                        " pizza is ready! " + scoreIt();
  cutButton.hidden = false;
  keepButton.hidden = false;
}

// ---------- The ding ----------
// There is no sound file here. The computer makes the two notes itself.

function ding() {
  try {
    var speaker = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1320].forEach(function (note, position) {
      var beep = speaker.createOscillator();
      var loudness = speaker.createGain();
      beep.type = "sine";
      beep.frequency.value = note;
      beep.connect(loudness);
      loudness.connect(speaker.destination);

      var startAt = speaker.currentTime + position * 0.16;
      loudness.gain.setValueAtTime(0.0001, startAt);
      loudness.gain.exponentialRampToValueAtTime(0.25, startAt + 0.02);
      loudness.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.6);
      beep.start(startAt);
      beep.stop(startAt + 0.65);
    });
  } catch (whoops) {
    // Some browsers will not make a noise. The pizza is still cooked.
  }
}

// ---------- Cutting it up ----------

cutButton.addEventListener("click", function () {
  if (isCut) return;
  isCut = true;

  slices.innerHTML = "";
  // Half as many lines as slices, because each line cuts all the way across.
  for (var i = 0; i < HOW_MANY_SLICES / 2; i++) {
    var cut = document.createElement("div");
    cut.className = "pizza-cut";
    cut.style.transform = "rotate(" + (i * (180 / (HOW_MANY_SLICES / 2))) + "deg)";
    slices.appendChild(cut);
  }
  slices.hidden = false;

  cutButton.hidden = true;
  message.textContent = "🔪 Cut into " + HOW_MANY_SLICES + " slices. Dinner time!";
});

function scoreIt() {
  if (whatIsOnTop.length === 1) return "Nice and simple.";
  if (whatIsOnTop.length === 2) return "Good combo!";
  if (whatIsOnTop.length === 3) return "Now that is a pizza.";
  if (whatIsOnTop.length >= 6) return "WOW. That is a monster pizza! 🤯";
  return "Chef's kiss! 👨‍🍳";
}

// ---------- Starting over ----------

clearButton.addEventListener("click", function () {
  toppingsLayer.innerHTML = "";
  whatIsOnTop = [];
  isBaked = false;
  isCut = false;
  inTheOven = false;
  keepButton.hidden = true;
  cutButton.hidden = true;
  slices.hidden = true;
  ovenDoor.classList.remove("shut");
  pizza.classList.remove("baked", "spinning");
  bakeBar.style.transition = "none";
  bakeBar.style.width = "0%";
  message.textContent = "An empty pizza. Add something!";
});

// ---------- My Pizza Box ----------
// Kept in this browser, on this device. Not sent anywhere.

var pizzaBox = [];

function loadBox() {
  try { pizzaBox = JSON.parse(localStorage.getItem("jack-pizza-box")) || []; }
  catch (whoops) { pizzaBox = []; }
}

function saveBox() {
  try { localStorage.setItem("jack-pizza-box", JSON.stringify(pizzaBox)); return true; }
  catch (whoops) { return false; }
}

function showBox() {
  boxBox.innerHTML = "";

  if (pizzaBox.length === 0) {
    boxMessage.textContent = "Empty! Bake a pizza and keep it in here.";
    return;
  }

  boxMessage.textContent = "You have baked " + pizzaBox.length + " pizza" +
                           (pizzaBox.length === 1 ? "" : "s") + ".";

  pizzaBox.forEach(function (kept) {
    var card = document.createElement("div");
    card.className = "food-box-item";

    var littlePizza = document.createElement("div");
    littlePizza.className = "little-pizza" + (kept.cut ? " little-pizza-cut" : "");
    kept.pictures.forEach(function (picture, position) {
      var bit = document.createElement("span");
      bit.className = "little-topping";
      // Spread the toppings evenly around the little pizza.
      var turn = (position / kept.pictures.length) * Math.PI * 2;
      bit.style.left = (50 + Math.cos(turn) * 26) + "%";
      bit.style.top = (50 + Math.sin(turn) * 26) + "%";
      bit.textContent = picture;
      littlePizza.appendChild(bit);
    });

    var label = document.createElement("div");
    label.className = "food-box-name";
    label.textContent = kept.name;

    var bin = document.createElement("button");
    bin.className = "album-button";
    bin.textContent = "🗑️";
    bin.title = "Eat this one";
    bin.addEventListener("click", function () {
      pizzaBox.splice(pizzaBox.indexOf(kept), 1);
      saveBox();
      showBox();
    });

    card.appendChild(littlePizza);
    card.appendChild(label);
    card.appendChild(bin);
    boxBox.appendChild(card);
  });
}

keepButton.addEventListener("click", function () {
  if (pizzaBox.length >= HOW_MANY_FIT_IN_THE_BOX) {
    boxMessage.textContent = "Your pizza box is full! Eat one with 🗑️ to make room.";
    return;
  }

  pizzaBox.push({
    name: whatIsOnTop.join(" and "),
    cut: isCut,
    pictures: TOPPINGS.filter(function (t) { return whatIsOnTop.indexOf(t.name) !== -1; })
                      .map(function (t) { return t.picture; })
  });

  if (saveBox()) {
    keepButton.hidden = true;
    showBox();
  } else {
    pizzaBox.pop();
    boxMessage.textContent = "This browser has run out of room to keep pizzas.";
  }
});

loadBox();
showBox();
