// ============================================================
// THE OPENING BIT
// Like the start of a film. A countdown, then the projector
// switches on, then it shines the name of the website.
// The pictures and the moving are all done in style.css -
// this file just counts, and gets out of the way at the end.
// ============================================================

// ---------- SETTINGS - change these! ----------
var COUNT_FROM = 3;           // the numbers at the start: 3, 2, 1
var EACH_NUMBER = 700;        // milliseconds each number stays up
var PROJECTOR_TIME = 3600;    // how long the projector part lasts
// ----------------------------------------------

var intro = document.getElementById("intro");
var leader = document.getElementById("leader");
var scene = document.getElementById("projector-scene");
var skipButton = document.getElementById("skip");

var timers = [];
var finished = false;

// Some people ask their computer for less movement. Give them the
// website straight away instead of a film.
var wantsLessMoving = window.matchMedia &&
                      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function countDown(number) {
  if (number === 0) {
    leader.hidden = true;
    scene.classList.add("rolling");
    timers.push(setTimeout(theEnd, PROJECTOR_TIME));
    return;
  }
  leader.textContent = number;
  // Taking the class off and putting it back makes the wipe run again.
  leader.classList.remove("ticking");
  void leader.offsetWidth;
  leader.classList.add("ticking");
  timers.push(setTimeout(function () { countDown(number - 1); }, EACH_NUMBER));
}

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

if (wantsLessMoving) {
  intro.remove();
} else {
  countDown(COUNT_FROM);
}
