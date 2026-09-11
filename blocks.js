// ============================================================
// BLOCK WORLD
// A world made of squares. Dig them out, put them back,
// build whatever you like. It saves itself as you go.
// ============================================================

// ---------- THE BLOCKS - add your own! ----------
// Copy a line, pick a color, and a new button appears by itself.
// "sparkle" is for shiny things buried in the stone.
var BLOCKS = [
  { name: "Grass",   color: "#4caf50" },
  { name: "Dirt",    color: "#8b5a2b" },
  { name: "Stone",   color: "#8a8f96" },
  { name: "Wood",    color: "#7a5230" },
  { name: "Leaves",  color: "#2f7d3a" },
  { name: "Coal",    color: "#8a8f96", sparkle: "#22262b" },
  { name: "Diamond", color: "#8a8f96", sparkle: "#4fe3e8" },
  { name: "Gold",    color: "#8a8f96", sparkle: "#f2c14e" },
  { name: "Brick",   color: "#b5462f" },
  { name: "Glass",   color: "#bfe6f5" },
  { name: "Sand",    color: "#e6d5a3" }
];

// ---------- YOUR TOOLS ----------
// "quick" blocks come out in one go. "slow" ones take 3 goes and crack
// first. Anything not in either list needs a different tool.
// The shovel has no emoji that works everywhere, so it is drawn by hand
// in a little picture below.
var TOOLS = [
  { name: "Hands", picture: "\u270B",
    quick: ["Leaves", "Glass"],
    slow: ["Grass", "Dirt", "Sand"] },
  { name: "Shovel", drawn: true,
    quick: ["Grass", "Dirt", "Sand"],
    slow: ["Leaves"] },
  { name: "Pickaxe", picture: "\u26CF\uFE0F",
    quick: ["Stone", "Coal", "Diamond", "Gold", "Brick", "Glass"],
    slow: ["Dirt", "Sand"] },
  { name: "Axe", picture: "\uD83E\uDE93",
    quick: ["Wood", "Leaves"],
    slow: ["Grass"] }
];

var HITS_WHEN_SLOW = 3;   // how many goes a wrong-ish tool takes

var BLOCK_SIZE = 16;      // how big one block is, in dots
var TREE_CHANCE = 12;     // 1 in this many spots grows a tree
// ------------------------------------------------

var world = document.getElementById("world");
var pen = world.getContext("2d");
var blockButtonsBox = document.getElementById("block-buttons");
var bagBox = document.getElementById("bag");

var ACROSS = world.width / BLOCK_SIZE;    // how many blocks wide
var DOWN = world.height / BLOCK_SIZE;     // how many blocks tall
var SKY = "#8ecdf0";

// ground[x][y] holds a block number, or -1 for empty sky.
var ground = [];
var bag = {};                 // how many of each block you have dug up
var holdingBlock = 0;         // which block the Build mode puts down
var tool = TOOLS[0];          // what you are digging with
var cracks = {};              // how many goes each block has had so far
var lastBlockTouched = "";    // so one drag does not hit the same block twice
var digging = true;           // true = Dig mode, false = Build mode
var busy = false;             // true while the mouse is held down

// ---------- Making a world ----------

function makeNewWorld() {
  ground = [];
  var height = Math.floor(DOWN / 2);

  for (var x = 0; x < ACROSS; x++) {
    // Walk the ground up and down a bit so it has hills.
    height += Math.floor(Math.random() * 3) - 1;
    if (height < 4) height = 4;
    if (height > DOWN - 4) height = DOWN - 4;

    ground[x] = [];
    for (var y = 0; y < DOWN; y++) {
      if (y < height) ground[x][y] = -1;                  // sky
      else if (y === height) ground[x][y] = 0;            // grass on top
      else if (y < height + 4) ground[x][y] = 1;          // dirt
      else ground[x][y] = 2;                              // stone
    }

    // Bury something shiny now and then.
    for (var deep = height + 5; deep < DOWN; deep++) {
      var luck = Math.random();
      if (luck < 0.05) ground[x][deep] = 5;               // coal
      else if (luck < 0.065) ground[x][deep] = 7;         // gold
      else if (luck < 0.072) ground[x][deep] = 6;         // diamond
    }

    // Sometimes grow a tree.
    if (Math.random() * TREE_CHANCE < 1 && x > 1 && x < ACROSS - 2 && height > 6) {
      growTree(x, height);
    }
  }

  saveWorld();
}

function growTree(x, groundLevel) {
  for (var t = 1; t <= 3; t++) ground[x][groundLevel - t] = 3;   // trunk
  // A little blob of leaves on top.
  for (var lx = x - 1; lx <= x + 1; lx++) {
    for (var ly = groundLevel - 6; ly <= groundLevel - 4; ly++) {
      if (ground[lx] && ground[lx][ly] === -1) ground[lx][ly] = 4;
    }
  }
}

// ---------- Drawing ----------

function drawWorld() {
  pen.fillStyle = SKY;
  pen.fillRect(0, 0, world.width, world.height);

  for (var x = 0; x < ACROSS; x++) {
    for (var y = 0; y < DOWN; y++) {
      if (ground[x][y] !== -1) drawBlock(x, y, BLOCKS[ground[x][y]]);
    }
  }
}

function drawBlock(x, y, block) {
  var left = x * BLOCK_SIZE;
  var top = y * BLOCK_SIZE;

  pen.fillStyle = block.color;
  pen.fillRect(left, top, BLOCK_SIZE, BLOCK_SIZE);

  // Grass gets soil showing under its green top.
  if (block.name === "Grass") {
    pen.fillStyle = "#8b5a2b";
    pen.fillRect(left, top + 5, BLOCK_SIZE, BLOCK_SIZE - 5);
    pen.fillStyle = block.color;
    pen.fillRect(left, top, BLOCK_SIZE, 5);
  }

  // Shiny things get a few specks in the stone.
  if (block.sparkle) {
    pen.fillStyle = block.sparkle;
    pen.fillRect(left + 3, top + 4, 4, 4);
    pen.fillRect(left + 9, top + 8, 3, 3);
    pen.fillRect(left + 5, top + 11, 3, 3);
  }

  // Cracks show a block is nearly out.
  var hits = cracks[x + "," + y];
  if (hits) {
    pen.strokeStyle = "rgba(0, 0, 0, " + (0.3 + hits * 0.2) + ")";
    pen.lineWidth = 2;
    pen.beginPath();
    pen.moveTo(left + 3, top + 3);
    pen.lineTo(left + BLOCK_SIZE - 4, top + BLOCK_SIZE - 5);
    if (hits > 1) {
      pen.moveTo(left + BLOCK_SIZE - 4, top + 4);
      pen.lineTo(left + 5, top + BLOCK_SIZE - 3);
    }
    pen.stroke();
  }

  // A dark edge on every block so you can see where each one ends.
  pen.strokeStyle = "rgba(0, 0, 0, 0.18)";
  pen.lineWidth = 1;
  pen.strokeRect(left + 0.5, top + 0.5, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
}

// ---------- Digging and building ----------

function whichBlockIsThere(event) {
  var box = world.getBoundingClientRect();
  return {
    x: Math.floor((event.clientX - box.left) * (world.width / box.width) / BLOCK_SIZE),
    y: Math.floor((event.clientY - box.top) * (world.height / box.height) / BLOCK_SIZE)
  };
}

function useTool(event) {
  var spot = whichBlockIsThere(event);
  if (spot.x < 0 || spot.x >= ACROSS || spot.y < 0 || spot.y >= DOWN) return;

  var whatIsThere = ground[spot.x][spot.y];
  var key = spot.x + "," + spot.y;

  if (digging) {
    if (whatIsThere === -1) return;              // nothing to dig

    // Dragging over the same block should not keep hitting it.
    if (key === lastBlockTouched) return;
    lastBlockTouched = key;

    var name = BLOCKS[whatIsThere].name;

    if (tool.quick.indexOf(name) !== -1) {
      digItOut(spot, name);
    } else if (tool.slow.indexOf(name) !== -1) {
      cracks[key] = (cracks[key] || 0) + 1;
      if (cracks[key] >= HITS_WHEN_SLOW) digItOut(spot, name);
      else say(tool.name + " is slow on " + name.toLowerCase() + ". Keep going!");
    } else {
      say("You cannot dig " + name.toLowerCase() + " with your " +
          tool.name.toLowerCase() + ". Try " + whoCanDig(name) + ".");
      return;
    }
  } else {
    if (whatIsThere !== -1) return;              // something is already there
    if (key === lastBlockTouched) return;
    lastBlockTouched = key;
    ground[spot.x][spot.y] = holdingBlock;
  }

  drawWorld();
}

// A star every time this many blocks have been dug out.
var BLOCKS_FOR_A_STAR = 25;
var dugThisVisit = 0;

function digItOut(spot, name) {
  ground[spot.x][spot.y] = -1;
  delete cracks[spot.x + "," + spot.y];
  bag[name] = (bag[name] || 0) + 1;
  showBag();
  say("Got a " + name.toLowerCase() + "!");

  dugThisVisit++;
  if (dugThisVisit % BLOCKS_FOR_A_STAR === 0) {
    if (typeof giveAStar === "function") giveAStar();
    say("\u2B50 " + BLOCKS_FOR_A_STAR + " blocks dug - that is a star!");
  }
}

// Which tool would be better for this block?
function whoCanDig(name) {
  var helpers = [];
  TOOLS.forEach(function (other) {
    if (other.quick.indexOf(name) !== -1) helpers.push("the " + other.name.toLowerCase());
  });
  return helpers.length ? helpers.join(" or ") : "something else";
}

function say(words) {
  document.getElementById("tool-message").textContent = words;
}

world.addEventListener("pointerdown", function (event) {
  busy = true;
  world.setPointerCapture(event.pointerId);
  useTool(event);
});
world.addEventListener("pointermove", function (event) { if (busy) useTool(event); });
world.addEventListener("pointerup", function () {
  busy = false;
  lastBlockTouched = "";
  saveWorld();
});
world.addEventListener("pointerleave", function () { busy = false; lastBlockTouched = ""; });

// ---------- The buttons ----------

BLOCKS.forEach(function (block, position) {
  var button = document.createElement("button");
  button.className = "block-button";
  button.innerHTML = '<span class="block-swatch" style="background:' + block.color + '"></span>' + block.name;
  if (position === 0) button.classList.add("chosen");

  button.addEventListener("click", function () {
    holdingBlock = position;
    var all = blockButtonsBox.querySelectorAll("button");
    for (var i = 0; i < all.length; i++) all[i].classList.remove("chosen");
    button.classList.add("chosen");

    // Picking a block means you want to build with it.
    setMode(false);
  });
  blockButtonsBox.appendChild(button);
});

// A shovel, drawn by hand, because the shovel emoji does not show up
// on most computers yet.
var SHOVEL_PICTURE =
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
  '<rect x="10.5" y="2" width="3" height="11" fill="#8b5a2b"/>' +
  '<rect x="7.5" y="2" width="9" height="2.4" fill="#8b5a2b"/>' +
  '<path d="M7 13 h10 v4 a5 5 0 0 1 -10 0 z" fill="#b9c0c7" stroke="#6d757d"/>' +
  '</svg>';

var toolBox = document.getElementById("tool-buttons");

TOOLS.forEach(function (each, position) {
  var button = document.createElement("button");
  button.className = "tool-button";
  button.innerHTML = (each.drawn ? SHOVEL_PICTURE : each.picture) + " " + each.name;
  if (position === 0) button.classList.add("chosen");

  button.addEventListener("click", function () {
    tool = each;
    var all = toolBox.querySelectorAll("button");
    for (var i = 0; i < all.length; i++) all[i].classList.remove("chosen");
    button.classList.add("chosen");
    setMode(true);                       // picking a tool means you want to dig
    say("Holding the " + each.name.toLowerCase() +
        ". Good for " + each.quick.join(", ").toLowerCase() + ".");
  });
  toolBox.appendChild(button);
});

var digButton = document.getElementById("dig-mode");
var buildButton = document.getElementById("build-mode");

function setMode(wantToDig) {
  digging = wantToDig;
  digButton.classList.toggle("chosen", digging);
  buildButton.classList.toggle("chosen", !digging);
  world.style.cursor = digging ? "crosshair" : "cell";
}

digButton.addEventListener("click", function () { setMode(true); });
buildButton.addEventListener("click", function () { setMode(false); });

document.getElementById("new-world-button").addEventListener("click", function () {
  makeNewWorld();
  drawWorld();
});

// ---------- The bag ----------

function showBag() {
  var names = Object.keys(bag);
  if (names.length === 0) {
    bagBox.textContent = "Nothing yet. Go and dig something!";
    return;
  }
  bagBox.innerHTML = "";
  names.forEach(function (name) {
    var tag = document.createElement("span");
    tag.className = "bag-item";
    tag.textContent = name + " × " + bag[name];
    bagBox.appendChild(tag);
  });
}

// ---------- Remembering your world ----------

function saveWorld() {
  try {
    localStorage.setItem("jack-block-world", JSON.stringify({ ground: ground, bag: bag }));
  } catch (whoops) {
    // The browser will not remember things. The world still works right now.
  }
}

function loadWorld() {
  try {
    var saved = JSON.parse(localStorage.getItem("jack-block-world"));
    // Only use it if it is the right shape, in case the world size changed.
    if (saved && saved.ground && saved.ground.length === ACROSS && saved.ground[0].length === DOWN) {
      ground = saved.ground;
      bag = saved.bag || {};
      return true;
    }
  } catch (whoops) {}
  return false;
}

if (!loadWorld()) makeNewWorld();
setMode(true);
showBag();
drawWorld();
