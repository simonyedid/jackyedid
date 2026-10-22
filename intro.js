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
