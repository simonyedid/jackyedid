// ============================================================
// MY QR CARD
// The print button. Everything with "no-print" on it is left
// off the paper, so only the card comes out.
// ============================================================

document.getElementById("print-button").addEventListener("click", function () {
  window.print();
});
