// ============================================================
// THE KEYBOARD
// A keyboard drawn on the page. Tap the letters and they go
// into whatever you are writing on the sticker book page.
// The real keyboard still works too.
// ============================================================

// ---------- THE KEYS - change them if you like! ----------
// Each line is a row of keys on the keyboard.
var KEY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["CAPS", "Z", "X", "C", "V", "B", "N", "M", "RUBOUT"],
  ["MIC", "!", "?", ".", "SPACE"]
];
// ---------------------------------------------------------

var keyboard = document.getElementById("keyboard");
var writingBox = document.getElementById("page-writing");

var capitals = false;
var listener = null;       // the thing that listens to your voice
var listening = false;

// ---------- Putting a letter in ----------

function typeThis(letter) {
  // Put it wherever the cursor is, or on the end if there is no cursor.
  var where = writingBox.selectionStart;
  if (where === null || where === undefined) where = writingBox.value.length;
  var upTo = writingBox.value.slice(0, where);
  var after = writingBox.value.slice(writingBox.selectionEnd);

  writingBox.value = upTo + letter + after;
  writingBox.selectionStart = writingBox.selectionEnd = where + letter.length;

  // Tell the page it changed, so it gets saved like normal typing.
  writingBox.dispatchEvent(new Event("input", { bubbles: true }));
  writingBox.focus();
}

function rubOutOne() {
  var where = writingBox.selectionStart;
  if (where === null || where === undefined) where = writingBox.value.length;

  if (writingBox.selectionStart !== writingBox.selectionEnd) {
    // Something is picked out, so rub that out.
    writingBox.value = writingBox.value.slice(0, writingBox.selectionStart) +
                       writingBox.value.slice(writingBox.selectionEnd);
    writingBox.selectionStart = writingBox.selectionEnd = writingBox.selectionStart;
  } else if (where > 0) {
    writingBox.value = writingBox.value.slice(0, where - 1) + writingBox.value.slice(where);
    writingBox.selectionStart = writingBox.selectionEnd = where - 1;
  }

  writingBox.dispatchEvent(new Event("input", { bubbles: true }));
  writingBox.focus();
}

// ---------- Building the keyboard ----------

KEY_ROWS.forEach(function (row) {
  var keyRow = document.createElement("div");
  keyRow.className = "key-row";

  row.forEach(function (whatItSays) {
    var key = document.createElement("button");
    key.type = "button";
    key.className = "key";

    if (whatItSays === "SPACE") {
      key.classList.add("key-space");
      key.textContent = "space";
      key.addEventListener("click", function () { typeThis(" "); });

    } else if (whatItSays === "RUBOUT") {
      key.classList.add("key-wide");
      key.textContent = "⌫";
      key.title = "Rub out the last letter";
      key.addEventListener("click", rubOutOne);

    } else if (whatItSays === "MIC") {
      key.classList.add("key-wide", "key-mic");
      key.textContent = "\uD83C\uDFA4";
      key.title = "Say it out loud instead of typing";
      // Only put the microphone key there if this browser can listen.
      if (canListen()) {
        key.addEventListener("click", function () { listenToMe(key); });
      } else {
        key.disabled = true;
        key.title = "This browser cannot listen to you";
      }

    } else if (whatItSays === "CAPS") {
      key.classList.add("key-wide");
      key.textContent = "⇪";
      key.title = "Big letters";
      key.addEventListener("click", function () {
        capitals = !capitals;
        key.classList.toggle("chosen", capitals);
        showTheRightLetters();
      });

    } else {
      key.dataset.letter = whatItSays;
      key.textContent = whatItSays.toLowerCase();
      key.addEventListener("click", function () {
        typeThis(capitals ? whatItSays : whatItSays.toLowerCase());
      });
    }

    keyRow.appendChild(key);
  });

  keyboard.appendChild(keyRow);
});

// Show big or small letters on the keys, to match the CAPS key.
function showTheRightLetters() {
  var letterKeys = keyboard.querySelectorAll("[data-letter]");
  for (var i = 0; i < letterKeys.length; i++) {
    var letter = letterKeys[i].dataset.letter;
    letterKeys[i].textContent = capitals ? letter : letter.toLowerCase();
  }
}


// ============================================================
// TALKING INSTEAD OF TYPING
// Tap the microphone and say something, and the words turn up
// in your writing. This is the same thing the microphone on a
// phone keyboard does.
//
// Your voice is sent off to the browser's own listening service
// (Apple's on Safari, Google's on Chrome) to be turned into
// words. That is the only way browsers can do this.
// ============================================================

function canListen() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function listenToMe(key) {
  // Tapping it again stops it early.
  if (listening) {
    stopListening(key);
    return;
  }

  var Listener = window.SpeechRecognition || window.webkitSpeechRecognition;
  listener = new Listener();
  listener.lang = navigator.language || "en-GB";
  listener.interimResults = false;
  listener.maxAlternatives = 1;

  listener.addEventListener("result", function (event) {
    var heard = event.results[0][0].transcript;
    // Start with a space if there are already words there.
    var needsASpace = writingBox.value.length > 0 &&
                      !/\s$/.test(writingBox.value);
    typeThis((needsASpace ? " " : "") + heard);
  });

  listener.addEventListener("error", function (event) {
    stopListening(key, event.error === "not-allowed"
      ? "The microphone is not switched on for this website."
      : "I did not catch that. Try again!");
  });

  // Listening stops on its own once you stop talking. Only tidy up
  // here if nothing has gone wrong, so a problem message stays put.
  listener.addEventListener("end", function () {
    if (listening) stopListening(key);
  });

  try {
    listener.start();
    listening = true;
    key.classList.add("listening");
    say("Listening... say something! \uD83C\uDFA4");
  } catch (whoops) {
    say("The microphone would not start.");
  }
}

function stopListening(key, problem) {
  listening = false;
  key.classList.remove("listening");
  if (listener) {
    try { listener.stop(); } catch (whoops) {}
    listener = null;
  }
  say(problem || "");
}

// A line under the keyboard for the microphone to talk back on.
var micWords = document.createElement("p");
micWords.className = "mic-words";
keyboard.parentNode.insertBefore(micWords, keyboard.nextSibling);

function say(words) { micWords.textContent = words; }

if (!canListen()) {
  say("This browser cannot listen to your voice, so the \uD83C\uDFA4 key is off.");
}
