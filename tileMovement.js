$(document).on("click", ".tile-parts", handleTileClick);
$(document).on("click", "#reset-button", resetTiles);
$(window).on("load", initializeFilledBoardSpaces);

let xEnd = 0;
let yEnd = 0;
let xStart = 0;
let yStart = 0;
let draggingTileId = "";
let filledBoardSpaces = new Array(44);
let targetTiles = [];

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
  xStart = e.clientX;
  yStart = e.clientY;
  // call a function whenever the cursor moves:
  document.onmousemove = dragTile;
  document.onkeydown = handleKeyPress;
  document.onclick = dropTile;
}

function dragTile(e) {
  e = e || window.event;
  e.preventDefault();
  const draggingTile = document.getElementById(draggingTileId);

  // calculate the new cursor position:
  xEnd = xStart - e.clientX;
  yEnd = yStart - e.clientY;
  xStart = e.clientX;
  yStart = e.clientY;

  // set the element's new position:
  let top = draggingTile.offsetTop - yEnd;
  let left = draggingTile.offsetLeft - xEnd;
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
      draggingTile.style.top = `${draggingTile.offsetTop - topDiff}px`;
      draggingTile.style.left = `${draggingTile.offsetLeft - leftDiff}px`;

      handleBoardValidation();

      return true;
    }
  });
}

function handleTileClick(e) {
  (xEnd = 0), (yEnd = 0), (xStart = 0), (yStart = 0);
  const draggingTile = e.target.parentElement;
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

function handleKeyPress(e) {
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
    parseInt(draggingTile.getAttribute("rotateDeg"))
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

function handleBoardValidation() {
  let tileSpaces = document.querySelectorAll("[id^=tile-space]");
  let tiles = Array.from(document.querySelectorAll(".tile-parts"));
  tileSpaces.forEach((space, index) => {
    filledBoardSpaces[index] = tiles.some((tile) => {
      if (isElementInFront(tile, space)) {
        return true;
      }
    });
  });

  console.log(filledBoardSpaces);

  if (isWinConditionMet()) {
    const winElement = document.createElement("h1");
    winElement.id = "win-element";
    winElement.textContent = "You Win!";
    document.getElementById("tile-area").appendChild(winElement);
  }
}

function isWinConditionMet() {
  let falseCount = 0;

  !filledBoardSpaces.some((space, index) => {
    if (!space) {
      if (!targetTiles.includes(index)) {
        return true;
      }
      falseCount++;
    }
  });

  return falseCount === 3;
}

function initializeFilledBoardSpaces() {
  let tileSpaces = document.querySelectorAll("[id^=tile-space]");
  filledBoardSpaces.fill(false);

  for (let i = 0; i < tileSpaces.length; i++) {
    if (tileSpaces[i].className === "tile-space glow") {
      targetTiles.push(i);
    }
  }

  return true;
}

function resetTiles() {
  const tiles = document.getElementsByClassName("tile");

  for (let tile of tiles) {
    let initialTranslation = tile.getAttribute("initialTranslation");
    tile.style.transform = `translate(${initialTranslation})`;
    tile.style.removeProperty("top");
    tile.style.removeProperty("left");
  }

  filledBoardSpaces.fill(false);

  if (document.getElementById("win-element")) {
    document.getElementById("win-element").remove();
  }
}

function isElementInFront(element1, element2) {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();

  // Check if element1 overlaps element2
  const isOverlapping = !(
    rect1.right < rect2.left + 1 ||
    rect1.left > rect2.right - 1 ||
    rect1.bottom < rect2.top + 1 ||
    rect1.top > rect2.bottom - 1
  );

  if (!isOverlapping) {
    return false; // No overlap, element1 cannot be in front
  }

  // Check z-index
  const zIndex1 = parseInt(getComputedStyle(element1).zIndex, 10) || 0;
  const zIndex2 = parseInt(getComputedStyle(element2).zIndex, 10) || 0;

  if (zIndex1 > zIndex2) {
    return true;
  } else if (zIndex1 < zIndex2) {
    return false;
  }

  // If z-index is equal, check document order
  return (
    document.body.compareDocumentPosition(element1) &
    Node.DOCUMENT_POSITION_FOLLOWING
  );
}
