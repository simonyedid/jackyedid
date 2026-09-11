// ============================================================
// THE OPENING BIT
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

if (wantsLessMoving) {
  intro.remove();
} else {
  scene.classList.add("rolling");

  // When the projector and the letters are done, the countdown starts.
  timers.push(setTimeout(function () {
    scene.hidden = true;
    leader.hidden = false;
    countDown(COUNT_FROM);
  }, PROJECTOR_PART));
}
