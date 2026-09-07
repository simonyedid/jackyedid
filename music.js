// ============================================================
// MY MUSIC
// Jack picks songs off his own computer or tablet and they play
// while he plays the games. Every game page loads this file.
//
// The songs never leave the device. The browser reads them
// straight off the disk - nothing is uploaded, nothing is put
// on the website, and nobody else can hear them.
// ============================================================

// There are TWO ways to have music here:
//   1. Songs off this computer   - always works, stays private
//   2. A Spotify playlist        - needs the internet and a Spotify
//                                  account for whole songs
// ---------- SETTINGS ----------
var START_VOLUME = 0.5;    // 0 is silent, 1 is as loud as it goes
// ------------------------------

var songs = [];            // the songs you have picked
var nowPlaying = -1;       // which one is playing, -1 for none

// The thing that actually makes the sound.
var player = document.createElement("audio");
player.volume = START_VOLUME;

// ---------- Building the little music bar ----------

var bar = document.createElement("div");
bar.className = "music-bar";

var addButton = document.createElement("label");
addButton.className = "music-button";
addButton.textContent = "🎵 Put my music on";

var filePicker = document.createElement("input");
filePicker.type = "file";
filePicker.accept = "audio/*";
filePicker.multiple = true;
filePicker.hidden = true;
addButton.appendChild(filePicker);

var playButton = document.createElement("button");
playButton.className = "music-button";
playButton.textContent = "▶️";
playButton.title = "Play or stop the music";
playButton.hidden = true;

var nextButton = document.createElement("button");
nextButton.className = "music-button";
nextButton.textContent = "⏭️";
nextButton.title = "Next song";
nextButton.hidden = true;

var songName = document.createElement("span");
songName.className = "music-name";

bar.appendChild(addButton);
bar.appendChild(playButton);
bar.appendChild(nextButton);
bar.appendChild(songName);
document.body.appendChild(bar);

// ---------- Picking songs ----------

filePicker.addEventListener("change", function () {
  for (var i = 0; i < filePicker.files.length; i++) {
    var file = filePicker.files[i];
    songs.push({
      // A private address for this file, inside this browser only.
      address: URL.createObjectURL(file),
      // Drop the ".mp3" bit off the end to make a tidy name.
      name: file.name.replace(/\.[^.]+$/, "")
    });
  }
  filePicker.value = "";          // so the same song can be picked again

  playButton.hidden = false;
  nextButton.hidden = songs.length < 2;
  addButton.textContent = "🎵 Add more";

  if (nowPlaying === -1) playSong(0);
});

// ---------- Playing ----------

function playSong(which) {
  nowPlaying = which;
  player.src = songs[which].address;
  player.play();
  playButton.textContent = "⏸️";
  showWhatIsOn();
}

function showWhatIsOn() {
  if (nowPlaying === -1) {
    songName.textContent = "";
    return;
  }
  songName.textContent = (player.paused ? "⏸ " : "♪ ") + songs[nowPlaying].name;
}

playButton.addEventListener("click", function () {
  if (nowPlaying === -1) return;
  if (player.paused) {
    player.play();
    playButton.textContent = "⏸️";
  } else {
    player.pause();
    playButton.textContent = "▶️";
  }
  showWhatIsOn();
});

nextButton.addEventListener("click", function () {
  playSong((nowPlaying + 1) % songs.length);
});

// When a song finishes, roll straight on to the next one.
player.addEventListener("ended", function () {
  playSong((nowPlaying + 1) % songs.length);
});

player.addEventListener("error", function () {
  songName.textContent = "That song would not play. Try a different one.";
});


// ============================================================
// MUSIC FROM SPOTIFY
// Paste a link to any Spotify playlist, album or song and it
// turns up as a big green player you can press play on.
// ============================================================

var spotifyButton = document.createElement("button");
spotifyButton.className = "music-button spotify-button";
spotifyButton.textContent = "\uD83D\uDFE2 Play music from Spotify";
bar.appendChild(spotifyButton);

// The panel that slides up above the bar.
var spotifyPanel = document.createElement("div");
spotifyPanel.className = "spotify-panel";
spotifyPanel.hidden = true;
spotifyPanel.innerHTML =
  '<div class="spotify-row">' +
  '  <strong>\uD83C\uDFB5 Your Spotify music</strong>' +
  '  <button class="music-button" id="shut-spotify">\u2715 Close</button>' +
  '</div>' +

  // The easy way: go to Spotify, start your music, come back and play.
  '<p class="spotify-help"><strong>The easy way:</strong> open Spotify, press play ' +
  'on whatever you like, then come back here. Your music keeps going while you play.</p>' +
  '<p><a class="music-button spotify-button spotify-open" ' +
  '      href="https://open.spotify.com" target="_blank" rel="noopener">' +
  '   \u25B6\uFE0F Open Spotify</a></p>' +

  // The other way: paste a link and play it right here on the page.
  '<p class="spotify-help"><strong>Or:</strong> copy the link to a playlist, album or ' +
  'song in Spotify, paste it here, and press Put it on.</p>' +
  '<div class="spotify-row">' +
  '  <input id="spotify-link" class="title-box" type="text" ' +
  '         placeholder="https://open.spotify.com/playlist/...">' +
  '  <button class="music-button" id="use-spotify">Put it on</button>' +
  '</div>' +
  '<p class="spotify-help" id="spotify-message"></p>' +
  '<div id="spotify-player"></div>';
document.body.appendChild(spotifyPanel);

var linkBox = spotifyPanel.querySelector("#spotify-link");
var spotifyMessage = spotifyPanel.querySelector("#spotify-message");
var spotifyPlayer = spotifyPanel.querySelector("#spotify-player");

spotifyButton.addEventListener("click", function () {
  spotifyPanel.hidden = !spotifyPanel.hidden;
});

spotifyPanel.querySelector("#shut-spotify").addEventListener("click", function () {
  spotifyPanel.hidden = true;
});

// A Spotify link looks like .../playlist/SOMELETTERSANDNUMBERS
// This pulls out the two bits we need: what kind it is, and its name.
function readSpotifyLink(link) {
  var found = link.match(/(playlist|album|track|episode|show)[\/:]([A-Za-z0-9]+)/);
  if (!found) return null;
  return { kind: found[1], id: found[2] };
}

function putSpotifyOn(link) {
  var bits = readSpotifyLink(link);

  if (!bits) {
    spotifyMessage.textContent = "That does not look like a Spotify link. " +
      "It should have open.spotify.com in it.";
    return;
  }

  spotifyPlayer.innerHTML = "";
  var frame = document.createElement("iframe");
  frame.className = "spotify-frame";
  frame.src = "https://open.spotify.com/embed/" + bits.kind + "/" + bits.id;
  frame.width = "100%";
  frame.height = "352";
  frame.loading = "lazy";
  frame.title = "Jack\u2019s Spotify music";
  frame.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
  spotifyPlayer.appendChild(frame);

  spotifyMessage.textContent = "Press play on the green player below. \uD83C\uDFA7";
  try { localStorage.setItem("jack-spotify", link); } catch (whoops) {}
}

spotifyPanel.querySelector("#use-spotify").addEventListener("click", function () {
  putSpotifyOn(linkBox.value.trim());
});

// Pressing Enter works too.
linkBox.addEventListener("keydown", function (event) {
  if (event.key === "Enter") putSpotifyOn(linkBox.value.trim());
});

// If a link was used last time, put it straight back.
try {
  var lastTime = localStorage.getItem("jack-spotify");
  if (lastTime) {
    linkBox.value = lastTime;
    putSpotifyOn(lastTime);
  }
} catch (whoops) {}
