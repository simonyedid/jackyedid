// ============================================================
// THE STICKER BOOK
// A book you open and turn the pages of. Every prize you win
// gets stuck on a page, and you can write on each page.
//
// The stars and prizes themselves are looked after by stars.js,
// which runs before this one.
// ============================================================

// ---------- SETTINGS ----------
var STICKERS_ON_A_PAGE = 4;
// ------------------------------

var book = document.getElementById("book");
var cover = document.getElementById("cover");
var page = document.getElementById("page");
var slots = document.getElementById("slots");
var writing = document.getElementById("page-writing");
var pageNumber = document.getElementById("page-number");
var emptyNote = document.getElementById("page-empty-note");
var progress = document.getElementById("progress");
var stillToPlay = document.getElementById("still-to-play");

// The book has a place for EVERY prize there is, stickers then toys.
// The ones not won yet sit in their place as shadows.
var everyPrize = STICKERS.concat(TOYS);

// The names of the ones actually won.
var won = saved.stickers.concat(saved.toys).map(function (prize) { return prize.name; });

var howManyPages = Math.ceil(everyPrize.length / STICKERS_ON_A_PAGE);
var openAt = 0;

// ---------- What you wrote on each page ----------

var writings = {};

function loadWritings() {
  try { writings = JSON.parse(localStorage.getItem("jack-book-writing")) || {}; }
  catch (whoops) { writings = {}; }
}

function saveWritings() {
  try { localStorage.setItem("jack-book-writing", JSON.stringify(writings)); }
  catch (whoops) {}
}

loadWritings();

writing.addEventListener("input", function () {
  writings[openAt] = writing.value;
  saveWritings();
});

// ---------- Showing a page ----------

function showPage() {
  slots.innerHTML = "";

  var firstOnThisPage = openAt * STICKERS_ON_A_PAGE;
  var anyWonOnThisPage = false;

  for (var i = 0; i < STICKERS_ON_A_PAGE; i++) {
    var prize = everyPrize[firstOnThisPage + i];
    var slot = document.createElement("div");

    if (!prize) {
      // Past the end of the list, so nothing belongs here at all.
      slot.className = "page-slot empty";
      slots.appendChild(slot);
      continue;
    }

    var haveIt = won.indexOf(prize.name) !== -1;
    if (haveIt) anyWonOnThisPage = true;

    slot.className = "page-slot " + (haveIt ? "stuck" : "in-shadow");
    if (haveIt) {
      // Tip each one a little, like a real sticker stuck on by hand.
      slot.style.transform = "rotate(" + (Math.random() * 10 - 5) + "deg)";
    }
    slot.innerHTML = '<span class="sticker-picture">' + prize.picture + "</span>" +
                     '<span class="sticker-name">' + (haveIt ? prize.name : "???") + "</span>";
    slots.appendChild(slot);
  }

  // A page with nothing on it yet says so.
  emptyNote.hidden = anyWonOnThisPage;

  writing.value = writings[openAt] || "";
  pageNumber.textContent = "Page " + (openAt + 1) + " of " + howManyPages;

  document.getElementById("page-back").disabled = (openAt === 0);
  document.getElementById("page-next").disabled = (openAt === howManyPages - 1);

  // A little flick, like turning a real page.
  page.classList.remove("turning");
  void page.offsetWidth;
  page.classList.add("turning");
}

// ---------- Opening, turning, shutting ----------

cover.addEventListener("click", function () {
  cover.hidden = true;
  page.hidden = false;
  book.classList.add("open");
  showPage();
});

document.getElementById("shut").addEventListener("click", function () {
  page.hidden = true;
  cover.hidden = false;
  book.classList.remove("open");
});

document.getElementById("page-back").addEventListener("click", function () {
  if (openAt > 0) { openAt--; showPage(); }
});

document.getElementById("page-next").addEventListener("click", function () {
  if (openAt < howManyPages - 1) { openAt++; showPage(); }
});

// ---------- How am I doing? ----------

var lines = [];
var totalStars = 0;

Object.keys(GAMES).forEach(function (name) {
  var howMany = starsIn(name);
  totalStars += howMany;
  lines.push('<a href="' + name + '.html">' + GAMES[name].name + "</a> " +
             "⭐".repeat(howMany) + "☆".repeat(STARS_IN_A_GAME - howMany));
});

if (won.length === 0) {
  progress.textContent = "Empty! Play games to earn stickers.";
} else {
  progress.textContent = won.length + " of " + everyPrize.length +
    " stuck in · " + totalStars + " stars altogether";
}

stillToPlay.innerHTML = "Fill up all " + STARS_IN_A_GAME +
  " stars in a game to win a prize:<br>" + lines.join("<br>");
