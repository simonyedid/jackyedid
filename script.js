// This makes the joke button work.
var button = document.getElementById("joke-button");
var punchline = document.getElementById("punchline");

button.addEventListener("click", function () {
  punchline.hidden = false;
  button.hidden = true;
});
