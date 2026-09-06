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
// --------------------------------------------------

var pizza = document.getElementById("pizza");
var toppingsLayer = document.getElementById("toppings");
var buttonsBox = document.getElementById("topping-buttons");
var message = document.getElementById("message");
var bakeButton = document.getElementById("bake-button");
var clearButton = document.getElementById("clear-button");

var whatIsOnTop = [];   // the names of everything added so far
var isBaked = false;

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
  if (isBaked) {
    message.textContent = "Already baked! Press Start over to make another one.";
    return;
  }
  if (whatIsOnTop.length === 0) {
    message.textContent = "Put something on it first!";
    return;
  }

  isBaked = true;
  pizza.classList.add("baked");
  message.textContent = "🔥 Baking...";

  // Wait a moment so it feels like it is really cooking.
  setTimeout(function () {
    message.textContent = "🍕 Your " + whatIsOnTop.join(" and ").toLowerCase() +
                          " pizza is ready! " + scoreIt();
  }, 1500);
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
  pizza.classList.remove("baked");
  message.textContent = "An empty pizza. Add something!";
});
