const video = document.getElementsByClassName('input_video')[0];
const conteiner = document.getElementsByClassName('conteiner');
const canvas = document.querySelector("#pose-canvas");
const ctx = canvas.getContext("2d");
const buttons = document.querySelectorAll(".my-button");

import { models } from "./glasses_models.js"
var idModel = 0
var glasses = new Image();
glasses.src = models[idModel].img
const manualAjust = 5
var upAndDown = 0
var newYposition = 0
var leftAndRight = 0
var newXposition = 0
var zoomInAndOut = 0
var newScale = 0

function onResultsFaceMesh(results) {
  conteiner.height = video.videoHeight;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.clearRect(0, 0, video.videoWidth, video.videoHeight)

  if (results.multiFaceLandmarks) {

    imageDraw(results.multiFaceLandmarks[0])
  }
}

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    switch (button.id) {
      case "Up":
        if (upAndDown < manualAjust) {
          upAndDown++
          newYposition = upAndDown * canvas.height/100
        }
        break;
      case "Down":
        if (upAndDown > -manualAjust) {
          upAndDown--
          newYposition = upAndDown * canvas.height/100
        }
        break;
      case "Left":
        if (leftAndRight < manualAjust) {
          leftAndRight++
          newXposition = leftAndRight * canvas.width/100
        }
        break;
      case "Right":
        if (leftAndRight > -manualAjust) {
          leftAndRight--
          newXposition = leftAndRight * canvas.width/100
        }
        break;
      case "ZoomIn":
        if (zoomInAndOut < manualAjust) {
          zoomInAndOut++
          newScale = zoomInAndOut * canvas.width/100
        }
        break;
      case "ZoomOut":
        if (zoomInAndOut > -manualAjust) {
          zoomInAndOut--
          newScale = zoomInAndOut * canvas.width/100
        }
        break;
      case "ChangeLeft":
        updateCounter('-');
        break;
      case "ChangeRight":
        updateCounter('+');
        break;
      default:
        console.log("Unknown button clicked");
    }
  });
});

function updateCounter(operator) {
  if (operator === '+') {
    idModel = (idModel + 1) % 3;
  } else if (operator === '-') {
    idModel = (idModel - 1 + 3) % 3;
  }
  glasses.src = models[idModel].img
  console.log(idModel, glasses)
}
function imageDraw(rsl) {
  const nodes = [127, 356, 168];
  ctx.save()
  const x0 = rsl[nodes[0]].x * video.videoWidth
  const y0 = rsl[nodes[0]].y * video.videoHeight
  const x1 = rsl[nodes[1]].x * video.videoWidth
  const y1 = rsl[nodes[1]].y * video.videoHeight
  const xGlasses = Math.sqrt(Math.pow((x1 - x0), 2) + Math.pow((y1 - y0), 2)) + newScale
  const yGlasses = (xGlasses * glasses.height) / glasses.width
  const imageX0 = (rsl[nodes[2]].x * video.videoWidth)
  const imageY0 = rsl[nodes[2]].y * video.videoHeight

  ctx.translate(imageX0, imageY0)
  const pendiente = ((y1 - y0) / (x1 - x0))
  const angleHead = Math.atan(pendiente)
  ctx.rotate(angleHead)
  ctx.drawImage(glasses, 0 - (xGlasses / 2) + newXposition, 0 - (yGlasses / 3) - newYposition, xGlasses, yGlasses)
  ctx.restore()
}

const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.1/${file}`;
  }
});
faceMesh.onResults(onResultsFaceMesh);

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 1280,
  height: 720
});
camera.start();
