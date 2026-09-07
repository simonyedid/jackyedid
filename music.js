// ============================================================
// MY MUSIC
// Jack picks songs off his own computer or tablet and they play
// while he plays the games. Every game page loads this file.
//
// The songs never leave the device. The browser reads them
// straight off the disk - nothing is uploaded, nothing is put
// on the website, and nobody else can hear them.
// ============================================================

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
