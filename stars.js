// ============================================================
// STARS AND PRIZES
// Every game has its own five stars. Play a game and that game
// gets one star. Fill up all five stars in a game and you win a
// prize: a sticker for your sticker book, or a toy.
//
// Your stars and prizes are kept in this browser, on this
// device. Nothing is sent anywhere.
// ============================================================

// ---------- THE PRIZES - add your own! ----------
var STICKERS = [
  { picture: "🌟", name: "Gold Star" },
  { picture: "🦄", name: "Unicorn" },
  { picture: "🦖", name: "T-Rex" },
  { picture: "🚀", name: "Rocket" },
  { picture: "🍕", name: "Pizza" },
  { picture: "🌈", name: "Rainbow" },
  { picture: "⚡", name: "Lightning" },
  { picture: "🐉", name: "Dragon" },
  { picture: "👽", name: "Alien" },
  { picture: "🏆", name: "Trophy" }
];

var TOYS = [
  { picture: "🧸", name: "Teddy" },
  { picture: "🤖", name: "Robot" },
  { picture: "🚗", name: "Race Car" },
  { picture: "🪁", name: "Kite" },
  { picture: "⚽", name: "Football" },
  { picture: "🎸", name: "Guitar" },
  { picture: "🛹", name: "Skateboard" },
  { picture: "🪀", name: "Yo-yo" }
];

// The big prize for collecting every single sticker and every toy.
var BIG_PRIZE = { picture: "\uD83E\uDD5F", name: "The Mega Gold Dumpling" };

var STARS_IN_A_GAME = 5;           // stars each game holds
var HOW_MANY_TO_CHOOSE_FROM = 3;   // prizes of each kind to choose between
// -------------------------------------------------

// Which pages are games you can earn a star on, and what earns one.
var GAMES = {
  "pizza":  { name: "\uD83C\uDF55 Pizza Store",      star: "serve a customer" },
  "draw":   { name: "\uD83C\uDFA8 Drawing Board",    star: "save a picture" },
  "race":   { name: "\uD83C\uDFC1 Race",             star: "finish a race" },
  "soccer": { name: "\u26BD Penalty Shootout",   star: "take all 5 penalties" },
  "movie":  { name: "\uD83C\uDFAC Movie Maker",      star: "play a whole movie" },
  "blocks": { name: "\u26CF\uFE0F Block World",      star: "dig 25 blocks" },
  "toys":   { name: "\uD83E\uDDF8 Toy Workshop",     star: "make a toy" },
  "bbq":    { name: "\uD83C\uDF56 Barbecue",         star: "cook something perfectly" }
};

var pageName = (location.pathname.split("/").pop() || "index.html").replace(".html", "");
var thisGame = GAMES[pageName] ? GAMES[pageName].name : null;
var howToGetAStar = GAMES[pageName] ? GAMES[pageName].star : "";

// ---------- Remembering ----------

// games holds a star count for each game, like { pizza: 2, race: 5 }
var saved = { games: {}, stickers: [], toys: [] };

function loadStars() {
  try {
    var found = JSON.parse(localStorage.getItem("jack-stars"));
    if (found) {
      saved.games = found.games || {};
      saved.stickers = found.stickers || [];
      saved.toys = found.toys || [];
    }
  } catch (whoops) {}
}

// How many stars does one game have so far?
function starsIn(page) {
  return saved.games[page] || 0;
}

function saveStars() {
  try { localStorage.setItem("jack-stars", JSON.stringify(saved)); }
  catch (whoops) {}
}

loadStars();

// ---------- The star strip along the top ----------

var strip = document.createElement("div");
strip.className = "star-strip";

var starRow = document.createElement("span");
starRow.className = "star-row";

var starWords = document.createElement("span");
starWords.className = "star-words";

var starHint = document.createElement("span");
starHint.className = "star-hint";

var bookLink = document.createElement("a");
bookLink.className = "star-book-link";
bookLink.href = "stickers.html";
bookLink.textContent = "📒 Sticker Book";

strip.appendChild(starRow);
strip.appendChild(starWords);
strip.appendChild(starHint);
strip.appendChild(bookLink);
document.body.appendChild(strip);

function showStars() {
  if (!thisGame) {
    // Not a game page, so show how many prizes have been won instead.
    var prizes = saved.stickers.length + saved.toys.length;
    starRow.textContent = "🏆";
    starWords.textContent = prizes + (prizes === 1 ? " prize won" : " prizes won");
    return;
  }
  var howMany = starsIn(pageName);
  starRow.textContent = "⭐".repeat(howMany) +
                        "☆".repeat(STARS_IN_A_GAME - howMany);
  starWords.textContent = howMany + " of " + STARS_IN_A_GAME + " in " + thisGame;
  starHint.textContent = howMany >= STARS_IN_A_GAME
    ? "Full! Choose your prize \uD83C\uDF89"
    : "\u2B50 for every time you " + howToGetAStar;
}

showStars();

// ---------- Winning a star ----------

// One star per go. Playing this game again another time earns another.
function giveAStar() {
  if (!thisGame) return;                       // not a game page
  if (starsIn(pageName) >= STARS_IN_A_GAME) return;   // this game is already full

  saved.games[pageName] = starsIn(pageName) + 1;
  saveStars();
  showStars();

  strip.classList.remove("just-won");
  void strip.offsetWidth;
  strip.classList.add("just-won");

  if (starsIn(pageName) >= STARS_IN_A_GAME) offerAPrize();
}

// Each game calls giveAStar() itself when you finish something: serving a
// pizza, crashing the race car, cooking something perfectly, and so on.
// That way stars come from playing, not from opening the page.

// ---------- Choosing a prize ----------

// Pick a few at random out of a list, but offer ones that have not
// been won yet first - otherwise the same prize keeps turning up and
// the toy room could never be filled.
function someOf(list, howMany, whichPile) {
  var alreadyWon = (saved[whichPile] || []).map(function (p) { return p.name; });
  var newOnes = list.filter(function (p) { return alreadyWon.indexOf(p.name) === -1; });
  var pickFrom = newOnes.length >= howMany ? newOnes : list;
  return shuffle(pickFrom).slice(0, howMany);
}

// Put a list in a jumbled order.
function shuffle(list) {
  var shuffled = list.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var swapWith = Math.floor(Math.random() * (i + 1));
    var keep = shuffled[i];
    shuffled[i] = shuffled[swapWith];
    shuffled[swapWith] = keep;
  }
  return shuffled;
}

function offerAPrize() {
  var panel = document.createElement("div");
  panel.className = "prize-panel";

  var inside = document.createElement("div");
  inside.className = "prize-inside";
  inside.innerHTML =
    '<h2>🎉 Five stars!</h2>' +
    '<p>You filled up all ' + STARS_IN_A_GAME + ' stars in ' + thisGame +
    '. Choose your prize!</p>' +
    '<h3>📒 A sticker for your book</h3>' +
    '<div class="prize-row" id="sticker-choices"></div>' +
    '<h3>🧸 Or a toy</h3>' +
    '<div class="prize-row" id="toy-choices"></div>';

  panel.appendChild(inside);
  document.body.appendChild(panel);

  fillChoices(inside.querySelector("#sticker-choices"),
              someOf(STICKERS, HOW_MANY_TO_CHOOSE_FROM, "stickers"), "stickers", panel);
  fillChoices(inside.querySelector("#toy-choices"),
              someOf(TOYS, HOW_MANY_TO_CHOOSE_FROM, "toys"), "toys", panel);
}

function fillChoices(box, prizes, whichPile, panel) {
  prizes.forEach(function (prize) {
    var button = document.createElement("button");
    button.className = "prize-button";
    button.innerHTML = '<span class="prize-picture">' + prize.picture + '</span>' + prize.name;

    button.addEventListener("click", function () {
      saved[whichPile].push(prize);
      // This game empties out, so its five stars can be filled again.
      saved.games[pageName] = 0;
      saveStars();
      showStars();

      panel.querySelector(".prize-inside").innerHTML =
        '<h2>' + prize.picture + ' You chose the ' + prize.name + '!</h2>' +
        '<p>It is in your sticker book now. Fill up another game for another prize.</p>' +
        '<p><a class="play-link" href="stickers.html">📒 See my sticker book</a></p>' +
        '<p><button class="prize-button" id="keep-playing">Keep playing</button></p>';

      panel.querySelector("#keep-playing").addEventListener("click", function () {
        panel.remove();
      });
    });
    box.appendChild(button);
  });
}


// ---------- Have you collected everything? ----------

function haveWonThemAll() {
  return saved.stickers.length >= STICKERS.length && saved.toys.length >= TOYS.length;
}
