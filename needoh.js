// ============================================================
// NEE-DOH FACTORY
// Nee-Dohs are the slow squishy ones. Squeeze one and it
// squashes right down, then creeps slowly back into shape.
// You can stretch them sideways too, and turn the lights off
// to see the glow in the dark one.
// ============================================================

// ---------- ALL THE NEE-DOHS - add your own! ----------
// A name, the color of the goo inside, and what shape it is.
var NEEDOHS = [
  { name: "nice cube",            goo: "#5bc8e8", shape: "cube" },
  { name: "gumdrop",              goo: "#ff6fa5", shape: "drop" },
  { name: "glow in the dark cube", goo: "#9ef08a", shape: "cube", glows: true },
  { name: "strawberry",           goo: "#e63946", shape: "berry" },
  { name: "nice ice",             goo: "#dff4ff", shape: "cube", icy: true },
  { name: "baby ball",            goo: "#f9a03f", shape: "ball" }
];

// ---------- SETTINGS - change these! ----------
var HOW_LONG_TO_FILL = 2600;     // milliseconds filling it up in the machine
var SQUEEZES_TO_TEST = 3;        // squeezes before you can keep it
var HOW_FAR_IT_STRETCHES = 2.3;  // the most it will stretch sideways
var HOW_MANY_FIT_ON_THE_SHELF = 12;
// ----------------------------------------------

var pickerBox = document.getElementById("needoh-picker");
var machine = document.getElementById("machine");
var gooFall = document.getElementById("goo");
var fillButton = document.getElementById("fill-button");
var machineMessage = document.getElementById("machine-message");

var room = document.getElementById("room");
var blob = document.getElementById("needoh");
var blobName = document.getElementById("needoh-name");
var squeezeCount = document.getElementById("squeeze-count");
var squeezeHelp = document.getElementById("squeeze-help");
var lightsButton = document.getElementById("lights-button");
var keepButton = document.getElementById("keep-button");

var shelfBox = document.getElementById("shelf");
var shelfMessage = document.getElementById("shelf-message");

var chosen = NEEDOHS[0];
var made = null;
var squeezes = 0;
var filling = false;
var squeezedAltogether = 0;

var holdingIt = false;
var heldAt = 0;                  // where your finger started, for stretching
var stretchedTo = 1;             // how wide you pulled it

try { squeezedAltogether = Number(localStorage.getItem("jack-needoh-squeezes")) || 0; }
catch (whoops) { squeezedAltogether = 0; }

// ---------- Picking one ----------

NEEDOHS.forEach(function (needoh, position) {
  var button = document.createElement("button");
  button.type = "button";
  button.className = "picker-button";
  button.textContent = needoh.name;
  if (position === 0) button.classList.add("chosen");

  button.addEventListener("click", function () {
    if (filling) return;
    chosen = needoh;

    var all = pickerBox.querySelectorAll("button");
    for (var i = 0; i < all.length; i++) all[i].classList.remove("chosen");
    button.classList.add("chosen");

    machineMessage.textContent = "A " + needoh.name +
                                 "! Press FILL IT UP to squirt the goo in.";
  });

  pickerBox.appendChild(button);
});

// ---------- Making one ----------

fillButton.addEventListener("click", function () {
  if (filling) return;

  filling = true;
  made = null;
  squeezes = 0;
  keepButton.hidden = true;
  blob.hidden = true;

  gooFall.style.background = chosen.goo;
  gooFall.hidden = false;
  gooFall.classList.remove("pouring");
  void gooFall.offsetWidth;                 // makes the animation start again
  gooFall.classList.add("pouring");

  machine.classList.add("working");
  machineMessage.textContent = "Squirting the goo into the " + chosen.name + "... 🏭";

  setTimeout(itIsFull, HOW_LONG_TO_FILL);
});

function itIsFull() {
  filling = false;
  machine.classList.remove("working");
  gooFall.hidden = true;
  pop();

  made = chosen;
  squeezes = 0;

  blob.hidden = false;
  blob.className = "needoh " + made.shape +
                   (made.glows ? " glows" : "") +
                   (made.icy ? " icy" : "");
  blob.style.backgroundColor = made.goo;
  blobName.textContent = "Your " + made.name;

  machineMessage.textContent = "POP! One " + made.name + " ✨ Now squeeze it!";
  keepButton.hidden = true;
  showSqueezes();

  if (typeof giveAStar === "function") giveAStar();   // a star for making one
}

// ---------- SQUEEZING AND STRETCHING ----------

function squeezeIt(fromX) {
  if (!made) return;
  holdingIt = true;
  heldAt = fromX;
  stretchedTo = 1;
  blob.classList.add("squeezed");
  squelch();
}

// Keep holding and drag sideways, and it stretches out.
function stretchIt(toX) {
  if (!holdingIt || !made) return;

  var pulled = Math.abs(toX - heldAt);
  stretchedTo = Math.min(HOW_FAR_IT_STRETCHES, 1 + pulled / 150);

  // Wider means thinner, the way real goo goes.
  blob.style.transform = "scale(" + (1.3 * stretchedTo) + ", " +
                         (0.56 / stretchedTo) + ")";
}

function letGo() {
  if (!holdingIt || !made) return;

  holdingIt = false;
  blob.style.transform = "";              // the slow rise takes it from here
  blob.classList.remove("squeezed");

  squeezes++;
  squeezedAltogether++;
  try { localStorage.setItem("jack-needoh-squeezes", squeezedAltogether); } catch (whoops) {}

  if (squeezes >= SQUEEZES_TO_TEST) keepButton.hidden = false;
  showSqueezes();
}

function showSqueezes() {
  squeezeCount.textContent = "Squeezes: " + squeezes +
                             " · Squeezed altogether: " + squeezedAltogether;

  if (!made) {
    squeezeHelp.textContent = "Fill one up in the machine first!";
  } else if (squeezes === 0) {
    squeezeHelp.textContent = "Hold it down to squash it — then drag sideways to STRETCH it!";
  } else if (squeezes < SQUEEZES_TO_TEST) {
    squeezeHelp.textContent = "Keep going! " + (SQUEEZES_TO_TEST - squeezes) +
                              " more squeeze" + (SQUEEZES_TO_TEST - squeezes === 1 ? "" : "s") +
                              " and you can keep it.";
  } else if (stretchedTo > 1.8) {
    squeezeHelp.textContent = "WOW, that is a long one! Keep it on your shelf ↓";
  } else {
    squeezeHelp.textContent = "It creeps back slowly, like a real Nee-Doh. Keep it ↓";
  }
}

blob.addEventListener("pointerdown", function (event) {
  blob.setPointerCapture(event.pointerId);
  squeezeIt(event.clientX);
});
blob.addEventListener("pointermove", function (event) { stretchIt(event.clientX); });
blob.addEventListener("pointerup", letGo);
blob.addEventListener("pointercancel", letGo);

// The space bar squeezes it too.
blob.addEventListener("keydown", function (event) {
  if (event.key === " " || event.key === "Enter") { event.preventDefault(); squeezeIt(0); }
});
blob.addEventListener("keyup", function (event) {
  if (event.key === " " || event.key === "Enter") letGo();
});

// ---------- The lights ----------

lightsButton.addEventListener("click", function () {
  room.classList.toggle("lights-off");

  var dark = room.classList.contains("lights-off");
  lightsButton.textContent = dark ? "💡 Lights on" : "🌙 Lights off";

  if (dark && made && made.glows) {
    machineMessage.textContent = "Look! The " + made.name + " is glowing 💚";
  }
});

// ---------- The noises ----------

// A long slow squelch, because Nee-Dohs are gooier.
function squelch() {
  try {
    var speaker = new (window.AudioContext || window.webkitAudioContext)();
    var sound = speaker.createOscillator();
    var muffler = speaker.createBiquadFilter();
    var loudness = speaker.createGain();

    sound.type = "sawtooth";
    sound.frequency.setValueAtTime(190, speaker.currentTime);
    sound.frequency.exponentialRampToValueAtTime(55, speaker.currentTime + 0.3);

    muffler.type = "lowpass";
    muffler.frequency.setValueAtTime(700, speaker.currentTime);
    muffler.frequency.exponentialRampToValueAtTime(180, speaker.currentTime + 0.3);

    loudness.gain.setValueAtTime(0.0001, speaker.currentTime);
    loudness.gain.exponentialRampToValueAtTime(0.2, speaker.currentTime + 0.03);
    loudness.gain.exponentialRampToValueAtTime(0.0001, speaker.currentTime + 0.32);

    sound.connect(muffler);
    muffler.connect(loudness);
    loudness.connect(speaker.destination);
    sound.start();
    sound.stop(speaker.currentTime + 0.34);
  } catch (whoops) {
    // Some browsers will not make a noise. It still squeezes.
  }
}

function pop() {
  try {
    var speaker = new (window.AudioContext || window.webkitAudioContext)();
    var sound = speaker.createOscillator();
    var loudness = speaker.createGain();

    sound.type = "sine";
    sound.frequency.setValueAtTime(380, speaker.currentTime);
    sound.frequency.exponentialRampToValueAtTime(1100, speaker.currentTime + 0.13);

    loudness.gain.setValueAtTime(0.0001, speaker.currentTime);
    loudness.gain.exponentialRampToValueAtTime(0.22, speaker.currentTime + 0.02);
    loudness.gain.exponentialRampToValueAtTime(0.0001, speaker.currentTime + 0.26);

    sound.connect(loudness);
    loudness.connect(speaker.destination);
    sound.start();
    sound.stop(speaker.currentTime + 0.3);
  } catch (whoops) {
    // Never mind.
  }
}

// ---------- My Nee-Doh Shelf ----------
// They are kept in this browser, on this device. Nothing is sent
// anywhere and nothing goes on the website.

var shelf = [];

function loadShelf() {
  try { shelf = JSON.parse(localStorage.getItem("jack-needoh-shelf")) || []; }
  catch (whoops) { shelf = []; }
}

function saveShelf() {
  try {
    localStorage.setItem("jack-needoh-shelf", JSON.stringify(shelf));
    return true;
  } catch (whoops) {
    return false;
  }
}

keepButton.addEventListener("click", function () {
  if (!made || squeezes < SQUEEZES_TO_TEST) return;

  if (shelf.length >= HOW_MANY_FIT_ON_THE_SHELF) {
    shelfMessage.textContent = "The shelf is full! Throw one away with 🗑️.";
    return;
  }

  shelf.push({
    name: made.name,
    goo: made.goo,
    shape: made.shape,
    glows: !!made.glows,
    icy: !!made.icy,
    squeezes: squeezes
  });

  if (saveShelf()) {
    showShelf();
    machineMessage.textContent = "Your " + made.name +
                                 " is on the shelf. Make another one!";
    made = null;
    blob.hidden = true;
    keepButton.hidden = true;
    squeezes = 0;
    showSqueezes();
  } else {
    shelf.pop();
    shelfMessage.textContent = "This browser has run out of room to keep them.";
  }
});

function showShelf() {
  shelfBox.innerHTML = "";

  if (shelf.length === 0) {
    shelfMessage.textContent = "Nothing on the shelf yet. Make one and keep it!";
    return;
  }

  shelfMessage.textContent = "You have made " + shelf.length + " Nee-Doh" +
                             (shelf.length === 1 ? "" : "s") + ".";

  shelf.forEach(function (one, position) {
    var holder = document.createElement("div");
    holder.className = "kept-squishy";

    var mini = document.createElement("button");
    mini.type = "button";
    mini.className = "mini-needoh " + one.shape +
                     (one.glows ? " glows" : "") + (one.icy ? " icy" : "");
    mini.style.backgroundColor = one.goo;
    mini.title = "Squeeze the " + one.name;
    mini.setAttribute("aria-label", "Squeeze the " + one.name);

    // The ones on the shelf can be squeezed as well.
    mini.addEventListener("pointerdown", function () {
      mini.classList.add("squeezed");
      squelch();
    });
    var comeBack = function () {
      if (!mini.classList.contains("squeezed")) return;
      mini.classList.remove("squeezed");
      one.squeezes++;
      squeezedAltogether++;
      try { localStorage.setItem("jack-needoh-squeezes", squeezedAltogether); } catch (whoops) {}
      saveShelf();
      howMany.textContent = one.squeezes + " squeezes";
      showSqueezes();
    };
    mini.addEventListener("pointerup", comeBack);
    mini.addEventListener("pointerleave", comeBack);

    var what = document.createElement("div");
    what.className = "kept-name";
    what.textContent = one.name;

    var howMany = document.createElement("div");
    howMany.className = "kept-bits";
    howMany.textContent = one.squeezes + " squeezes";

    var bin = document.createElement("button");
    bin.type = "button";
    bin.className = "album-button";
    bin.textContent = "🗑️";
    bin.title = "Throw this one away";
    bin.addEventListener("click", function () {
      shelf.splice(position, 1);
      saveShelf();
      showShelf();
    });

    holder.appendChild(mini);
    holder.appendChild(what);
    holder.appendChild(howMany);
    holder.appendChild(bin);
    shelfBox.appendChild(holder);
  });
}

// ---------- Open the factory ----------

loadShelf();
showShelf();
showSqueezes();
