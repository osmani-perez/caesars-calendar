$(window).on("load", highlightTodaysDate);

function highlightTodaysDate() {
  const dateObj = new Date();
  const date = dateObj.getDate();
  const month = dateObj.getMonth();
  const day = dateObj.getDay();

  document.getElementById(`tile-space-date-${date}`).classList.add("glow");
  document.getElementById(`tile-space-month-${month}`).classList.add("glow");
  document.getElementById(`tile-space-day-${day}`).classList.add("glow");
}
