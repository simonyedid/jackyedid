// ============================================================
// THE OPENING BIT
// No music: Jack asked for the film to be silent.
//
// Three parts, in this order:
//   1. the projector comes on, on its own
//   2. the letters come up and the projector goes away
//   3. a 3, 2, 1 film countdown runs you into the website
//
// The pictures and the moving are all done in style.css -
// this file just waits, and gets out of the way at the end.
// ============================================================

// ---------- SETTINGS - change these! ----------
var PROJECTOR_PART = 3400;   // milliseconds of projector and letters
var COUNT_FROM = 3;          // the countdown at the end: 3, 2, 1
var EACH_NUMBER = 700;       // milliseconds each number stays up
// ----------------------------------------------

var welcome = document.getElementById("welcome");
var welcomeLine = document.getElementById("welcome-line");
var welcomeButtons = document.getElementById("welcome-buttons");
var helloForm = document.getElementById("hello-form");
var yourName = document.getElementById("your-name");
var yourAge = document.getElementById("your-age");
var helloBack = document.getElementById("hello-back");
var scanButton = document.getElementById("scan-in");
var scanner = document.getElementById("scanner");
var camera = document.getElementById("camera");
var scanWords = document.getElementById("scan-words");
var scanStop = document.getElementById("scan-stop");
var intro = document.getElementById("intro");
var scene = document.getElementById("projector-scene");
var leader = document.getElementById("leader");
var skipButton = document.getElementById("skip");

var timers = [];
var finished = false;

// Some people ask their computer for less movement. Give them the
// website straight away instead of a film.
var wantsLessMoving = window.matchMedia &&
                      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function theEnd() {
  if (finished) return;
  finished = true;

  timers.forEach(clearTimeout);
  intro.classList.add("going");

  // Take it off the page once it has faded, so it cannot be clicked.
  setTimeout(function () { intro.remove(); }, 700);
}

skipButton.addEventListener("click", theEnd);
intro.addEventListener("click", theEnd);
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" || event.key === " ") theEnd();
});

// ---------- The countdown at the end ----------

function countDown(number) {
  if (number === 0) {
    theEnd();
    return;
  }
  leader.textContent = number;
  // Taking the class off and putting it back makes the wipe run again.
  leader.classList.remove("ticking");
  void leader.offsetWidth;
  leader.classList.add("ticking");
  timers.push(setTimeout(function () { countDown(number - 1); }, EACH_NUMBER));
}

function rollTheFilm() {
  intro.hidden = false;
  scene.classList.add("rolling");

  // When the projector and the letters are done, the countdown starts.
  timers.push(setTimeout(function () {
    scene.hidden = true;
    leader.hidden = false;
    countDown(COUNT_FROM);
  }, PROJECTOR_PART));
}

// ============================================================
// WHO IS PLAYING
// The first time you come, the website asks your name and how old
// you are. It is kept in your own browser only - nothing is sent
// anywhere and nothing goes on the website.
// ============================================================

function whoIsPlaying() {
  try { return JSON.parse(localStorage.getItem("jack-who-is-playing")); }
  catch (whoops) { return null; }
}

function rememberWhoIsPlaying(name, age) {
  try {
    localStorage.setItem("jack-who-is-playing", JSON.stringify({ name: name, age: age }));
  } catch (whoops) {
    // Some browsers will not remember things. The website still works.
  }
}

// Say hello by name at the top of the page.
function sayHello() {
  var you = whoIsPlaying();
  if (!you || !you.name) return;

  helloBack.textContent = "\uD83D\uDC4B Hello " + you.name + "!" +
                          (you.age ? " You are " + you.age + "." : "");
  helloBack.hidden = false;

  if (welcomeLine) welcomeLine.textContent = "Welcome back, " + you.name + "!";
}

// A QR card opens the website with your name in the address, like
// jackyedid.com/?hello=Jack&age=7 - so scanning it logs you in.
function loginFromTheAddress() {
  var asked = new URLSearchParams(location.search);
  var name = (asked.get("hello") || "").trim().slice(0, 20);
  if (!name) return false;

  rememberWhoIsPlaying(name, (asked.get("age") || "").trim().slice(0, 3));

  // Take the name back out of the address bar, so it is tidy.
  if (history.replaceState) history.replaceState(null, "", location.pathname);
  return true;
}

var scannedIn = loginFromTheAddress();
sayHello();

// Pressing a button is also what lets the browser make noises later,
// so the film only begins once somebody has pressed one.
function intoTheWebsite() {
  welcome.remove();
  sayHello();
  if (wantsLessMoving) return;          // less movement: straight to the site
  rollTheFilm();
}

// First time here: ask who you are before the film.
document.getElementById("first-time").addEventListener("click", function () {
  welcomeButtons.hidden = true;
  helloForm.hidden = false;
  yourName.focus();
});

helloForm.addEventListener("submit", function (event) {
  event.preventDefault();
  rememberWhoIsPlaying(yourName.value.trim(), yourAge.value.trim());
  intoTheWebsite();
});

// Been here before: straight in.
document.getElementById("played-before").addEventListener("click", intoTheWebsite);

// ============================================================
// LOGGING IN WITH YOUR QR CARD
// Hold the card up to the camera. The code is read here on the
// device by the browser itself - no picture is ever sent anywhere,
// and nothing is kept.
// ============================================================

var cameraRunning = null;      // the camera, while it is on
var stillLooking = false;

function canReadCodes() {
  return typeof BarcodeDetector !== "undefined";
}

function stopTheCamera() {
  stillLooking = false;
  if (cameraRunning) {
    cameraRunning.getTracks().forEach(function (bit) { bit.stop(); });
    cameraRunning = null;
  }
  scanner.hidden = true;
  welcomeButtons.hidden = false;
}

function keepLooking(reader) {
  if (!stillLooking) return;

  reader.detect(camera).then(function (codes) {
    if (!stillLooking) return;

    for (var i = 0; i < codes.length; i++) {
      var says = codes[i].rawValue || "";
      if (says.indexOf("hello=") === -1) continue;

      // Found a card. Read the name out of it and come in.
      var name = decodeURIComponent((says.split("hello=")[1] || "").split("&")[0]);
      var age = decodeURIComponent((says.split("age=")[1] || "").split("&")[0]);
      rememberWhoIsPlaying(name.trim().slice(0, 20), age.trim().slice(0, 3));
      stopTheCamera();
      intoTheWebsite();
      return;
    }

    requestAnimationFrame(function () { keepLooking(reader); });
  }).catch(function () {
    requestAnimationFrame(function () { keepLooking(reader); });
  });
}

scanButton.addEventListener("click", function () {
  welcomeButtons.hidden = true;
  scanner.hidden = false;

  // Browsers that cannot read codes themselves: use the phone's own
  // camera app on the card instead, which works everywhere.
  if (!canReadCodes() || !navigator.mediaDevices) {
    camera.hidden = true;
    scanWords.innerHTML = "This browser cannot read codes by itself. " +
      "Point your <strong>phone's camera app</strong> at your QR card instead " +
      "\u2014 it opens the website and logs you straight in.";
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(function (pictures) {
      cameraRunning = pictures;
      camera.srcObject = pictures;
      camera.play();
      stillLooking = true;
      scanWords.textContent = "Hold your QR card up to the camera...";
      keepLooking(new BarcodeDetector({ formats: ["qr_code"] }));
    })
    .catch(function () {
      camera.hidden = true;
      scanWords.innerHTML = "No camera here. Point your <strong>phone's camera " +
        "app</strong> at your QR card instead \u2014 it logs you straight in.";
    });
});

scanStop.addEventListener("click", stopTheCamera);

// Scanned your card with the phone's own camera? Then the website
// already knows you, so it skips the questions and just goes in.
if (scannedIn) intoTheWebsite();
