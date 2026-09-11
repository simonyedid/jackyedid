// ============================================================
// THE STICKER BOOK
// Shows everything won in the games. The stars and prizes
// themselves are looked after by stars.js, which runs first.
// ============================================================

var progress = document.getElementById("progress");
var stillToPlay = document.getElementById("still-to-play");
var stickerPage = document.getElementById("sticker-page");
var toyShelf = document.getElementById("toy-shelf");

// ---------- How am I doing? ----------

// Show every game and how many of its five stars are filled in.
var lines = [];
var totalStars = 0;

Object.keys(GAMES).forEach(function (page) {
  var howMany = starsIn(page);
  totalStars += howMany;
  lines.push('<a href="' + page + '.html">' + GAMES[page] + "</a> " +
             "\u2B50".repeat(howMany) + "\u2606".repeat(STARS_IN_A_GAME - howMany));
});

var prizes = saved.stickers.length + saved.toys.length;
progress.textContent = totalStars + " stars altogether · " +
                       prizes + (prizes === 1 ? " prize won" : " prizes won");

stillToPlay.innerHTML = "Fill up all " + STARS_IN_A_GAME +
  " stars in a game to win a prize:<br>" + lines.join("<br>");

// ---------- Sticking them in ----------

function fillPage(box, prizes, emptyWords) {
  box.innerHTML = "";

  if (prizes.length === 0) {
    box.innerHTML = '<p class="album-message">' + emptyWords + "</p>";
    return;
  }

  prizes.forEach(function (prize) {
    var sticker = document.createElement("div");
    sticker.className = "sticker";
    // Tip each one a little, like a real sticker stuck on by hand.
    sticker.style.transform = "rotate(" + (Math.random() * 12 - 6) + "deg)";
    sticker.innerHTML = '<span class="sticker-picture">' + prize.picture + "</span>" +
                        '<span class="sticker-name">' + prize.name + "</span>";
    box.appendChild(sticker);
  });
}

fillPage(stickerPage, saved.stickers, "Empty! Play games to get stickers.");
fillPage(toyShelf, saved.toys, "Empty! Play games to get toys.");
