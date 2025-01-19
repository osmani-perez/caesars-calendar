$(document).on("click", "#reset-button", resetTiles);
$(window).on("load", highlightTodaysDate);

function resetTiles() {
  const tiles = document.getElementsByClassName("tile");

  for (let tile of tiles) {
    let initialTranslation = tile.getAttribute("initialTranslation");
    tile.style.transform = `translate(${initialTranslation})`;
    tile.style.removeProperty("top");
    tile.style.removeProperty("left");
  }
}

function highlightTodaysDate() {
  const dateObj = new Date();
  const date = dateObj.getDate();
  const month = dateObj.getMonth();
  const day = dateObj.getDay();

  document.getElementById(`tile-space-date-${date}`).classList.add("glow");
  document.getElementById(`tile-space-month-${month}`).classList.add("glow");
  document.getElementById(`tile-space-day-${day}`).classList.add("glow");
}
