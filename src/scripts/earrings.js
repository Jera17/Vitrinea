const video = document.getElementsByClassName('input_video')[0];
const canvas = document.querySelector("#pose-canvas")
const ctx = canvas.getContext("2d")
const buttons = document.querySelectorAll(".my-button");

import { models } from "./earrings_models.js"
var idModel = 0
var EarringModel = new Image();
EarringModel.src = models[idModel].img

const manualAjust = 10
var translationDistance = 2
var upAndDown = 0
var newYposition = 0
var leftAndRight = 0
var newXposition = 0
var zoomInAndOut = 0
var newScale = 1

function onResultsFaceMesh(results) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (results.multiFaceLandmarks) {
    imageDraw(results.multiFaceLandmarks[0], 356, 323, 401, 1)
    imageDraw(results.multiFaceLandmarks[0], 127, 93, 177, -1)
  }
}

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    switch (button.id) {
      case "Up":
      case "Down":
        updateY(button.id);
        break;
      case "Left":
      case "Right":
        updateX(button.id);
        break;
      case "ZoomIn":
      case "ZoomOut":
        updateZoom(button.id);
        break;
      case "ChangeLeft":
      case "ChangeRight":
        updateCounter(button.id);
        break;
      default:
        console.log("Unknown button clicked");
    }
  });
});

function updateY(buttonId) {
  if (buttonId === "Up" && upAndDown < manualAjust) {
    upAndDown++;
  } else if (buttonId === "Down" && upAndDown > -manualAjust) {
    upAndDown--;
  }
  newYposition = upAndDown * translationDistance;
}

function updateX(buttonId) {
  if (buttonId === "Left" && leftAndRight < manualAjust) {
    leftAndRight++;
  } else if (buttonId === "Right" && leftAndRight > -manualAjust) {
    leftAndRight--;
  }
  newXposition = leftAndRight * translationDistance;
}

function updateZoom(direction) {
  const delta = (direction === "ZoomIn") ? 1 : -1;
  if (zoomInAndOut + delta >= -manualAjust && zoomInAndOut + delta <= manualAjust) {
    zoomInAndOut += delta;
    newScale = 1 + (zoomInAndOut * 0.05);
    console.log(newScale)
  }
}

function updateCounter(operator) {
  idModel = (operator === 'ChangeRight') ? (idModel + 1) % models.length : (idModel - 1 + models.length) % models.length;
  console.log(idModel, (idModel + 1) % models.length, (idModel - 1 + 3) % models.length)
  glasses.src = models[idModel].img;
}

function imageDraw(rsl, Node1, Node2, Node3, Orientation) {
  const x0 = rsl[Node2].x * canvas.width
  const y0 = rsl[Node2].y * canvas.height
  const x1 = rsl[Node3].x * canvas.width
  const y1 = rsl[Node3].y * canvas.height
  // (x0 + x1) / 2) get the point  ((x0 - x1) * 0.75)
  const xEarring = ((x0 + x1) / 2) + ((x0 - x1) * 0.75)
  if (x0 * Orientation > x1 * Orientation) {
    const imageY0 = rsl[Node1].y * canvas.height
    const imageY1 = rsl[Node2].y * canvas.height
    const imageY = (imageY1 - imageY0) * newScale
    const imageX = (imageY * EarringModel.width)/EarringModel.height
    ctx.drawImage(EarringModel, xEarring - (imageX / 2) + newXposition, (y0 + y1) / 2 - newYposition, imageX, imageY)
  }
}

const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`;
  }
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResultsFaceMesh);

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 854,
  height: 480
});
camera.start();
