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
  ["!", "?", ".", "SPACE"]
];
// ---------------------------------------------------------

var keyboard = document.getElementById("keyboard");
var writingBox = document.getElementById("page-writing");

var capitals = false;

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
