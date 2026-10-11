// ============================================================
// SQUISHY FACTORY
// Pick a squishy, make it in the machine, and then SQUISH IT.
// Hold it down and it squashes. Let go and it springs back.
// ============================================================

// ---------- ALL THE SQUISHIES - add your own! ----------
// A picture, a name, and the color of the goo it is made from.
var SQUISHIES = [
  { picture: "🧀", name: "cheese",         goo: "#f7c948" },
  { picture: "🍓", name: "strawberry",     goo: "#e63946" },
  { picture: "🍇", name: "grape",          goo: "#9d4edd" },
  { picture: "🥟", name: "dumpling",       goo: "#f2e3c4" },
  { picture: "🥒", name: "pickle",         goo: "#4f9d3a" },
  { picture: "🍗", name: "fried chicken",  goo: "#d08b3a" },
  { picture: "🧊", name: "nice cube",      goo: "#6fd3e8" },
  { picture: "🍬", name: "gumdrop",        goo: "#ff6fa5" },
  { picture: "🧈", name: "butter",         goo: "#ffd978" },
  { picture: "🥕", name: "carrot",         goo: "#f77f00" },
  { picture: "🥥", name: "coconut oil",    goo: "#f3f0e6" },
  { picture: "🥜", name: "peanut",         goo: "#c08a4a" }
];

// ---------- SETTINGS - change these! ----------
var HOW_LONG_IT_TAKES = 2600;      // milliseconds in the squishy machine
var TESTS_NEEDED = 3;              // squishes to test that it really is squishy
var SUPER_SQUISHY_AT = 20;         // squishes before it goes SUPER SQUISHY
var HOW_MANY_FIT_ON_THE_SHELF = 12;
// ----------------------------------------------

var pickerBox = document.getElementById("squishy-picker");
var machine = document.getElementById("machine");
var gooFall = document.getElementById("goo");
var makeButton = document.getElementById("make-button");
var machineMessage = document.getElementById("machine-message");

var squishyBlob = document.getElementById("squishy");
var squishyFace = document.getElementById("squishy-face");
var squishyName = document.getElementById("squishy-name");
var squishCount = document.getElementById("squish-count");
var squishHelp = document.getElementById("squish-help");
var keepButton = document.getElementById("keep-button");
var squishyBox = document.getElementById("squishy-box");
var boxLid = document.getElementById("box-lid");
var boxFront = document.getElementById("box-front");

var shelfBox = document.getElementById("shelf");
var shelfMessage = document.getElementById("shelf-message");

var chosen = SQUISHIES[0];         // which one you picked
var made = null;                   // the one you have made, ready to squish
var squishes = 0;
var making = false;
var squishedAltogether = 0;

try { squishedAltogether = Number(localStorage.getItem("jack-squishes")) || 0; }
catch (whoops) { squishedAltogether = 0; }

// ---------- Picking one ----------

SQUISHIES.forEach(function (squishy, position) {
  var button = document.createElement("button");
  button.type = "button";
  button.className = "picker-button";
  button.textContent = squishy.picture + " " + squishy.name;
  if (position === 0) button.classList.add("chosen");

  button.addEventListener("click", function () {
    if (making) return;
    chosen = squishy;

    var all = pickerBox.querySelectorAll("button");
    for (var i = 0; i < all.length; i++) all[i].classList.remove("chosen");
    button.classList.add("chosen");

    machineMessage.textContent = "A " + squishy.name +
                                 " squishy! Press MAKE IT to pour the goo in.";
  });

  pickerBox.appendChild(button);
});

// ---------- Making one ----------

makeButton.addEventListener("click", function () {
  if (making) return;

  making = true;
  made = null;
  keepButton.hidden = true;
  squishyBlob.hidden = true;
  squishyBox.hidden = true;
  boxLid.classList.remove("shut");
  squishes = 0;

  // The goo pours in, in the color of whatever you picked.
  gooFall.style.background = chosen.goo;
  gooFall.hidden = false;
  gooFall.classList.remove("pouring");
  void gooFall.offsetWidth;                 // makes the animation start again
  gooFall.classList.add("pouring");

  machine.classList.add("working");
  machineMessage.textContent = "Pouring the " + chosen.name + " goo in... 🏭";

  setTimeout(itIsReady, HOW_LONG_IT_TAKES);
});

function itIsReady() {
  making = false;
  machine.classList.remove("working");
  gooFall.hidden = true;
  pop();

  made = chosen;
  squishes = 0;

  squishyBlob.hidden = false;
  squishyBlob.classList.remove("going-in");
  squishyBlob.style.background = made.goo;
  squishyBlob.classList.remove("super");
  squishyFace.textContent = made.picture;
  squishyName.textContent = "Your " + made.name + " squishy";

  machineMessage.textContent = "POP! One " + made.name +
                               " squishy ✨ Now test it!";

  // Its empty box waits next to it with the lid open.
  squishyBox.hidden = false;
  boxLid.classList.remove("shut");
  boxFront.textContent = made.name.toUpperCase();

  // You cannot box it until you have tested it.
  keepButton.hidden = true;
  showSquishes();

  if (typeof giveAStar === "function") giveAStar();   // a star for making a squishy
}

// ---------- SQUISHING IT ----------

function squishIt() {
  if (!made) return;
  squishyBlob.classList.add("squished");
  squishSound();
}

function letGo() {
  if (!made) return;
  if (!squishyBlob.classList.contains("squished")) return;

  squishyBlob.classList.remove("squished");

  // The wobble as it springs back.
  squishyBlob.classList.remove("boing");
  void squishyBlob.offsetWidth;
  squishyBlob.classList.add("boing");

  squishes++;
  squishedAltogether++;
  try { localStorage.setItem("jack-squishes", squishedAltogether); } catch (whoops) {}

  if (squishes === TESTS_NEEDED) pop();        // it passed the test!
  if (squishes >= TESTS_NEEDED) keepButton.hidden = false;

  if (squishes === SUPER_SQUISHY_AT) {
    squishyBlob.classList.add("super");
    sparkle();
  }

  showSquishes();
}

function showSquishes() {
  squishCount.textContent = "Squishes: " + squishes +
                            " · Squished altogether: " + squishedAltogether;

  if (squishes === 0) {
    squishHelp.textContent = "TEST IT! Hold it down to squash it, and let go.";
  } else if (squishes < TESTS_NEEDED) {
    squishHelp.textContent = "Testing... " + (TESTS_NEEDED - squishes) +
                             " more squish" + (TESTS_NEEDED - squishes === 1 ? "" : "es") +
                             " to check it.";
  } else if (squishes >= SUPER_SQUISHY_AT) {
    squishHelp.textContent = "✨ SUPER SQUISHY! ✨ As squishy as it can get. Box it up!";
  } else {
    squishHelp.textContent = "✅ Tested! It really is squishy. Put it in its box, " +
                             "or squish it " + (SUPER_SQUISHY_AT - squishes) +
                             " more times to make it SUPER SQUISHY.";
  }
}

// Hold it down with a finger or the mouse.
squishyBlob.addEventListener("pointerdown", function (event) {
  squishyBlob.setPointerCapture(event.pointerId);
  squishIt();
});
squishyBlob.addEventListener("pointerup", letGo);
squishyBlob.addEventListener("pointercancel", letGo);
squishyBlob.addEventListener("pointerleave", letGo);

// The space bar and enter squish it too.
squishyBlob.addEventListener("keydown", function (event) {
  if (event.key === " " || event.key === "Enter") { event.preventDefault(); squishIt(); }
});
squishyBlob.addEventListener("keyup", function (event) {
  if (event.key === " " || event.key === "Enter") letGo();
});

// ---------- The noises ----------

// A squelchy slide down, like squashing something soft.
function squishSound() {
  try {
    var speaker = new (window.AudioContext || window.webkitAudioContext)();
    var sound = speaker.createOscillator();
    var muffler = speaker.createBiquadFilter();
    var loudness = speaker.createGain();

    sound.type = "sawtooth";
    sound.frequency.setValueAtTime(260, speaker.currentTime);
    sound.frequency.exponentialRampToValueAtTime(70, speaker.currentTime + 0.18);

    muffler.type = "lowpass";
    muffler.frequency.setValueAtTime(900, speaker.currentTime);
    muffler.frequency.exponentialRampToValueAtTime(220, speaker.currentTime + 0.18);

    loudness.gain.setValueAtTime(0.0001, speaker.currentTime);
    loudness.gain.exponentialRampToValueAtTime(0.18, speaker.currentTime + 0.02);
    loudness.gain.exponentialRampToValueAtTime(0.0001, speaker.currentTime + 0.2);

    sound.connect(muffler);
    muffler.connect(loudness);
    loudness.connect(speaker.destination);
    sound.start();
    sound.stop(speaker.currentTime + 0.22);
  } catch (whoops) {
    // Some browsers will not make a noise. It still squishes.
  }
}

// The pop when a new squishy comes out of the machine.
function pop() {
  try {
    var speaker = new (window.AudioContext || window.webkitAudioContext)();
    var sound = speaker.createOscillator();
    var loudness = speaker.createGain();

    sound.type = "sine";
    sound.frequency.setValueAtTime(400, speaker.currentTime);
    sound.frequency.exponentialRampToValueAtTime(1200, speaker.currentTime + 0.12);

    loudness.gain.setValueAtTime(0.0001, speaker.currentTime);
    loudness.gain.exponentialRampToValueAtTime(0.22, speaker.currentTime + 0.02);
    loudness.gain.exponentialRampToValueAtTime(0.0001, speaker.currentTime + 0.25);

    sound.connect(loudness);
    loudness.connect(speaker.destination);
    sound.start();
    sound.stop(speaker.currentTime + 0.3);
  } catch (whoops) {
    // Never mind.
  }
}

// Little stars flying off when it goes SUPER SQUISHY.
function sparkle() {
  for (var i = 0; i < 8; i++) {
    var star = document.createElement("span");
    star.className = "squish-sparkle";
    star.textContent = "✨";
    star.style.left = (10 + Math.random() * 80) + "%";
    star.style.animationDelay = (Math.random() * 0.3) + "s";
    squishyBlob.parentNode.appendChild(star);

    // Take it away again once it has flown off.
    setTimeout(function (which) {
      return function () { if (which.parentNode) which.parentNode.removeChild(which); };
    }(star), 1600);
  }
}

// ---------- My Squishy Shelf ----------
// Your squishies are kept in this browser, on this device. They are not
// sent anywhere and they do not go on the website.

var shelf = [];

function loadShelf() {
  try { shelf = JSON.parse(localStorage.getItem("jack-squishy-shelf")) || []; }
  catch (whoops) { shelf = []; }
}

function saveShelf() {
  try {
    localStorage.setItem("jack-squishy-shelf", JSON.stringify(shelf));
    return true;
  } catch (whoops) {
    return false;
  }
}

keepButton.addEventListener("click", function () {
  if (!made) return;
  if (squishes < TESTS_NEEDED) return;        // it has to be tested first

  if (shelf.length >= HOW_MANY_FIT_ON_THE_SHELF) {
    shelfMessage.textContent = "No room for another box! Throw one away with 🗑️.";
    return;
  }

  var boxingUp = made;
  var howSquishy = squishes;

  keepButton.hidden = true;
  made = null;                                // it is on its way into the box

  // It drops in...
  squishyBlob.classList.add("going-in");
  machineMessage.textContent = "Tested and into its box it goes... 📦";

  // ...the lid comes down...
  setTimeout(function () {
    boxLid.classList.add("shut");
    squishyBlob.hidden = true;
    squishyBlob.classList.remove("going-in");
  }, 700);

  // ...and then the box goes on the shelf.
  setTimeout(function () {
    shelf.push({
      picture: boxingUp.picture,
      name: boxingUp.name,
      goo: boxingUp.goo,
      squishes: howSquishy
    });

    if (saveShelf()) {
      showShelf();
      machineMessage.textContent = "One boxed " + boxingUp.name +
                                   " squishy! Make another one.";
    } else {
      shelf.pop();
      shelfMessage.textContent = "This browser has run out of room to keep squishies.";
    }

    squishyBox.hidden = true;
    boxLid.classList.remove("shut");
    squishes = 0;
    showSquishes();
  }, 1400);
});

function showShelf() {
  shelfBox.innerHTML = "";

  if (shelf.length === 0) {
    shelfMessage.textContent = "Nothing on the shelf yet. Make a squishy and keep it!";
    return;
  }

  shelfMessage.textContent = "You have made " + shelf.length + " squish" +
                             (shelf.length === 1 ? "y" : "ies") + ".";

  shelf.forEach(function (one, position) {
    var holder = document.createElement("div");
    holder.className = "kept-squishy";

    var blob = document.createElement("button");
    blob.type = "button";
    blob.className = "mini-squishy";
    blob.style.background = one.goo;
    blob.textContent = one.picture;
    blob.title = "Squish the " + one.name;
    blob.setAttribute("aria-label", "Squish the " + one.name);

    // The ones on the shelf can be squished too.
    blob.addEventListener("pointerdown", function () {
      blob.classList.add("squished");
      squishSound();
    });
    var springBack = function () {
      if (!blob.classList.contains("squished")) return;
      blob.classList.remove("squished");
      one.squishes++;
      squishedAltogether++;
      try { localStorage.setItem("jack-squishes", squishedAltogether); } catch (whoops) {}
      saveShelf();
      howSquishy.textContent = one.squishes + " squishes";
      showSquishes();
    };
    blob.addEventListener("pointerup", springBack);
    blob.addEventListener("pointerleave", springBack);

    var what = document.createElement("div");
    what.className = "kept-name";
    what.textContent = one.name;

    var howSquishy = document.createElement("div");
    howSquishy.className = "kept-bits";
    howSquishy.textContent = one.squishes + " squishes";

    var bin = document.createElement("button");
    bin.type = "button";
    bin.className = "album-button";
    bin.textContent = "🗑️";
    bin.title = "Throw this squishy away";
    bin.addEventListener("click", function () {
      shelf.splice(position, 1);
      saveShelf();
      showShelf();
    });

    holder.appendChild(blob);
    holder.appendChild(what);
    holder.appendChild(howSquishy);
    holder.appendChild(bin);
    shelfBox.appendChild(holder);
  });
}

// ---------- Open the factory ----------

loadShelf();
showShelf();
showSquishes();
