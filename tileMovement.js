$(document).on("click", ".tile", handleTileClick);

let pos1 = 0,
  pos2 = 0,
  pos3 = 0,
  pos4 = 0;
let draggingTileId = "";
const R_KEY_CODE = 82;
const F_KEY_CODE = 70;

function generateGridCoordinates() {
  const gridCoordinates = [];
  const tileSpaces = document.getElementsByClassName("tile-space");

  for (let tileSpace of tileSpaces) {
    let tileSpaceRect = tileSpace.getBoundingClientRect();
    gridCoordinates.push({
      x: tileSpaceRect.x + window.scrollX,
      y: tileSpaceRect.y + window.scrollY,
    });
  }

  return gridCoordinates;
}

function pickUpTile(e) {
  e = e || window.event;
  e.preventDefault();
  // get the mouse cursor position at startup:
  pos3 = e.clientX;
  pos4 = e.clientY;
  // call a function whenever the cursor moves:
  document.onmousemove = dragTile;
  document.onkeydown = keyPress;
  document.onclick = dropTile;
}

function dragTile(e) {
  e = e || window.event;
  e.preventDefault();
  const draggingTile = document.getElementById(draggingTileId);

  // calculate the new cursor position:
  pos1 = pos3 - e.clientX;
  pos2 = pos4 - e.clientY;
  pos3 = e.clientX;
  pos4 = e.clientY;

  // set the element's new position:
  let top = draggingTile.offsetTop - pos2;
  let left = draggingTile.offsetLeft - pos1;
  draggingTile.style.top = top + "px";
  draggingTile.style.left = left + "px";
}

function dropTile() {
  const draggingTile = document.getElementById(draggingTileId);
  // stop moving when mouse button is released:
  document.onmousemove = null;
  document.onclick = null;
  document.onkeydown = null;
  draggingTile.style.cursor = "grab";

  const initialTranslation = draggingTile.getAttribute("initialTranslation");

  let xTranslation = initialTranslation.split(", ")[0];
  let yTranslation = initialTranslation.split(", ")[1];
  xTranslation = parseInt(xTranslation.substring(0, xTranslation.length - 2));
  yTranslation = parseInt(yTranslation.substring(0, yTranslation.length - 2));

  const gridCoordinates = generateGridCoordinates();
  const boundingRect = draggingTile.getBoundingClientRect();
  gridCoordinates.some((coordinate) => {
    if (
      isNearCoordinate(
        coordinate.x,
        coordinate.y,
        boundingRect.y + window.scrollY,
        boundingRect.x + window.scrollX
      )
    ) {
      const topDiff = boundingRect.y - coordinate.y + window.scrollY;
      const leftDiff = boundingRect.x - coordinate.x + window.scrollX;
      const currTop = parseInt(
        draggingTile.style.top.substr(0, draggingTile.style.top.length - 2)
      );
      const currLeft = parseInt(
        draggingTile.style.left.substr(0, draggingTile.style.left.length - 2)
      );
      draggingTile.style.top = `${currTop - topDiff}px`;
      draggingTile.style.left = `${currLeft - leftDiff}px`;
      return true;
    }
  });
}

function handleTileClick(e) {
  (pos1 = 0), (pos2 = 0), (pos3 = 0), (pos4 = 0);
  const draggingTile = e.target;
  draggingTileId = draggingTile.id;

  pickUpTile(e);
  moveAllOtherTilesBehind(draggingTile);
  draggingTile.style.cursor = "grabbing";
  draggingTile.style.zIndex = 10;

  if (!draggingTile.hasAttribute("rotateDeg")) {
    draggingTile.setAttribute("rotateDeg", 0);
  }
  if (!draggingTile.hasAttribute("scale")) {
    draggingTile.setAttribute("scale", 1);
  }
}

function moveAllOtherTilesBehind(draggingTile) {
  const tiles = document.getElementsByClassName("tile");

  for (let tile of tiles) {
    if (tile !== draggingTile) {
      tile.style.zIndex = 9;
    }
  }
}

function keyPress(e) {
  const draggingTile = document.getElementById(draggingTileId);
  const pressedKeyCode = e.keyCode;

  if (pressedKeyCode === R_KEY_CODE) {
    draggingTile.setAttribute(
      "rotateDeg",
      (parseInt(draggingTile.getAttribute("rotateDeg")) + 90) % 360
    );
  } else if (pressedKeyCode === F_KEY_CODE) {
    draggingTile.setAttribute(
      "scale",
      parseInt(draggingTile.getAttribute("scale")) * -1
    );
  }

  const scaleDirection = [90, 270].includes(
    draggingTile.getAttribute("rotateDeg")
  )
    ? "Y"
    : "X";

  draggingTile.style.transform = buildTransformString(
    draggingTile.getAttribute("initialTranslation"),
    draggingTile.getAttribute("rotateDeg"),
    scaleDirection,
    draggingTile.getAttribute("scale")
  );
}

function buildTransformString(
  initialTranslation,
  rotateDeg,
  scaleDirection,
  scale
) {
  return `translate(${initialTranslation}) rotate(${rotateDeg}deg) scale${scaleDirection}(${scale})`;
}

function isNearCoordinate(x, y, top, left) {
  let isTopBelowBoundingUpper = top < y + 40;
  let isTopAboveBoundingLower = top > y - 40;
  let isLeftBelowBoundingUpper = left < x + 40;
  let isLeftAboveBoundingLower = left > x - 40;

  return (
    isTopBelowBoundingUpper &&
    isTopAboveBoundingLower &&
    isLeftBelowBoundingUpper &&
    isLeftAboveBoundingLower
  );
}
