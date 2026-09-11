// ============================================================
// THE TOY ROOM
// Shows every prize there is to win. The ones you have not won
// yet sit there as dark shadows, so you can see what is still
// out there. Win them all and the Big Prize lights up.
// ============================================================

// ---------- Filling a shelf ----------

function fillShelves(box, everyPrize, whatYouHaveWon) {
  box.innerHTML = "";

  // The names of the ones already won.
  var won = whatYouHaveWon.map(function (prize) { return prize.name; });

  everyPrize.forEach(function (prize) {
    var spot = document.createElement("div");
    var haveIt = won.indexOf(prize.name) !== -1;
    spot.className = "shelf-thing" + (haveIt ? " won" : " in-shadow");

    var picture = document.createElement("span");
    picture.className = "shelf-picture";
    picture.textContent = prize.picture;

    var label = document.createElement("span");
    label.className = "shelf-name";
    // A shadow does not tell you what it is.
    label.textContent = haveIt ? prize.name : "???";

    spot.appendChild(picture);
    spot.appendChild(label);
    box.appendChild(spot);
  });
}

fillShelves(document.getElementById("toy-shelves"), TOYS, saved.toys);
fillShelves(document.getElementById("sticker-shelves"), STICKERS, saved.stickers);

// ---------- How many have I got? ----------

function countUp(box, everyPrize, whatYouHaveWon, whatTheyAre) {
  var howMany = whatYouHaveWon.map(function (p) { return p.name; })
                              .filter(function (name, where, list) {
                                return list.indexOf(name) === where;   // no counting twice
                              }).length;
  box.textContent = howMany + " of " + everyPrize.length + " " + whatTheyAre +
                    (howMany === everyPrize.length ? " — all of them! 🎉" : "");
  return howMany;
}

countUp(document.getElementById("toy-count"), TOYS, saved.toys, "toys");
countUp(document.getElementById("sticker-count"), STICKERS, saved.stickers, "stickers");

// ---------- The Big Prize ----------

var bigPrize = document.getElementById("big-prize");
var bigWords = document.getElementById("big-prize-words");

var gotThemAll = haveWonThemAll();

bigPrize.className = "big-prize" + (gotThemAll ? " won" : " in-shadow");
bigPrize.innerHTML = '<span class="big-prize-picture">' + BIG_PRIZE.picture + "</span>" +
                     '<span class="big-prize-name">' +
                     (gotThemAll ? BIG_PRIZE.name : "???") + "</span>";

if (gotThemAll) {
  bigWords.textContent = "You did it! You won every single prize and unlocked " +
                         BIG_PRIZE.name + "!";
} else {
  var toysLeft = TOYS.length - saved.toys.length;
  var stickersLeft = STICKERS.length - saved.stickers.length;
  bigWords.textContent = "Win every sticker and every toy to unlock it. " +
                         Math.max(0, stickersLeft) + " stickers and " +
                         Math.max(0, toysLeft) + " toys to go!";
}
