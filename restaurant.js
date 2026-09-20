// ============================================================
// MY RESTAURANT
// A customer sits down and asks for something. Open the cooking
// stuff, pick the ingredients, bake it in the oven, and give it
// to them.
// ============================================================

// ---------- ALL THE COOKING STUFF ----------
// Every shelf in the kitchen, and everything on it. Add your own
// by copying a line - a picture and a name is all it needs.

var SHELVES = [

  { name: "Fruits", picture: "🍓", things: [
    { picture: "🍓", name: "strawberry" },
    { picture: "🍌", name: "banana" },
    { picture: "🍎", name: "apple" },
    { picture: "🍇", name: "grapes" },
    { picture: "🍊", name: "orange" },
    { picture: "🍉", name: "watermelon" },
    { picture: "🍍", name: "pineapple" },
    { picture: "🍑", name: "peach" },
    { picture: "🍒", name: "cherries" },
    { picture: "🥭", name: "mango" },
    { picture: "🍋", name: "lemon" },
    { picture: "🫐", name: "blueberries" }
  ] },

  { name: "Vegetables", picture: "🥦", things: [
    { picture: "🥕", name: "carrot" },
    { picture: "🥦", name: "broccoli" },
    { picture: "🌽", name: "corn" },
    { picture: "🍅", name: "tomato" },
    { picture: "🥔", name: "potato" },
    { picture: "🍄", name: "mushroom" },
    { picture: "🫑", name: "pepper" },
    { picture: "🥒", name: "cucumber" },
    { picture: "🧅", name: "onion" },
    { picture: "🥬", name: "lettuce" },
    { picture: "🥑", name: "avocado" },
    { picture: "🧄", name: "garlic" }
  ] },

  { name: "Meat and fish", picture: "🥩", things: [
    { picture: "🍗", name: "chicken" },
    { picture: "🥩", name: "steak" },
    { picture: "🥓", name: "bacon" },
    { picture: "🌭", name: "sausage" },
    { picture: "🐟", name: "fish" },
    { picture: "🍤", name: "shrimp" },
    { picture: "🥚", name: "egg" },
    { picture: "🧆", name: "falafel" }
  ] },

  { name: "Milk and cheese", picture: "🧀", things: [
    { picture: "🧀", name: "cheese" },
    { picture: "🥛", name: "milk" },
    { picture: "🧈", name: "butter" },
    { picture: "🍦", name: "ice cream" },
    { picture: "🍨", name: "yogurt" }
  ] },

  { name: "Bread and pasta", picture: "🍞", things: [
    { picture: "🍞", name: "bread" },
    { picture: "🥖", name: "baguette" },
    { picture: "🥐", name: "croissant" },
    { picture: "🥯", name: "bagel" },
    { picture: "🥨", name: "pretzel" },
    { picture: "🥞", name: "pancakes" },
    { picture: "🧇", name: "waffle" },
    { picture: "🍚", name: "rice" },
    { picture: "🍜", name: "noodles" },
    { picture: "🍝", name: "pasta" },
    { picture: "🥟", name: "dumpling" },
    { picture: "🫓", name: "tortilla" }
  ] },

  { name: "Sweet things", picture: "🍫", things: [
    { picture: "🍫", name: "chocolate" },
    { picture: "🍬", name: "candy" },
    { picture: "🍭", name: "lollipop" },
    { picture: "🍪", name: "cookie" },
    { picture: "🧁", name: "cupcake" },
    { picture: "🍩", name: "doughnut" },
    { picture: "🍯", name: "honey" },
    { picture: "🍰", name: "cream cake" }
  ] },

  { name: "Sprinkles and sauces", picture: "🧂", things: [
    { picture: "🧂", name: "salt" },
    { picture: "🌶️", name: "chilli" },
    { picture: "🌿", name: "herbs" },
    { picture: "🫒", name: "olives" },
    { picture: "🥜", name: "peanuts" },
    { picture: "🧄", name: "garlic sauce" }
  ] },

  { name: "Drinks", picture: "🧃", things: [
    { picture: "🧃", name: "juice" },
    { picture: "🥤", name: "milkshake" },
    { picture: "🍵", name: "tea" },
    { picture: "☕", name: "hot chocolate" },
    { picture: "💧", name: "water" }
  ] }
];

// ---------- WHAT THEY CAN ASK FOR ----------
var DISHES = [
  { picture: "🍰", name: "CAKE" },
  { picture: "🍲", name: "SOUP" },
  { picture: "🥪", name: "SANDWICH" },
  { picture: "🥗", name: "SALAD" },
  { picture: "🍕", name: "PIZZA" },
  { picture: "🥧", name: "PIE" },
  { picture: "🍜", name: "BIG BOWL OF NOODLES" },
  { picture: "🥤", name: "SMOOTHIE" },
  { picture: "🍔", name: "BURGER" },
  { picture: "🌮", name: "TACO" },
  { picture: "🥟", name: "PLATE OF DUMPLINGS" },
  { picture: "🍨", name: "SUNDAE" }
];

var CUSTOMERS = ["🧑", "👩", "👨", "👵", "👴",
                 "👧", "👦", "🧑‍🦰", "👩‍🦱",
                 "🤖", "👽", "🦸"];

// ---------- SETTINGS - change these! ----------
var FEWEST_THINGS_ORDERED = 2;
var MOST_THINGS_ORDERED = 4;
var HOW_LONG_IT_BAKES = 4000;          // milliseconds in the oven
var HOW_MANY_FIT_IN_THE_BOX = 12;
// ----------------------------------------------

var customerFace = document.getElementById("customer-face");
var orderText = document.getElementById("order");
var nextCustomerButton = document.getElementById("next-customer");

var whatToCookButton = document.getElementById("what-to-cook");
var cupboard = document.getElementById("cupboard");
var cupboardTitle = document.getElementById("cupboard-title");
var shelvesBox = document.getElementById("shelves");
var ingredientsBox = document.getElementById("ingredients");
var backToShelvesButton = document.getElementById("back-to-shelves");

var bowlBox = document.getElementById("bowl");
var bowlMessage = document.getElementById("bowl-message");
var cookButton = document.getElementById("cook-button");
var emptyBowlButton = document.getElementById("empty-bowl");

var ovenDoor = document.getElementById("oven-door");
var bakeBar = document.getElementById("bake-bar");
var ovenMessage = document.getElementById("oven-message");
var plate = document.getElementById("plate");
var plateDish = document.getElementById("plate-dish");
var plateBits = document.getElementById("plate-bits");
var serveButton = document.getElementById("serve-button");

var scoreLine = document.getElementById("score");
var boxBox = document.getElementById("box");
var boxMessage = document.getElementById("box-message");

var order = [];                  // what the customer asked for
var dish = DISHES[0];            // and what kind of food it is
var inTheBowl = [];              // what you have put in
var cooking = false;
var cookedFood = null;           // what came out of the oven

var served = 0;
var perfect = 0;
var best = 0;

try { best = Number(localStorage.getItem("jack-restaurant-best")) || 0; }
catch (whoops) { best = 0; }

// ---------- The customer ----------

// Mix up a list without changing the original.
function shuffled(list) {
  var copy = list.slice();
  for (var i = copy.length - 1; i > 0; i--) {
    var swapWith = Math.floor(Math.random() * (i + 1));
    var keep = copy[i];
    copy[i] = copy[swapWith];
    copy[swapWith] = keep;
  }
  return copy;
}

// Everything in the whole kitchen, all on one list.
function everything() {
  var all = [];
  SHELVES.forEach(function (shelf) {
    shelf.things.forEach(function (thing) { all.push(thing); });
  });
  return all;
}

function newCustomer() {
  var howMany = FEWEST_THINGS_ORDERED +
                Math.floor(Math.random() * (MOST_THINGS_ORDERED - FEWEST_THINGS_ORDERED + 1));

  order = shuffled(everything()).slice(0, howMany);
  dish = DISHES[Math.floor(Math.random() * DISHES.length)];

  customerFace.textContent = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
  orderText.textContent = "Hello! Can I have a " + dish.picture + " " + dish.name +
                          " with " + listOut(order) + ", please?";

  emptyTheBowl();
  showScore();
}

// "🍓 strawberry, 🍌 banana and 🍫 chocolate"
function listOut(things) {
  var words = things.map(function (thing) {
    return thing.picture + " " + thing.name;
  });
  if (words.length === 1) return words[0];
  return words.slice(0, -1).join(", ") + " and " + words[words.length - 1];
}

// ---------- All the cooking stuff ----------

whatToCookButton.addEventListener("click", function () {
  cupboard.hidden = !cupboard.hidden;
  whatToCookButton.textContent = cupboard.hidden
    ? "👨‍🍳 What do you want to cook?"
    : "✖️ Shut the cupboard";
  if (!cupboard.hidden) showTheShelves();
});

// The kinds of food: fruits, vegetables, meat and the rest.
function showTheShelves() {
  shelvesBox.hidden = false;
  ingredientsBox.hidden = true;
  backToShelvesButton.hidden = true;
  cupboardTitle.textContent = "Pick a kind of food:";
}

// Everything on one shelf - the whole list of fruits, say.
function showTheShelf(shelf) {
  shelvesBox.hidden = true;
  ingredientsBox.hidden = false;
  backToShelvesButton.hidden = false;
  cupboardTitle.textContent = shelf.picture + " " + shelf.name +
                              " - tap one to put it in the bowl:";

  ingredientsBox.innerHTML = "";
  shelf.things.forEach(function (thing) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "picker-button";
    button.textContent = thing.picture + " " + thing.name;
    button.addEventListener("click", function () { putInTheBowl(thing); });
    ingredientsBox.appendChild(button);
  });
}

SHELVES.forEach(function (shelf) {
  var button = document.createElement("button");
  button.type = "button";
  button.className = "picker-button shelf-button";
  button.textContent = shelf.picture + " " + shelf.name;
  button.addEventListener("click", function () { showTheShelf(shelf); });
  shelvesBox.appendChild(button);
});

backToShelvesButton.addEventListener("click", showTheShelves);

// ---------- The mixing bowl ----------

function putInTheBowl(thing) {
  if (cooking) return;
  inTheBowl.push(thing);
  cookedFood = null;
  serveButton.hidden = true;
  showTheBowl();
}

function takeOutOfTheBowl(where) {
  if (cooking) return;
  inTheBowl.splice(where, 1);
  cookedFood = null;
  serveButton.hidden = true;
  showTheBowl();
}

function emptyTheBowl() {
  inTheBowl = [];
  cookedFood = null;
  serveButton.hidden = true;
  plateDish.textContent = "";
  plateBits.innerHTML = "";
  bakeBar.style.transition = "none";
  bakeBar.style.width = "0%";
  ovenMessage.textContent = "Nothing is cooking yet.";
  showTheBowl();
}

function showTheBowl() {
  bowlBox.innerHTML = "";

  inTheBowl.forEach(function (thing, where) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "bowl-thing";
    button.textContent = thing.picture;
    button.title = "Take the " + thing.name + " out again";
    button.setAttribute("aria-label", "Take the " + thing.name + " out again");
    button.addEventListener("click", function () { takeOutOfTheBowl(where); });
    bowlBox.appendChild(button);
  });

  bowlMessage.textContent = inTheBowl.length === 0
    ? "The bowl is empty. Put some ingredients in!"
    : "In the bowl: " + listOut(inTheBowl) + ". Tap one to take it out.";
}

emptyBowlButton.addEventListener("click", function () {
  if (cooking) return;
  emptyTheBowl();
});

// ---------- The oven ----------

cookButton.addEventListener("click", function () {
  if (cooking) return;

  if (inTheBowl.length === 0) {
    ovenMessage.textContent = "The bowl is empty! Put something in it first.";
    return;
  }

  cooking = true;
  cookedFood = null;
  serveButton.hidden = true;
  ovenDoor.classList.add("shut");
  ovenMessage.textContent = "Cooking... 🔥";

  bakeBar.style.transition = "none";
  bakeBar.style.width = "0%";
  // Let the browser notice the 0% before starting to fill it up.
  requestAnimationFrame(function () {
    bakeBar.style.transition = "width " + HOW_LONG_IT_BAKES + "ms linear";
    bakeBar.style.width = "100%";
  });

  setTimeout(comeOutOfTheOven, HOW_LONG_IT_BAKES);
});

function comeOutOfTheOven() {
  cooking = false;
  ovenDoor.classList.remove("shut");
  ding();

  cookedFood = { dish: dish, bits: inTheBowl.slice() };

  plateDish.textContent = dish.picture;
  plateBits.innerHTML = "";
  inTheBowl.forEach(function (thing) {
    var bit = document.createElement("span");
    bit.className = "plate-bit";
    bit.textContent = thing.picture;
    plateBits.appendChild(bit);
  });

  ovenMessage.textContent = "DING! Your " + dish.name.toLowerCase() + " is ready 🍽️";
  serveButton.hidden = false;
}

// The oven bell, made out of two beeps.
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
    // Some browsers will not make a noise. The food is still cooked.
  }
}

// ---------- Giving it to the customer ----------

serveButton.addEventListener("click", function () {
  if (!cookedFood || cooking) return;

  var cookedNames = cookedFood.bits.map(function (thing) { return thing.name; });

  var missing = order.filter(function (wanted) {
    return cookedNames.indexOf(wanted.name) === -1;
  });
  var extras = cookedFood.bits.filter(function (thing) {
    return !order.some(function (wanted) { return wanted.name === thing.name; });
  });

  served++;

  if (missing.length === 0 && extras.length === 0) {
    perfect++;
    customerFace.textContent = "😍";
    orderText.textContent = "PERFECT! That is exactly what I wanted. Thank you!";
  } else if (missing.length === 0) {
    customerFace.textContent = "😋";
    orderText.textContent = "Yummy! I did not ask for " + listOut(extras) +
                            ", but I liked it anyway!";
  } else if (missing.length === order.length) {
    customerFace.textContent = "🤔";
    orderText.textContent = "That is not what I asked for... but I will try it!";
  } else {
    customerFace.textContent = "🙂";
    orderText.textContent = "Thank you! Where is my " + listOut(missing) + " though?";
  }

  if (perfect > best) {
    best = perfect;
    try { localStorage.setItem("jack-restaurant-best", best); } catch (whoops) {}
  }

  keepInMyBox(cookedFood);
  if (typeof giveAStar === "function") giveAStar();   // a star for serving a customer

  serveButton.hidden = true;
  cookedFood = null;
  inTheBowl = [];
  showTheBowl();
  showScore();

  // The next customer sits down after a moment.
  setTimeout(newCustomer, 3200);
}, false);

function showScore() {
  scoreLine.textContent = "Served " + served + " · Perfect " + perfect + " · Best " + best;
}

// ---------- My Restaurant Box ----------
// Everything you cook is kept in this browser, on this device. It is not
// sent anywhere and it does not go on the website.

var restaurantBox = [];

function loadBox() {
  try { restaurantBox = JSON.parse(localStorage.getItem("jack-restaurant-box")) || []; }
  catch (whoops) { restaurantBox = []; }
}

function saveBox() {
  try {
    localStorage.setItem("jack-restaurant-box", JSON.stringify(restaurantBox));
    return true;
  } catch (whoops) {
    return false;
  }
}

function keepInMyBox(food) {
  if (restaurantBox.length >= HOW_MANY_FIT_IN_THE_BOX) restaurantBox.shift();   // the oldest one goes

  restaurantBox.push({
    dish: food.dish.picture + " " + food.dish.name.toLowerCase(),
    pictures: food.bits.map(function (thing) { return thing.picture; })
  });

  if (saveBox()) showBox();
  else restaurantBox.pop();
}

function showBox() {
  boxBox.innerHTML = "";

  if (restaurantBox.length === 0) {
    boxMessage.textContent = "Nothing in here yet. Cook something for a customer!";
    return;
  }

  boxMessage.textContent = "You have cooked " + restaurantBox.length + " thing" +
                           (restaurantBox.length === 1 ? "" : "s") + ".";

  restaurantBox.slice().reverse().forEach(function (food) {
    var frame = document.createElement("div");
    frame.className = "kept-food";

    var what = document.createElement("div");
    what.className = "kept-name";
    what.textContent = food.dish;

    var bits = document.createElement("div");
    bits.className = "kept-bits";
    bits.textContent = food.pictures.join(" ");

    frame.appendChild(what);
    frame.appendChild(bits);
    boxBox.appendChild(frame);
  });
}

// ---------- Open the restaurant ----------

loadBox();
showBox();
showTheShelves();
newCustomer();
