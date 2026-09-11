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
var HOW_LOUD = 0.16;         // 0 is silent, 1 is as loud as it goes
// ----------------------------------------------

// ============================================================
// THE MUSIC
// There is no music file. The computer plays the notes itself,
// the same way the pizza oven makes its ding.
// ============================================================

// How many wobbles a second each note is.
var NOTES = {
  "C3": 130.8, "G3": 196.0,
  "C4": 261.6, "E4": 329.6, "G4": 392.0, "A4": 440.0, "B4": 493.9,
  "C5": 523.3, "D5": 587.3, "E5": 659.3, "F5": 698.5, "G5": 784.0,
  "A5": 880.0, "C6": 1046.5
};

var speaker = null;

function playNote(name, startAt, howLong, loudness, shape) {
  var note = speaker.createOscillator();
  var volume = speaker.createGain();
  note.type = shape || "triangle";
  note.frequency.value = NOTES[name] || name;   // a name, or just a number
  note.connect(volume);
  volume.connect(speaker.destination);

  // Fade every note in and out so it does not click.
  volume.gain.setValueAtTime(0.0001, startAt);
  volume.gain.exponentialRampToValueAtTime(loudness, startAt + 0.03);
  volume.gain.exponentialRampToValueAtTime(0.0001, startAt + howLong);

  note.start(startAt);
  note.stop(startAt + howLong + 0.05);
}

function playOpeningMusic() {
  var now = speaker.currentTime + 0.05;

  // 1. A low hum under the projector, like a cinema waking up.
  playNote("C3", now, 1.6, HOW_LOUD * 0.5, "sine");
  playNote("G3", now + 0.3, 1.3, HOW_LOUD * 0.35, "sine");

  // 2. The big fanfare, landing exactly when the letters appear.
  var fanfareStarts = now + 1.35;
  [["G4", 0, 0.22], ["C5", 0.2, 0.22], ["E5", 0.4, 0.22], ["G5", 0.6, 1.1]]
    .forEach(function (step) {
      playNote(step[0], fanfareStarts + step[1], step[2], HOW_LOUD, "sawtooth");
    });

  // A big chord underneath it, so it sounds like a whole band.
  ["C4", "E4", "G4", "C5"].forEach(function (name) {
    playNote(name, fanfareStarts + 0.6, 1.2, HOW_LOUD * 0.45, "triangle");
  });

  // 3. A beep on each number of the countdown, like a real film reel.
  var beepStarts = now + (PROJECTOR_PART / 1000);
  playNote(1000, beepStarts, 0.12, HOW_LOUD * 0.8, "square");
  playNote(1000, beepStarts + (EACH_NUMBER / 1000), 0.12, HOW_LOUD * 0.8, "square");
  playNote(1000, beepStarts + (EACH_NUMBER / 1000) * 2, 0.12, HOW_LOUD * 0.8, "square");
  // The last one is higher, so you know the film is starting.
  playNote(2000, beepStarts + (EACH_NUMBER / 1000) * 3, 0.3, HOW_LOUD * 0.8, "square");
}

// Browsers will not make a noise until somebody has clicked something,
// so if the music is blocked we put a button up instead of failing.
function startTheMusic() {
  try {
    speaker = new (window.AudioContext || window.webkitAudioContext)();
    if (speaker.state === "suspended") return false;
    playOpeningMusic();
    return true;
  } catch (whoops) {
    return false;
  }
}

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

  // Stop the music too, or a skipped film keeps playing its fanfare.
  // A short wait first, so the very last beep is still heard.
  if (speaker) {
    var stopThis = speaker;
    speaker = null;
    setTimeout(function () {
      try { stopThis.close(); } catch (whoops) {}
    }, 450);
  }

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

  if (!startTheMusic()) {
    // No sound allowed yet. Offer a button that turns it on and
    // starts the film again from the beginning.
    var soundButton = document.createElement("button");
    soundButton.className = "skip sound-on";
    soundButton.textContent = "🔊 Sound on";
    soundButton.addEventListener("click", function (event) {
      event.stopPropagation();          // turning sound on must not skip
      soundButton.remove();
      if (speaker && speaker.state === "suspended") speaker.resume();
      playOpeningMusic();
    });
    intro.appendChild(soundButton);
  }

  // When the projector and the letters are done, the countdown starts.
  timers.push(setTimeout(function () {
    scene.hidden = true;
    leader.hidden = false;
    countDown(COUNT_FROM);
  }, PROJECTOR_PART));
}
