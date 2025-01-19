$(document).on("click", ".tile", clickMouse);

let pos1 = 0,
  pos2 = 0,
  pos3 = 0,
  pos4 = 0;
let movingDiv = "";

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

function dragMouseDown(e) {
  e = e || window.event;
  e.preventDefault();
  // get the mouse cursor position at startup:
  pos3 = e.clientX;
  pos4 = e.clientY;
  // call a function whenever the cursor moves:
  document.onmousemove = elementDrag;
  document.onkeydown = keyPress;
  document.onclick = closeDragElement;
}

function elementDrag(e) {
  e = e || window.event;
  e.preventDefault();
  elem = document.getElementById(movingDiv);

  // calculate the new cursor position:
  pos1 = pos3 - e.clientX;
  pos2 = pos4 - e.clientY;
  pos3 = e.clientX;
  pos4 = e.clientY;

  // set the element's new position:
  let top = elem.offsetTop - pos2;
  let left = elem.offsetLeft - pos1;
  elem.style.top = top + "px";
  elem.style.left = left + "px";
}

function closeDragElement() {
  elem = document.getElementById(movingDiv);
  // stop moving when mouse button is released:
  document.onmousemove = null;
  document.onclick = null;
  document.onkeydown = null;
  elem.style.cursor = "grab";
  elem.style.zIndex = 9;

  const initialTranslation = elem.getAttribute("initialTranslation");

  let xTranslation = initialTranslation.split(", ")[0];
  let yTranslation = initialTranslation.split(", ")[1];
  xTranslation = parseInt(xTranslation.substring(0, xTranslation.length - 2));
  yTranslation = parseInt(yTranslation.substring(0, yTranslation.length - 2));

  const gridCoordinates = generateGridCoordinates();
  const boundingRect = elem.getBoundingClientRect();
  gridCoordinates.some((coordinate) => {
    if (
      nearCoordinate(
        coordinate.x,
        coordinate.y,
        boundingRect.y + window.scrollY,
        boundingRect.x + window.scrollX
      )
    ) {
      const topDiff = boundingRect.y - coordinate.y + window.scrollY;
      const leftDiff = boundingRect.x - coordinate.x + window.scrollX;
      const currTop = parseInt(
        elem.style.top.substr(0, elem.style.top.length - 2)
      );
      const currLeft = parseInt(
        elem.style.left.substr(0, elem.style.left.length - 2)
      );
      elem.style.top = `${currTop - topDiff}px`;
      elem.style.left = `${currLeft - leftDiff}px`;
      return true;
    }
  });
}

function clickMouse(e) {
  (pos1 = 0), (pos2 = 0), (pos3 = 0), (pos4 = 0);
  movingDiv = e.target.id;
  if (!e.target.hasAttribute("rotateDeg")) {
    e.target.setAttribute("rotateDeg", 0);
  }
  if (!e.target.hasAttribute("scale")) {
    e.target.setAttribute("scale", 1);
  }
  dragMouseDown(e);
  e.target.style.cursor = "grabbing";
  e.target.style.zIndex = 10;
}

function keyPress(e) {
  elem = document.getElementById(movingDiv);
  if (e.keyCode === 82) {
    // R key pressed, rotate block
    elem.setAttribute(
      "rotateDeg",
      (parseInt(elem.getAttribute("rotateDeg")) + 90) % 360
    );
  } else if (e.keyCode === 70) {
    // F key pressed, flip block
    elem.setAttribute("scale", parseInt(elem.getAttribute("scale")) * -1);
  }

  const scaleDirection = [90, 270].includes(elem.getAttribute("rotateDeg"))
    ? "Y"
    : "X";

  elem.style.transform = buildTransformString(
    elem.getAttribute("initialTranslation"),
    elem.getAttribute("rotateDeg"),
    scaleDirection,
    elem.getAttribute("scale")
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

function nearCoordinate(x, y, top, left) {
  let isTopNearBoundingUpper = top < y + 40;
  let isTopNearBoundingLower = top > y - 40;
  let isLeftNearBoundingUpper = left < x + 40;
  let isLeftNearBoundingLower = left > x - 40;

  return (
    isTopNearBoundingUpper &&
    isTopNearBoundingLower &&
    isLeftNearBoundingUpper &&
    isLeftNearBoundingLower
  );
}
