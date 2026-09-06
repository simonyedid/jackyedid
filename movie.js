// ============================================================
// MOVIE MAKER
// Pick a star, a place, what happens and an ending.
// Press ACTION and your movie plays on the screen.
// ============================================================

// ---------- YOUR MOVIE BITS - add your own! ----------
// Copy any line, change the picture and the words, and a new
// button turns up on the page all by itself.

var HEROES = [
  { picture: "🦖", name: "a dinosaur" },
  { picture: "🤖", name: "a robot" },
  { picture: "🦸", name: "a superhero" },
  { picture: "🐱", name: "a cat" },
  { picture: "🦈", name: "a shark" },
  { picture: "🐉", name: "a dragon" },
  { picture: "👽", name: "an alien" },
  { picture: "🕵️", name: "a detective" }
];

var PLACES = [
  { picture: "🌋", name: "a volcano", sky: "#7a2e12" },
  { picture: "🌌", name: "outer space", sky: "#10142e" },
  { picture: "🏰", name: "an old castle", sky: "#3d3357" },
  { picture: "🌴", name: "a jungle", sky: "#14472a" },
  { picture: "🏙️", name: "the big city", sky: "#1d2b45" },
  { picture: "🌊", name: "under the sea", sky: "#0b3f5c" }
];

var ACTIONS = [
  { picture: "💥", name: "everything blows up", move: "shake" },
  { picture: "🏃", name: "a giant chase begins", move: "zoom" },
  { picture: "💃", name: "a huge dance party starts", move: "spin" },
  { picture: "💎", name: "the treasure is found", move: "zoom" },
  { picture: "🛸", name: "a spaceship lands", move: "slide" },
  { picture: "🍕", name: "the pizza goes missing", move: "shake" }
];

var ENDINGS = [
  { picture: "🏆", name: "and everybody wins!", move: "zoom" },
  { picture: "😂", name: "and it was all a joke!", move: "spin" },
  { picture: "😱", name: "but something is still out there...", move: "shake" },
  { picture: "🌅", name: "and they all go home happy.", move: "slide" },
  { picture: "🎬", name: "TO BE CONTINUED...", move: "zoom" }
];

var HOW_LONG_EACH_SCENE = 2600;   // milliseconds each scene stays up
// -----------------------------------------------------

var screen = document.getElementById("screen");
var star = document.getElementById("star");
var caption = document.getElementById("caption");
var titleBox = document.getElementById("title-box");
var actionButton = document.getElementById("action-button");
var againButton = document.getElementById("again-button");

// Whatever is picked right now. The first of each is picked to begin with.
var chosen = { hero: HEROES[0], place: PLACES[0], action: ACTIONS[0], ending: ENDINGS[0] };

var timers = [];       // so a new movie can cancel the old one

// ---------- Building the picker buttons ----------

function buildPicker(boxId, list, whichOne) {
  var box = document.getElementById(boxId);
  list.forEach(function (thing, position) {
    var button = document.createElement("button");
    button.className = "picker-button";
    button.textContent = thing.picture + " " + thing.name;
    if (position === 0) button.classList.add("chosen");

    button.addEventListener("click", function () {
      chosen[whichOne] = thing;
      var all = box.querySelectorAll("button");
      for (var i = 0; i < all.length; i++) all[i].classList.remove("chosen");
      button.classList.add("chosen");
    });
    box.appendChild(button);
  });
}

buildPicker("hero-picker", HEROES, "hero");
buildPicker("place-picker", PLACES, "place");
buildPicker("action-picker", ACTIONS, "action");
buildPicker("ending-picker", ENDINGS, "ending");

// ---------- Showing one scene ----------

function showScene(scene) {
  screen.style.background = scene.sky || "#0d0d12";
  star.textContent = scene.picture;
  caption.textContent = scene.words;

  // Restarting the animation needs the old one taken off first.
  star.className = "movie-star";
  void star.offsetWidth;
  star.classList.add("move-" + (scene.move || "zoom"));
}

// ---------- Playing the whole movie ----------

function playMovie() {
  stopEverything();
  actionButton.hidden = true;
  againButton.hidden = true;

  var movieTitle = titleBox.value.trim() || "My Movie";

  // Every scene of the film, in order.
  var scenes = [
    { picture: "🎬", words: movieTitle, sky: "#000000", move: "zoom" },
    { picture: chosen.hero.picture, words: "Starring " + chosen.hero.name + "...", sky: "#0d0d12", move: "slide" },
    { picture: chosen.place.picture, words: "...in " + chosen.place.name + ".", sky: chosen.place.sky, move: "zoom" },
    { picture: chosen.action.picture, words: "Suddenly, " + chosen.action.name + "!", sky: chosen.place.sky, move: chosen.action.move },
    { picture: chosen.ending.picture, words: chosen.ending.name, sky: chosen.place.sky, move: chosen.ending.move },
    { picture: "🍿", words: "THE END", sky: "#000000", move: "zoom" },
    { picture: "📽️", words: "Directed by Jack Yedid", sky: "#000000", move: "slide" }
  ];

  scenes.forEach(function (scene, position) {
    timers.push(setTimeout(function () {
      showScene(scene);
    }, position * HOW_LONG_EACH_SCENE));
  });

  // When the credits have rolled, offer another go.
  timers.push(setTimeout(function () {
    againButton.hidden = false;
  }, scenes.length * HOW_LONG_EACH_SCENE));
}

function stopEverything() {
  for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
  timers = [];
}

actionButton.addEventListener("click", playMovie);

againButton.addEventListener("click", function () {
  stopEverything();
  againButton.hidden = true;
  actionButton.hidden = false;
  screen.style.background = "#0d0d12";
  star.className = "movie-star";
  star.textContent = "🎬";
  caption.textContent = "Pick your story and press ACTION!";
});
