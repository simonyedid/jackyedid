// ============================================================
// MOVIE MAKER
// Pick a star, a place, what happens and an ending. You can also
// add your own photos and videos. Press ACTION and it all plays.
//
// Your pictures never leave this device. The browser reads them
// straight off your computer or phone — they are not uploaded
// anywhere and they do not go on the website.
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

var HOW_LONG_EACH_SCENE = 2600;   // milliseconds an emoji scene stays up
var HOW_LONG_EACH_PHOTO = 3000;   // milliseconds one of your photos stays up
var LONGEST_A_CLIP_PLAYS = 12000; // a video never holds the movie up longer
// -----------------------------------------------------

var screen = document.getElementById("screen");
var star = document.getElementById("star");
var photo = document.getElementById("photo");
var clip = document.getElementById("clip");
var caption = document.getElementById("caption");
var titleBox = document.getElementById("title-box");
var actionButton = document.getElementById("action-button");
var againButton = document.getElementById("again-button");
var mediaInput = document.getElementById("my-media");
var mediaList = document.getElementById("my-media-list");

var chosen = { hero: HEROES[0], place: PLACES[0], action: ACTIONS[0], ending: ENDINGS[0] };

var myScenes = [];     // the photos and videos you added
var scenes = [];       // the whole movie, once ACTION is pressed
var sceneNumber = 0;
var timer = null;

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

// ---------- Your own photos and videos ----------

mediaInput.addEventListener("change", function () {
  for (var i = 0; i < mediaInput.files.length; i++) {
    var file = mediaInput.files[i];
    myScenes.push({
      kind: file.type.indexOf("video") === 0 ? "video" : "photo",
      // This makes a private address for the file inside this browser only.
      address: URL.createObjectURL(file),
      words: ""
    });
  }
  mediaInput.value = "";     // so the same file can be picked again
  showMyScenes();
});

function showMyScenes() {
  mediaList.innerHTML = "";

  myScenes.forEach(function (scene, position) {
    var row = document.createElement("div");
    row.className = "my-media-row";

    var thumbnail = document.createElement(scene.kind === "video" ? "video" : "img");
    thumbnail.src = scene.address;
    thumbnail.className = "my-media-thumb";
    if (scene.kind === "video") thumbnail.muted = true;
    else thumbnail.alt = "Scene " + (position + 1) + " of your movie";

    var words = document.createElement("input");
    words.type = "text";
    words.className = "my-media-words";
    words.placeholder = "Words for this scene (you can leave it empty)";
    words.maxLength = 40;
    words.value = scene.words;
    words.addEventListener("input", function () { scene.words = words.value; });

    var remove = document.createElement("button");
    remove.className = "picker-button";
    remove.textContent = "🗑️";
    remove.title = "Take this one out";
    remove.addEventListener("click", function () {
      URL.revokeObjectURL(scene.address);
      myScenes.splice(myScenes.indexOf(scene), 1);
      showMyScenes();
    });

    row.appendChild(thumbnail);
    row.appendChild(words);
    row.appendChild(remove);
    mediaList.appendChild(row);
  });
}

// ---------- Showing one scene ----------

function showScene(scene) {
  screen.style.background = scene.sky || "#000000";
  caption.textContent = scene.words || "";

  star.hidden = scene.kind !== "emoji";
  photo.hidden = scene.kind !== "photo";
  clip.hidden = scene.kind !== "video";

  if (scene.kind === "emoji") {
    star.textContent = scene.picture;
    // Taking the old animation off and putting it back makes it run again.
    star.className = "movie-star";
    void star.offsetWidth;
    star.classList.add("move-" + (scene.move || "zoom"));
  }

  if (scene.kind === "photo") {
    photo.src = scene.address;
    photo.className = "movie-media";
    void photo.offsetWidth;
    photo.classList.add("move-zoom");
  }

  if (scene.kind === "video") {
    clip.src = scene.address;
    clip.currentTime = 0;
    clip.play();
  }
}

// ---------- Playing the whole movie ----------

function playMovie() {
  stopEverything();
  actionButton.hidden = true;
  againButton.hidden = true;

  var movieTitle = titleBox.value.trim() || "My Movie";
  var place = chosen.place;

  scenes = [
    { kind: "emoji", picture: "🎬", words: movieTitle, sky: "#000000", move: "zoom" },
    { kind: "emoji", picture: chosen.hero.picture, words: "Starring " + chosen.hero.name + "...", sky: "#0d0d12", move: "slide" },
    { kind: "emoji", picture: place.picture, words: "...in " + place.name + ".", sky: place.sky, move: "zoom" },
    { kind: "emoji", picture: chosen.action.picture, words: "Suddenly, " + chosen.action.name + "!", sky: place.sky, move: chosen.action.move }
  ];

  // Your own photos and videos play here, in the middle of the story.
  myScenes.forEach(function (mine) {
    scenes.push({ kind: mine.kind, address: mine.address, words: mine.words, sky: "#000000" });
  });

  scenes.push({ kind: "emoji", picture: chosen.ending.picture, words: chosen.ending.name, sky: place.sky, move: chosen.ending.move });
  scenes.push({ kind: "emoji", picture: "🍿", words: "THE END", sky: "#000000", move: "zoom" });
  scenes.push({ kind: "emoji", picture: "📽️", words: "Directed by Jack Yedid", sky: "#000000", move: "slide" });

  sceneNumber = 0;
  playNextScene();
}

function playNextScene() {
  if (sceneNumber >= scenes.length) {
    againButton.hidden = false;
    return;
  }

  var scene = scenes[sceneNumber];
  sceneNumber++;
  showScene(scene);

  // A video runs until it finishes. Everything else gets a fixed time.
  if (scene.kind === "video") {
    clip.onended = playNextScene;
    timer = setTimeout(playNextScene, LONGEST_A_CLIP_PLAYS);
  } else {
    var howLong = scene.kind === "photo" ? HOW_LONG_EACH_PHOTO : HOW_LONG_EACH_SCENE;
    timer = setTimeout(playNextScene, howLong);
  }
}

function stopEverything() {
  clearTimeout(timer);
  clip.onended = null;
  clip.pause();
}

actionButton.addEventListener("click", playMovie);

againButton.addEventListener("click", function () {
  stopEverything();
  againButton.hidden = true;
  actionButton.hidden = false;
  screen.style.background = "#0d0d12";
  star.hidden = false;
  photo.hidden = true;
  clip.hidden = true;
  star.className = "movie-star";
  star.textContent = "🎬";
  caption.textContent = "Pick your story and press ACTION!";
});
